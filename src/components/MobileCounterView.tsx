import React, { useState, useMemo } from 'react';
import {
  Users,
  CreditCard,
  Search,
  Plus,
  Trash2,
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member } from '../types';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import { t } from '../utils/translations';
import { calculateMemberBalance } from '../utils/memberCalculations';

export const MobileCounterView: React.FC = () => {
  const {
    members,
    addMember,
    deleteMember,
    memberLedgers,
    addMemberPayment,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    lang,
    currentUser,
  } = useApp();

  const strings = t(lang);

  // Tab inside mobile counter: 'members' | 'payment'
  const [mobileTab, setMobileTab] = useState<'members' | 'payment'>('members');
  const [searchQuery, setSearchQuery] = useState('');

  // Member deletion confirmation modal
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Add Member Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemMobile, setNewMemMobile] = useState('');
  const [newMemAddress, setNewMemAddress] = useState('');
  const [newMemLedgerNo, setNewMemLedgerNo] = useState('');
  const [newMemPledge, setNewMemPledge] = useState<number | ''>(1100);

  // Payment Form State
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [fromMonth, setFromMonth] = useState<number>(selectedMonth);
  const [fromYear, setFromYear] = useState<number>(selectedYear);
  const [toMonth, setToMonth] = useState<number>(selectedMonth);
  const [toYear, setToYear] = useState<number>(selectedYear);
  const [payMode, setPayMode] = useState<'Cash' | 'Online/UPI'>('Cash');
  const [refNumber, setRefNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  // Filtered members
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.contactNumber.includes(q) ||
        m.ledgerNo.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Selected member for payment
  const activeMember = useMemo(() => {
    return members.find((m) => m.id === selectedMemberId);
  }, [members, selectedMemberId]);

  // Balance and unpaid months calculation for selected member
  const memberBalanceInfo = useMemo(() => {
    if (!activeMember) return null;
    return calculateMemberBalance(
      activeMember,
      memberLedgers,
      selectedMonth,
      selectedYear,
      lang
    );
  }, [activeMember, memberLedgers, selectedMonth, selectedYear, lang]);

  // Handle member selection and auto-configure unpaid range
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) return;
    const target = members.find((m) => m.id === memberId);
    if (target) {
      const info = calculateMemberBalance(target, memberLedgers, selectedMonth, selectedYear, lang);
      if (info.firstUnpaidMonth && info.firstUnpaidYear) {
        setFromMonth(info.firstUnpaidMonth);
        setFromYear(info.firstUnpaidYear);
        setToMonth(selectedMonth);
        setToYear(selectedYear);
      } else {
        setFromMonth(selectedMonth);
        setFromYear(selectedYear);
        setToMonth(selectedMonth);
        setToYear(selectedYear);
      }
    }
  };

  // Calculate month-to-month count & total for selected member
  const { calculatedMonthsCount, calculatedTotal, coveredMonthsList } = useMemo(() => {
    if (!activeMember) return { calculatedMonthsCount: 0, calculatedTotal: 0, coveredMonthsList: [] };

    const startIdx = fromYear * 12 + fromMonth;
    const endIdx = toYear * 12 + toMonth;

    if (endIdx < startIdx) {
      return { calculatedMonthsCount: 0, calculatedTotal: 0, coveredMonthsList: [] };
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
      calculatedTotal: count * activeMember.monthlyAmount,
      coveredMonthsList: list,
    };
  }, [activeMember, fromMonth, fromYear, toMonth, toYear]);

  // Handle Quick Member Select for Payment
  const handleQuickPay = (memberId: string) => {
    handleSelectMember(memberId);
    setMobileTab('payment');
  };

  // Submit Payment
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMember || calculatedTotal <= 0) return;

    const [y, m] = paymentDate.split('-').map(Number);
    addMemberPayment({
      memberId: activeMember.id,
      memberName: activeMember.name,
      ledgerNo: activeMember.ledgerNo,
      contactNumber: activeMember.contactNumber,
      date: paymentDate,
      year: y,
      fromMonth: fromMonth,
      toMonth: toMonth,
      fromYear: fromYear,
      toYear: toYear,
      monthsCovered: coveredMonthsList,
      monthlyRate: activeMember.monthlyAmount,
      totalAmount: calculatedTotal,
      paymentMode: payMode,
      refNumber: refNumber,
      remarks: remarks,
    });

    // Prepare WhatsApp message
    const msg = `जय बाबा महाकाल की रसोई
सदस्य का नाम: ${activeMember.name}
बही क्रमांक: ${activeMember.ledgerNo}
जमा राशि: ₹${calculatedTotal.toLocaleString('en-IN')} (माह: ${coveredMonthsList.join(', ')})

अन्नदान महादान है। 'जय बाबा महाकाल की रसोई' आप सभी सेवादारों के सहयोग से निरंतर संचालित हो रही है; कृपया अपना सहयोग बनाए रखें। बाबा महाकाल की कृपा आप पर बनी रहे।`;

    const cleanPhone = activeMember.contactNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(msg)}`;

    // Reset
    setRefNumber('');
    setRemarks('');
    setSelectedMemberId('');
    setMobileTab('members');

    // Open WhatsApp
    window.open(url, '_blank');
  };

  // Submit Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName.trim() || !newMemMobile.trim() || !newMemPledge) return;

    addMember({
      ledgerNo: newMemLedgerNo.trim() || `MKR-${String(members.length + 1).padStart(3, '0')}`,
      name: newMemName.trim(),
      contactNumber: newMemMobile.trim(),
      address: newMemAddress.trim() || 'उज्जैन (म.प्र.)',
      joiningMonth: selectedMonth,
      joiningYear: selectedYear,
      monthlyAmount: Number(newMemPledge),
      paymentStartMonth: selectedMonth,
      paymentStartYear: selectedYear,
      status: 'Active',
    });

    setNewMemName('');
    setNewMemMobile('');
    setNewMemAddress('');
    setNewMemLedgerNo('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-4 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{lang === 'hi' ? 'मोबाइल सेवादार काउंटर' : 'Mobile Sevadar Counter'}</span>
          </div>
          <p className="text-[11px] text-amber-100">
            {lang === 'hi'
              ? 'केवल सदस्य सूची एवं सदस्य अंशदान भुगतान'
              : 'Dedicated to Members List & Pledge Payment'}
          </p>
        </div>

        {/* Global Period badge */}
        <div className="bg-black/25 px-2.5 py-1 rounded-xl text-xs font-bold border border-white/20">
          {selectedMonth}/{selectedYear}
        </div>
      </div>

      {/* 2 Big Touch-Friendly Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-stone-200 p-1.5 rounded-2xl">
        <button
          onClick={() => setMobileTab('members')}
          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            mobileTab === 'members'
              ? 'bg-white text-stone-900 shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4 text-amber-600" />
          <span>{lang === 'hi' ? 'सदस्य सूची' : 'Members List'}</span>
          <span className="bg-stone-100 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
            {members.length}
          </span>
        </button>

        <button
          onClick={() => setMobileTab('payment')}
          className={`py-2.5 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition ${
            mobileTab === 'payment'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'hi' ? 'सदस्य भुगतान' : 'Member Payment'}</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW 1: MEMBERS LIST                                          */}
      {/* ------------------------------------------------------------- */}
      {mobileTab === 'members' && (
        <div className="space-y-3">
          {/* Search & Add Member */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder={strings.memberSearchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 shadow-xs"
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>{lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
            </button>
          </div>

          {/* Members List Cards */}
          <div className="space-y-2.5">
            {filteredMembers.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl text-center text-stone-400 border border-stone-200 text-xs">
                {lang === 'hi' ? 'कोई सदस्य नहीं मिला' : 'No members found'}
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between space-y-2 hover:border-amber-400 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 text-sm">{member.name}</h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">
                          {member.ledgerNo}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{member.address}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-emerald-700 font-black text-sm">
                        ₹{member.monthlyAmount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-400 block">/ माह</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${member.contactNumber}`}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs"
                        title="कॉल करें"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://api.whatsapp.com/send?phone=91${member.contactNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs"
                        title="WhatsApp खोलें"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>

                      {/* Remove Button with In-App Confirmation */}
                      <button
                        onClick={() => setMemberToDelete(member)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-1 border border-rose-200 active:scale-95"
                        title={lang === 'hi' ? 'सदस्य हटाएँ (Delete)' : 'Remove Member'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>{lang === 'hi' ? 'हटाएँ' : 'Remove'}</span>
                      </button>
                    </div>

                    {/* Quick Pay Button */}
                    <button
                      onClick={() => handleQuickPay(member.id)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <span>{lang === 'hi' ? 'अंशदान लें' : 'Pay Pledge'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW 2: MEMBER PAYMENT                                        */}
      {/* ------------------------------------------------------------- */}
      {mobileTab === 'payment' && (
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 text-xs">
          <div className="border-b pb-2">
            <h3 className="font-bold text-sm text-stone-900">
              {lang === 'hi' ? 'सदस्य अंशदान रसीद' : 'Member Contribution Receipt'}
            </h3>
            <p className="text-[11px] text-stone-500">
              {lang === 'hi'
                ? 'माह से माह चयन करें, राशि स्वतः गणना होगी'
                : 'Select month range to auto-calculate pledge amount'}
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-3">
            {/* Pick Member */}
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                1. {lang === 'hi' ? 'सदस्य चुनें (Select Member):' : 'Select Member:'}
              </label>
              <select
                value={selectedMemberId}
                onChange={(e) => handleSelectMember(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2.5 font-bold text-stone-900 text-xs"
              >
                <option value="">-- {lang === 'hi' ? 'सदस्य चुनें' : 'Select Member'} --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.ledgerNo}) - ₹{m.monthlyAmount}/माह
                  </option>
                ))}
              </select>
            </div>

            {/* Member Details, Balance Amount and Unpaid Months to Till Month Banner */}
            {memberBalanceInfo && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-stone-900 text-sm">{memberBalanceInfo.member.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black">
                        {memberBalanceInfo.member.ledgerNo}
                      </span>
                      <span className="text-[10px] font-bold text-stone-500">
                        (दर: ₹{memberBalanceInfo.member.monthlyAmount}/माह)
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-600 mt-0.5">
                      फोन: {memberBalanceInfo.member.contactNumber} • पता: {memberBalanceInfo.member.address}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-600 block font-bold uppercase tracking-wider">
                      {lang === 'hi' ? 'वर्तमान माह तक कुल बकाया राशि' : 'Balance Till Month'}
                    </span>
                    <div className={`text-xl font-black ${memberBalanceInfo.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      ₹{memberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] font-bold text-amber-900">
                      ({memberBalanceInfo.tillPeriodLabel})
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
                      {memberBalanceInfo.summaryText}
                    </span>
                  </div>

                  {memberBalanceInfo.unpaidPeriods.length === 0 ? (
                    <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>
                        {lang === 'hi'
                          ? `✓ इस सदस्य का ${memberBalanceInfo.tillPeriodLabel} तक समस्त अंशदान पूर्ण जमा है! कोई बकाया शेष नहीं है।`
                          : `✓ Fully paid up to ${memberBalanceInfo.tillPeriodLabel}! No pending balance.`}
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-white/95 p-3 rounded-xl border border-amber-200">
                        <div className="text-[11px] font-extrabold text-stone-700 mb-2">
                          {lang === 'hi'
                            ? `बकाया माह सूची (${memberBalanceInfo.startPeriodLabel} ${memberBalanceInfo.tillPeriodLabel}):`
                            : `List of Unpaid Months (${memberBalanceInfo.startPeriodLabel} ${memberBalanceInfo.tillPeriodLabel}):`}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {memberBalanceInfo.unpaidPeriods.map((period) => (
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
                          if (memberBalanceInfo.firstUnpaidMonth && memberBalanceInfo.firstUnpaidYear) {
                            setFromMonth(memberBalanceInfo.firstUnpaidMonth);
                            setFromYear(memberBalanceInfo.firstUnpaidYear);
                            setToMonth(memberBalanceInfo.tillMonth);
                            setToYear(memberBalanceInfo.tillYear);
                          }
                        }}
                        className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 active:scale-98"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                        <span>
                          {lang === 'hi'
                            ? `यह बकाया अवधि (${memberBalanceInfo.unpaidMonthsCount} माह) स्वतः सेट करें`
                            : `Auto-Set Unpaid Range (${memberBalanceInfo.unpaidMonthsCount} Months)`}
                        </span>
                        <span className="bg-amber-900 text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-black">
                          ₹{memberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
                        </span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Date */}
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                {lang === 'hi' ? 'भुगतान दिनांक (Date):' : 'Payment Date:'}
              </label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2"
              />
            </div>

            {/* Month to Month Range */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'प्रारंभ माह:' : 'From Month:'}
                </label>
                <div className="flex gap-1">
                  <select
                    value={fromMonth}
                    onChange={(e) => setFromMonth(Number(e.target.value))}
                    className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-1.5"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>{m.name.split(' ')[0]}</option>
                    ))}
                  </select>
                  <select
                    value={fromYear}
                    onChange={(e) => setFromYear(Number(e.target.value))}
                    className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-1.5 font-bold"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">
                  {lang === 'hi' ? 'समाप्त माह:' : 'To Month:'}
                </label>
                <div className="flex gap-1">
                  <select
                    value={toMonth}
                    onChange={(e) => setToMonth(Number(e.target.value))}
                    className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-1.5"
                  >
                    {MONTH_NAMES.map((m) => (
                      <option key={m.value} value={m.value}>{m.name.split(' ')[0]}</option>
                    ))}
                  </select>
                  <select
                    value={toYear}
                    onChange={(e) => setToYear(Number(e.target.value))}
                    className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-1.5 font-bold"
                  >
                    {YEARS_LIST.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Auto-Calculated Amount Box */}
            <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <div>
                <span className="text-amber-900 font-bold block">
                  {lang === 'hi' ? 'कुल माह:' : 'Total Months:'} {calculatedMonthsCount} माह
                </span>
                <span className="text-[10px] text-amber-800">
                  {coveredMonthsList.join(', ')}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-stone-500 block">कुल देय राशि</span>
                <span className="text-xl font-black text-amber-900">
                  ₹{calculatedTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Payment Mode */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">माध्यम:</label>
                <select
                  value={payMode}
                  onChange={(e) => setPayMode(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                >
                  <option value="Cash">Cash (नकद)</option>
                  <option value="Online/UPI">Online / UPI</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">रसीद / Ref No:</label>
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => setRefNumber(e.target.value)}
                  placeholder="उदा. UPI/48910"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!activeMember || calculatedTotal <= 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-extrabold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>
                {lang === 'hi'
                  ? 'भुगतान सुरक्षित करें व WhatsApp भेजें'
                  : 'Save Payment & Send WhatsApp'}
              </span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL 1: ADD MEMBER */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="font-bold text-sm text-stone-900">
                {lang === 'hi' ? 'नया सेवादार सदस्य जोड़ें' : 'Add New Member'}
              </h4>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMember} className="space-y-2.5">
              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">नाम:</label>
                <input
                  type="text"
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  required
                  placeholder="उदा. पं. रामेश्वर शर्मा"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">मोबाइल नंबर:</label>
                <input
                  type="tel"
                  value={newMemMobile}
                  onChange={(e) => setNewMemMobile(e.target.value)}
                  required
                  placeholder="9826012345"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">बही क्रमांक:</label>
                  <input
                    type="text"
                    value={newMemLedgerNo}
                    onChange={(e) => setNewMemLedgerNo(e.target.value)}
                    placeholder="MKR-006"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-0.5">मासिक अंशदान ₹:</label>
                  <input
                    type="number"
                    value={newMemPledge}
                    onChange={(e) => setNewMemPledge(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-0.5">निवास पता:</label>
                <input
                  type="text"
                  value={newMemAddress}
                  onChange={(e) => setNewMemAddress(e.target.value)}
                  placeholder="उज्जैन"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 border rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM MEMBER DELETION (In-App Reliable Dialog) */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {strings.confirmDeleteTitle}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {strings.confirmDeleteMsg}
            </p>

            <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-bold text-stone-900">{memberToDelete.name}</span>
              <span className="text-[11px] text-stone-500 block">
                बही नं: {memberToDelete.ledgerNo} | फोन: {memberToDelete.contactNumber}
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-3.5 py-1.5 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteMember(memberToDelete.id);
                  setMemberToDelete(null);
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
