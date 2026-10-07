import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserAccount,
  DayBookEntry,
  Member,
  MemberLedgerPayment,
  Item,
  Vendor,
  LedgerAuditEntry,
  ShortcutKeyMap,
  ThemeType,
  Language,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_ITEMS,
  INITIAL_VENDORS,
  INITIAL_MEMBERS,
  INITIAL_DAYBOOK_ENTRIES,
  INITIAL_MEMBER_LEDGERS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_SHORTCUTS,
} from '../data/initialData';
import { saveLiveWebDataBackup } from '../utils/excel';

interface AppContextType {
  // Authentication & Users
  users: UserAccount[];
  currentUser: UserAccount;
  loginUser: (username: string, password: string) => boolean;
  logoutUser: () => void;
  updateAdminCredentials: (newUsername: string, newPassword: string) => boolean;
  createCustomUser: (user: Omit<UserAccount, 'id' | 'createdAt'>) => void;
  updateCustomUser: (user: UserAccount) => void;
  deleteCustomUser: (userId: string) => void;

  // Language & Mobile View
  lang: Language;
  setLang: (lang: Language) => void;
  isMobileMode: boolean;
  setIsMobileMode: (mode: boolean) => void;

  // Navigation & Theme
  activeTab: 'dashboard' | 'daybook' | 'ledger' | 'members' | 'vendors' | 'items' | 'admin' | 'gas';
  setActiveTab: (tab: 'dashboard' | 'daybook' | 'ledger' | 'members' | 'vendors' | 'items' | 'admin' | 'gas') => void;
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;

  // Global Financial Period Selection (2026-2030)
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;

  // Auto-Save & Google Drive / Apps Script sync
  lastSavedAt: Date | null;
  secondsUntilAutoSave: number;
  gasWebAppUrl: string;
  setGasWebAppUrl: (url: string) => void;
  saveAllNow: (downloadLiveWebData?: boolean) => Promise<void>;

  // Day Book
  dayBook: DayBookEntry[];
  addDayBookEntry: (entry: Omit<DayBookEntry, 'id' | 'createdAt'>) => string;
  updateDayBookEntry: (id: string, updated: Partial<DayBookEntry>, editReason?: string) => boolean;
  deleteDayBookEntry: (id: string) => boolean;

  // Members & Member Ledger
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, updated: Partial<Member>) => boolean;
  deleteMember: (id: string) => boolean;
  importMembersList: (imported: Member[]) => void;

  memberLedgers: MemberLedgerPayment[];
  addMemberPayment: (payment: Omit<MemberLedgerPayment, 'id' | 'createdAt'>) => void;
  updateMemberPayment: (id: string, updated: Partial<MemberLedgerPayment>, reason?: string) => boolean;
  deleteMemberPayment: (id: string) => boolean;

  // Items
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => void;
  updateItem: (id: string, updated: Partial<Item>) => boolean;
  deleteItem: (id: string) => boolean;
  importItemsList: (imported: Item[]) => void;

  // Vendors
  vendors: Vendor[];
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updated: Partial<Vendor>) => boolean;
  deleteVendor: (id: string) => boolean;
  importVendorsList: (imported: Vendor[]) => void;

  // Audit Logs (Ledger duplicate highlight entries)
  auditLogs: LedgerAuditEntry[];

  // Shortcut Keys
  shortcuts: ShortcutKeyMap;
  updateShortcuts: (newMap: ShortcutKeyMap) => void;
  isShortcutModalOpen: boolean;
  setIsShortcutModalOpen: (open: boolean) => void;

  // Toast / notification
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial states from localStorage if available
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('mkr_users');
    if (saved) {
      try {
        const parsed: UserAccount[] = JSON.parse(saved);
        return parsed.map((u) => ({
          ...u,
          allowedVersion: u.allowedVersion || (u.role === 'admin' ? 'both' : 'computer'),
        }));
      } catch {
        return INITIAL_USERS;
      }
    }
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount>(() => {
    const saved = localStorage.getItem('mkr_currentUser');
    if (saved) {
      try {
        const parsed: UserAccount = JSON.parse(saved);
        return {
          ...parsed,
          allowedVersion: parsed.allowedVersion || (parsed.role === 'admin' ? 'both' : 'computer'),
        };
      } catch {
        // fallback
      }
    }
    return INITIAL_USERS[0];
  });

  const [theme, setTheme] = useState<ThemeType>(() => {
    const saved = localStorage.getItem('mkr_theme') as ThemeType;
    return saved || 'saffron';
  });

  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('mkr_lang') as Language;
    return saved === 'en' ? 'en' : 'hi';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('mkr_lang', newLang);
  };

  const [isMobileMode, setIsMobileModeState] = useState<boolean>(() => {
    const userSaved = localStorage.getItem('mkr_currentUser');
    if (userSaved) {
      try {
        const u = JSON.parse(userSaved);
        if (u.allowedVersion === 'mobile') return true;
        if (u.allowedVersion === 'computer') return false;
      } catch {}
    }
    const saved = localStorage.getItem('mkr_mobile_mode');
    if (saved !== null) return saved === 'true';
    return typeof window !== 'undefined' && window.innerWidth < 768;
  });

  const setIsMobileMode = (val: boolean) => {
    setIsMobileModeState(val);
    localStorage.setItem('mkr_mobile_mode', String(val));
  };

  const [gasWebAppUrl, setGasWebAppUrlState] = useState<string>(() => {
    return localStorage.getItem('mkr_gas_url') || '';
  });

  const setGasWebAppUrl = (url: string) => {
    setGasWebAppUrlState(url);
    localStorage.setItem('mkr_gas_url', url);
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'daybook' | 'ledger' | 'members' | 'vendors' | 'items' | 'admin' | 'gas'>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<number>(10); // October
  const [selectedYear, setSelectedYear] = useState<number>(2026); // Starting Year 2026

  const [dayBook, setDayBook] = useState<DayBookEntry[]>(() => {
    const saved = localStorage.getItem('mkr_daybook');
    return saved ? JSON.parse(saved) : INITIAL_DAYBOOK_ENTRIES;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('mkr_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [memberLedgers, setMemberLedgers] = useState<MemberLedgerPayment[]>(() => {
    const saved = localStorage.getItem('mkr_member_ledgers');
    return saved ? JSON.parse(saved) : INITIAL_MEMBER_LEDGERS;
  });

  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem('mkr_items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [vendors, setVendors] = useState<Vendor[]>(() => {
    const saved = localStorage.getItem('mkr_vendors');
    return saved ? JSON.parse(saved) : INITIAL_VENDORS;
  });

  const [auditLogs, setAuditLogs] = useState<LedgerAuditEntry[]>(() => {
    const saved = localStorage.getItem('mkr_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [shortcuts, setShortcuts] = useState<ShortcutKeyMap>(() => {
    const saved = localStorage.getItem('mkr_shortcuts');
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });

  const [isShortcutModalOpen, setIsShortcutModalOpen] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(new Date());
  const [secondsUntilAutoSave, setSecondsUntilAutoSave] = useState<number>(30);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  // Save state immediately to localStorage and generate LiveWebData
  const saveAllNow = useCallback(async (downloadLiveWebData: boolean = true) => {
    try {
      localStorage.setItem('mkr_users', JSON.stringify(users));
      localStorage.setItem('mkr_currentUser', JSON.stringify(currentUser));
      localStorage.setItem('mkr_theme', theme);
      localStorage.setItem('mkr_lang', lang);
      localStorage.setItem('mkr_daybook', JSON.stringify(dayBook));
      localStorage.setItem('mkr_members', JSON.stringify(members));
      localStorage.setItem('mkr_member_ledgers', JSON.stringify(memberLedgers));
      localStorage.setItem('mkr_items', JSON.stringify(items));
      localStorage.setItem('mkr_vendors', JSON.stringify(vendors));
      localStorage.setItem('mkr_audit_logs', JSON.stringify(auditLogs));
      localStorage.setItem('mkr_shortcuts', JSON.stringify(shortcuts));
      setLastSavedAt(new Date());
      setSecondsUntilAutoSave(30);

      if (downloadLiveWebData) {
        const { jsonString } = saveLiveWebDataBackup({
          dayBook,
          members,
          memberLedgers,
          vendors,
          items,
          auditLogs,
        });

        // If Google Apps Script Web App URL is configured, push to Google Drive replacing old backup
        if (gasWebAppUrl.trim()) {
          try {
            await fetch(gasWebAppUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'saveLiveWebData',
                data: jsonString,
              }),
              mode: 'no-cors',
            });
            showNotification(
              lang === 'hi'
                ? 'डेटा सुरक्षित! LiveWebData फ़ाइल Google Drive व लोकल में अपडेट हुई।'
                : 'Data saved & LiveWebData updated in Google Drive!',
              'success'
            );
          } catch {
            showNotification(
              lang === 'hi'
                ? 'डेटा सुरक्षित! LiveWebData.xlsx बैकअप फ़ाइल सुरक्षित की गई।'
                : 'Data saved! LiveWebData.xlsx file updated.',
              'success'
            );
          }
        } else {
          showNotification(
            lang === 'hi'
              ? 'डेटा सुरक्षित! LiveWebData.xlsx बैकअप फ़ाइल डाउनलोड की गई।'
              : 'Data saved! LiveWebData.xlsx backup file updated.',
            'success'
          );
        }
      } else {
        showNotification(
          lang === 'hi' ? 'डेटा सुरक्षित किया गया!' : 'Data saved successfully!',
          'success'
        );
      }
    } catch {
      showNotification(
        lang === 'hi' ? 'डेटा सेव करने में त्रुटि!' : 'Failed to save data!',
        'error'
      );
    }
  }, [users, currentUser, theme, lang, dayBook, members, memberLedgers, items, vendors, auditLogs, shortcuts, gasWebAppUrl, showNotification]);

  // Automatic 30-Second Countdown & Auto-Save
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsUntilAutoSave((prev) => {
        if (prev <= 1) {
          // Trigger Auto Save
          try {
            localStorage.setItem('mkr_users', JSON.stringify(users));
            localStorage.setItem('mkr_currentUser', JSON.stringify(currentUser));
            localStorage.setItem('mkr_theme', theme);
            localStorage.setItem('mkr_daybook', JSON.stringify(dayBook));
            localStorage.setItem('mkr_members', JSON.stringify(members));
            localStorage.setItem('mkr_member_ledgers', JSON.stringify(memberLedgers));
            localStorage.setItem('mkr_items', JSON.stringify(items));
            localStorage.setItem('mkr_vendors', JSON.stringify(vendors));
            localStorage.setItem('mkr_audit_logs', JSON.stringify(auditLogs));
            localStorage.setItem('mkr_shortcuts', JSON.stringify(shortcuts));
            setLastSavedAt(new Date());
          } catch {
            // handle silent fail
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [users, currentUser, theme, dayBook, members, memberLedgers, items, vendors, auditLogs, shortcuts]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in standard inputs unless Ctrl+S
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Save All: Ctrl+S
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        saveAllNow();
        return;
      }

      if (isInput) return;

      const altPressed = e.altKey;
      const key = e.key.toUpperCase();

      if (altPressed) {
        if (key === 'D') {
          e.preventDefault();
          setActiveTab('dashboard');
        } else if (key === 'B') {
          e.preventDefault();
          setActiveTab('daybook');
        } else if (key === 'L') {
          e.preventDefault();
          setActiveTab('ledger');
        } else if (key === 'M') {
          e.preventDefault();
          setActiveTab('members');
        } else if (key === 'V') {
          e.preventDefault();
          setActiveTab('vendors');
        } else if (key === 'I') {
          e.preventDefault();
          setActiveTab('items');
        } else if (key === 'A') {
          e.preventDefault();
          if (currentUser.role === 'admin' || currentUser.permissions.adminPanel) {
            setActiveTab('admin');
          } else {
            showNotification('एडमिन पैनल के लिए अनुमति नहीं है (No Admin Permission)', 'error');
          }
        }
      }

      // Help shortcuts: '?' or 'F1'
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setIsShortcutModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentUser, saveAllNow, showNotification]);

  // Auth Operations
  const loginUser = (username: string, password: string): boolean => {
    const found = users.find((u) => u.username.toLowerCase() === username.toLowerCase() && u.passwordHash === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('mkr_currentUser', JSON.stringify(found));
      if (found.allowedVersion === 'mobile') {
        setIsMobileMode(true);
      } else if (found.allowedVersion === 'computer') {
        setIsMobileMode(false);
      }
      const versionLabel =
        found.allowedVersion === 'mobile'
          ? (lang === 'hi' ? 'मोबाइल संस्करण' : 'Mobile Version')
          : found.allowedVersion === 'computer'
          ? (lang === 'hi' ? 'कंप्यूटर संस्करण' : 'Computer Version')
          : (lang === 'hi' ? 'दोनों संस्करण' : 'All Versions');

      showNotification(`${lang === 'hi' ? 'स्वागत है' : 'Welcome'}, ${found.displayName}! [${versionLabel}]`, 'success');
      return true;
    }
    showNotification('गलत यूज़रनेम या पासवर्ड (Invalid credentials)', 'error');
    return false;
  };

  const logoutUser = () => {
    const defaultAdmin = users.find((u) => u.username === 'admin') || users[0];
    setCurrentUser(defaultAdmin);
    localStorage.setItem('mkr_currentUser', JSON.stringify(defaultAdmin));
    if (defaultAdmin.allowedVersion === 'mobile') {
      setIsMobileMode(true);
    } else if (defaultAdmin.allowedVersion === 'computer') {
      setIsMobileMode(false);
    }
    showNotification('लॉगआउट हुआ (Switched to Guest/Admin View)', 'info');
  };

  const updateAdminCredentials = (newUsername: string, newPassword: string): boolean => {
    if (currentUser.role !== 'admin') {
      showNotification('केवल मुख्य एडमिन ही क्रेडेंशियल बदल सकते हैं!', 'error');
      return false;
    }
    const updated = users.map((u) => {
      if (u.role === 'admin' && u.id === currentUser.id) {
        return { ...u, username: newUsername, passwordHash: newPassword };
      }
      return u;
    });
    setUsers(updated);
    const updatedCurrent = { ...currentUser, username: newUsername, passwordHash: newPassword };
    setCurrentUser(updatedCurrent);
    showNotification('एडमिन यूज़रनेम व पासवर्ड अपडेट हुआ!', 'success');
    return true;
  };

  const createCustomUser = (userData: Omit<UserAccount, 'id' | 'createdAt'>) => {
    const newUser: UserAccount = {
      ...userData,
      id: `user_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, newUser]);
    showNotification(`नया यूज़र '${newUser.displayName}' सफलतापूर्वक बनाया गया!`, 'success');
  };

  const updateCustomUser = (updatedUser: UserAccount) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    if (currentUser.id === updatedUser.id) {
      setCurrentUser(updatedUser);
    }
    showNotification('यूज़र अनुमति एवं विवरण अपडेट किया गया!', 'success');
  };

  const deleteCustomUser = (userId: string) => {
    if (userId === currentUser.id) {
      showNotification('वर्तमान सक्रिय यूज़र को डिलीट नहीं किया जा सकता!', 'error');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showNotification('यूज़र को हटा दिया गया!', 'info');
  };

  // Day Book CRUD & Audit Trail
  const addDayBookEntry = (entryData: Omit<DayBookEntry, 'id' | 'createdAt'>): string => {
    const newId = `db_${Date.now()}`;
    const newEntry: DayBookEntry = {
      ...entryData,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    setDayBook((prev) => [newEntry, ...prev]);
    showNotification('डे बुक प्रविष्टि सफलतापूर्वक दर्ज की गई!', 'success');
    return newId;
  };

  const updateDayBookEntry = (id: string, updated: Partial<DayBookEntry>, editReason: string = 'रिकॉर्ड संशोधन'): boolean => {
    if (!currentUser.permissions.canEdit) {
      showNotification('आपको प्रविष्टि संपादित (Edit) करने की अनुमति नहीं है!', 'error');
      return false;
    }

    const existing = dayBook.find((d) => d.id === id);
    if (!existing) return false;

    // Critical Requirement: If any entry is edited, make an audit log duplicate entry with highlight and old vs new amount!
    const oldAmount = existing.amount;
    const newAmount = updated.amount !== undefined ? updated.amount : existing.amount;

    if (oldAmount !== newAmount || (updated.particulars && updated.particulars !== existing.particulars)) {
      const auditEntry: LedgerAuditEntry = {
        id: `audit_${Date.now()}`,
        originalEntryId: id,
        bookName: existing.category === 'Purchase' ? 'Purchase Book' : existing.category === 'Token' ? 'Token Book' : 'Day Book',
        date: updated.date || existing.date,
        particulars: updated.particulars || existing.particulars,
        oldAmount: oldAmount,
        newAmount: newAmount,
        difference: newAmount - oldAmount,
        modifiedBy: currentUser.username,
        timestamp: new Date().toISOString(),
        reason: editReason,
      };
      setAuditLogs((prev) => [auditEntry, ...prev]);
    }

    setDayBook((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...updated,
              editedAt: new Date().toISOString(),
              isEdited: true,
            }
          : d
      )
    );
    showNotification('प्रविष्टि अपडेट की गई एवं ऑडिट लेज़र में दर्ज की गई!', 'success');
    return true;
  };

  const deleteDayBookEntry = (id: string): boolean => {
    if (!currentUser.permissions.canDelete) {
      showNotification('आपको प्रविष्टि डिलीट करने की अनुमति नहीं है!', 'error');
      return false;
    }
    setDayBook((prev) => prev.filter((d) => d.id !== id));
    showNotification('प्रविष्टि हटा दी गई!', 'info');
    return true;
  };

  // Member CRUD
  const addMember = (memberData: Omit<Member, 'id' | 'createdAt'>) => {
    const newMember: Member = {
      ...memberData,
      id: `mem_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMembers((prev) => [newMember, ...prev]);
    showNotification(`सदस्य '${newMember.name}' सफलतापूर्वक जोड़ा गया!`, 'success');
  };

  const updateMember = (id: string, updated: Partial<Member>): boolean => {
    if (!currentUser.permissions.canEdit) {
      showNotification('सदस्य विवरण संशोधित करने की अनुमति नहीं है!', 'error');
      return false;
    }
    setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...updated } : m)));
    showNotification('सदस्य विवरण अपडेट किया गया!', 'success');
    return true;
  };

  const deleteMember = (id: string): boolean => {
    // If explicitly denied in custom role permissions
    if (currentUser.role !== 'admin' && currentUser.permissions.canDelete === false) {
      showNotification(
        lang === 'hi'
          ? 'सदस्य हटाने के लिए एडमिन अनुमति आवश्यक है!'
          : 'You do not have permission to delete members!',
        'error'
      );
      return false;
    }

    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem('mkr_members', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to sync members to localStorage', err);
      }
      return updated;
    });

    showNotification(
      lang === 'hi'
        ? 'सदस्य को सूची से सफलतापूर्वक हटाया गया!'
        : 'Member removed successfully!',
      'info'
    );
    return true;
  };

  const importMembersList = (imported: Member[]) => {
    setMembers((prev) => [...imported, ...prev]);
    showNotification(`${imported.length} सदस्य सफलतापूर्वक इम्पोर्ट किए गए!`, 'success');
  };

  // Member Payments (Links to Day Book and Member Ledger)
  const addMemberPayment = (paymentData: Omit<MemberLedgerPayment, 'id' | 'createdAt'>) => {
    const paymentId = `mlp_${Date.now()}`;
    const newPayment: MemberLedgerPayment = {
      ...paymentData,
      id: paymentId,
      createdAt: new Date().toISOString(),
    };
    setMemberLedgers((prev) => [newPayment, ...prev]);

    // Also auto-record in Day Book!
    const monthsText = paymentData.monthsCovered.join(', ');
    const dayBookType = paymentData.paymentMode === 'Cash' ? 'Cash In' : 'Bank In';

    const dbId = `db_${Date.now()}`;
    const dbEntry: DayBookEntry = {
      id: dbId,
      date: paymentData.date,
      month: paymentData.toMonth,
      year: paymentData.toYear,
      entryType: dayBookType,
      category: 'Member Payment',
      particulars: `सदस्य अंशदान - ${paymentData.memberName} (${paymentData.ledgerNo})`,
      description: `माह: ${monthsText} (${paymentData.monthsCovered.length} माह) | ${paymentData.remarks || ''}`,
      amount: paymentData.totalAmount,
      paymentMode: paymentData.paymentMode,
      refNumber: paymentData.refNumber,
      memberId: paymentData.memberId,
      memberName: paymentData.memberName,
      createdAt: new Date().toISOString(),
    };
    setDayBook((prev) => [dbEntry, ...prev]);

    showNotification(`सदस्य अंशदान ₹${paymentData.totalAmount} डे बुक एवं सदस्य लेज़र में दर्ज हुआ!`, 'success');
  };

  const updateMemberPayment = (id: string, updated: Partial<MemberLedgerPayment>, reason: string = 'सदस्य रसीद संशोधन'): boolean => {
    if (!currentUser.permissions.canEdit) {
      showNotification('संशोधन की अनुमति नहीं है!', 'error');
      return false;
    }
    const existing = memberLedgers.find((m) => m.id === id);
    if (!existing) return false;

    if (updated.totalAmount && updated.totalAmount !== existing.totalAmount) {
      const audit: LedgerAuditEntry = {
        id: `audit_${Date.now()}`,
        originalEntryId: id,
        bookName: 'Member Book',
        date: updated.date || existing.date,
        particulars: `सदस्य अंशदान - ${existing.memberName} (${existing.ledgerNo})`,
        oldAmount: existing.totalAmount,
        newAmount: updated.totalAmount,
        difference: updated.totalAmount - existing.totalAmount,
        modifiedBy: currentUser.username,
        timestamp: new Date().toISOString(),
        reason: reason,
      };
      setAuditLogs((prev) => [audit, ...prev]);
    }

    setMemberLedgers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated, editedAt: new Date().toISOString(), isEdited: true } : m))
    );
    showNotification('सदस्य भुगतान अपडेट हुआ व ऑडिट में दर्ज हुआ!', 'success');
    return true;
  };

  const deleteMemberPayment = (id: string): boolean => {
    if (!currentUser.permissions.canDelete) {
      showNotification('डिलीट की अनुमति नहीं है!', 'error');
      return false;
    }
    setMemberLedgers((prev) => prev.filter((m) => m.id !== id));
    showNotification('सदस्य भुगतान हटाया गया!', 'info');
    return true;
  };

  // Item Master CRUD
  const addItem = (itemData: Omit<Item, 'id'>) => {
    const newItem: Item = { ...itemData, id: `item_${Date.now()}` };
    setItems((prev) => [newItem, ...prev]);
    showNotification(`सामग्री '${newItem.name}' जोड़ी गई!`, 'success');
  };

  const updateItem = (id: string, updated: Partial<Item>): boolean => {
    if (!currentUser.permissions.canEdit) {
      showNotification('संशोधन की अनुमति नहीं है!', 'error');
      return false;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updated } : i)));
    showNotification('सामग्री विवरण अपडेट हुआ!', 'success');
    return true;
  };

  const deleteItem = (id: string): boolean => {
    if (!currentUser.permissions.canDelete) {
      showNotification('डिलीट की अनुमति नहीं है!', 'error');
      return false;
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    showNotification('सामग्री सूची से हटाई गई!', 'info');
    return true;
  };

  const importItemsList = (imported: Item[]) => {
    setItems((prev) => [...imported, ...prev]);
    showNotification(`${imported.length} सामग्री इम्पोर्ट की गई!`, 'success');
  };

  // Vendor Master CRUD
  const addVendor = (vendorData: Omit<Vendor, 'id'>) => {
    const newVendor: Vendor = { ...vendorData, id: `ven_${Date.now()}` };
    setVendors((prev) => [newVendor, ...prev]);
    showNotification(`सप्लायर/विक्रेता '${newVendor.name}' जोड़ा गया!`, 'success');
  };

  const updateVendor = (id: string, updated: Partial<Vendor>): boolean => {
    if (!currentUser.permissions.canEdit) {
      showNotification('संशोधन की अनुमति नहीं है!', 'error');
      return false;
    }
    setVendors((prev) => prev.map((v) => (v.id === id ? { ...v, ...updated } : v)));
    showNotification('विक्रेता विवरण अपडेट हुआ!', 'success');
    return true;
  };

  const deleteVendor = (id: string): boolean => {
    if (!currentUser.permissions.canDelete) {
      showNotification('डिलीट की अनुमति नहीं है!', 'error');
      return false;
    }
    setVendors((prev) => prev.filter((v) => v.id !== id));
    showNotification('विक्रेता हटाया गया!', 'info');
    return true;
  };

  const importVendorsList = (imported: Vendor[]) => {
    setVendors((prev) => [...imported, ...prev]);
    showNotification(`${imported.length} विक्रेता इम्पोर्ट किए गए!`, 'success');
  };

  const updateShortcuts = (newMap: ShortcutKeyMap) => {
    setShortcuts(newMap);
    localStorage.setItem('mkr_shortcuts', JSON.stringify(newMap));
    showNotification('शॉर्टकट कीज़ अपडेट की गई!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        users,
        currentUser,
        loginUser,
        logoutUser,
        updateAdminCredentials,
        createCustomUser,
        updateCustomUser,
        deleteCustomUser,
        lang,
        setLang,
        isMobileMode,
        setIsMobileMode,
        gasWebAppUrl,
        setGasWebAppUrl,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        selectedMonth,
        setSelectedMonth,
        selectedYear,
        setSelectedYear,
        lastSavedAt,
        secondsUntilAutoSave,
        saveAllNow,
        dayBook,
        addDayBookEntry,
        updateDayBookEntry,
        deleteDayBookEntry,
        members,
        addMember,
        updateMember,
        deleteMember,
        importMembersList,
        memberLedgers,
        addMemberPayment,
        updateMemberPayment,
        deleteMemberPayment,
        items,
        addItem,
        updateItem,
        deleteItem,
        importItemsList,
        vendors,
        addVendor,
        updateVendor,
        deleteVendor,
        importVendorsList,
        auditLogs,
        shortcuts,
        updateShortcuts,
        isShortcutModalOpen,
        setIsShortcutModalOpen,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
