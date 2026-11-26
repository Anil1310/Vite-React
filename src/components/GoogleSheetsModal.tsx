'use client';

import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  UploadCloud,
  DownloadCloud,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface GoogleSheetsModalProps {
  currentUrl: string;
  onSaveUrlAndPush: (url: string) => Promise<void>;
  onPullFromSheet: (url: string) => Promise<void>;
  onClose: () => void;
}

const SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1ZV_woXgdvi1Vo5cvWqhSK7NeALceB-eoV9hXgY_8_-k/edit?gid=0#gid=0';
const APPS_SCRIPT_URL =
  'https://script.google.com/home/projects/1qn7o81bfLJbMWYPh4XXIkCj9Gin9okm0LXQ3u7lhwWqb7scgRlyu4ubj/edit';

export default function GoogleSheetsModal({
  currentUrl,
  onSaveUrlAndPush,
  onPullFromSheet,
  onClose,
}: GoogleSheetsModalProps) {
  const [url, setUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<'push' | 'pull' | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleCopyScript = async () => {
    const snippet = `// Paste in Apps Script Project: 1qn7o81bfLJbMWYPh4XXIkCj9Gin9okm0LXQ3u7lhwWqb7scgRlyu4ubj
const SPREADSHEET_ID = '1ZV_woXgdvi1Vo5cvWqhSK7NeALceB-eoV9hXgY_8_-k';
const EXPENSES_TAB = 'Expenses';
const BUDGETS_TAB = 'Budgets';

function getSpreadsheet() {
  try { return SpreadsheetApp.openById(SPREADSHEET_ID); }
  catch (e) { return SpreadsheetApp.getActiveSpreadsheet(); }
}

function formatCellValue(header, val, tz) {
  if (val instanceof Date) {
    if (header === 'date') return Utilities.formatDate(val, tz, 'yyyy-MM-dd');
    if (header === 'time') return Utilities.formatDate(val, tz, 'HH:mm');
    return val.toISOString();
  }
  return val;
}

function doGet() {
  const ss = getSpreadsheet();
  const tz = ss.getSpreadsheetTimeZone() || 'Asia/Kolkata';
  const expSheet = ss.getSheetByName(EXPENSES_TAB);
  const budSheet = ss.getSheetByName(BUDGETS_TAB);
  const expenses = [];
  if (expSheet && expSheet.getLastRow() > 1) {
    const data = expSheet.getDataRange().getValues();
    const headers = data[0];
    for (let i = 1; i < data.length; i++) {
      if (!data[i][0] && !data[i][3]) continue;
      const obj = {};
      for (let c = 0; c < headers.length; c++) {
        const h = String(headers[c]);
        obj[h] = formatCellValue(h, data[i][c], tz);
      }
      if (!obj.id) obj.id = 'exp-sheet-' + (i + 1);
      obj.amount = Number(obj.amount) || 0;
      expenses.push(obj);
    }
  }
  let budgets = null;
  if (budSheet && budSheet.getLastRow() > 1) {
    const bData = budSheet.getDataRange().getValues();
    const catBudgets = {};
    let monthlyLimit = 35000, dailyLimit = 1500;
    for (let i = 1; i < bData.length; i++) {
      const k = String(bData[i][0] || ''), v = Number(bData[i][1]) || 0;
      if (k === 'monthlyLimit') monthlyLimit = v;
      else if (k === 'dailyLimit') dailyLimit = v;
      else if (k) catBudgets[k] = v;
    }
    budgets = { monthlyLimit, dailyLimit, categoryBudgets: catBudgets };
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, expenses, budgets })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const payload = JSON.parse(e.postData.contents);
  const ss = getSpreadsheet();
  if (Array.isArray(payload.expenses)) {
    let expSheet = ss.getSheetByName(EXPENSES_TAB) || ss.insertSheet(EXPENSES_TAB);
    expSheet.clearContents();
    const headers = ['id', 'date', 'time', 'title', 'category', 'paymentMode', 'amount', 'notes', 'createdAt'];
    const rows = [headers, ...payload.expenses.map(i => [i.id||'', i.date ? "'" + String(i.date) : '', i.time ? "'" + String(i.time) : '', i.title||'', i.category||'', i.paymentMode||'', Number(i.amount)||0, i.notes||'', i.createdAt||''])];
    expSheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
    expSheet.setFrozenRows(1);
  }
  if (payload.budgets) {
    let budSheet = ss.getSheetByName(BUDGETS_TAB) || ss.insertSheet(BUDGETS_TAB);
    budSheet.clearContents();
    const bRows = [['key', 'value'], ['monthlyLimit', Number(payload.budgets.monthlyLimit)||0], ['dailyLimit', Number(payload.budgets.dailyLimit)||0]];
    if (payload.budgets.categoryBudgets) Object.entries(payload.budgets.categoryBudgets).forEach(([k, v]) => bRows.push([k, Number(v)||0]));
    budSheet.getRange(1, 1, bRows.length, 2).setValues(bRows);
    budSheet.setFrozenRows(1);
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}`;
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePush = async () => {
    if (!url.trim().startsWith('https://script.google.com/')) {
      setStatusMsg({
        type: 'err',
        text: 'Please enter a valid Google Apps Script Web App URL (https://script.google.com/macros/s/.../exec).',
      });
      return;
    }
    setBusy('push');
    setStatusMsg(null);
    try {
      await onSaveUrlAndPush(url.trim());
      setStatusMsg({ type: 'ok', text: 'Connected and pushed all expenses & budgets to Google Sheets!' });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to push to Google Sheets.',
      });
    } finally {
      setBusy(null);
    }
  };

  const handlePull = async () => {
    if (!url.trim().startsWith('https://script.google.com/')) {
      setStatusMsg({
        type: 'err',
        text: 'Please enter a valid Google Apps Script Web App URL first.',
      });
      return;
    }
    setBusy('pull');
    setStatusMsg(null);
    try {
      await onPullFromSheet(url.trim());
      setStatusMsg({ type: 'ok', text: 'Pulled latest expenses & budgets from Google Sheets!' });
    } catch (err) {
      setStatusMsg({
        type: 'err',
        text: err instanceof Error ? err.message : 'Failed to pull from Google Sheets.',
      });
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Google Sheets Live Backend
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs sm:text-sm">
          {/* Step 1: Open Sheet */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
            <p className="font-bold text-emerald-800 dark:text-emerald-300 text-xs">
              Step 1: Your Google Sheet is Ready
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              We created <strong>ExpenseFlow - Day-to-Day Expense Manager</strong> with{' '}
              <code>Expenses</code> and <code>Budgets</code> tabs in your Google account.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={SHEET_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                Open Google Sheet <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={APPS_SCRIPT_URL}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                Open Apps Script <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={handleCopyScript}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied Script!' : 'Copy Apps Script Code'}
              </button>
            </div>
          </div>

          {/* Step 2: Deploy instructions */}
          <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 leading-relaxed">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Step 2: Deploy Web App (One-Time Setup)
            </p>
            <p>
              In the Sheet: <strong>Extensions → Apps Script</strong> → paste the copied code →{' '}
              <strong>Deploy → New deployment → Web app</strong> (Execute as: <em>Me</em>, Access:{' '}
              <em>Anyone</em>) → paste the Web App URL below:
            </p>
          </div>

          {/* Step 3: URL input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Google Apps Script Web App URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {statusMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                statusMsg.type === 'ok'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
              }`}
            >
              {statusMsg.type === 'ok' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2.5 pt-2">
            <button
              type="button"
              onClick={handlePush}
              disabled={busy !== null}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              {busy === 'push' ? 'Syncing...' : 'Save URL & Push to Sheet'}
            </button>
            <button
              type="button"
              onClick={handlePull}
              disabled={busy !== null}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <DownloadCloud className="w-4 h-4" />
              {busy === 'pull' ? 'Pulling...' : 'Pull from Sheet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
