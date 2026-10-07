import { Member, MemberLedgerPayment } from '../types';
import { MONTH_NAMES } from '../data/initialData';

export interface UnpaidPeriod {
  month: number;
  year: number;
  periodKey: string; // e.g. "2026-03"
  monthName: string; // e.g. "मार्च"
  formatted: string; // e.g. "मार्च 2026"
}

export interface MemberBalanceDetails {
  member: Member;
  totalPaid: number;
  latestPayment: MemberLedgerPayment | null;
  unpaidMonthsList: string[]; // ["मार्च 2026", "अप्रैल 2026"]
  unpaidPeriods: UnpaidPeriod[];
  unpaidMonthsCount: number;
  balanceAmount: number; // unpaidMonthsCount * monthlyAmount
  tillMonth: number;
  tillYear: number;
  tillMonthName: string; // "अक्टूबर"
  tillPeriodLabel: string; // "अक्टूबर 2026 तक"
  startPeriodLabel: string; // "मार्च 2026 से"
  firstUnpaidMonth?: number;
  firstUnpaidYear?: number;
  summaryText: string; // e.g. "मार्च 2026 से अक्टूबर 2026 तक (कुल 8 माह)"
}

export function calculateMemberBalance(
  member: Member,
  paymentsList: MemberLedgerPayment[],
  tillMonth: number,
  tillYear: number,
  lang: 'hi' | 'en' = 'hi'
): MemberBalanceDetails {
  const memberPayments = paymentsList.filter((p) => p.memberId === member.id);
  const totalPaid = memberPayments.reduce((sum, p) => sum + p.totalAmount, 0);
  const latestPayment = memberPayments.length > 0 ? memberPayments[memberPayments.length - 1] : null;

  const paidPeriodSet = new Set<string>();
  memberPayments.forEach((p) => {
    p.monthsCovered.forEach((m) => paidPeriodSet.add(m));
  });

  const startMonth = member.paymentStartMonth || member.joiningMonth || 1;
  const startYear = member.paymentStartYear || member.joiningYear || 2026;

  const startIdx = startYear * 12 + startMonth;
  const currentIdx = tillYear * 12 + tillMonth;

  const unpaidMonthsList: string[] = [];
  const unpaidPeriods: UnpaidPeriod[] = [];

  if (currentIdx >= startIdx) {
    for (let i = startIdx; i <= currentIdx; i++) {
      const y = Math.floor((i - 1) / 12);
      const m = ((i - 1) % 12) + 1;
      const periodKey = `${y}-${String(m).padStart(2, '0')}`;

      const rawMonthName = MONTH_NAMES.find((mn) => mn.value === m)?.name || `M${m}`;
      const monthName =
        lang === 'hi'
          ? rawMonthName.split(' ')[0]
          : rawMonthName.split(' ')[1]?.replace(/[()]/g, '') || rawMonthName.split(' ')[0];
      const formatted = `${monthName} ${y}`;

      if (!paidPeriodSet.has(periodKey)) {
        unpaidMonthsList.push(formatted);
        unpaidPeriods.push({
          month: m,
          year: y,
          periodKey,
          monthName,
          formatted,
        });
      }
    }
  }

  const unpaidMonthsCount = unpaidPeriods.length;
  const balanceAmount = unpaidMonthsCount * member.monthlyAmount;

  const rawTillMonth = MONTH_NAMES.find((mn) => mn.value === tillMonth)?.name || `M${tillMonth}`;
  const tillMonthName =
    lang === 'hi'
      ? rawTillMonth.split(' ')[0]
      : rawTillMonth.split(' ')[1]?.replace(/[()]/g, '') || rawTillMonth.split(' ')[0];

  const tillPeriodLabel =
    lang === 'hi' ? `${tillMonthName} ${tillYear} तक` : `till ${tillMonthName} ${tillYear}`;

  let summaryText = '';
  if (unpaidPeriods.length === 0) {
    summaryText =
      lang === 'hi'
        ? `${tillMonthName} ${tillYear} तक पूर्ण जमा (कोई बकाया नहीं)`
        : `Fully paid till ${tillMonthName} ${tillYear} (No balance)`;
  } else if (unpaidPeriods.length === 1) {
    summaryText =
      lang === 'hi'
        ? `${unpaidPeriods[0].formatted} (1 माह)`
        : `${unpaidPeriods[0].formatted} (1 Month)`;
  } else {
    const first = unpaidPeriods[0].formatted;
    const last = unpaidPeriods[unpaidPeriods.length - 1].formatted;
    summaryText =
      lang === 'hi'
        ? `${first} से ${last} तक (कुल ${unpaidMonthsCount} माह)`
        : `${first} to ${last} (${unpaidMonthsCount} Months)`;
  }

  return {
    member,
    totalPaid,
    latestPayment,
    unpaidMonthsList,
    unpaidPeriods,
    unpaidMonthsCount,
    balanceAmount,
    tillMonth,
    tillYear,
    tillMonthName,
    tillPeriodLabel,
    startPeriodLabel: unpaidPeriods[0]
      ? lang === 'hi'
        ? `${unpaidPeriods[0].formatted} से`
        : `from ${unpaidPeriods[0].formatted}`
      : '',
    firstUnpaidMonth: unpaidPeriods[0]?.month,
    firstUnpaidYear: unpaidPeriods[0]?.year,
    summaryText,
  };
}
