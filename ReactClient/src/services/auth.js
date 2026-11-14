const SAVED_CREDS_KEY = 'DIVINE_SAVED_CREDS';
const AUTH_SESSION_KEY = 'DIVINE_AUTH_SESSION';
const LAST_ACTIVITY_KEY = 'DIVINE_LAST_ACTIVITY';
const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;
const TWO_HOURS_MS = 2 * 60 * 60 * 1000; // 7,200,000 ms

/**
 * 10-Day Remembered Credentials
 */
export function getSavedCredentials() {
  try {
    const raw = localStorage.getItem(SAVED_CREDS_KEY);
    if (!raw) return null;
    const creds = JSON.parse(raw);
    if (Date.now() > (creds.expiresAt || 0)) {
      localStorage.removeItem(SAVED_CREDS_KEY);
      return null;
    }
    return creds;
  } catch (e) {
    localStorage.removeItem(SAVED_CREDS_KEY);
    return null;
  }
}

export function saveCredentials(loginId, password) {
  try {
    const payload = {
      loginId,
      password,
      savedAt: Date.now(),
      expiresAt: Date.now() + TEN_DAYS_MS
    };
    localStorage.setItem(SAVED_CREDS_KEY, JSON.stringify(payload));
  } catch (e) {
    console.error('Failed to save credentials', e);
  }
}

export function clearSavedCredentials() {
  localStorage.removeItem(SAVED_CREDS_KEY);
}

/**
 * Active Session
 */
export function getActiveSession() {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setActiveSession(user) {
  try {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(user));
    recordActivity();
  } catch (e) {
    console.error('Failed to set active session', e);
  }
}

export function clearActiveSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(LAST_ACTIVITY_KEY);
}

/**
 * Inactivity tracker
 */
export function recordActivity() {
  try {
    localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
  } catch (e) {
    // ignore
  }
}

export function isSessionExpiredByInactivity() {
  try {
    const last = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || 0);
    if (!last) return false;
    return Date.now() - last > TWO_HOURS_MS;
  } catch (e) {
    return false;
  }
}

/**
 * Authenticates against current state
 */
export function authenticateUser(loginId, password, state) {
  const normId = String(loginId || '').trim().toLowerCase();
  const rawId = String(loginId || '').trim();
  const rawPass = String(password || '').trim();

  // 1. Lead Developer
  const devEmail = String(state.settings?.leadDevEmail || 'anil.chahar170@gmail.com').toLowerCase();
  const devPass = String(state.settings?.leadDevPassword || 'Anil@1310');
  if (normId === devEmail && rawPass === devPass) {
    return {
      role: 'admin',
      isLeadDev: true,
      id: 'lead-dev',
      name: 'Dev. Anil Kumar Chahar',
      email: devEmail,
      title: 'Lead Architect & Systems Engineer',
      badge: 'Lead Developer'
    };
  }

  // 2. Admin
  const adminEmail = String(state.settings?.adminEmail || 'divineclasses1010@gmail.com').toLowerCase();
  const adminPass = String(state.settings?.adminPassword || 'admin123');
  const adminName = state.settings?.adminName || 'Ravi Shankar';
  if ((normId === adminEmail || normId === 'admin') && rawPass === adminPass) {
    return {
      role: 'admin',
      id: 'admin-main',
      name: adminName,
      email: adminEmail,
      title: 'Institute Administrator',
      badge: 'Admin'
    };
  }

  // 3. Teachers
  const teacher = (state.teachers || []).find(t => 
    (t.email && t.email.toLowerCase() === normId) ||
    (t.id && t.id.toLowerCase() === normId) ||
    (t.phone && t.phone.replace(/\D/g, '') === normId.replace(/\D/g, ''))
  );
  if (teacher && String(teacher.password || 'teacher123') === rawPass) {
    return {
      role: 'teacher',
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      phone: teacher.phone,
      subject: teacher.subject,
      qualification: teacher.qualification,
      experience: teacher.experience,
      title: teacher.subject,
      badge: 'Faculty Mentor',
      avatarColor: teacher.avatarColor || 'bg-indigo-600',
      initials: teacher.initials || 'TR'
    };
  }

  // 4. Students
  const student = (state.students || []).find(s => 
    (s.roll && s.roll.toLowerCase() === normId) ||
    (s.id && s.id.toLowerCase() === normId) ||
    (s.phone && s.phone.replace(/\D/g, '') === normId.replace(/\D/g, ''))
  );
  if (student && String(student.password || 'password123') === rawPass) {
    const batch = (state.batches || []).find(b => b.id === student.batchId);
    return {
      role: 'student',
      id: student.id,
      roll: student.roll,
      name: student.name,
      phone: student.phone,
      parentName: student.parentName,
      batchId: student.batchId,
      batchName: batch ? batch.name : 'Divine Classes Batch',
      title: `Student • Roll ${student.roll}`,
      badge: 'Student'
    };
  }

  return null;
}
