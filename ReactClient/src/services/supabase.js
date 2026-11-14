/**
 * Supabase Direct REST Client
 */
function getApiUrl(settings) {
  const url = (settings && settings.supabaseUrl) || import.meta.env.VITE_SUPABASE_URL || 'https://srjqsofkjizwskqnzyfn.supabase.co';
  const clean = url.replace(/\/+$/, '');
  return /\/rest\/v1$/i.test(clean) ? clean : `${clean}/rest/v1`;
}

function getApiKey(settings) {
  return (settings && settings.supabaseKey) || import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vxonFVKPpyJjY5O-Y9mS6g_bhSYCcsS';
}

async function supabaseFetch(path, options = {}, settings) {
  const base = getApiUrl(settings);
  const key = getApiKey(settings);
  if (!base || !key) throw new Error('Supabase configuration missing.');

  const url = `${base}/${path.replace(/^\/+/, '')}`;
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  return fetch(url, { ...options, headers });
}

function sanitizeForSnapshot(state) {
  const clone = JSON.parse(JSON.stringify(state || {}));
  if (clone.settings) {
    delete clone.settings.leadDevPassword;
  }
  return clone;
}

/**
 * Fetch remote state from Supabase
 */
export async function fetchRemoteStateFromSupabase(settings) {
  try {
    const res = await supabaseFetch('db_json?snapshot_key=eq.main&select=payload,updated_at', { method: 'GET' }, settings);
    if (!res.ok) {
      throw new Error(`Supabase query failed with status ${res.status}`);
    }
    const rows = await res.json();
    if (rows && rows[0] && rows[0].payload) {
      return {
        success: true,
        payload: rows[0].payload,
        updatedAt: rows[0].updated_at
      };
    }
    return { success: false, reason: 'Empty snapshot' };
  } catch (err) {
    console.warn('[Supabase] Fetch remote error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Synchronize current state to Supabase
 */
export async function syncStateToSupabase(state) {
  const settings = state.settings || {};
  if (settings.supabaseEnabled === false) {
    return { success: false, reason: 'Supabase disabled in settings' };
  }

  try {
    // 1. Update main db_json snapshot
    const snapshotPayload = sanitizeForSnapshot(state);
    const dbJsonRes = await supabaseFetch('db_json?snapshot_key=eq.main', {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify({
        payload: snapshotPayload,
        updated_at: new Date().toISOString()
      })
    }, settings);

    if (!dbJsonRes.ok && dbJsonRes.status === 404) {
      // Insert if not yet created
      await supabaseFetch('db_json', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify([{
          snapshot_key: 'main',
          payload: snapshotPayload,
          updated_at: new Date().toISOString()
        }])
      }, settings);
    }

    // 2. Sync batches table
    if (Array.isArray(state.batches) && state.batches.length) {
      const batchesData = state.batches.map(b => ({
        id: b.id,
        name: b.name,
        subject: b.subject,
        schedule: b.schedule,
        room: b.room,
        teacher: b.teacher,
        student_ids: b.studentIds || []
      }));
      await supabaseFetch('batches?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(batchesData)
      }, settings).catch(e => console.warn('Batches table upsert note:', e));
    }

    // 3. Sync students table
    if (Array.isArray(state.students) && state.students.length) {
      const studentsData = state.students.map(s => ({
        id: s.id || s.roll,
        roll: s.roll || s.id,
        name: s.name,
        phone: s.phone || '',
        parent_name: s.parentName || '',
        total_fee: Number(s.totalFee || 0),
        paid_fee: Number(s.paidFee || 0),
        monthly_fee: Number(s.monthlyFee || 0),
        due_date: s.dueDate || 'Paid',
        last_reminder: s.lastReminder || '-',
        password: s.password || 'password123',
        status: s.status || 'Active',
        admission_date: s.admissionDate || '',
        batch_id: s.batchId || ''
      }));
      await supabaseFetch('students?on_conflict=id', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(studentsData)
      }, settings).catch(e => console.warn('Students table upsert note:', e));
    }

    return {
      success: true,
      syncedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (err) {
    console.error('[Supabase] Sync failed:', err);
    return { success: false, error: err.message };
  }
}
