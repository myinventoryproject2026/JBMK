import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Calendar,
  AlertCircle,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import * as XLSX from 'xlsx';
import { t } from '../utils/translations';

export const LedgerBook: React.FC = () => {
  const {
    dayBook,
    auditLogs,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    theme,
    lang,
  } = useApp();

  const strings = t(lang);

  const [activeTab, setActiveTab] = useState<'ledger' | 'audit'>('ledger');
  const [dayFilter, setDayFilter] = useState<string>(''); // specific date filter YYYY-MM-DD
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [accountFilter, setAccountFilter] = useState<'All' | 'Cash' | 'Bank'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtered ledger entries
  const filteredLedgerEntries = useMemo(() => {
    return dayBook.filter((e) => {
      const matchMonth = e.month === selectedMonth;
      const matchYear = e.year === selectedYear;
      const matchDay = !dayFilter || e.date === dayFilter;
      const matchAccount =
        accountFilter === 'All'
          ? true
          : accountFilter === 'Cash'
          ? e.entryType.startsWith('Cash')
          : e.entryType.startsWith('Bank');
      const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const matchSearch =
        !searchQuery.trim() ||
        e.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.refNumber && e.refNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchMonth && matchYear && matchDay && matchAccount && matchCategory && matchSearch;
    });
  }, [dayBook, selectedMonth, selectedYear, dayFilter, accountFilter, categoryFilter, searchQuery]);

  // Aggregate Metrics for Ledger
  const totalCashIn = filteredLedgerEntries
    .filter((e) => e.entryType === 'Cash In')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCashOut = filteredLedgerEntries
    .filter((e) => e.entryType === 'Cash Out')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBankIn = filteredLedgerEntries
    .filter((e) => e.entryType === 'Bank In')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBankOut = filteredLedgerEntries
    .filter((e) => e.entryType === 'Bank Out')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalAllIn = totalCashIn + totalBankIn;
  const totalAllOut = totalCashOut + totalBankOut;
  const netCashBalance = totalCashIn - totalCashOut;
  const netBankBalance = totalBankIn - totalBankOut;
  const grandTotalBalance = netCashBalance + netBankBalance;

  // Export Day-to-Day Ledger to Excel
  const handleExportLedgerExcel = () => {
    const rows = filteredLedgerEntries.map((e, idx) => {
      const isCashIn = e.entryType === 'Cash In';
      const isCashOut = e.entryType === 'Cash Out';
      const isBankIn = e.entryType === 'Bank In';
      const isBankOut = e.entryType === 'Bank Out';

      return {
        'क्रमांक (S.No)': idx + 1,
        'दिनांक (Date)': e.date,
        'खाता विवरण (Particulars)': e.particulars,
        'वाउचर श्रेणी (Category)': e.category,
        'Cash In (Debit ₹)': isCashIn ? e.amount : 0,
        'Cash Out (Credit ₹)': isCashOut ? e.amount : 0,
        'Bank In (Debit ₹)': isBankIn ? e.amount : 0,
        'Bank Out (Credit ₹)': isBankOut ? e.amount : 0,
        'भुगतान माध्यम (Mode)': e.paymentMode,
        'Ref/Cheque No': e.refNumber || '',
        'संशोधित स्थिति': e.isEdited ? 'संशोधित (Edited)' : 'मूल प्रविष्टि',
      };
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, 'DayToDayLedger');
    XLSX.writeFile(wb, `Ledger_Book_${selectedYear}_${selectedMonth}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Receipt className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              लेज़र बहीखाता (Ledger Book)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            संयुक्त रोकड़ व बैंक बही, दिन-प्रतिदिन (Day-to-Day) खाता एवं ऑडिट संशोधन रिकॉर्ड
          </p>
        </div>

        {/* Period Selector & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-300">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white text-xs font-bold text-stone-800 py-1 px-2.5 rounded-lg border border-stone-200 cursor-pointer"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white text-xs font-bold text-stone-800 py-1 px-2.5 rounded-lg border border-stone-200 cursor-pointer"
            >
              {YEARS_LIST.map((y) => (
                <option key={y} value={y}>
                  वर्ष {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleExportLedgerExcel}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>लेज़र एक्सेल में सेव करें (Day to Day)</span>
          </button>
        </div>
      </div>

      {/* 4-Column Key Financial Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Total In */}
        <div className="bg-emerald-50/90 border border-emerald-200 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-emerald-800 font-bold">
            <span>कुल आवक (Total In - Cash &amp; Bank)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700 mt-1">
            ₹{totalAllIn.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-900/80 mt-1 flex justify-between">
            <span>Cash: ₹{totalCashIn.toLocaleString('en-IN')}</span>
            <span>Bank: ₹{totalBankIn.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Out */}
        <div className="bg-rose-50/90 border border-rose-200 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-rose-800 font-bold">
            <span>कुल व्यय (Total Out - Cash &amp; Bank)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700 mt-1">
            ₹{totalAllOut.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-rose-900/80 mt-1 flex justify-between">
            <span>Cash: ₹{totalCashOut.toLocaleString('en-IN')}</span>
            <span>Bank: ₹{totalBankOut.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Cash Net Balance */}
        <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl">
          <div className="text-amber-900 font-bold">शुद्ध नकद शेष (Cash Balance)</div>
          <div className="text-xl font-black text-amber-900 mt-1">
            ₹{netCashBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-amber-800/80 mt-1">
            (Cash In ₹{totalCashIn.toLocaleString('en-IN')} - Cash Out ₹{totalCashOut.toLocaleString('en-IN')})
          </div>
        </div>

        {/* Bank Net Balance */}
        <div className="bg-blue-50/90 border border-blue-200 p-3.5 rounded-2xl">
          <div className="text-blue-900 font-bold">शुद्ध बैंक शेष (Bank Balance)</div>
          <div className="text-xl font-black text-blue-900 mt-1">
            ₹{netBankBalance.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-blue-800/80 mt-1">
            (Bank In ₹{totalBankIn.toLocaleString('en-IN')} - Bank Out ₹{totalBankOut.toLocaleString('en-IN')})
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'ledger'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span>दिन-प्रतिदिन लेज़र प्रविष्टियाँ (Day to Day Ledger)</span>
            <span className="bg-stone-800 text-[10px] px-1.5 py-0.5 rounded text-stone-300">
              {filteredLedgerEntries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-amber-700 text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>संशोधित ऑडिट प्रविष्टियाँ (Audit Trail &amp; Modifications)</span>
            <span className="bg-amber-100 text-amber-900 text-[10px] px-1.5 py-0.5 rounded font-black">
              {auditLogs.length}
            </span>
          </button>
        </div>

        <div className="text-xs text-stone-500 font-medium hidden sm:block">
          कुल शुद्ध शेष: <b className="text-stone-900">₹{grandTotalBalance.toLocaleString('en-IN')}</b>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* TAB 1: DAY TO DAY LEDGER TABLE                                    */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Day to Day Filter Controls */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-stone-500" />
              <span className="font-semibold text-stone-700">दिन अनुसार फ़िल्टर (Day to Day):</span>
              <input
                type="date"
                value={dayFilter}
                onChange={(e) => setDayFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-lg p-1.5 focus:ring-1 focus:ring-amber-500"
              />
              {dayFilter && (
                <button
                  onClick={() => setDayFilter('')}
                  className="text-[11px] text-amber-700 font-bold hover:underline"
                >
                  सभी दिन देखें
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">खाता:</span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                {(['All', 'Cash', 'Bank'] as const).map((acc) => (
                  <button
                    key={acc}
                    onClick={() => setAccountFilter(acc)}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                      accountFilter === acc
                        ? 'bg-amber-600 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {acc === 'All' ? 'दोनों (Both)' : acc}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-700">श्रेणी:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-stone-50 border border-stone-300 rounded-lg py-1 px-2 text-xs font-semibold"
              >
                <option value="All">सभी श्रेणियाँ (All)</option>
                <option value="Token">टोकन / करंसी (Token)</option>
                <option value="Member Payment">सदस्य अंशदान (Member)</option>
                <option value="Purchase">सामग्री क्रय (Purchase)</option>
                <option value="General">सामान्य (General)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <input
                type="text"
                placeholder="खोजें विवरण..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Master Ledger Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">दिनांक</th>
                    <th className="py-3 px-3">खाता विवरण (Particulars)</th>
                    <th className="py-3 px-3">वाउचर श्रेणी</th>
                    <th className="py-3 px-3 text-right bg-emerald-50/40 text-emerald-900">
                      Cash In (₹)
                    </th>
                    <th className="py-3 px-3 text-right bg-rose-50/40 text-rose-900">
                      Cash Out (₹)
                    </th>
                    <th className="py-3 px-3 text-right bg-blue-50/40 text-blue-900">
                      Bank In (₹)
                    </th>
                    <th className="py-3 px-3 text-right bg-purple-50/40 text-purple-900">
                      Bank Out (₹)
                    </th>
                    <th className="py-3 px-3">माध्यम / Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLedgerEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        कोई लेज़र प्रविष्टि उपलब्ध नहीं है।
                      </td>
                    </tr>
                  ) : (
                    filteredLedgerEntries.map((entry) => {
                      const isCashIn = entry.entryType === 'Cash In';
                      const isCashOut = entry.entryType === 'Cash Out';
                      const isBankIn = entry.entryType === 'Bank In';
                      const isBankOut = entry.entryType === 'Bank Out';

                      return (
                        <tr
                          key={entry.id}
                          className={`hover:bg-amber-50/30 transition ${
                            entry.isEdited ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-stone-700 whitespace-nowrap">
                            {entry.date}
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                              <span>{entry.particulars}</span>
                              {entry.isEdited && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                                  संशोधित (Edited)
                                </span>
                              )}
                            </div>
                            {entry.description && (
                              <div className="text-[10px] text-stone-500">{entry.description}</div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200">
                              {entry.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                            {isCashIn ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-rose-700 bg-rose-50/20 whitespace-nowrap">
                            {isCashOut ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-blue-700 bg-blue-50/20 whitespace-nowrap">
                            {isBankIn ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-purple-700 bg-purple-50/20 whitespace-nowrap">
                            {isBankOut ? `₹${entry.amount.toLocaleString('en-IN')}` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-stone-600 whitespace-nowrap">
                            <div>{entry.paymentMode}</div>
                            {entry.refNumber && (
                              <span className="text-[9px] font-mono text-stone-400">{entry.refNumber}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {/* Total Footer Row */}
                <tfoot>
                  <tr className="bg-stone-100 font-extrabold text-stone-900 border-t-2 border-stone-300 text-xs">
                    <td colSpan={3} className="py-3 px-3 text-right">
                      कुल योग (Totals):
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-800">
                      ₹{totalCashIn.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-rose-800">
                      ₹{totalCashOut.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-blue-800">
                      ₹{totalBankIn.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-3 text-right text-purple-800">
                      ₹{totalBankOut.toLocaleString('en-IN')}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* TAB 2: AUDIT TRAIL & DUPLICATE HIGHLIGHTED ENTRIES                */}
      {/* User requirement: "if any entry edit in day book entry,          */}
      {/* purchase book entry and member book entry then make a duplicate  */}
      {/* entry with high light and old amount, new amount."                */}
      {/* ----------------------------------------------------------------- */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-900 text-sm">
                लेज़र संशोधन ऑडिट ट्रेल (Audit Trail - Duplicate Highlighted Entries)
              </h4>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                नियम के अनुसार, जब भी डे बुक, क्रय बही या सदस्य बही में किसी प्रविष्टि को संपादित (Edit) किया जाता है,
                तो पारदर्शिता हेतु पुरानी राशि (Old Amount), नई राशि (New Amount) और अंतर के साथ यह हाइलाइटेड डुप्लीकेट रिकॉर्ड सुरक्षित किया जाता है।
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-amber-100/60 text-amber-950 font-bold border-b border-amber-200 uppercase text-[11px]">
                    <th className="py-3 px-3">संशोधन समय (Timestamp)</th>
                    <th className="py-3 px-3">मूल बही (Book Name)</th>
                    <th className="py-3 px-3">दिनांक</th>
                    <th className="py-3 px-3">खाता विवरण (Particulars)</th>
                    <th className="py-3 px-3 text-right text-stone-600">पुरानी राशि (Old Amount)</th>
                    <th className="py-3 px-3 text-right text-amber-900">संशोधित राशि (New Amount)</th>
                    <th className="py-3 px-3 text-right">अंतर (Difference)</th>
                    <th className="py-3 px-3">संशोधनकर्ता (User)</th>
                    <th className="py-3 px-3">संशोधन कारण (Reason)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-stone-400">
                        अब तक कोई प्रविष्टि संपादित नहीं की गई है (No edits recorded yet).
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((audit) => {
                      const isPositiveDiff = audit.difference >= 0;
                      return (
                        <tr
                          key={audit.id}
                          className="bg-amber-50/30 hover:bg-amber-100/40 transition border-l-4 border-l-amber-500"
                        >
                          <td className="py-3 px-3 font-mono text-[10px] text-stone-500 whitespace-nowrap">
                            {new Date(audit.timestamp).toLocaleString('hi-IN')}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold">
                              {audit.bookName}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-stone-700 whitespace-nowrap">
                            {audit.date}
                          </td>
                          <td className="py-3 px-3 font-bold text-stone-900 max-w-xs">
                            {audit.particulars}
                          </td>
                          <td className="py-3 px-3 text-right font-medium text-stone-500 line-through">
                            ₹{audit.oldAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-amber-900 text-sm">
                            ₹{audit.newAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-bold whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] ${
                                isPositiveDiff
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {isPositiveDiff ? '+' : ''}₹{audit.difference.toLocaleString('en-IN')}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-semibold text-stone-700">@{audit.modifiedBy}</span>
                          </td>
                          <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={audit.reason}>
                            {audit.reason || 'संशोधन'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
