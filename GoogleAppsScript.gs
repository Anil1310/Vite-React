/**
 * ExpenseFlow - Google Sheets Two-Way Sync Backend (Google Apps Script)
 * Apps Script Project ID: 1qn7o81bfLJbMWYPh4XXIkCj9Gin9okm0LXQ3u7lhwWqb7scgRlyu4ubj
 * Spreadsheet ID: 1ZV_woXgdvi1Vo5cvWqhSK7NeALceB-eoV9hXgY_8_-k
 *
 * Setup Instructions:
 * 1. Open https://script.google.com/home/projects/1qn7o81bfLJbMWYPh4XXIkCj9Gin9okm0LXQ3u7lhwWqb7scgRlyu4ubj/edit
 * 2. Paste this entire code and click Save (Ctrl+S)
 * 3. Click Deploy -> New deployment -> Select type: Web app
 * 4. Execute as: Me | Who has access: Anyone
 * 5. Click Deploy, authorize, and paste the Web App (/exec) URL into ExpenseFlow!
 */

const SPREADSHEET_ID = '1ZV_woXgdvi1Vo5cvWqhSK7NeALceB-eoV9hXgY_8_-k';
const EXPENSES_TAB = 'Expenses';
const BUDGETS_TAB = 'Budgets';

function getSpreadsheet() {
  try {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (e) {
    return SpreadsheetApp.getActiveSpreadsheet();
  }
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
  try {
    const ss = getSpreadsheet();
    const tz = ss.getSpreadsheetTimeZone() || 'Asia/Kolkata';
    const expSheet = ss.getSheetByName(EXPENSES_TAB);
    const budSheet = ss.getSheetByName(BUDGETS_TAB);

    const expenses = [];
    if (expSheet && expSheet.getLastRow() > 1) {
      const data = expSheet.getDataRange().getValues();
      const headers = data[0];
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row[0] && !row[3]) continue;
        const obj = {};
        for (let c = 0; c < headers.length; c++) {
          const h = String(headers[c]);
          obj[h] = formatCellValue(h, row[c], tz);
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
      let monthlyLimit = 35000;
      let dailyLimit = 1500;
      for (let i = 1; i < bData.length; i++) {
        const k = String(bData[i][0] || '');
        const v = Number(bData[i][1]) || 0;
        if (k === 'monthlyLimit') monthlyLimit = v;
        else if (k === 'dailyLimit') dailyLimit = v;
        else if (k) catBudgets[k] = v;
      }
      budgets = { monthlyLimit, dailyLimit, categoryBudgets: catBudgets };
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
        expenses,
        budgets,
        lastSyncedAt: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const ss = getSpreadsheet();

    // Sync Expenses Tab
    if (Array.isArray(payload.expenses)) {
      let expSheet = ss.getSheetByName(EXPENSES_TAB);
      if (!expSheet) expSheet = ss.insertSheet(EXPENSES_TAB);
      expSheet.clearContents();

      const headers = ['id', 'date', 'time', 'title', 'category', 'paymentMode', 'amount', 'notes', 'createdAt'];
      const rows = [headers];
      for (const item of payload.expenses) {
        rows.push([
          item.id || '',
          item.date ? "'" + String(item.date) : '',
          item.time ? "'" + String(item.time) : '',
          item.title || '',
          item.category || '',
          item.paymentMode || '',
          Number(item.amount) || 0,
          item.notes || '',
          item.createdAt || '',
        ]);
      }
      expSheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
      expSheet.setFrozenRows(1);
    }

    // Sync Budgets Tab
    if (payload.budgets) {
      let budSheet = ss.getSheetByName(BUDGETS_TAB);
      if (!budSheet) budSheet = ss.insertSheet(BUDGETS_TAB);
      budSheet.clearContents();

      const bRows = [['key', 'value']];
      bRows.push(['monthlyLimit', Number(payload.budgets.monthlyLimit) || 0]);
      bRows.push(['dailyLimit', Number(payload.budgets.dailyLimit) || 0]);
      if (payload.budgets.categoryBudgets) {
        for (const [cat, val] of Object.entries(payload.budgets.categoryBudgets)) {
          bRows.push([cat, Number(val) || 0]);
        }
      }
      budSheet.getRange(1, 1, bRows.length, 2).setValues(bRows);
      budSheet.setFrozenRows(1);
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        ok: true,
        count: (payload.expenses || []).length,
        lastSyncedAt: new Date().toISOString(),
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
