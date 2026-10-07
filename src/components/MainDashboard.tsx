import React from 'react';
import {
  Wallet,
  Building2,
  Users,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
  Save,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import { THEME_CONFIGS } from '../utils/theme';
import { backupAllDataToExcel } from '../utils/excel';
import { t } from '../utils/translations';

export const MainDashboard: React.FC = () => {
  const {
    theme,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    dayBook,
    members,
    memberLedgers,
    vendors,
    items,
    auditLogs,
    setActiveTab,
    saveAllNow,
    secondsUntilAutoSave,
    lang,
  } = useApp();

  const themeConfig = THEME_CONFIGS[theme];
  const strings = t(lang);
  const currentMonthName = MONTH_NAMES.find((m) => m.value === selectedMonth)?.name || `Month ${selectedMonth}`;

  // 1. Calculate Cash In / Cash Out for selected month & year
  const monthDayBook = dayBook.filter((e) => e.month === selectedMonth && e.year === selectedYear);

  const selectedMonthCashIn = monthDayBook
    .filter((e) => e.entryType === 'Cash In')
    .reduce((sum, e) => sum + e.amount, 0);

  const selectedMonthCashOut = monthDayBook
    .filter((e) => e.entryType === 'Cash Out')
    .reduce((sum, e) => sum + e.amount, 0);

  // Cumulative Overall Cash Balance
  const cumulativeCashIn = dayBook
    .filter((e) => e.entryType === 'Cash In')
    .reduce((sum, e) => sum + e.amount, 0);
  const cumulativeCashOut = dayBook
    .filter((e) => e.entryType === 'Cash Out')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalCashBalance = cumulativeCashIn - cumulativeCashOut;

  // 2. Calculate Bank In / Bank Out for selected month & year
  const selectedMonthBankIn = monthDayBook
    .filter((e) => e.entryType === 'Bank In')
    .reduce((sum, e) => sum + e.amount, 0);

  const selectedMonthBankOut = monthDayBook
    .filter((e) => e.entryType === 'Bank Out')
    .reduce((sum, e) => sum + e.amount, 0);

  // Cumulative Overall Bank Balance
  const cumulativeBankIn = dayBook
    .filter((e) => e.entryType === 'Bank In')
    .reduce((sum, e) => sum + e.amount, 0);
  const cumulativeBankOut = dayBook
    .filter((e) => e.entryType === 'Bank Out')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalBankBalance = cumulativeBankIn - cumulativeBankOut;

  // 3. Member calculations till selected month
  const totalMembers = members.length;
  const totalMonthlyPledge = members.reduce((sum, m) => sum + m.monthlyAmount, 0);

  // Compute expected dues & payments for all members from joining month to selectedMonth/selectedYear
  let totalMemberExpectedTillMonth = 0;
  let totalMemberPaidTillMonth = 0;

  members.forEach((member) => {
    // Months between joining and selected period
    const startPeriodVal = member.paymentStartYear * 12 + member.paymentStartMonth;
    const currentPeriodVal = selectedYear * 12 + selectedMonth;

    if (currentPeriodVal >= startPeriodVal) {
      const monthsElapsed = currentPeriodVal - startPeriodVal + 1;
      const expectedAmount = monthsElapsed * member.monthlyAmount;
      totalMemberExpectedTillMonth += expectedAmount;
    }

    // Sum member's total payments recorded
    const payments = memberLedgers.filter((ml) => ml.memberId === member.id);
    const paidSum = payments.reduce((acc, p) => acc + p.totalAmount, 0);
    totalMemberPaidTillMonth += paidSum;
  });

  const totalMemberBalanceTillMonth = Math.max(0, totalMemberExpectedTillMonth - totalMemberPaidTillMonth);

  // Recent entries list
  const recentEntries = [...dayBook].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 7);

  const handleBackupAll = () => {
    backupAllDataToExcel({
      dayBook,
      members,
      memberLedgers,
      vendors,
      items,
      auditLogs,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              मुख्य लेखा डैशबोर्ड (Main Dashboard)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            सत्र: <b>{currentMonthName} {selectedYear}</b> का वित्तीय सारांश एवं कैश-बैंक प्रवाह
          </p>
        </div>

        {/* Month & Year Selectors & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-300">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white text-xs font-bold text-stone-800 py-1.5 px-3 rounded-lg border border-stone-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
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
              className="bg-white text-xs font-bold text-stone-800 py-1.5 px-3 rounded-lg border border-stone-200 shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              {YEARS_LIST.map((y) => (
                <option key={y} value={y}>
                  वर्ष {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => saveAllNow(true)}
            className="flex items-center gap-1.5 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
          >
            <Save className="w-3.5 h-3.5 text-emerald-400" />
            <span>डेटा सुरक्षित करें (Save All)</span>
          </button>

          <button
            onClick={handleBackupAll}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>बैकअप एक्सेल (8 Sheets)</span>
          </button>
        </div>
      </div>

      {/* Auto-Save & 30s Status Alert Bar */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-stone-50 border border-amber-200/80 rounded-xl p-3 flex flex-wrap items-center justify-between text-xs text-amber-900 shadow-xs gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-700 animate-pulse" />
          <span>
            <b>ऑटो-सेव सक्रिय:</b> डेटा हर 30 सेकंड में स्वतः सुरक्षित होता है। अगला स्वतः सेव{' '}
            <span className="font-mono font-bold text-amber-800">{secondsUntilAutoSave} सेकंड</span> में।
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-stone-500">वित्तीय वर्ष: 2026 - 2030</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-100/80 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> सिंक स्थिति: सामान्य
          </span>
        </div>
      </div>

      {/* Primary KPI Grid: Cash, Bank, Members */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: CASH SUMMARY */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">नकद बही (Cash Balance)</h3>
                  <span className="text-[11px] text-stone-500">माह: {selectedMonth}/{selectedYear}</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                नकद खाता
              </span>
            </div>

            {/* Total cumulative cash balance */}
            <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 font-medium">कुल शुद्ध नकद शेष (Total Cash Balance):</div>
              <div className="text-2xl font-black text-amber-900 mt-0.5">
                ₹{totalCashBalance.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Selected Month Cash In / Cash Out */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>मासिक Cash In</span>
                </div>
                <div className="text-sm font-extrabold text-emerald-700 mt-1">
                  + ₹{selectedMonthCashIn.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  <span>मासिक Cash Out</span>
                </div>
                <div className="text-sm font-extrabold text-rose-700 mt-1">
                  - ₹{selectedMonthCashOut.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('daybook')}
            className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-700 hover:text-amber-800 transition"
          >
            <span>डे बुक में नकद प्रविष्टियाँ देखें</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 2: BANK SUMMARY */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-800 font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">बैंक खाता (Bank Balance)</h3>
                  <span className="text-[11px] text-stone-500">माह: {selectedMonth}/{selectedYear}</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 border border-blue-200">
                बैंक / UPI
              </span>
            </div>

            {/* Total Cumulative Bank Balance */}
            <div className="my-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="text-xs text-stone-500 font-medium">कुल शुद्ध बैंक शेष (Total Bank Balance):</div>
              <div className="text-2xl font-black text-blue-900 mt-0.5">
                ₹{totalBankBalance.toLocaleString('en-IN')}
              </div>
            </div>

            {/* Selected Month Bank In / Bank Out */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                  <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                  <span>मासिक Bank In</span>
                </div>
                <div className="text-sm font-extrabold text-emerald-700 mt-1">
                  + ₹{selectedMonthBankIn.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                <div className="flex items-center gap-1 text-[11px] font-semibold text-rose-800">
                  <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                  <span>मासिक Bank Out</span>
                </div>
                <div className="text-sm font-extrabold text-rose-700 mt-1">
                  - ₹{selectedMonthBankOut.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('ledger')}
            className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-blue-700 hover:text-blue-800 transition"
          >
            <span>लेज़र बही में बैंक पासबुक देखें</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* CARD 3: MEMBER SUMMARY */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">सदस्य अंशदान स्थिति (Members)</h3>
                  <span className="text-[11px] text-stone-500">जुड़ने से माह {selectedMonth}/{selectedYear} तक</span>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                {totalMembers} सेवादार
              </span>
            </div>

            <div className="my-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="text-[11px] text-stone-500">कुल सक्रिय सदस्य</div>
                <div className="text-base font-bold text-stone-800">{totalMembers} सदस्य</div>
              </div>
              <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                <div className="text-[11px] text-stone-500">मासिक अपेक्षित अंशदान</div>
                <div className="text-base font-bold text-amber-700">₹{totalMonthlyPledge.toLocaleString('en-IN')}/माह</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                <div className="text-[10px] font-semibold text-emerald-800">कुल जमा (Paid Till Month)</div>
                <div className="text-sm font-extrabold text-emerald-700 mt-0.5">
                  ₹{totalMemberPaidTillMonth.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bg-amber-50/70 p-2 rounded-xl border border-amber-100">
                <div className="text-[10px] font-semibold text-amber-800">बकाया राशि (Balance Due)</div>
                <div className="text-sm font-extrabold text-amber-800 mt-0.5">
                  ₹{totalMemberBalanceTillMonth.toLocaleString('en-IN')}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('members')}
            className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-700 hover:text-emerald-800 transition"
          >
            <span>सदस्य बही व व्हाट्सएप्प संदेश भेजें</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <h3 className="text-sm font-bold text-stone-800 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-600" />
          <span>त्वरित खाता प्रबंधन (Quick Actions &amp; Shortcuts)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={() => setActiveTab('daybook')}
            className="p-3 bg-stone-50 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 rounded-xl text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-800 group-hover:text-amber-900">
                + सामान्य प्रविष्टि (General)
              </span>
              <span className="text-[10px] font-mono bg-stone-200 group-hover:bg-amber-200 px-1.5 py-0.5 rounded text-stone-600">
                Alt+B
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">आय, व्यय व गुप्त दान दर्ज करें</p>
          </button>

          <button
            onClick={() => setActiveTab('daybook')}
            className="p-3 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-xl text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-800 group-hover:text-emerald-900">
                + सदस्य अंशदान (Member Pay)
              </span>
              <span className="text-[10px] font-mono bg-stone-200 group-hover:bg-emerald-200 px-1.5 py-0.5 rounded text-stone-600">
                Alt+P
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">माहवार अंशदान की गणना व रसीद</p>
          </button>

          <button
            onClick={() => setActiveTab('daybook')}
            className="p-3 bg-stone-50 hover:bg-blue-50 border border-stone-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-800 group-hover:text-blue-900">
                + सामग्री क्रय (Purchase)
              </span>
              <span className="text-[10px] font-mono bg-stone-200 group-hover:bg-blue-200 px-1.5 py-0.5 rounded text-stone-600">
                Alt+U
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">वेंडर बिल, GST व बहु-सामग्री एंट्री</p>
          </button>

          <button
            onClick={() => setActiveTab('daybook')}
            className="p-3 bg-stone-50 hover:bg-orange-50 border border-stone-200 hover:border-orange-300 rounded-xl text-left transition flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-stone-800 group-hover:text-orange-900">
                + टोकन व नोट गणक (Token)
              </span>
              <span className="text-[10px] font-mono bg-stone-200 group-hover:bg-orange-200 px-1.5 py-0.5 rounded text-stone-600">
                Alt+T
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-1">₹500, ₹200, ₹100, ₹50, ₹10 नोट मिलान</p>
          </button>
        </div>
      </div>

      {/* Recent Entries Feed */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-800">
              हाल ही की प्रविष्टियाँ (Recent Entries Feed)
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('daybook')}
            className="text-xs font-bold text-amber-700 hover:underline"
          >
            सम्पूर्ण डे बुक खोलें &rarr;
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 bg-stone-50/70">
                <th className="py-2.5 px-3">दिनांक (Date)</th>
                <th className="py-2.5 px-3">प्रकार (Type)</th>
                <th className="py-2.5 px-3">खाता श्रेणी (Category)</th>
                <th className="py-2.5 px-3">विवरण (Particulars)</th>
                <th className="py-2.5 px-3">माध्यम (Mode)</th>
                <th className="py-2.5 px-3 text-right">राशि (Amount)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {recentEntries.map((entry) => {
                const isIncoming = entry.entryType.includes('In');
                return (
                  <tr key={entry.id} className="hover:bg-stone-50/80 transition">
                    <td className="py-2.5 px-3 font-medium text-stone-700">{entry.date}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          isIncoming
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {entry.entryType}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200">
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-stone-900 max-w-xs truncate" title={entry.particulars}>
                      {entry.particulars}
                    </td>
                    <td className="py-2.5 px-3 text-stone-600">{entry.paymentMode}</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold text-sm ${
                        isIncoming ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {isIncoming ? '+' : '-'} ₹{entry.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
