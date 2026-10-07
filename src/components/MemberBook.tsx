import React, { useState, useMemo, useRef } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  MessageCircle,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  AlertCircle,
  X,
  CreditCard,
  Send,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Member, MemberLedgerPayment } from '../types';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import {
  exportMembersToExcel,
  exportMemberLedgersToExcel,
  parseExcelFile,
} from '../utils/excel';
import { t } from '../utils/translations';
import { calculateMemberBalance } from '../utils/memberCalculations';

export const MemberBook: React.FC = () => {
  const {
    members,
    addMember,
    updateMember,
    deleteMember,
    importMembersList,
    memberLedgers,
    addMemberPayment,
    updateMemberPayment,
    deleteMemberPayment,
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    currentUser,
    showNotification,
    lang,
  } = useApp();

  const strings = t(lang);

  // Sub-section tab
  const [subTab, setSubTab] = useState<'master' | 'ledger'>('master');
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Member In-App Modal State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Add Member Modal State
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [memName, setMemName] = useState('');
  const [memContact, setMemContact] = useState('');
  const [memAddress, setMemAddress] = useState('');
  const [memLedgerNo, setMemLedgerNo] = useState('');
  const [memJoinMonth, setMemJoinMonth] = useState<number>(1);
  const [memJoinYear, setMemJoinYear] = useState<number>(2026);
  const [memMonthlyAmount, setMemMonthlyAmount] = useState<number | ''>(1100);

  // Edit Member Modal State
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  // Member Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayMemberId, setSelectedPayMemberId] = useState<string>('');
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [payFromMonth, setPayFromMonth] = useState<number>(selectedMonth);
  const [payFromYear, setPayFromYear] = useState<number>(selectedYear);
  const [payToMonth, setPayToMonth] = useState<number>(selectedMonth);
  const [payToYear, setPayToYear] = useState<number>(selectedYear);
  const [payMode, setPayMode] = useState<'Cash' | 'Online/UPI' | 'Bank Transfer'>('Cash');
  const [payRef, setPayRef] = useState('');
  const [payRemarks, setPayRemarks] = useState('');

  // Excel file upload input ref
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered members list
  const filteredMembers = useMemo(() => {
    if (!searchQuery.trim()) return members;
    const q = searchQuery.toLowerCase();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.contactNumber.includes(q) ||
        m.ledgerNo.toLowerCase().includes(q) ||
        m.address.toLowerCase().includes(q)
    );
  }, [members, searchQuery]);

  // Compute Member Ledger View with Unpaid Months & Balance till selectedMonth / selectedYear
  const memberLedgerCalculations = useMemo(() => {
    return members.map((member) => {
      const details = calculateMemberBalance(
        member,
        memberLedgers,
        selectedMonth,
        selectedYear,
        lang
      );
      return {
        member,
        totalPaid: details.totalPaid,
        latestPayment: details.latestPayment,
        unpaidMonthsList: details.unpaidMonthsList,
        unpaidPeriods: details.unpaidPeriods,
        balanceAmount: details.balanceAmount,
        balanceDue: details.balanceAmount,
        summaryText: details.summaryText,
        tillPeriodLabel: details.tillPeriodLabel,
      };
    });
  }, [members, memberLedgers, selectedMonth, selectedYear, lang]);

  // Selected member for payment modal
  const selectedPayMember = useMemo(() => {
    return members.find((m) => m.id === selectedPayMemberId);
  }, [members, selectedPayMemberId]);

  const selectedPayMemberBalanceInfo = useMemo(() => {
    if (!selectedPayMember) return null;
    return calculateMemberBalance(
      selectedPayMember,
      memberLedgers,
      selectedMonth,
      selectedYear,
      lang
    );
  }, [selectedPayMember, memberLedgers, selectedMonth, selectedYear, lang]);

  const handleOpenPaymentModal = (memberId?: string) => {
    const targetId = memberId || (members[0]?.id ?? '');
    setSelectedPayMemberId(targetId);
    if (targetId) {
      const target = members.find((m) => m.id === targetId);
      if (target) {
        const info = calculateMemberBalance(target, memberLedgers, selectedMonth, selectedYear, lang);
        if (info.firstUnpaidMonth && info.firstUnpaidYear) {
          setPayFromMonth(info.firstUnpaidMonth);
          setPayFromYear(info.firstUnpaidYear);
          setPayToMonth(selectedMonth);
          setPayToYear(selectedYear);
        } else {
          setPayFromMonth(selectedMonth);
          setPayFromYear(selectedYear);
          setPayToMonth(selectedMonth);
          setPayToYear(selectedYear);
        }
      }
    }
    setIsPayModalOpen(true);
  };

  const handleSelectPayMember = (memberId: string) => {
    setSelectedPayMemberId(memberId);
    const target = members.find((m) => m.id === memberId);
    if (target) {
      const info = calculateMemberBalance(target, memberLedgers, selectedMonth, selectedYear, lang);
      if (info.firstUnpaidMonth && info.firstUnpaidYear) {
        setPayFromMonth(info.firstUnpaidMonth);
        setPayFromYear(info.firstUnpaidYear);
        setPayToMonth(selectedMonth);
        setToYear(selectedYear);
      } else {
        setPayFromMonth(selectedMonth);
        setPayFromYear(selectedYear);
        setPayToMonth(selectedMonth);
        setPayToYear(selectedYear);
      }
    }
  };

  // Month-to-month calculation in Payment Modal
  const { calculatedPayMonthsCount, calculatedPayTotal, coveredPayMonthsList } = useMemo(() => {
    if (!selectedPayMember) return { calculatedPayMonthsCount: 0, calculatedPayTotal: 0, coveredPayMonthsList: [] };

    const startIdx = payFromYear * 12 + payFromMonth;
    const endIdx = payToYear * 12 + payToMonth;

    if (endIdx < startIdx) {
      return { calculatedPayMonthsCount: 0, calculatedPayTotal: 0, coveredPayMonthsList: [] };
    }

    const count = endIdx - startIdx + 1;
    const list: string[] = [];
    for (let i = startIdx; i <= endIdx; i++) {
      const y = Math.floor((i - 1) / 12);
      const m = ((i - 1) % 12) + 1;
      list.push(`${y}-${String(m).padStart(2, '0')}`);
    }

    return {
      calculatedPayMonthsCount: count,
      calculatedPayTotal: count * selectedPayMember.monthlyAmount,
      coveredPayMonthsList: list,
    };
  }, [selectedPayMember, payFromMonth, payFromYear, payToMonth, payToYear]);

  // Submit Payment from Modal
  const handlePaymentModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayMember || calculatedPayTotal <= 0) return;

    const [y] = payDate.split('-').map(Number);
    addMemberPayment({
      memberId: selectedPayMember.id,
      memberName: selectedPayMember.name,
      ledgerNo: selectedPayMember.ledgerNo,
      contactNumber: selectedPayMember.contactNumber,
      date: payDate,
      year: y,
      fromMonth: payFromMonth,
      toMonth: payToMonth,
      fromYear: payFromYear,
      toYear: payToYear,
      monthsCovered: coveredPayMonthsList,
      monthlyRate: selectedPayMember.monthlyAmount,
      totalAmount: calculatedPayTotal,
      paymentMode: payMode,
      refNumber: payRef,
      remarks: payRemarks,
    });

    setIsPayModalOpen(false);
    setPayRef('');
    setPayRemarks('');
  };

  // Filtered Member Ledger view
  const filteredMemberLedgers = useMemo(() => {
    if (!searchQuery.trim()) return memberLedgerCalculations;
    const q = searchQuery.toLowerCase();
    return memberLedgerCalculations.filter(
      (item) =>
        item.member.name.toLowerCase().includes(q) ||
        item.member.contactNumber.includes(q) ||
        item.member.ledgerNo.toLowerCase().includes(q)
    );
  }, [memberLedgerCalculations, searchQuery]);

  // Handle WhatsApp Message Generation
  const handleSendWhatsApp = (item: typeof memberLedgerCalculations[0]) => {
    const { member, latestPayment, unpaidMonthsList, balanceAmount } = item;

    const latestPaidAmount = latestPayment ? latestPayment.totalAmount : 0;
    const latestPaidMonths = latestPayment ? latestPayment.monthsCovered.join(', ') : 'कोई नहीं';
    const unpaidMonthsText = unpaidMonthsList.length > 0 ? unpaidMonthsList.join(', ') : 'कोई बकाया नहीं';

    const message = `जय बाबा महाकाल की रसोई
सदस्य का नाम: ${member.name}
बही क्रमांक: ${member.ledgerNo}
जमा राशि: ₹${latestPaidAmount.toLocaleString('en-IN')} (माह: ${latestPaidMonths})
बकाया माह: ${unpaidMonthsText}
कुल बकाया राशि (Balance Amount): ₹${balanceAmount.toLocaleString('en-IN')}

अन्नदान महादान है। 'जय बाबा महाकाल की रसोई' (community kitchen) आप सभी सेवादारों के सहयोग से निरंतर संचालित हो रही है; कृपया अपना तन, मन और धन से निरंतर सहयोग बनाए रखें। बाबा महाकाल की असीम कृपा आप और आपके परिवार पर सदा बनी रहे।`;

    const cleanPhone = member.contactNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const url = `https://api.whatsapp.com/send?phone=${phoneWithCountry}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // Submit Add Member
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memName.trim() || !memContact.trim() || !memMonthlyAmount) return;

    addMember({
      ledgerNo: memLedgerNo.trim() || `MKR-${String(members.length + 1).padStart(3, '0')}`,
      name: memName.trim(),
      contactNumber: memContact.trim(),
      address: memAddress.trim() || 'उज्जैन (म.प्र.)',
      joiningMonth: memJoinMonth,
      joiningYear: memJoinYear,
      monthlyAmount: Number(memMonthlyAmount),
      paymentStartMonth: memJoinMonth,
      paymentStartYear: memJoinYear,
      status: 'Active',
    });

    setMemName('');
    setMemContact('');
    setMemAddress('');
    setMemLedgerNo('');
    setIsAddMemberOpen(false);
  };

  // Submit Edit Member
  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    updateMember(editingMember.id, {
      name: editingMember.name,
      contactNumber: editingMember.contactNumber,
      address: editingMember.address,
      ledgerNo: editingMember.ledgerNo,
      monthlyAmount: editingMember.monthlyAmount,
      joiningMonth: editingMember.joiningMonth,
      joiningYear: editingMember.joiningYear,
      status: editingMember.status,
    });
    setEditingMember(null);
  };

  // Import from Excel
  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile<any>(file);
      const newMembers: Member[] = rows.map((r, i) => ({
        id: `mem_imp_${Date.now()}_${i}`,
        ledgerNo: r['Ledger No'] || r['बही नं'] || `MKR-${String(members.length + i + 1).padStart(3, '0')}`,
        name: r['Member Name'] || r['नाम'] || 'नया सदस्य',
        contactNumber: String(r['Contact Number'] || r['मोबाइल'] || '9800000000'),
        address: r['Address'] || r['पता'] || 'उज्जैन',
        joiningMonth: Number(r['Joining Month'] || r['माह'] || 1),
        joiningYear: Number(r['Joining Year'] || r['वर्ष'] || 2026),
        monthlyAmount: Number(r['Monthly Donation'] || r['मासिक अंशदान'] || 1100),
        paymentStartMonth: Number(r['Joining Month'] || 1),
        paymentStartYear: Number(r['Joining Year'] || 2026),
        status: 'Active',
        createdAt: new Date().toISOString(),
      }));
      importMembersList(newMembers);
    } catch {
      showNotification('एक्सेल इम्पोर्ट में त्रुटि (Failed to read file)', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      {/* Hidden File Input for Excel Import */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <Users className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              सदस्य बहीखाता (Member Book &amp; Ledger)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            सेवादार सदस्य मास्टर, माहवार अंशदान लेज़र, बकाया गणना एवं व्हाट्सएप्प संदेश
          </p>
        </div>

        {/* Action Controls & Excel */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-xl border border-stone-300">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-white text-xs font-bold text-stone-800 py-1 px-2 rounded-lg border border-stone-200"
            >
              {MONTH_NAMES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.name.split(' ')[0]}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-white text-xs font-bold text-stone-800 py-1 px-2 rounded-lg border border-stone-200"
            >
              {YEARS_LIST.map((y) => (
                <option key={y} value={y}>
                  वर्ष {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-stone-300"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>इम्पोर्ट एक्सेल</span>
          </button>

          <button
            onClick={() => {
              if (subTab === 'master') exportMembersToExcel(members);
              else exportMemberLedgersToExcel(memberLedgers);
            }}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>एक्सेल एक्सपोर्ट</span>
          </button>

          <button
            onClick={() => handleOpenPaymentModal()}
            className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-extrabold shadow-sm transition active:scale-95"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-200" />
            <span>{lang === 'hi' ? '+ अंशदान जमा करें' : '+ Pay Pledge'}</span>
          </button>

          <button
            onClick={() => setIsAddMemberOpen(true)}
            className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>+ नया सदस्य जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setSubTab('master')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'master'
                ? 'bg-stone-900 text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>सदस्य मास्टर सूची (Member Master)</span>
            <span className="bg-stone-800 text-[10px] px-1.5 py-0.5 rounded text-stone-300">
              {members.length}
            </span>
          </button>

          <button
            onClick={() => setSubTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              subTab === 'ledger'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-300" />
            <span>सदस्य लेज़र व व्हाट्सएप्प (Member Ledger &amp; WhatsApp)</span>
            <span className="bg-emerald-900 text-[10px] px-1.5 py-0.5 rounded text-emerald-100">
              {selectedMonth}/{selectedYear}
            </span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-2 max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="नाम, मोबाइल नं या बही नं से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs"
          />
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 1: MEMBER MASTER TABLE                                */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'master' && (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[11px]">
                  <th className="py-3 px-3">बही नं (Ledger No)</th>
                  <th className="py-3 px-3">सदस्य का नाम (Member Name)</th>
                  <th className="py-3 px-3">मोबाइल नंबर (Mobile)</th>
                  <th className="py-3 px-3">निवास पता (Address)</th>
                  <th className="py-3 px-3">जुड़ने का माह/वर्ष</th>
                  <th className="py-3 px-3 text-right">मासिक अंशदान (₹)</th>
                  <th className="py-3 px-3 text-center">स्थिति</th>
                  <th className="py-3 px-3 text-center">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-400">
                      कोई सदस्य नहीं मिला। कृपया ऊपर दिए गए बटन से नया सदस्य जोड़ें।
                    </td>
                  </tr>
                ) : (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3 px-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                        {member.ledgerNo}
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {member.name}
                      </td>
                      <td className="py-3 px-3 font-medium text-stone-700 whitespace-nowrap">
                        {member.contactNumber}
                      </td>
                      <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={member.address}>
                        {member.address}
                      </td>
                      <td className="py-3 px-3 text-stone-700 whitespace-nowrap">
                        {member.joiningMonth}/{member.joiningYear}
                      </td>
                      <td className="py-3 px-3 text-right font-black text-emerald-700 text-sm whitespace-nowrap">
                        ₹{member.monthlyAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenPaymentModal(member.id)}
                            title="अंशदान जमा करें"
                            className="px-2 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 transition text-[11px] font-bold flex items-center gap-1 border border-emerald-300 shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{lang === 'hi' ? 'अंशदान' : 'Pay'}</span>
                          </button>
                          {currentUser.permissions.canEdit && (
                            <button
                              onClick={() => setEditingMember(member)}
                              title={strings.editBtn}
                              className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-800 transition text-[11px] font-bold flex items-center gap-1 border border-stone-200"
                            >
                              <Edit className="w-3.5 h-3.5 text-amber-700" />
                              <span>{strings.editBtn}</span>
                            </button>
                          )}
                          <button
                            onClick={() => setMemberToDelete(member)}
                            title={strings.deleteBtn}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-900 transition text-[11px] font-bold flex items-center gap-1 border border-rose-200 shadow-2xs active:scale-95"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                            <span>{strings.deleteBtn}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* SUB-SECTION 2: MEMBER LEDGER VIEW & WHATSAPP HYPERLINK            */}
      {/* ----------------------------------------------------------------- */}
      {subTab === 'ledger' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 flex flex-wrap items-center justify-between text-xs text-emerald-950 gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>
                लेज़र गणना सत्र: <b>माह {selectedMonth} / वर्ष {selectedYear}</b> तक (सदस्य जुड़ने के माह से वित्तीय वर्ष वर्तमान माह तक)
              </span>
            </div>
            <div className="text-[11px] text-emerald-800 font-semibold">
              व्हाट्सएप्प बटन दबाकर सेवादार को बकाया व जमा रसीद का भक्तिमय संदेश भेजें।
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[11px]">
                    <th className="py-3 px-3">बही नं</th>
                    <th className="py-3 px-3">सदस्य विवरण (Name &amp; Address)</th>
                    <th className="py-3 px-3">संपर्क नंबर</th>
                    <th className="py-3 px-3 text-right">मासिक दर (₹)</th>
                    <th className="py-3 px-3 text-right text-emerald-900 bg-emerald-50/50">
                      कुल जमा राशि (Paid)
                    </th>
                    <th className="py-3 px-3 text-right text-rose-900 bg-rose-50/50">
                      बकाया राशि (Balance Amount)
                    </th>
                    <th className="py-3 px-3">बकाया माह (Unpaid Months)</th>
                    <th className="py-3 px-3 text-center">व्हाट्सएप्प संदेश</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredMemberLedgers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-stone-400">
                        कोई रिकॉर्ड नहीं मिला।
                      </td>
                    </tr>
                  ) : (
                    filteredMemberLedgers.map((item) => {
                      const { member, totalPaid, balanceDue, unpaidMonthsList } = item;
                      const hasBalance = balanceDue > 0;

                      return (
                        <tr key={member.id} className="hover:bg-amber-50/30 transition">
                          <td className="py-3 px-3 font-mono font-bold text-amber-900 whitespace-nowrap">
                            {member.ledgerNo}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-stone-900">{member.name}</div>
                            <div className="text-[10px] text-stone-500 max-w-xs truncate">{member.address}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-stone-700 whitespace-nowrap">
                            {member.contactNumber}
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-stone-800 whitespace-nowrap">
                            ₹{member.monthlyAmount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-emerald-700 bg-emerald-50/20 whitespace-nowrap">
                            ₹{totalPaid.toLocaleString('en-IN')}
                          </td>
                          <td
                            className={`py-3 px-3 text-right font-black whitespace-nowrap bg-rose-50/20 ${
                              hasBalance ? 'text-rose-700' : 'text-stone-400'
                            }`}
                          >
                            ₹{balanceDue.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 max-w-xs">
                            {unpaidMonthsList.length === 0 ? (
                              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                                <CheckCircle2 className="w-3 h-3" /> पूर्ण जमा
                              </span>
                            ) : (
                              <div className="text-[11px] text-rose-800 line-clamp-2" title={unpaidMonthsList.join(', ')}>
                                {unpaidMonthsList.join(', ')}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleOpenPaymentModal(member.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-2xs"
                                title="अंशदान जमा करें"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>{lang === 'hi' ? 'जमा करें' : 'Pay'}</span>
                              </button>
                              <button
                                onClick={() => handleSendWhatsApp(item)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95"
                                title="जय बाबा महाकाल की रसोई व्हाट्सएप्प संदेश भेजें"
                              >
                                <MessageCircle className="w-3.5 h-3.5 fill-white" />
                                <span>WhatsApp</span>
                              </button>
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

      {/* Modal 1: Add Member */}
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>नया सेवादार सदस्य जोड़ें (Add Member)</span>
              </h3>
              <button onClick={() => setIsAddMemberOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">सदस्य का नाम (Member Name):</label>
                <input
                  type="text"
                  value={memName}
                  onChange={(e) => setMemName(e.target.value)}
                  required
                  placeholder="उदा. पं. रामेश्वर दयाल शर्मा"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">मोबाइल नंबर (Mobile):</label>
                  <input
                    type="tel"
                    value={memContact}
                    onChange={(e) => setMemContact(e.target.value)}
                    required
                    placeholder="9826012345"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">बही क्रमांक (Ledger No):</label>
                  <input
                    type="text"
                    value={memLedgerNo}
                    onChange={(e) => setMemLedgerNo(e.target.value)}
                    placeholder="MKR-006"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">निवास पता (Address):</label>
                <input
                  type="text"
                  value={memAddress}
                  onChange={(e) => setMemAddress(e.target.value)}
                  placeholder="उदा. महाकाल घाटी, उज्जैन"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">जुड़ने का माह व वर्ष:</label>
                  <div className="flex gap-1">
                    <select
                      value={memJoinMonth}
                      onChange={(e) => setMemJoinMonth(Number(e.target.value))}
                      className="w-1/2 bg-stone-50 border border-stone-300 rounded-lg p-2"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value}>{m.name.split(' ')[0]}</option>
                      ))}
                    </select>
                    <select
                      value={memJoinYear}
                      onChange={(e) => setMemJoinYear(Number(e.target.value))}
                      className="w-1/2 bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                    >
                      {YEARS_LIST.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">मासिक अंशदान राशि (₹):</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={memMonthlyAmount}
                    onChange={(e) => setMemMonthlyAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddMemberOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md"
                >
                  सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Member */}
      {editingMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <span>सदस्य विवरण संशोधन (Edit Member)</span>
              </h3>
              <button onClick={() => setEditingMember(null)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMemberSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">सदस्य का नाम:</label>
                <input
                  type="text"
                  value={editingMember.name}
                  onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">मोबाइल नंबर:</label>
                  <input
                    type="tel"
                    value={editingMember.contactNumber}
                    onChange={(e) => setEditingMember({ ...editingMember, contactNumber: e.target.value })}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">बही क्रमांक:</label>
                  <input
                    type="text"
                    value={editingMember.ledgerNo}
                    onChange={(e) => setEditingMember({ ...editingMember, ledgerNo: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">निवास पता:</label>
                <input
                  type="text"
                  value={editingMember.address}
                  onChange={(e) => setEditingMember({ ...editingMember, address: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">मासिक अंशदान (₹):</label>
                  <input
                    type="number"
                    value={editingMember.monthlyAmount}
                    onChange={(e) => setEditingMember({ ...editingMember, monthlyAmount: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">स्थिति (Status):</label>
                  <select
                    value={editingMember.status}
                    onChange={(e) => setEditingMember({ ...editingMember, status: e.target.value as any })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                  >
                    <option value="Active">Active (सक्रिय)</option>
                    <option value="Inactive">Inactive (निष्क्रिय)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-between gap-2 border-t">
                <button
                  type="button"
                  onClick={() => {
                    const toDel = editingMember;
                    setEditingMember(null);
                    setMemberToDelete(toDel);
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl border border-rose-200 flex items-center gap-1.5 transition text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{strings.deleteBtn}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingMember(null)}
                    className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
                  >
                    {strings.cancel}
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                  >
                    {lang === 'hi' ? 'अपडेट करें' : 'Update Member'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Record Member Payment with Balance and Unpaid Month Display */}
      {isPayModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 rounded-xl text-emerald-800">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-stone-900">
                    {lang === 'hi' ? 'सदस्य अंशदान रसीद' : 'Member Contribution Receipt'}
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    {lang === 'hi'
                      ? 'वर्तमान माह तक बकाया राशि व माह अनुसार रसीद प्रविष्टि'
                      : 'Balance amount and unpaid months up to current period'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePaymentModalSubmit} className="space-y-4">
              {/* Member Selection */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  {lang === 'hi' ? '1. सदस्य चुनें (Select Member):' : '1. Select Member:'}
                </label>
                <select
                  value={selectedPayMemberId}
                  onChange={(e) => handleSelectPayMember(e.target.value)}
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

              {/* Balance Amount and Unpaid Month Details Banner */}
              {selectedPayMemberBalanceInfo && (
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/70 p-4 rounded-2xl border border-amber-300 shadow-xs space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-amber-200/80 pb-3">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-black text-stone-900 text-sm">
                          {selectedPayMemberBalanceInfo.member.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 font-black">
                          {selectedPayMemberBalanceInfo.member.ledgerNo}
                        </span>
                        <span className="text-[10px] font-bold text-stone-500">
                          (दर: ₹{selectedPayMemberBalanceInfo.member.monthlyAmount}/माह)
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-600 mt-0.5">
                        फोन: {selectedPayMemberBalanceInfo.member.contactNumber} • पता: {selectedPayMemberBalanceInfo.member.address}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-stone-600 block font-bold uppercase tracking-wider">
                        {lang === 'hi' ? 'वर्तमान माह तक कुल बकाया राशि' : 'Total Balance Amount'}
                      </span>
                      <div
                        className={`text-xl font-black ${
                          selectedPayMemberBalanceInfo.balanceAmount > 0 ? 'text-rose-600' : 'text-emerald-700'
                        }`}
                      >
                        ₹{selectedPayMemberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] font-bold text-amber-900">
                        ({selectedPayMemberBalanceInfo.tillPeriodLabel})
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
                        {selectedPayMemberBalanceInfo.summaryText}
                      </span>
                    </div>

                    {selectedPayMemberBalanceInfo.unpaidPeriods.length === 0 ? (
                      <div className="p-3 bg-emerald-100/80 rounded-xl border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          {lang === 'hi'
                            ? `✓ इस सदस्य का ${selectedPayMemberBalanceInfo.tillPeriodLabel} तक समस्त अंशदान पूर्ण जमा है! कोई बकाया शेष नहीं है।`
                            : `✓ Fully paid up to ${selectedPayMemberBalanceInfo.tillPeriodLabel}! No pending balance.`}
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="bg-white/95 p-3 rounded-xl border border-amber-200">
                          <div className="text-[11px] font-extrabold text-stone-700 mb-2">
                            {lang === 'hi'
                              ? `बकाया माह सूची (${selectedPayMemberBalanceInfo.startPeriodLabel} ${selectedPayMemberBalanceInfo.tillPeriodLabel}):`
                              : `List of Unpaid Months (${selectedPayMemberBalanceInfo.startPeriodLabel} ${selectedPayMemberBalanceInfo.tillPeriodLabel}):`}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedPayMemberBalanceInfo.unpaidPeriods.map((period) => (
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
                              selectedPayMemberBalanceInfo.firstUnpaidMonth &&
                              selectedPayMemberBalanceInfo.firstUnpaidYear
                            ) {
                              setPayFromMonth(selectedPayMemberBalanceInfo.firstUnpaidMonth);
                              setPayFromYear(selectedPayMemberBalanceInfo.firstUnpaidYear);
                              setPayToMonth(selectedPayMemberBalanceInfo.tillMonth);
                              setPayToYear(selectedPayMemberBalanceInfo.tillYear);
                            }
                          }}
                          className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs transition shadow-xs flex items-center justify-center gap-2 active:scale-98"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                          <span>
                            {lang === 'hi'
                              ? `यह समस्त बकाया अवधि (${selectedPayMemberBalanceInfo.unpaidMonthsCount} माह) स्वतः सेट करें`
                              : `Auto-Set Unpaid Range (${selectedPayMemberBalanceInfo.unpaidMonthsCount} Months)`}
                          </span>
                          <span className="bg-amber-900 text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-black">
                            ₹{selectedPayMemberBalanceInfo.balanceAmount.toLocaleString('en-IN')}
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
                  {lang === 'hi' ? 'जमा दिनांक (Payment Date):' : 'Payment Date:'}
                </label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-xl p-2 font-medium"
                />
              </div>

              {/* Month to Month Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'प्रारंभ माह (From):' : 'From Month:'}
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={payFromMonth}
                      onChange={(e) => setPayFromMonth(Number(e.target.value))}
                      className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={payFromYear}
                      onChange={(e) => setPayFromYear(Number(e.target.value))}
                      className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                    >
                      {YEARS_LIST.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">
                    {lang === 'hi' ? 'समाप्त माह (To):' : 'To Month:'}
                  </label>
                  <div className="flex gap-1">
                    <select
                      value={payToMonth}
                      onChange={(e) => setPayToMonth(Number(e.target.value))}
                      className="w-2/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                    >
                      {MONTH_NAMES.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                    <select
                      value={payToYear}
                      onChange={(e) => setPayToYear(Number(e.target.value))}
                      className="w-1/3 bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                    >
                      {YEARS_LIST.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Calculated Total Box */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <span className="text-amber-900 font-bold block">
                    {lang === 'hi' ? 'कुल माह:' : 'Total Months:'} {calculatedPayMonthsCount} माह
                  </span>
                  <span className="text-[10px] text-amber-800 line-clamp-1">
                    {coveredPayMonthsList.join(', ')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-stone-500 block">कुल देय राशि</span>
                  <span className="text-xl font-black text-amber-900">
                    ₹{calculatedPayTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Payment Mode & Ref */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">भुगतान माध्यम:</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  >
                    <option value="Cash">Cash (नकद)</option>
                    <option value="Online/UPI">Online / UPI</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">रसीद / Ref No:</label>
                  <input
                    type="text"
                    value={payRef}
                    onChange={(e) => setPayRef(e.target.value)}
                    placeholder="उदा. UPI/98124"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">रिमार्क / टिप्पणी:</label>
                <input
                  type="text"
                  value={payRemarks}
                  onChange={(e) => setPayRemarks(e.target.value)}
                  placeholder="उदा. अग्रिम अंशदान / नियमित"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  {strings.cancel}
                </button>
                <button
                  type="submit"
                  disabled={!selectedPayMember || calculatedPayTotal <= 0}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{lang === 'hi' ? 'अंशदान रसीद सुरक्षित करें' : 'Save Payment Receipt'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Member Deletion */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 z-[100]">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {strings.confirmDeleteTitle}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {strings.confirmDeleteMsg}
            </p>

            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
              <span className="font-bold text-stone-900 block">{memberToDelete.name}</span>
              <span className="text-[11px] text-stone-500 block">
                बही नं: {memberToDelete.ledgerNo} | संपर्क: {memberToDelete.contactNumber}
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
