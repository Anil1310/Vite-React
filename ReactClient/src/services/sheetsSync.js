/**
 * Google Sheets Mirror & Apps Script Bridge
 */
export async function syncToGoogleSheets(webAppUrl) {
  const endpoint = webAppUrl || import.meta.env.VITE_APPS_SCRIPT_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbzW3POboCUJfKE2W-vFKVRMvwu6Q6OV9yELYhy-SZTVSQY8nlO43Kj1PhlNUeTj0JtV/exec';
  if (!endpoint) {
    return { success: false, reason: 'Google Apps Script endpoint not configured' };
  }

  try {
    const url = new URL(endpoint);
    url.searchParams.set('action', 'sync_settings_to_sheet');
    const res = await fetch(url.toString(), {
      method: 'GET',
      mode: 'no-cors' // Google Apps Script web app redirect compatibility
    });
    return {
      success: true,
      syncedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
  } catch (err) {
    console.warn('[Sheets Sync] Bridge ping notice:', err);
    return { success: false, error: err.message };
  }
}
