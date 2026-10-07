import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  PlusCircle,
  Users,
  ShoppingCart,
  Coins,
  Download,
  Filter,
  Search,
  Trash2,
  Edit3,
  Calendar,
  Save,
  CheckCircle,
  X,
  CreditCard,
  Building,
  RefreshCw,
  Calculator,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DayBookEntry,
  EntryType,
  PaymentMode,
  BookCategory,
  PurchaseItemLine,
  CurrencyDenomination,
} from '../types';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import { exportDayBookExcel } from '../utils/excel';
import { t } from '../utils/translations';
import { calculateMemberBalance } from '../utils/memberCalculations';

export const DayBook: React.FC = () => {
  const {
    dayBook,
    addDayBookEntry,
    updateDayBookEntry,
    deleteDayBookEntry,
    members,
    memberLedgers,
    addMemberPayment,
    vendors,
    items,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    currentUser,
    shortcuts,
    setIsShortcutModalOpen,
    lang,
    showNotification,
  } = useApp();

  const strings = t(lang);

  // Active sub-section tab
  const [activeSubTab, setActiveSubTab] = useState<'records' | 'general' | 'member' | 'purchase' | 'token'>('records');

  // Filter state for records
  const [filterCategory, setFilterCategory] = useState<'All' | BookCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal State
  const [entryToDelete, setEntryToDelete] = useState<DayBookEntry | null>(null);

  // Edit Modal State
  const [editingEntry, setEditingEntry] = useState<DayBookEntry | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);
  const [editParticulars, setEditParticulars] = useState<string>('');
  const [editReason, setEditReason] = useState<string>('');

  // ----------------------------------------------------
  // FORM 1: GENERAL ENTRY STATE
  // ----------------------------------------------------
  const [genDate, setGenDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [genType, setGenType] = useState<EntryType>('Cash In');
  const [genParticulars, setGenParticulars] = useState('');
  const [genDescription, setGenDescription] = useState('');
  const [genAmount, setGenAmount] = useState<number | ''>('');
  const [genMode, setGenMode] = useState<PaymentMode>('Cash');
  const [genRef, setGenRef] = useState('');

  // ----------------------------------------------------
  // FORM 2: MEMBER PAYMENT SUB-SECTION STATE
  // ----------------------------------------------------
  const [memberSearch, setMemberSearch] = useState('');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [memPayDate, setMemPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [memFromMonth, setMemFromMonth] = useState<number>(selectedMonth);
  const [memFromYear, setMemFromYear] = useState<number>(selectedYear);
  const [memToMonth, setMemToMonth] = useState<number>(selectedMonth);
  const [memToYear, setMemToYear] = useState<number>(selectedYear);
  const [memPayMode, setMemPayMode] = useState<'Cash' | 'Online/UPI' | 'Bank Transfer'>('Cash');
  const [memRef, setMemRef] = useState('');
  const [memRemarks, setMemRemarks] = useState('');

  // ----------------------------------------------------
  // FORM 3: PURCHASE ENTRY SUB-SECTION STATE
  // ----------------------------------------------------
  const [purDate, setPurDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [purPayType, setPurPayType] = useState<'Cash Out' | 'Bank Out'>('Cash Out');
  const [selectedVendorId, setSelectedVendorId] = useState<string>('');
  const [purLines, setPurLines] = useState<PurchaseItemLine[]>([]);
  const [purRef, setPurRef] = useState('');
  const [purRemarks, setPurRemarks] = useState('');

  // ----------------------------------------------------
  // FORM 4: TOKEN & CURRENCY DENOMINATION CALCULATOR STATE
  // Strictly Rs. 500, Rs. 200, Rs. 100, Rs. 50, Rs. 10
  // ----------------------------------------------------
  const [tokenDate, setTokenDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [tokenName, setTokenName] = useState('भोग व दर्शनार्थी कूपन संग्रह (Prasad Token)');
  const [note500, setNote500] = useState<number>(0);
  const [note200, setNote200] = useState<number>(0);
  const [note100, setNote100] = useState<number>(0);
  const [note50, setNote50] = useState<number>(0);
  const [note10, setNote10] = useState<number>(0);
  const [tokenPaymentMode, setTokenPaymentMode] = useState<PaymentMode>('Cash');

  // Filtered members for member payment lookup
  const filteredMemberList = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const q = memberSearch.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.contactNumber.includes(q) ||
        m.ledgerNo.toLowerCase().includes(q)
    );
  }, [members, memberSearch]);

  const selectedMemberObj = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  // Balance & unpaid month calculation for selected member
  const selectedMemberBalanceInfo = useMemo(() => {
    if (!selectedMemberObj) return null;
    return calculateMemberBalance(
      selectedMemberObj,
      memberLedgers,
      selectedMonth,
      selectedYear,
      lang
    );
  }, [selectedMemberObj, memberLedgers, selectedMonth, selectedYear, lang]);

  const handleSelectMemberInDayBook = (memberId: string) => {
    setSelectedMemberId(memberId);
    const m = members.find((mem) => mem.id === memberId);
    if (m) {
      const info = calculateMemberBalance(m, memberLedgers, selectedMonth, selectedYear, lang);
      if (info.firstUnpaidMonth && info.firstUnpaidYear) {
        setMemFromMonth(info.firstUnpaidMonth);
        setMemFromYear(info.firstUnpaidYear);
        setMemToMonth(selectedMonth);
        setMemToYear(selectedYear);
      } else {
        setMemFromMonth(selectedMonth);
        setMemFromYear(selectedYear);
        setMemToMonth(selectedMonth);
        setMemToYear(selectedYear);
      }
    }
  };

  // Calculate months count & total amount for member payment
  const { calculatedMonthsCount, calculatedMemberTotal, coveredMonthsList } = useMemo(() => {
    if (!selectedMemberObj) return { calculatedMonthsCount: 0, calculatedMemberTotal: 0, coveredMonthsList: [] };

    const startIdx = memFromYear * 12 + memFromMonth;
    const endIdx = memToYear * 12 + memToMonth;

    if (endIdx < startIdx) {
      return { calculatedMonthsCount: 0, calculatedMemberTotal: 0, coveredMonthsList: [] };
    }

    const count = endIdx - startIdx + 1;
    const list: string[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const y = Math.floor((i - 1) / 12);
      const m = ((i - 1) % 12) + 1;
      list.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    return {
      calculatedMonthsCount: count,
      calculatedMemberTotal: count * selectedMemberObj.monthlyAmount,
      coveredMonthsList: list,
    };
  }, [selectedMemberObj, memFromMonth, memFromYear, memToMonth, memToYear]);

  // Selected vendor object & available items
  const selectedVendorObj = useMemo(() => {
    return vendors.find((v) => v.id === selectedVendorId);
  }, [vendors, selectedVendorId]);

  // Add line item to purchase
  const handleAddPurchaseLine = (itemId: string) => {
    const itm = items.find((i) => i.id === itemId);
    if (!itm) return;
    const totalGst = (itm.cgstPercent || 0) + (itm.sgstPercent || 0) + (itm.igstPercent || 0);
    const newLine: PurchaseItemLine = {
      itemId: itm.id,
      itemName: itm.name,
      unit: itm.unit,
      quantity: 1,
      rate: itm.defaultRate || 100,
      gstPercent: totalGst,
      amount: (itm.defaultRate || 100) * (1 + totalGst / 100),
    };
    setPurLines([...purLines, newLine]);
  };

  const handleUpdatePurLine = (index: number, field: keyof PurchaseItemLine, val: any) => {
    const updated = [...purLines];
    const item = { ...updated[index], [field]: val };
    const base = item.quantity * item.rate;
    item.amount = Math.round(base * (1 + (item.gstPercent || 0) / 100));
    updated[index] = item;
    setPurLines(updated);
  };

  const handleRemovePurLine = (index: number) => {
    setPurLines(purLines.filter((_, idx) => idx !== index));
  };

  const purchaseGrandTotal = purLines.reduce((sum, l) => sum + l.amount, 0);

  // Currency calculation
  const total500 = note500 * 500;
  const total200 = note200 * 200;
  const total100 = note100 * 100;
  const total50 = note50 * 50;
  const total10 = note10 * 10;
  const currencyGrandTotal = total500 + total200 + total100 + total50 + total10;
  const currencyNotesCount = note500 + note200 + note100 + note50 + note10;

  // Filter Day Book entries
  const filteredDayBook = useMemo(() => {
    return dayBook.filter((e) => {
      const matchMonth = e.month === selectedMonth;
      const matchYear = e.year === selectedYear;
      const matchCategory = filterCategory === 'All' || e.category === filterCategory;
      const matchSearch =
        !searchQuery.trim() ||
        e.particulars.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (e.description && e.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.memberName && e.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.vendorName && e.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (e.refNumber && e.refNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchMonth && matchYear && matchCategory && matchSearch;
    });
  }, [dayBook, selectedMonth, selectedYear, filterCategory, searchQuery]);

  // Aggregate totals for the filtered month
  const monthCashIn = filteredDayBook.filter((e) => e.entryType === 'Cash In').reduce((s, e) => s + e.amount, 0);
  const monthCashOut = filteredDayBook.filter((e) => e.entryType === 'Cash Out').reduce((s, e) => s + e.amount, 0);
  const monthBankIn = filteredDayBook.filter((e) => e.entryType === 'Bank In').reduce((s, e) => s + e.amount, 0);
  const monthBankOut = filteredDayBook.filter((e) => e.entryType === 'Bank Out').reduce((s, e) => s + e.amount, 0);

  // ----------------------------------------------------
  // SUBMISSIONS
  // ----------------------------------------------------

  // 1. Submit General Entry
  const handleSubmitGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    if (!genParticulars.trim() || !genAmount || Number(genAmount) <= 0) return;

    const [y, m] = genDate.split('-').map(Number);
    addDayBookEntry({
      date: genDate,
      month: m,
      year: y,
      entryType: genType,
      category: 'General',
      particulars: genParticulars,
      description: genDescription,
      amount: Number(genAmount),
      paymentMode: genMode,
      refNumber: genRef,
    });

    // Reset
    setGenParticulars('');
    setGenDescription('');
    setGenAmount('');
    setGenRef('');
    setActiveSubTab('records');
  };

  // 2. Submit Member Payment
  const handleSubmitMemberPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberObj || calculatedMemberTotal <= 0) return;

    const [y, m] = memPayDate.split('-').map(Number);
    addMemberPayment({
      memberId: selectedMemberObj.id,
      memberName: selectedMemberObj.name,
      ledgerNo: selectedMemberObj.ledgerNo,
      contactNumber: selectedMemberObj.contactNumber,
      date: memPayDate,
      year: y,
      fromMonth: memFromMonth,
      toMonth: memToMonth,
      fromYear: memFromYear,
      toYear: memToYear,
      monthsCovered: coveredMonthsList,
      monthlyRate: selectedMemberObj.monthlyAmount,
      totalAmount: calculatedMemberTotal,
      paymentMode: memPayMode,
      refNumber: memRef,
      remarks: memRemarks,
    });

    setSelectedMemberId('');
    setMemberSearch('');
    setMemRef('');
    setMemRemarks('');
    setActiveSubTab('records');
  };

  // 3. Submit Purchase Entry
  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorObj || purLines.length === 0 || purchaseGrandTotal <= 0) return;

    const [y, m] = purDate.split('-').map(Number);
    const summaryItems = purLines.map((l) => `${l.itemName} (${l.quantity} ${l.unit})`).join(', ');

    addDayBookEntry({
      date: purDate,
      month: m,
      year: y,
      entryType: purPayType,
      category: 'Purchase',
      particulars: `सामग्री क्रय - ${selectedVendorObj.name} [${summaryItems}]`,
      description: purRemarks || `सप्लायर: ${selectedVendorObj.name} | कुल सामग्री: ${purLines.length}`,
      amount: purchaseGrandTotal,
      paymentMode: purPayType === 'Cash Out' ? 'Cash' : 'Bank Transfer',
      refNumber: purRef,
      vendorId: selectedVendorObj.id,
      vendorName: selectedVendorObj.name,
      items: purLines,
    });

    setSelectedVendorId('');
    setPurLines([]);
    setPurRef('');
    setPurRemarks('');
    setActiveSubTab('records');
  };

  // 4. Submit Token & Currency Calculator
  const handleSubmitToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (currencyGrandTotal <= 0) return;

    const [y, m] = tokenDate.split('-').map(Number);
    const tokenBreakdown: CurrencyDenomination = {
      note500,
      note200,
      note100,
      note50,
      note10,
      totalTokens: currencyNotesCount,
      tokenName: tokenName,
    };

    addDayBookEntry({
      date: tokenDate,
      month: m,
      year: y,
      entryType: 'Cash In',
      category: 'Token',
      particulars: `टोकन व दान काउंटर संग्रह - ${tokenName} (कुल नोट: ${currencyNotesCount})`,
      description: `₹500 x ${note500}, ₹200 x ${note200}, ₹100 x ${note100}, ₹50 x ${note50}, ₹10 x ${note10}`,
      amount: currencyGrandTotal,
      paymentMode: tokenPaymentMode,
      tokenBreakdown,
    });

    showNotification(
      lang === 'hi'
        ? `करंसी कैलकुलेटर प्रविष्टि (₹${currencyGrandTotal.toLocaleString('en-IN')}) डे बुक और लेज़र बुक में सुरक्षित की गई!`
        : `Currency calculator entry (₹${currencyGrandTotal.toLocaleString('en-IN')}) saved to Day Book and Ledger Book!`,
      'success'
    );

    // Reset currency notes
    setNote500(0);
    setNote200(0);
    setNote100(0);
    setNote50(0);
    setNote10(0);
    setActiveSubTab('records');
  };

  // Handle Edit Day Book entry
  const handleOpenEdit = (entry: DayBookEntry) => {
    setEditingEntry(entry);
    setEditAmount(entry.amount);
    setEditParticulars(entry.particulars);
    setEditReason('');
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    updateDayBookEntry(
      editingEntry.id,
      {
        amount: Number(editAmount),
        particulars: editParticulars,
      },
      editReason || 'डे बुक रिकॉर्ड संशोधन'
    );
    setEditingEntry(null);
  };

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <BookOpen className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              डे बुक (Day Book - दैनिक रोकड़ बही)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            दैनिक आय-व्यय, सदस्य अंशदान, सामग्री क्रय व नोट गणक टोकन प्रविष्टियाँ
          </p>
        </div>

        {/* Month/Year selector & Excel export */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-stone-100 p-1.5 rounded-xl border border-stone-300">
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

          {/* Export Dropdown */}
          <div className="flex items-center bg-emerald-50 rounded-xl p-1 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-800 px-2 flex items-center gap-1">
              <Download className="w-3.5 h-3.5" /> एक्सेल:
            </span>
            <button
              onClick={() => exportDayBookExcel(filteredDayBook, 'All')}
              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition"
            >
              सम्पूर्ण
            </button>
            <button
              onClick={() => exportDayBookExcel(filteredDayBook, 'Cash')}
              className="px-2 py-1 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold rounded-lg transition ml-1"
            >
              केवल Cash
            </button>
            <button
              onClick={() => exportDayBookExcel(filteredDayBook, 'Bank')}
              className="px-2 py-1 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold rounded-lg transition ml-1"
            >
              केवल Bank
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Section Navigation Tabs with Shortcuts */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveSubTab('records')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSubTab === 'records'
              ? 'bg-stone-900 text-white'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span>डे बुक प्रविष्टियाँ (View Records)</span>
          <span className="bg-stone-800 text-[10px] px-1.5 py-0.5 rounded text-stone-300">
            {filteredDayBook.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('general')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSubTab === 'general'
              ? 'bg-amber-600 text-white'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-amber-500" />
          <span>+ सामान्य प्रविष्टि (General Entry)</span>
          <span className="text-[10px] font-mono bg-black/10 px-1 py-0.5 rounded">Alt+G</span>
        </button>

        <button
          onClick={() => setActiveSubTab('member')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSubTab === 'member'
              ? 'bg-emerald-700 text-white'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Users className="w-4 h-4 text-emerald-500" />
          <span>+ सदस्य अंशदान (Member Payment)</span>
          <span className="text-[10px] font-mono bg-black/10 px-1 py-0.5 rounded">{shortcuts.newMemberPayment}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('purchase')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSubTab === 'purchase'
              ? 'bg-blue-700 text-white'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4 text-blue-500" />
          <span>+ सामग्री क्रय (Purchase Entry)</span>
          <span className="text-[10px] font-mono bg-black/10 px-1 py-0.5 rounded">{shortcuts.newPurchase}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('token')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
            activeSubTab === 'token'
              ? 'bg-orange-600 text-white'
              : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
          }`}
        >
          <Calculator className="w-4 h-4 text-orange-400" />
          <span>+ नोट गणक टोकन (Currency Calculator)</span>
          <span className="text-[10px] font-mono bg-black/10 px-1 py-0.5 rounded">{shortcuts.openTokenCalc}</span>
        </button>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 1: RECORDS VIEW (Main Day Book Table & Metrics)      */}
      {/* ----------------------------------------------------------------- */}
      {activeSubTab === 'records' && (
        <div className="space-y-4">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                कुल Cash In (नकद आवक)
              </span>
              <div className="text-lg font-black text-emerald-700 mt-0.5">
                + ₹{monthCashIn.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800">
                कुल Cash Out (नकद जावक)
              </span>
              <div className="text-lg font-black text-rose-700 mt-0.5">
                - ₹{monthCashOut.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                कुल Bank In (बैंक/UPI आवक)
              </span>
              <div className="text-lg font-black text-blue-700 mt-0.5">
                + ₹{monthBankIn.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                कुल Bank Out (बैंक जावक)
              </span>
              <div className="text-lg font-black text-purple-700 mt-0.5">
                - ₹{monthBankOut.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="खोजें (Search विवरण, सदस्य, वेंडर, रसीद नं...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-stone-500" />
              <span className="font-semibold text-stone-600">श्रेणी फ़िल्टर:</span>
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
                {(['All', 'Member Payment', 'Purchase', 'Token', 'General'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-1 rounded-md text-[11px] font-bold transition ${
                      filterCategory === cat
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {cat === 'All' ? 'सभी (All)' : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Records Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-3">दिनांक</th>
                    <th className="py-3 px-3">प्रकार</th>
                    <th className="py-3 px-3">खाता श्रेणी</th>
                    <th className="py-3 px-3">विवरण (Particulars)</th>
                    <th className="py-3 px-3">माध्यम / Ref</th>
                    <th className="py-3 px-3 text-right">राशि (₹)</th>
                    <th className="py-3 px-3 text-center">क्रियाएँ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredDayBook.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-stone-400">
                        इस माह ({selectedMonth}/{selectedYear}) में कोई प्रविष्टि नहीं मिली।
                      </td>
                    </tr>
                  ) : (
                    filteredDayBook.map((entry) => {
                      const isIncoming = entry.entryType.includes('In');
                      const isCash = entry.entryType.startsWith('Cash');
                      return (
                        <tr key={entry.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3 px-3 font-medium text-stone-700 whitespace-nowrap">
                            {entry.date}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                isIncoming
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {entry.entryType}
                            </span>
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200">
                              {entry.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 max-w-sm">
                            <div className="font-semibold text-stone-900">{entry.particulars}</div>
                            {entry.description && (
                              <div className="text-[11px] text-stone-500 truncate">{entry.description}</div>
                            )}
                            {entry.tokenBreakdown && (
                              <div className="mt-1 flex flex-wrap gap-1">
                                {entry.tokenBreakdown.note500 > 0 && (
                                  <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 text-[9px] font-bold rounded">
                                    ₹500 &times; {entry.tokenBreakdown.note500}
                                  </span>
                                )}
                                {entry.tokenBreakdown.note200 > 0 && (
                                  <span className="px-1.5 py-0.2 bg-orange-100 text-orange-900 text-[9px] font-bold rounded">
                                    ₹200 &times; {entry.tokenBreakdown.note200}
                                  </span>
                                )}
                                {entry.tokenBreakdown.note100 > 0 && (
                                  <span className="px-1.5 py-0.2 bg-stone-100 text-stone-800 text-[9px] font-bold rounded">
                                    ₹100 &times; {entry.tokenBreakdown.note100}
                                  </span>
                                )}
                                {entry.tokenBreakdown.note50 > 0 && (
                                  <span className="px-1.5 py-0.2 bg-stone-100 text-stone-800 text-[9px] font-bold rounded">
                                    ₹50 &times; {entry.tokenBreakdown.note50}
                                  </span>
                                )}
                                {entry.tokenBreakdown.note10 > 0 && (
                                  <span className="px-1.5 py-0.2 bg-stone-100 text-stone-800 text-[9px] font-bold rounded">
                                    ₹10 &times; {entry.tokenBreakdown.note10}
                                  </span>
                                )}
                              </div>
                            )}
                            {entry.isEdited && (
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[9px] font-bold rounded">
                                संशोधित (Edited)
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-stone-600">
                            <div>{entry.paymentMode}</div>
                            {entry.refNumber && (
                              <div className="text-[10px] font-mono text-stone-400">{entry.refNumber}</div>
                            )}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-bold text-sm whitespace-nowrap ${
                              isIncoming ? 'text-emerald-700' : 'text-rose-700'
                            }`}
                          >
                            {isIncoming ? '+' : '-'} ₹{entry.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {currentUser.permissions.canEdit && (
                                <button
                                  onClick={() => handleOpenEdit(entry)}
                                  title="संशोधित करें (Edit)"
                                  className="p-1 rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                              )}
                              {(currentUser.role === 'admin' || currentUser.permissions.canDelete) && (
                                <button
                                  onClick={() => setEntryToDelete(entry)}
                                  title="हटाएँ (Delete)"
                                  className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-800 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
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

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 2: GENERAL ENTRY FORM                                  */}
      {/* ----------------------------------------------------------------- */}
      {activeSubTab === 'general' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-amber-600" />
              <h3 className="font-bold text-base text-stone-900">
                सामान्य प्रविष्टि जोड़ें (General Entry Voucher)
              </h3>
            </div>
            <button
              onClick={() => setActiveSubTab('records')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              रद्द करें &times;
            </button>
          </div>

          <form onSubmit={handleSubmitGeneral} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">दिनांक (Date):</label>
                <input
                  type="date"
                  value={genDate}
                  onChange={(e) => setGenDate(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">प्रविष्टि प्रकार (Type):</label>
                <select
                  value={genType}
                  onChange={(e) => setGenType(e.target.value as EntryType)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="Cash In">Cash In (नकद आवक)</option>
                  <option value="Cash Out">Cash Out (नकद खर्च)</option>
                  <option value="Bank In">Bank In (बैंक में जमा / UPI)</option>
                  <option value="Bank Out">Bank Out (बैंक भुगतान / NEFT)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                खाता विवरण / नाम (Particulars):
              </label>
              <input
                type="text"
                value={genParticulars}
                onChange={(e) => setGenParticulars(e.target.value)}
                placeholder="उदा. गुप्त दान, रसोई बिजली बिल, मंदिर दर्शनार्थी विशेष सेवा..."
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">अतिरिक्त टिप्पणी (Description):</label>
              <textarea
                value={genDescription}
                onChange={(e) => setGenDescription(e.target.value)}
                rows={2}
                placeholder="बिल नंबर, सेवादार का नाम, या विशेष टिप्पणी..."
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">राशि (Amount ₹):</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={genAmount}
                  onChange={(e) => setGenAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  placeholder="0"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold text-sm text-stone-900 focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">भुगतान माध्यम (Mode):</label>
                <select
                  value={genMode}
                  onChange={(e) => setGenMode(e.target.value as PaymentMode)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 cursor-pointer"
                >
                  <option value="Cash">Cash (नकद)</option>
                  <option value="Online/UPI">Online / UPI</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                  <option value="Cheque">Cheque (चेक)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">रसीद / Ref No:</label>
                <input
                  type="text"
                  value={genRef}
                  onChange={(e) => setGenRef(e.target.value)}
                  placeholder="उदा. UPI/4810294"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('records')}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 transition"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition"
              >
                प्रविष्टि सुरक्षित करें (Save Voucher)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 3: MEMBER PAYMENT FORM                                */}
      {/* ----------------------------------------------------------------- */}
      {activeSubTab === 'member' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 max-w-3xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-base text-stone-900">
                सदस्य अंशदान प्रविष्टि (Member Payment &amp; Auto Month Calculator)
              </h3>
            </div>
            <button
              onClick={() => setActiveSubTab('records')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              रद्द करें &times;
            </button>
          </div>

          <form onSubmit={handleSubmitMemberPayment} className="space-y-4 text-xs">
            {/* Step 1: Search & Pick Member */}
            <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-3">
              <label className="block font-bold text-stone-800">
                1. सदस्य खोजें एवं चुनें (Search by Name or Mobile):
              </label>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="नाम या मोबाइल नंबर से खोजें..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="max-h-40 overflow-y-auto space-y-1.5 pt-1">
                {filteredMemberList.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleSelectMemberInDayBook(m.id)}
                    className={`p-2.5 rounded-lg border cursor-pointer flex items-center justify-between transition ${
                      selectedMemberId === m.id
                        ? 'bg-emerald-100 border-emerald-500 font-bold'
                        : 'bg-white border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-stone-900">{m.name}</span>
                      <span className="ml-2 text-[10px] text-stone-500">बही नं: {m.ledgerNo}</span>
                      <div className="text-[11px] text-stone-600">फोन: {m.contactNumber} | पता: {m.address}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-700 font-extrabold">₹{m.monthlyAmount}/माह</span>
                      <div className="text-[10px] text-stone-500">जुड़े: {m.joiningMonth}/{m.joiningYear}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Member Details, Balance Amount and Unpaid Months Banner */}
            {selectedMemberBalanceInfo && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-stone-900 text-sm">
                        {selectedMemberBalanceInfo.member.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black">
                        {selectedMemberBalanceInfo.member.ledgerNo}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">
                        (दर: ₹{selectedMemberBalanceInfo.member.monthlyAmount}/माह)
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      फोन: {selectedMemberBalanceInfo.member.contactNumber} • पता: {selectedMemberBalanceInfo.member.address}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-600 block font-bold uppercase tracking-wider">
                      {lang === 'hi' ? 'वर्तमान माह तक कुल बकाया राशि' : 'Total Balance Amount'}
                    </span>
                    <div
                      className={`text-xl font-black ${
                        selectedMemberBalanceInfo.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                      }`}
                    >
                      ₹{selectedMemberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold text-amber-900">
                      ({selectedMemberBalanceInfo.tillPeriodLabel})
                    </span>
                  </div>
                </div>

                {/* Detailed Month Names to Till Month */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-stone-800 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      <span>
                        {lang === 'hi' ? 'बकाया माह (Unpaid Months):' : 'Unpaid Months:'}
                      </span>
                    </span>
                    <span className="text-rose-700 font-extrabold text-[11px]">
                      {selectedMemberBalanceInfo.summaryText}
                    </span>
                  </div>

                  {selectedMemberBalanceInfo.unpaidPeriods.length === 0 ? (
                    <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        {lang === 'hi'
                          ? `✓ इस सदस्य का ${selectedMemberBalanceInfo.tillPeriodLabel} तक समस्त अंशदान पूर्ण जमा है! कोई बकाया शेष नहीं है।`
                          : `✓ Fully paid up to ${selectedMemberBalanceInfo.tillPeriodLabel}! No pending balance.`}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-white/95 p-3 rounded-xl border border-amber-200">
                        <div className="text-[11px] font-extrabold text-stone-700 mb-2">
                          {lang === 'hi'
                            ? `बकाया माह सूची (${selectedMemberBalanceInfo.startPeriodLabel} ${selectedMemberBalanceInfo.tillPeriodLabel}):`
                            : `List of Unpaid Months (${selectedMemberBalanceInfo.startPeriodLabel} ${selectedMemberBalanceInfo.tillPeriodLabel}):`}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedMemberBalanceInfo.unpaidPeriods.map((period) => (
                            <span
                              key={period.periodKey}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-2xs flex items-center gap-1"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                              <span>{period.formatted}</span>
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Fast Click to set this exact unpaid range */}
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            selectedMemberBalanceInfo.firstUnpaidMonth &&
                            selectedMemberBalanceInfo.firstUnpaidYear
                          ) {
                            setMemFromMonth(selectedMemberBalanceInfo.firstUnpaidMonth);
                            setMemFromYear(selectedMemberBalanceInfo.firstUnpaidYear);
                            setMemToMonth(selectedMemberBalanceInfo.tillMonth);
                            setMemToYear(selectedMemberBalanceInfo.tillYear);
                          }
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                        <span>
                          {lang === 'hi'
                            ? `यह समस्त बकाया अवधि (${selectedMemberBalanceInfo.unpaidMonthsCount} माह) स्वतः सेट करें`
                            : `Auto-Set Unpaid Range (${selectedMemberBalanceInfo.unpaidMonthsCount} Months)`}
                        </span>
                        <span className="bg-amber-900 text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-black">
                          ₹{selectedMemberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Date, Month-to-Month Range & Auto Calculation */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">जमा दिनांक (Payment Date):</label>
                <input
                  type="date"
                  value={memPayDate}
                  onChange={(e) => setMemPayDate(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  प्रारंभ माह (From Month - Year):
                </label>
                <div className="flex gap-1">
                  <select
                    value={memFromMonth}
                    onChange={(e) => setMemFromMonth(Number(e.target.value))}
                    className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>{m.name.split(' ')[0]}</option>
                    ))}
                  </select>
                  <select
                    value={memFromYear}
                    onChange={(e) => setMemFromYear(Number(e.target.value))}
                    className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  समाप्त माह (To Month - Year):
                </label>
                <div className="flex gap-1">
                  <select
                    value={memToMonth}
                    onChange={(e) => setMemToMonth(Number(e.target.value))}
                    className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>{m.name.split(' ')[0]}</option>
                    ))}
                  </select>
                  <select
                    value={memToYear}
                    onChange={(e) => setMemToYear(Number(e.target.value))}
                    className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Calculated Monthly Amount Banner */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="font-semibold text-amber-900">
                  माह गणना: <b>{calculatedMonthsCount} माह</b> ({coveredMonthsList.join(', ')})
                </span>
                <div className="text-[11px] text-amber-800">
                  {selectedMemberObj ? `दर: ₹${selectedMemberObj.monthlyAmount} x ${calculatedMonthsCount} माह` : 'सदस्य चुनें'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-stone-500">कुल देय राशि:</span>
                <div className="text-lg font-black text-amber-900">
                  ₹{calculatedMemberTotal.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Mode (Cash In vs Online) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  जमा प्रकार (Select Cash In or Online):
                </label>
                <select
                  value={memPayMode}
                  onChange={(e) => setMemPayMode(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="Cash">Cash In (नकद रसीद)</option>
                  <option value="Online/UPI">Online / UPI (बैंक खाता)</option>
                  <option value="Bank Transfer">Bank Transfer / NEFT</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">यूटीआर / रसीद क्रमांक (Ref No):</label>
                <input
                  type="text"
                  value={memRef}
                  onChange={(e) => setMemRef(e.target.value)}
                  placeholder="उदा. UPI/991203912 या रसीद #104"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">टिप्पणी (Remarks):</label>
              <input
                type="text"
                value={memRemarks}
                onChange={(e) => setMemRemarks(e.target.value)}
                placeholder="उदा. श्री महाकाल कृपा, भंडारा सेवा हेतु समर्पण..."
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('records')}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 transition"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={!selectedMemberObj || calculatedMemberTotal <= 0}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md transition"
              >
                सदस्य भुगतान दर्ज करें (Save Entry)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 4: PURCHASE ENTRY FORM                                */}
      {/* ----------------------------------------------------------------- */}
      {activeSubTab === 'purchase' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 max-w-4xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-base text-stone-900">
                सामग्री क्रय प्रविष्टि (Purchase Entry with Multi-Items &amp; Vendor)
              </h3>
            </div>
            <button
              onClick={() => setActiveSubTab('records')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              रद्द करें &times;
            </button>
          </div>

          <form onSubmit={handleSubmitPurchase} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">क्रय दिनांक (Purchase Date):</label>
                <input
                  type="date"
                  value={purDate}
                  onChange={(e) => setPurDate(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  भुगतान विकल्प (Cash Out or Bank Out):
                </label>
                <select
                  value={purPayType}
                  onChange={(e) => setPurPayType(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="Cash Out">Cash Out (नकद भुगतान)</option>
                  <option value="Bank Out">Bank Out (बैंक / UPI ट्रांसफर)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">सप्लायर / वेंडर चुनें (Vendor):</label>
                <select
                  value={selectedVendorId}
                  onChange={(e) => setSelectedVendorId(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="">-- वेंडर चुनें (Select Vendor) --</option>
                  {vendors.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.contactNumber})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vendor Attached Items Quick Buttons */}
            {selectedVendorObj && (
              <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 block">
                  इस वेंडर से संबंधित सामग्री जोड़ें (Click to add attached items):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedVendorObj.attachedItemIds.map((itemId) => {
                    const itm = items.find((i) => i.id === itemId);
                    if (!itm) return null;
                    return (
                      <button
                        key={itm.id}
                        type="button"
                        onClick={() => handleAddPurchaseLine(itm.id)}
                        className="px-2.5 py-1 bg-white hover:bg-blue-100 border border-blue-300 rounded-lg text-[11px] font-semibold text-blue-800 transition flex items-center gap-1 shadow-xs"
                      >
                        <Plus className="w-3 h-3 text-blue-600" />
                        <span>{itm.name} ({itm.unit})</span>
                      </button>
                    );
                  })}
                  <div className="w-full pt-1 flex items-center gap-2">
                    <span className="text-stone-500 text-[11px]">अन्य सामग्री जोड़ें:</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleAddPurchaseLine(e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="bg-white border border-stone-300 rounded-lg px-2 py-1 text-[11px]"
                    >
                      <option value="">+ सामग्री सूची से चुनें...</option>
                      {items.map((i) => (
                        <option key={i.id} value={i.id}>{i.name} ({i.unit})</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Multiple Item Line Items Table */}
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <div className="bg-stone-100 p-2 text-stone-700 font-bold flex justify-between items-center text-xs">
                <span>क्रय सामग्री सूची (Line Items - {purLines.length})</span>
                <span>कुल क्रय राशि: ₹{purchaseGrandTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-stone-50 text-stone-600 border-b border-stone-200">
                      <th className="p-2">सामग्री (Item)</th>
                      <th className="p-2">इकाई (Unit)</th>
                      <th className="p-2">मात्रा (Qty)</th>
                      <th className="p-2">दर ₹ (Rate)</th>
                      <th className="p-2">GST %</th>
                      <th className="p-2 text-right">कुल ₹ (Amount)</th>
                      <th className="p-2 text-center">हटाएँ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {purLines.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-stone-400">
                          कृपया वेंडर चुनकर सामग्री जोड़ें (+ Add Items above)
                        </td>
                      </tr>
                    ) : (
                      purLines.map((line, idx) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="p-2 font-semibold text-stone-800">{line.itemName}</td>
                          <td className="p-2 text-stone-600">{line.unit}</td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0.1"
                              step="any"
                              value={line.quantity}
                              onChange={(e) => handleUpdatePurLine(idx, 'quantity', Number(e.target.value))}
                              className="w-16 bg-white border border-stone-300 rounded p-1 text-center font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={line.rate}
                              onChange={(e) => handleUpdatePurLine(idx, 'rate', Number(e.target.value))}
                              className="w-20 bg-white border border-stone-300 rounded p-1 text-center font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="0"
                              value={line.gstPercent}
                              onChange={(e) => handleUpdatePurLine(idx, 'gstPercent', Number(e.target.value))}
                              className="w-14 bg-white border border-stone-300 rounded p-1 text-center"
                            />
                            %
                          </td>
                          <td className="p-2 text-right font-extrabold text-stone-900">
                            ₹{line.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemovePurLine(idx)}
                              className="p-1 text-rose-600 hover:bg-rose-50 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">बिल / इनवॉइस नंबर (Invoice / Ref):</label>
                <input
                  type="text"
                  value={purRef}
                  onChange={(e) => setPurRef(e.target.value)}
                  placeholder="उदा. Bill #519 / Cheque #8192"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">विशेष विवरण (Remarks):</label>
                <input
                  type="text"
                  value={purRemarks}
                  onChange={(e) => setPurRemarks(e.target.value)}
                  placeholder="उदा. साप्ताहिक भंडारा राशन आपूर्ति"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('records')}
                className="px-4 py-2 border border-stone-300 text-stone-700 font-semibold rounded-xl hover:bg-stone-100 transition"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                disabled={!selectedVendorObj || purLines.length === 0}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md transition"
              >
                क्रय प्रविष्टि सुरक्षित करें (Save Purchase Voucher)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 5: TOKEN & CURRENCY DENOMINATION CALCULATOR           */}
      {/* Strictly Rs. 500, Rs. 200, Rs. 100, Rs. 50, Rs. 10               */}
      {/* ----------------------------------------------------------------- */}
      {activeSubTab === 'token' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 max-w-2xl mx-auto">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-orange-600" />
              <h3 className="font-bold text-base text-stone-900">
                टोकन व नोट गणक (Currency Denomination Calculator)
              </h3>
            </div>
            <button
              onClick={() => setActiveSubTab('records')}
              className="text-xs text-stone-500 hover:text-stone-800"
            >
              रद्द करें &times;
            </button>
          </div>

          <form onSubmit={handleSubmitToken} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">दिनांक (Date):</label>
                <input
                  type="date"
                  value={tokenDate}
                  onChange={(e) => setTokenDate(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  टोकन काउंटर नाम (Counter / Token Type):
                </label>
                <input
                  type="text"
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  required
                  placeholder="उदा. प्रातः आरती कूपन, दान पेटी संग्रह"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
            </div>

            {/* Currency Note Counting Grid */}
            <div className="border border-stone-200 rounded-2xl overflow-hidden bg-stone-50/50">
              <div className="bg-orange-100 text-orange-950 p-2.5 font-bold flex justify-between items-center text-xs border-b border-orange-200">
                <span>नोट प्रकार (Denomination)</span>
                <span>संख्या (Count) &times; मूल्य = कुल (Total)</span>
              </div>

              <div className="divide-y divide-stone-200 p-2 space-y-2">
                {/* Rs. 500 */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded-xl border border-stone-200">
                  <span className="font-extrabold text-stone-800 text-sm w-24">₹500 नोट:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={note500 || ''}
                      placeholder="0"
                      onChange={(e) => setNote500(Number(e.target.value) || 0)}
                      className="w-24 bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-center font-bold text-sm focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-stone-400 font-bold">&times; 500 =</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm w-28 text-right">
                    ₹{total500.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Rs. 200 */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded-xl border border-stone-200">
                  <span className="font-extrabold text-stone-800 text-sm w-24">₹200 नोट:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={note200 || ''}
                      placeholder="0"
                      onChange={(e) => setNote200(Number(e.target.value) || 0)}
                      className="w-24 bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-center font-bold text-sm focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-stone-400 font-bold">&times; 200 =</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm w-28 text-right">
                    ₹{total200.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Rs. 100 */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded-xl border border-stone-200">
                  <span className="font-extrabold text-stone-800 text-sm w-24">₹100 नोट:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={note100 || ''}
                      placeholder="0"
                      onChange={(e) => setNote100(Number(e.target.value) || 0)}
                      className="w-24 bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-center font-bold text-sm focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-stone-400 font-bold">&times; 100 =</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm w-28 text-right">
                    ₹{total100.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Rs. 50 */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded-xl border border-stone-200">
                  <span className="font-extrabold text-stone-800 text-sm w-24">₹50 नोट:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={note50 || ''}
                      placeholder="0"
                      onChange={(e) => setNote50(Number(e.target.value) || 0)}
                      className="w-24 bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-center font-bold text-sm focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-stone-400 font-bold">&times; 50 =</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm w-28 text-right">
                    ₹{total50.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* Rs. 10 */}
                <div className="flex items-center justify-between py-1.5 px-2 bg-white rounded-xl border border-stone-200">
                  <span className="font-extrabold text-stone-800 text-sm w-24">₹10 नोट:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      value={note10 || ''}
                      placeholder="0"
                      onChange={(e) => setNote10(Number(e.target.value) || 0)}
                      className="w-24 bg-stone-50 border border-stone-300 rounded-lg p-1.5 text-center font-bold text-sm focus:ring-1 focus:ring-orange-500"
                    />
                    <span className="text-stone-400 font-bold">&times; 10 =</span>
                  </div>
                  <span className="font-black text-amber-900 text-sm w-28 text-right">
                    ₹{total10.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Total Currency Counter Footer */}
              <div className="bg-gradient-to-r from-orange-600 to-amber-700 text-white p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-orange-200">
                    कुल नोटों की संख्या:
                  </span>
                  <div className="text-lg font-black">{currencyNotesCount} नोट</div>
                </div>
                <div className="text-right">
                  <span className="text-xs uppercase font-bold tracking-wider text-orange-200">
                    कुल टोकन नकद राशि:
                  </span>
                  <div className="text-2xl font-black">
                    ₹{currencyGrandTotal.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setNote500(0);
                  setNote200(0);
                  setNote100(0);
                  setNote50(0);
                  setNote10(0);
                }}
                className="px-3 py-1.5 text-stone-500 hover:text-stone-800"
              >
                रीसेट करें
              </button>
              <button
                type="submit"
                disabled={currencyGrandTotal <= 0}
                className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md transition"
              >
                टोकन राशि डे बुक व लेज़र में सेव करें (Save Token Total)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Entry Modal with Audit Log Reason */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>प्रविष्टि संशोधन (Edit Day Book Entry)</span>
              </h3>
              <button onClick={() => setEditingEntry(null)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <b>नोट:</b> संशोधन करने पर लेज़र ऑडिट ट्रेल में पुराना मूल्य एवं नया मूल्य स्वतः दर्ज होगा।
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">विवरण (Particulars):</label>
              <input
                type="text"
                value={editParticulars}
                onChange={(e) => setEditParticulars(e.target.value)}
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-500 mb-1">पुरानी राशि (Old Amount):</label>
                <div className="font-bold text-stone-700 p-2 bg-stone-100 rounded-lg">
                  ₹{editingEntry.amount.toLocaleString('en-IN')}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">संशोधित राशि (New Amount ₹):</label>
                <input
                  type="number"
                  value={editAmount}
                  onChange={(e) => setEditAmount(Number(e.target.value))}
                  className="w-full bg-white border border-stone-300 rounded-lg p-2 font-bold text-amber-900 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">संशोधन का कारण (Reason for Edit):</label>
              <input
                type="text"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
                placeholder="उदा. बिल गणना सुधार, टाइपिंग अंतर..."
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
              />
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t">
              <button
                onClick={() => setEditingEntry(null)}
                className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold text-stone-600"
              >
                रद्द करें
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
              >
                अपडेट व ऑडिट दर्ज करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Day Book Entry Deletion */}
      {entryToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {lang === 'hi' ? 'प्रविष्टि हटाने की पुष्टि' : 'Confirm Entry Deletion'}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? 'क्या आप सचमुच यह डे बुक प्रविष्टि हटाना चाहते हैं?'
                : 'Are you sure you want to delete this Day Book entry?'}
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-bold text-stone-900 block">{entryToDelete.particulars}</span>
              <span className="text-[11px] text-stone-500 block">
                {entryToDelete.date} • ₹{entryToDelete.amount.toLocaleString('en-IN')} ({entryToDelete.entryType})
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="px-3.5 py-1.5 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteDayBookEntry(entryToDelete.id);
                  setEntryToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
              >
                {strings.yesDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
