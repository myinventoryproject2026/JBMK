import * as XLSX from 'xlsx';
import {
  DayBookEntry,
  Member,
  MemberLedgerPayment,
  Item,
  Vendor,
  LedgerAuditEntry,
} from '../types';

/**
 * Back up all data into a single Excel file with separate sheets:
 * DayBook, Ledger, Members, MemberLedger, Vendors, Items, Tokens, AuditLog
 */
export function backupAllDataToExcel(data: {
  dayBook: DayBookEntry[];
  members: Member[];
  memberLedgers: MemberLedgerPayment[];
  vendors: Vendor[];
  items: Item[];
  auditLogs: LedgerAuditEntry[];
}) {
  const wb = XLSX.utils.book_new();

  // 1. DayBook Sheet
  const dayBookRows = data.dayBook.map((e) => ({
    'ID': e.id,
    'Date': e.date,
    'Month': e.month,
    'Year': e.year,
    'Type': e.entryType,
    'Category': e.category,
    'Particulars': e.particulars,
    'Description': e.description || '',
    'Amount (₹)': e.amount,
    'Payment Mode': e.paymentMode,
    'Ref/Cheque No': e.refNumber || '',
    'Member Name': e.memberName || '',
    'Vendor Name': e.vendorName || '',
    'Created At': e.createdAt,
  }));
  const wsDayBook = XLSX.utils.json_to_sheet(dayBookRows);
  XLSX.utils.book_append_sheet(wb, wsDayBook, 'DayBook');

  // 2. Ledger Sheet (Combined cash/bank view)
  const ledgerRows = data.dayBook.map((e) => {
    const isCashIn = e.entryType === 'Cash In';
    const isCashOut = e.entryType === 'Cash Out';
    const isBankIn = e.entryType === 'Bank In';
    const isBankOut = e.entryType === 'Bank Out';

    return {
      'Date': e.date,
      'Particulars': e.particulars,
      'Voucher Type': e.category,
      'Cash In (Debit)': isCashIn ? e.amount : 0,
      'Cash Out (Credit)': isCashOut ? e.amount : 0,
      'Bank In (Debit)': isBankIn ? e.amount : 0,
      'Bank Out (Credit)': isBankOut ? e.amount : 0,
      'Payment Mode': e.paymentMode,
      'Ref No': e.refNumber || '',
    };
  });
  const wsLedger = XLSX.utils.json_to_sheet(ledgerRows);
  XLSX.utils.book_append_sheet(wb, wsLedger, 'LedgerBook');

  // 3. Members Master Sheet
  const memberRows = data.members.map((m) => ({
    'Ledger No': m.ledgerNo,
    'Member Name': m.name,
    'Contact Number': m.contactNumber,
    'Address': m.address,
    'Joining Month': m.joiningMonth,
    'Joining Year': m.joiningYear,
    'Monthly Donation (₹)': m.monthlyAmount,
    'Payment Start Month': m.paymentStartMonth,
    'Payment Start Year': m.paymentStartYear,
    'Status': m.status,
  }));
  const wsMembers = XLSX.utils.json_to_sheet(memberRows);
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Members');

  // 4. Member Ledger Payments Sheet
  const memberLedgerRows = data.memberLedgers.map((ml) => ({
    'Date': ml.date,
    'Ledger No': ml.ledgerNo,
    'Member Name': ml.memberName,
    'Contact': ml.contactNumber,
    'Paid From Month': `${ml.fromYear}-${String(ml.fromMonth).padStart(2, '0')}`,
    'Paid To Month': `${ml.toYear}-${String(ml.toMonth).padStart(2, '0')}`,
    'Months Covered': ml.monthsCovered.join(', '),
    'Monthly Rate (₹)': ml.monthlyRate,
    'Total Amount (₹)': ml.totalAmount,
    'Payment Mode': ml.paymentMode,
    'Remarks': ml.remarks || '',
  }));
  const wsMemberLedgers = XLSX.utils.json_to_sheet(memberLedgerRows);
  XLSX.utils.book_append_sheet(wb, wsMemberLedgers, 'MemberLedger');

  // 5. Vendors Sheet
  const vendorRows = data.vendors.map((v) => ({
    'Vendor ID': v.id,
    'Vendor Name': v.name,
    'Contact Number': v.contactNumber,
    'Address': v.address,
    'GST Number': v.gstNumber || '',
    'GST %': v.gstPercent ?? '',
    'Attached Items Count': v.attachedItemIds.length,
    'Notes': v.notes || '',
  }));
  const wsVendors = XLSX.utils.json_to_sheet(vendorRows);
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors');

  // 6. Items Sheet
  const itemRows = data.items.map((i) => ({
    'Item ID': i.id,
    'Item Name': i.name,
    'Unit Type': i.unit,
    'Default Rate (₹)': i.defaultRate ?? '',
    'CGST %': i.cgstPercent ?? 0,
    'SGST %': i.sgstPercent ?? 0,
    'IGST %': i.igstPercent ?? 0,
    'Category': i.category || '',
    'Notes': i.notes || '',
  }));
  const wsItems = XLSX.utils.json_to_sheet(itemRows);
  XLSX.utils.book_append_sheet(wb, wsItems, 'Items');

  // 7. Tokens Breakdown Sheet
  const tokenRows = data.dayBook
    .filter((e) => e.category === 'Token' && e.tokenBreakdown)
    .map((e) => ({
      'Date': e.date,
      'Token/Counter Name': e.tokenBreakdown?.tokenName || e.particulars,
      'Rs 500 Count': e.tokenBreakdown?.note500 || 0,
      'Rs 500 Value': (e.tokenBreakdown?.note500 || 0) * 500,
      'Rs 200 Count': e.tokenBreakdown?.note200 || 0,
      'Rs 200 Value': (e.tokenBreakdown?.note200 || 0) * 200,
      'Rs 100 Count': e.tokenBreakdown?.note100 || 0,
      'Rs 100 Value': (e.tokenBreakdown?.note100 || 0) * 100,
      'Rs 50 Count': e.tokenBreakdown?.note50 || 0,
      'Rs 50 Value': (e.tokenBreakdown?.note50 || 0) * 50,
      'Rs 10 Count': e.tokenBreakdown?.note10 || 0,
      'Rs 10 Value': (e.tokenBreakdown?.note10 || 0) * 10,
      'Total Amount (₹)': e.amount,
    }));
  const wsTokens = XLSX.utils.json_to_sheet(tokenRows);
  XLSX.utils.book_append_sheet(wb, wsTokens, 'Tokens');

  // 8. Audit Trail Sheet
  const auditRows = data.auditLogs.map((a) => ({
    'Audit ID': a.id,
    'Original Ref ID': a.originalEntryId,
    'Book Name': a.bookName,
    'Date of Record': a.date,
    'Particulars': a.particulars,
    'Old Amount (₹)': a.oldAmount,
    'New Amount (₹)': a.newAmount,
    'Difference (₹)': a.difference,
    'Modified By User': a.modifiedBy,
    'Timestamp': a.timestamp,
    'Modification Reason': a.reason || '',
  }));
  const wsAudit = XLSX.utils.json_to_sheet(auditRows);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'AuditTrail');

  const fileName = `Mahakal_Rasoi_Complete_Backup_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * Save backup file specifically named 'LiveWebData.xlsx' (and download/replace),
 * plus return formatted JSON for Google Drive / Google Apps Script sync.
 */
export function saveLiveWebDataBackup(data: {
  dayBook: DayBookEntry[];
  members: Member[];
  memberLedgers: MemberLedgerPayment[];
  vendors: Vendor[];
  items: Item[];
  auditLogs: LedgerAuditEntry[];
}): { jsonString: string; fileName: string } {
  const wb = XLSX.utils.book_new();

  // 1. DayBook Sheet
  const wsDayBook = XLSX.utils.json_to_sheet(data.dayBook.map((e) => ({
    'ID': e.id,
    'Date': e.date,
    'Month': e.month,
    'Year': e.year,
    'Type': e.entryType,
    'Category': e.category,
    'Particulars': e.particulars,
    'Description': e.description || '',
    'Amount (₹)': e.amount,
    'Payment Mode': e.paymentMode,
    'Ref/Cheque No': e.refNumber || '',
    'Member Name': e.memberName || '',
    'Vendor Name': e.vendorName || '',
    'Created At': e.createdAt,
  })));
  XLSX.utils.book_append_sheet(wb, wsDayBook, 'DayBook');

  // 2. Ledger Sheet
  const wsLedger = XLSX.utils.json_to_sheet(data.dayBook.map((e) => ({
    'Date': e.date,
    'Particulars': e.particulars,
    'Voucher Type': e.category,
    'Cash In': e.entryType === 'Cash In' ? e.amount : 0,
    'Cash Out': e.entryType === 'Cash Out' ? e.amount : 0,
    'Bank In': e.entryType === 'Bank In' ? e.amount : 0,
    'Bank Out': e.entryType === 'Bank Out' ? e.amount : 0,
    'Payment Mode': e.paymentMode,
    'Ref No': e.refNumber || '',
  })));
  XLSX.utils.book_append_sheet(wb, wsLedger, 'LedgerBook');

  // 3. Members Sheet
  const wsMembers = XLSX.utils.json_to_sheet(data.members.map((m) => ({
    'Ledger No': m.ledgerNo,
    'Member Name': m.name,
    'Contact Number': m.contactNumber,
    'Address': m.address,
    'Joining Month': m.joiningMonth,
    'Joining Year': m.joiningYear,
    'Monthly Pledge (₹)': m.monthlyAmount,
    'Status': m.status,
  })));
  XLSX.utils.book_append_sheet(wb, wsMembers, 'Members');

  // 4. MemberLedger Sheet
  const wsMemberLedgers = XLSX.utils.json_to_sheet(data.memberLedgers.map((ml) => ({
    'Date': ml.date,
    'Ledger No': ml.ledgerNo,
    'Member Name': ml.memberName,
    'Contact': ml.contactNumber,
    'Months Covered': ml.monthsCovered.join(', '),
    'Monthly Rate (₹)': ml.monthlyRate,
    'Total Amount (₹)': ml.totalAmount,
    'Payment Mode': ml.paymentMode,
    'Remarks': ml.remarks || '',
  })));
  XLSX.utils.book_append_sheet(wb, wsMemberLedgers, 'MemberLedger');

  // 5. Vendors Sheet
  const wsVendors = XLSX.utils.json_to_sheet(data.vendors.map((v) => ({
    'Vendor Name': v.name,
    'Contact': v.contactNumber,
    'Address': v.address,
    'GST No': v.gstNumber || '',
    'GST %': v.gstPercent ?? '',
    'Notes': v.notes || '',
  })));
  XLSX.utils.book_append_sheet(wb, wsVendors, 'Vendors');

  // 6. Items Sheet
  const wsItems = XLSX.utils.json_to_sheet(data.items.map((i) => ({
    'Item Name': i.name,
    'Unit': i.unit,
    'Rate (₹)': i.defaultRate || '',
    'CGST %': i.cgstPercent || 0,
    'SGST %': i.sgstPercent || 0,
    'IGST %': i.igstPercent || 0,
    'Category': i.category || '',
  })));
  XLSX.utils.book_append_sheet(wb, wsItems, 'Items');

  // 7. Tokens Sheet
  const wsTokens = XLSX.utils.json_to_sheet(data.dayBook
    .filter((e) => e.category === 'Token' && e.tokenBreakdown)
    .map((e) => ({
      'Date': e.date,
      'Name': e.tokenBreakdown?.tokenName || e.particulars,
      'Rs 500 Count': e.tokenBreakdown?.note500 || 0,
      'Rs 200 Count': e.tokenBreakdown?.note200 || 0,
      'Rs 100 Count': e.tokenBreakdown?.note100 || 0,
      'Rs 50 Count': e.tokenBreakdown?.note50 || 0,
      'Rs 10 Count': e.tokenBreakdown?.note10 || 0,
      'Total Amount': e.amount,
    })));
  XLSX.utils.book_append_sheet(wb, wsTokens, 'Tokens');

  // 8. Audit Trail Sheet
  const wsAudit = XLSX.utils.json_to_sheet(data.auditLogs.map((a) => ({
    'Audit ID': a.id,
    'Book': a.bookName,
    'Date': a.date,
    'Particulars': a.particulars,
    'Old Amount': a.oldAmount,
    'New Amount': a.newAmount,
    'Difference': a.difference,
    'Modified By': a.modifiedBy,
    'Timestamp': a.timestamp,
    'Reason': a.reason || '',
  })));
  XLSX.utils.book_append_sheet(wb, wsAudit, 'AuditTrail');

  const fileName = 'LiveWebData.xlsx';
  XLSX.writeFile(wb, fileName);

  const jsonString = JSON.stringify({
    savedAt: new Date().toISOString(),
    ...data,
  }, null, 2);

  return { jsonString, fileName };
}

/**
 * Export Day Book with custom filter (All, Cash, Bank)
 */
export function exportDayBookExcel(entries: DayBookEntry[], filterType: 'All' | 'Cash' | 'Bank') {
  const filtered = entries.filter((e) => {
    if (filterType === 'Cash') return e.entryType.startsWith('Cash');
    if (filterType === 'Bank') return e.entryType.startsWith('Bank');
    return true;
  });

  const rows = filtered.map((e, idx) => ({
    'S.No': idx + 1,
    'Date': e.date,
    'Type': e.entryType,
    'Category': e.category,
    'Particulars': e.particulars,
    'Description': e.description || '',
    'Amount (₹)': e.amount,
    'Payment Mode': e.paymentMode,
    'Ref / Cheque': e.refNumber || '',
    'Member / Vendor': e.memberName || e.vendorName || '-',
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, `DayBook_${filterType}`);
  XLSX.writeFile(wb, `DayBook_${filterType}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Members to Excel
 */
export function exportMembersToExcel(members: Member[]) {
  const rows = members.map((m) => ({
    'Ledger No': m.ledgerNo,
    'Member Name': m.name,
    'Contact Number': m.contactNumber,
    'Address': m.address,
    'Joining Month': m.joiningMonth,
    'Joining Year': m.joiningYear,
    'Monthly Pledge (₹)': m.monthlyAmount,
    'Status': m.status,
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Members');
  XLSX.writeFile(wb, `Mahakal_Rasoi_Members_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Member Ledgers to Excel
 */
export function exportMemberLedgersToExcel(records: MemberLedgerPayment[]) {
  const rows = records.map((r) => ({
    'Date': r.date,
    'Ledger No': r.ledgerNo,
    'Member Name': r.memberName,
    'Contact Number': r.contactNumber,
    'From Month': `${r.fromYear}-${String(r.fromMonth).padStart(2, '0')}`,
    'To Month': `${r.toYear}-${String(r.toMonth).padStart(2, '0')}`,
    'Months Paid Count': r.monthsCovered.length,
    'Monthly Amount (₹)': r.monthlyRate,
    'Total Paid (₹)': r.totalAmount,
    'Mode': r.paymentMode,
    'Reference': r.refNumber || '',
    'Remarks': r.remarks || '',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'MemberLedger');
  XLSX.writeFile(wb, `Member_Ledger_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Items to Excel
 */
export function exportItemsToExcel(items: Item[]) {
  const rows = items.map((i) => ({
    'Item Name': i.name,
    'Unit Type': i.unit,
    'Default Rate (₹)': i.defaultRate || '',
    'CGST %': i.cgstPercent || 0,
    'SGST %': i.sgstPercent || 0,
    'IGST %': i.igstPercent || 0,
    'Category': i.category || '',
    'Notes': i.notes || '',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Items');
  XLSX.writeFile(wb, `Items_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Export Vendors to Excel
 */
export function exportVendorsToExcel(vendors: Vendor[], items: Item[]) {
  const itemMap = new Map(items.map((i) => [i.id, i.name]));
  const rows = vendors.map((v) => ({
    'Vendor Name': v.name,
    'Contact Number': v.contactNumber,
    'Address': v.address,
    'GST Number': v.gstNumber || '',
    'GST %': v.gstPercent ?? '',
    'Supplied Items': v.attachedItemIds.map((id) => itemMap.get(id) || id).join(', '),
    'Notes': v.notes || '',
  }));
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
  XLSX.writeFile(wb, `Vendors_List_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

/**
 * Parse Excel file to JSON
 */
export async function parseExcelFile<T = any>(file: File): Promise<T[]> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = wb.SheetNames[0];
  const worksheet = wb.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<T>(worksheet);
}
