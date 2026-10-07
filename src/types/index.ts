export type PaymentMode = 'Cash' | 'Bank Transfer' | 'Online/UPI' | 'Cheque';
export type EntryType = 'Cash In' | 'Cash Out' | 'Bank In' | 'Bank Out';
export type BookCategory = 'General' | 'Member Payment' | 'Purchase' | 'Token' | 'Donation';

export type UnitType = 'Kg' | 'Litre' | 'Quintal' | 'Bag' | 'Pcs' | 'Tin' | 'Packet' | 'Box' | 'Gram';

export interface UserPermissions {
  dashboard: boolean;
  dayBook: boolean;
  ledgerBook: boolean;
  memberBook: boolean;
  vendorBook: boolean;
  itemListBook: boolean;
  adminPanel: boolean;
  gasSuite: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export type AppVersionType = 'computer' | 'mobile' | 'both';

export interface UserAccount {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: 'admin' | 'user';
  permissions: UserPermissions;
  allowedVersion?: AppVersionType;
  createdAt: string;
}

export interface DayBookEntry {
  id: string;
  date: string; // YYYY-MM-DD
  month: number; // 1 - 12
  year: number; // 2026 - 2030
  entryType: EntryType;
  category: BookCategory;
  particulars: string;
  description?: string;
  amount: number;
  paymentMode: PaymentMode;
  refNumber?: string;
  memberId?: string;
  memberName?: string;
  vendorId?: string;
  vendorName?: string;
  tokenBreakdown?: CurrencyDenomination;
  items?: PurchaseItemLine[];
  createdAt: string;
  editedAt?: string;
  isEdited?: boolean;
}

export interface PurchaseItemLine {
  itemId: string;
  itemName: string;
  unit: UnitType;
  quantity: number;
  rate: number;
  gstPercent: number; // CGST + SGST or IGST
  amount: number;
}

export interface CurrencyDenomination {
  note500: number;
  note200: number;
  note100: number;
  note50: number;
  note10: number;
  totalTokens?: number;
  tokenName?: string;
}

export interface LedgerAuditEntry {
  id: string;
  originalEntryId: string;
  bookName: 'Day Book' | 'Member Book' | 'Purchase Book' | 'Token Book';
  date: string;
  particulars: string;
  oldAmount: number;
  newAmount: number;
  difference: number;
  modifiedBy: string;
  timestamp: string;
  reason?: string;
}

export interface Member {
  id: string;
  ledgerNo: string;
  name: string;
  contactNumber: string;
  address: string;
  joiningMonth: number; // 1-12
  joiningYear: number; // 2026-2030
  monthlyAmount: number;
  paymentStartMonth: number;
  paymentStartYear: number;
  status: 'Active' | 'Inactive';
  createdAt: string;
}

export interface MemberLedgerPayment {
  id: string;
  memberId: string;
  memberName: string;
  ledgerNo: string;
  contactNumber: string;
  date: string;
  year: number;
  fromMonth: number;
  toMonth: number;
  fromYear: number;
  toYear: number;
  monthsCovered: string[]; // e.g. ["2026-03", "2026-04"]
  monthlyRate: number;
  totalAmount: number;
  paymentMode: 'Cash' | 'Online/UPI' | 'Bank Transfer';
  refNumber?: string;
  remarks?: string;
  createdAt: string;
  editedAt?: string;
  isEdited?: boolean;
}

export interface Item {
  id: string;
  name: string;
  unit: UnitType;
  defaultRate?: number;
  cgstPercent?: number;
  sgstPercent?: number;
  igstPercent?: number;
  category?: string;
  notes?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contactNumber: string;
  address: string;
  gstNumber?: string;
  gstPercent?: number;
  attachedItemIds: string[]; // IDs of items supplied by this vendor
  notes?: string;
}

export type ThemeType = 'saffron' | 'emerald' | 'slate' | 'navy' | 'dark';
export type Language = 'hi' | 'en';

export interface ShortcutKeyMap {
  navDashboard: string;
  navDayBook: string;
  navLedger: string;
  navMember: string;
  navVendor: string;
  navItem: string;
  navAdmin: string;
  saveAll: string;
  newGeneralEntry: string;
  newMemberPayment: string;
  newPurchase: string;
  openTokenCalc: string;
  exportExcel: string;
}
