import React, { useState } from 'react';
import { syncStateToSupabase } from '../services/supabase';
import { syncToGoogleSheets } from '../services/sheetsSync';

export default function SettingsPage({ state, onUpdateState, currentUser }) {
  const settings = state.settings || {};
  const [formData, setFormData] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [testingSupabase, setTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState(null);
  const [syncingSheets, setSyncingSheets] = useState(false);
  const [sheetsStatus, setSheetsStatus] = useState(null);

  function handleChange(field, value) {
    setFormData(prev => ({ ...prev, [field]: value }));
  }

  function handleSave(e) {
    e.preventDefault();
    const updatedState = {
      ...state,
      settings: { ...formData }
    };
    onUpdateState(updatedState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  async function handleTestSupabase() {
    setTestingSupabase(true);
    setSupabaseStatus(null);
    const res = await syncStateToSupabase({ ...state, settings: formData });
    setTestingSupabase(false);
    if (res.success) {
      setSupabaseStatus({ ok: true, msg: `Supabase connected successfully at ${res.syncedAt}` });
    } else {
      setSupabaseStatus({ ok: false, msg: `Connection failed: ${res.error || res.reason}` });
    }
  }

  async function handleTestSheets() {
    setSyncingSheets(true);
    setSheetsStatus(null);
    const res = await syncToGoogleSheets(formData.sheetsWebAppUrl);
    setSyncingSheets(false);
    if (res.success) {
      setSheetsStatus({ ok: true, msg: `Sheets sync signal sent at ${res.syncedAt}` });
    } else {
      setSheetsStatus({ ok: false, msg: `Sync notice: ${res.error || res.reason}` });
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-heading font-black text-2xl text-slate-900 dark:text-white">
          Institute &amp; System Configuration
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Governance &bull; Dual-layer persistence &bull; AI Assistant master controls &bull; Branding
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-2">
          <i className="fa-solid fa-circle-check"></i>
          <span>Settings successfully saved and persisted!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Card 1: Core Institute Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <i className="fa-solid fa-building-columns text-indigo-600 dark:text-indigo-400"></i>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              Center Details &amp; Contact
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Institute Name</label>
              <input
                type="text"
                value={formData.instituteName || ''}
                onChange={(e) => handleChange('instituteName', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Tagline / Mission</label>
              <input
                type="text"
                value={formData.tagline || ''}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Helpline Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Official UPI ID for Fees</label>
              <input
                type="text"
                value={formData.upiId || ''}
                onChange={(e) => handleChange('upiId', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Campus Address</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Dual-Layer Persistence (Supabase & Google Sheets per Rule 5) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <i className="fa-solid fa-database text-emerald-600 dark:text-emerald-400"></i>
              <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                Dual-Layer Persistence (Supabase Primary &bull; Sheets Secondary)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">
              Rule 5 Active
            </span>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Supabase Primary Database</p>
                <p className="text-[11px] text-slate-400">Enables high-concurrency real-time REST storage</p>
              </div>
              <input
                type="checkbox"
                checked={formData.supabaseEnabled !== false}
                onChange={(e) => handleChange('supabaseEnabled', e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Supabase Project URL</label>
                <input
                  type="url"
                  value={formData.supabaseUrl || ''}
                  onChange={(e) => handleChange('supabaseUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Supabase Anon Key</label>
                <input
                  type="password"
                  value={formData.supabaseKey || ''}
                  onChange={(e) => handleChange('supabaseKey', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestSupabase}
                disabled={testingSupabase}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition flex items-center gap-2"
              >
                <i className={`fa-solid fa-arrows-rotate ${testingSupabase ? 'animate-spin' : ''}`}></i>
                <span>Test Supabase Connection</span>
              </button>
              {supabaseStatus && (
                <span className={`text-[11px] font-semibold ${supabaseStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {supabaseStatus.msg}
                </span>
              )}
            </div>

            {/* Google Sheets Secondary Mirror */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Google Sheets Mirror Backup</p>
                  <p className="text-[11px] text-slate-400">Syncs records to Calibri 10pt formatted Google Sheets</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.sheetsMirrorEnabled !== false}
                  onChange={(e) => handleChange('sheetsMirrorEnabled', e.target.checked)}
                  className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">Google Apps Script Web App Endpoint</label>
                <input
                  type="url"
                  value={formData.sheetsWebAppUrl || ''}
                  onChange={(e) => handleChange('sheetsWebAppUrl', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleTestSheets}
                  disabled={syncingSheets}
                  className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-semibold text-xs transition flex items-center gap-2"
                >
                  <i className={`fa-solid fa-cloud ${syncingSheets ? 'animate-spin' : ''}`}></i>
                  <span>Trigger Google Sheets Sync</span>
                </button>
                {sheetsStatus && (
                  <span className={`text-[11px] font-semibold ${sheetsStatus.ok ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {sheetsStatus.msg}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: AI Assistant & Feature Governance (Rule 9) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <i className="fa-solid fa-robot text-purple-600 dark:text-purple-400"></i>
            <h3 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
              AI Assistant &amp; Developer Governance Controls
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">AI Assistant &amp; Chatbot Control (Rule 9)</p>
                <p className="text-[11px] text-slate-400">
                  Master toggle for floating launcher, voice recognition, and dedicated doubt solver page
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.chatbotEnabled !== false}
                onChange={(e) => handleChange('chatbotEnabled', e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Show One-Click Demo Logins on Auth Screen</p>
                <p className="text-[11px] text-slate-400">Enables instant Admin, Teacher, and Student test buttons</p>
              </div>
              <input
                type="checkbox"
                checked={formData.demoLoginEnabled !== false}
                onChange={(e) => handleChange('demoLoginEnabled', e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="py-3 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/25 transition active:scale-[0.98]"
          >
            Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
}
