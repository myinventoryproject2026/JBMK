/**
 * Generator for Google Apps Script (Code.gs) and standalone HTML bundle
 * for "Jai Baba Mahakal Ki Rasoi" SaaS Dashboard.
 */

export function generateGoogleAppsScriptCode(): string {
  return `/**
 * =========================================================================
 * JAI BABA MAHAKAL KI RASOI - GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * SaaS Accounting & Member Management System (2026-2030)
 * =========================================================================
 * Deploy as Web App:
 * 1. Open Google Sheets -> Extensions -> Apps Script
 * 2. Paste this code into Code.gs
 * 3. Run initialSetup() once to auto-create all database sheets
 * 4. Click 'Deploy' -> 'New deployment' -> Select 'Web app'
 *    - Execute as: Me
 *    - Who has access: Anyone (or within domain)
 * 5. Copy the Web App URL and paste into your SaaS Dashboard!
 */

// Global Sheet Names
var SHEETS = {
  DAY_BOOK: 'DayBook',
  LEDGER: 'LedgerBook',
  MEMBERS: 'Members',
  MEMBER_LEDGER: 'MemberLedger',
  VENDORS: 'Vendors',
  ITEMS: 'Items',
  TOKENS: 'Tokens',
  AUDIT_LOG: 'AuditLog',
  SETTINGS: 'Settings'
};

/**
 * Serves the HTML Web App UI
 */
function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('जय बाबा महाकाल की रसोई - SaaS Management')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Initial Sheet Setup - creates tabs with pre-styled headers
 */
function initialSetup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var headers = {
    DayBook: ['ID', 'Date', 'Month', 'Year', 'Type', 'Category', 'Particulars', 'Description', 'Amount', 'Mode', 'Ref No', 'Member/Vendor', 'Created At'],
    LedgerBook: ['Date', 'Particulars', 'Category', 'Cash In (₹)', 'Cash Out (₹)', 'Bank In (₹)', 'Bank Out (₹)', 'Payment Mode', 'Ref No'],
    Members: ['Ledger No', 'Name', 'Contact Number', 'Address', 'Joining Month', 'Joining Year', 'Monthly Donation', 'Payment Start Month', 'Payment Start Year', 'Status'],
    MemberLedger: ['Date', 'Ledger No', 'Member Name', 'Contact', 'From Month', 'To Month', 'Months Count', 'Monthly Rate', 'Total Amount', 'Mode', 'Ref', 'Remarks'],
    Vendors: ['Vendor ID', 'Vendor Name', 'Contact Number', 'Address', 'GST Number', 'GST %', 'Attached Items', 'Notes'],
    Items: ['Item ID', 'Item Name', 'Unit', 'Default Rate', 'CGST %', 'SGST %', 'IGST %', 'Category', 'Notes'],
    Tokens: ['Date', 'Token Name', 'Rs 500', 'Rs 200', 'Rs 100', 'Rs 50', 'Rs 10', 'Total Amount', 'Created At'],
    AuditLog: ['Audit ID', 'Original ID', 'Book Name', 'Date', 'Particulars', 'Old Amount', 'New Amount', 'Difference', 'Modified By', 'Timestamp', 'Reason']
  };

  for (var key in headers) {
    var sheet = ss.getSheetByName(key);
    if (!sheet) {
      sheet = ss.insertSheet(key);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers[key]);
      var range = sheet.getRange(1, 1, 1, headers[key].length);
      range.setBackground('#b91c1c').setFontColor('#ffffff').setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  
  return { status: 'success', message: 'All 8 Sheets initialized with headers successfully!' };
}

/**
 * Handle POST request from web app to backup LiveWebData to Google Drive,
 * replacing the old backup file every time!
 */
function doPost(e) {
  try {
    var postData = JSON.parse(e.postData.contents);
    
    // Save LiveWebData file to Google Drive (replaces old file)
    if (postData.action === 'saveLiveWebData' || postData.action === 'backup') {
      var fileName = 'LiveWebData.json';
      var contentString = typeof postData.data === 'string' ? postData.data : JSON.stringify(postData.data, null, 2);
      
      var files = DriveApp.getFilesByName(fileName);
      var driveFile;
      if (files.hasNext()) {
        driveFile = files.next();
        driveFile.setContent(contentString); // REPLACES OLD BACKUP FILE!
      } else {
        driveFile = DriveApp.createFile(fileName, contentString, MimeType.PLAIN_TEXT);
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'LiveWebData backup file updated in Google Drive (replaced old backup)!',
        fileId: driveFile.getId(),
        updatedAt: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'ok' })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Save LiveWebData directly to Google Drive (Can also be run via Apps Script trigger)
 */
function saveLiveWebDataToDrive(contentString) {
  var fileName = 'LiveWebData.json';
  var files = DriveApp.getFilesByName(fileName);
  var driveFile;
  if (files.hasNext()) {
    driveFile = files.next();
    driveFile.setContent(contentString); // Replaces old backup!
  } else {
    driveFile = DriveApp.createFile(fileName, contentString, MimeType.PLAIN_TEXT);
  }
  return driveFile.getId();
}

/**
 * API: Fetch all books data in single payload
 */
function getAllData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {};
  
  for (var key in SHEETS) {
    var sheetName = SHEETS[key];
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      result[key] = [];
      continue;
    }
    var data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      result[key] = [];
      continue;
    }
    var headers = data[0];
    var rows = [];
    for (var i = 1; i < data.length; i++) {
      var rowObj = {};
      for (var j = 0; j < headers.length; j++) {
        rowObj[headers[j]] = data[i][j];
      }
      rows.push(rowObj);
    }
    result[key] = rows;
  }
  
  return JSON.stringify(result);
}

/**
 * API: Append DayBook Entry & Sync to Ledger
 */
function addDayBookEntry(entryData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.DAY_BOOK);
  if (!sheet) initialSetup();
  sheet = ss.getSheetByName(SHEETS.DAY_BOOK);

  sheet.appendRow([
    entryData.id,
    entryData.date,
    entryData.month,
    entryData.year,
    entryData.entryType,
    entryData.category,
    entryData.particulars,
    entryData.description || '',
    entryData.amount,
    entryData.paymentMode,
    entryData.refNumber || '',
    entryData.memberName || entryData.vendorName || '',
    new Date().toISOString()
  ]);

  // Sync to Ledger
  var ledgerSheet = ss.getSheetByName(SHEETS.LEDGER);
  if (ledgerSheet) {
    var isCashIn = entryData.entryType === 'Cash In';
    var isCashOut = entryData.entryType === 'Cash Out';
    var isBankIn = entryData.entryType === 'Bank In';
    var isBankOut = entryData.entryType === 'Bank Out';

    ledgerSheet.appendRow([
      entryData.date,
      entryData.particulars,
      entryData.category,
      isCashIn ? entryData.amount : 0,
      isCashOut ? entryData.amount : 0,
      isBankIn ? entryData.amount : 0,
      isBankOut ? entryData.amount : 0,
      entryData.paymentMode,
      entryData.refNumber || ''
    ]);
  }

  return { success: true, id: entryData.id };
}

/**
 * API: Record audit trail for modifications
 */
function logAuditEntry(auditData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEETS.AUDIT_LOG);
  if (!sheet) initialSetup();
  sheet = ss.getSheetByName(SHEETS.AUDIT_LOG);

  sheet.appendRow([
    auditData.id,
    auditData.originalEntryId,
    auditData.bookName,
    auditData.date,
    auditData.particulars,
    auditData.oldAmount,
    auditData.newAmount,
    auditData.difference,
    auditData.modifiedBy,
    auditData.timestamp,
    auditData.reason || ''
  ]);

  return { success: true };
}

/**
 * Include partial HTML files
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
`;
}

export function generateStandaloneHtml(): string {
  return `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>जय बाबा महाकाल की रसोई - SaaS Management System</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Tiro+Devanagari+Hindi&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', 'Tiro Devanagari Hindi', sans-serif; }
  </style>
</head>
<body class="bg-stone-50 text-stone-900 min-h-screen">
  <div class="p-6 max-w-7xl mx-auto">
    <header class="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800 text-white p-6 rounded-2xl shadow-xl mb-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black tracking-tight">जय बाबा महाकाल की रसोई</h1>
          <p class="text-amber-100 text-sm mt-1">SaaS Accounting, Day Book, Member Book &amp; Ledger Suite (2026-2030)</p>
        </div>
        <div class="bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-xs">
          Google Apps Script Web App Ready
        </div>
      </div>
    </header>
    <div class="bg-white p-8 rounded-2xl shadow-md border border-stone-200">
      <h2 class="text-xl font-bold text-stone-800 mb-3">Google Apps Script HTML Container</h2>
      <p class="text-stone-600 text-sm mb-4">
        This file can be saved as <code>Index.html</code> in your Google Apps Script project alongside <code>Code.gs</code>.
        It runs seamlessly inside Google Workspace, connects directly with Google Sheets tabs, and supports live two-way sync!
      </p>
    </div>
  </div>
</body>
</html>`;
}
