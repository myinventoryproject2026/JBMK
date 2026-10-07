import { Language } from '../types';

export const t = (lang: Language) => {
  const isHi = lang === 'hi';
  return {
    // Brand & App title
    appTitle: isHi ? 'जय बाबा महाकाल की रसोई' : 'Jai Baba Mahakal Ki Rasoi',
    appSubtitle: isHi
      ? 'डे बुक • लेज़र बही • सदस्य प्रबंधन • टोकन • वेंडर व सामग्री खाता'
      : 'Day Book • Ledger • Member Book • Token • Vendor & Item Ledger',
    saasTag: isHi ? 'SaaS 2026-2030' : 'SaaS 2026-2030',

    // Period selector
    sessionPeriod: isHi ? 'सत्र काल:' : 'Period:',
    yearLabel: isHi ? 'वर्ष' : 'Year',

    // Actions
    autoSave: isHi ? 'ऑटो सेव:' : 'Auto Save:',
    saveAll: isHi ? 'डेटा सुरक्षित करें' : 'Save All',
    backupExcel: isHi ? 'बैकअप एक्सेल' : 'Backup Excel',
    gasCode: isHi ? '.GS कोड' : '.GS Code',
    mobileMode: isHi ? 'मोबाइल मोड' : 'Mobile View',
    fullMode: isHi ? 'पूर्ण डेस्कटॉप मोड' : 'Full Desktop View',
    language: isHi ? 'भाषा (Language)' : 'Language',

    // Nav Items
    navDashboard: isHi ? 'मुख्य डैशबोर्ड' : 'Main Dashboard',
    navDayBook: isHi ? 'डे बुक' : 'Day Book',
    navLedger: isHi ? 'लेज़र बही' : 'Ledger Book',
    navMembers: isHi ? 'सदस्य बही' : 'Member Book',
    navVendors: isHi ? 'वेंडर बही' : 'Vendor Book',
    navItems: isHi ? 'सामग्री सूची' : 'Item List',
    navAdmin: isHi ? 'एडमिन पैनल' : 'Admin Panel',
    navGas: isHi ? 'Apps Script सुइट' : 'Apps Script Suite',

    // Dashboard
    dashboardTitle: isHi ? 'मुख्य लेखा डैशबोर्ड' : 'Financial Dashboard',
    dashboardDesc: isHi
      ? 'का वित्तीय सारांश एवं कैश-बैंक प्रवाह'
      : 'Financial Summary & Cash-Bank Flow',
    cashBalance: isHi ? 'नकद बही (Cash Balance)' : 'Cash Account (Cash Balance)',
    totalCashBalance: isHi ? 'कुल शुद्ध नकद शेष' : 'Total Net Cash Balance',
    monthlyCashIn: isHi ? 'मासिक Cash In' : 'Monthly Cash In',
    monthlyCashOut: isHi ? 'मासिक Cash Out' : 'Monthly Cash Out',
    bankBalance: isHi ? 'बैंक खाता (Bank Balance)' : 'Bank Account (Bank Balance)',
    totalBankBalance: isHi ? 'कुल शुद्ध बैंक शेष' : 'Total Net Bank Balance',
    monthlyBankIn: isHi ? 'मासिक Bank In' : 'Monthly Bank In',
    monthlyBankOut: isHi ? 'मासिक Bank Out' : 'Monthly Bank Out',
    memberStatus: isHi ? 'सदस्य अंशदान स्थिति' : 'Member Contribution Status',
    totalActiveMembers: isHi ? 'कुल सक्रिय सदस्य' : 'Total Active Members',
    monthlyExpectedPledge: isHi ? 'मासिक अपेक्षित अंशदान' : 'Monthly Expected Pledge',
    totalPaidTillMonth: isHi ? 'कुल जमा (Paid Till Month)' : 'Total Paid (Till Month)',
    balanceAmount: isHi ? 'बकाया राशि (Balance Amount)' : 'Balance Amount (Due)',
    recentEntries: isHi ? 'हाल ही की प्रविष्टियाँ' : 'Recent Entries Feed',
    quickActions: isHi ? 'त्वरित खाता प्रबंधन' : 'Quick Actions & Shortcuts',

    // Day Book
    dayBookTitle: isHi ? 'डे बुक (दैनिक रोकड़ बही)' : 'Day Book (Daily Cash/Bank Book)',
    dayBookDesc: isHi
      ? 'दैनिक आय-व्यय, सदस्य अंशदान, सामग्री क्रय व नोट गणक टोकन प्रविष्टियाँ'
      : 'Daily Income/Expense, Member Pledge, Purchase & Token Denominations',
    tabRecords: isHi ? 'डे बुक प्रविष्टियाँ' : 'Day Book Records',
    tabGeneral: isHi ? '+ सामान्य प्रविष्टि' : '+ General Entry',
    tabMemberPay: isHi ? '+ सदस्य अंशदान' : '+ Member Payment',
    tabPurchase: isHi ? '+ सामग्री क्रय' : '+ Purchase Entry',
    tabToken: isHi ? '+ नोट गणक टोकन' : '+ Currency Calculator Token',

    // Currency Denominations
    currencyCalculator: isHi ? 'टोकन व नोट गणक' : 'Currency Denomination Calculator',
    denominationsTitle: isHi ? 'नोट प्रकार' : 'Denomination',
    countMultiply: isHi ? 'संख्या × मूल्य = कुल' : 'Count × Value = Total',
    totalNotesCount: isHi ? 'कुल नोटों की संख्या:' : 'Total Notes Count:',
    totalTokenCash: isHi ? 'कुल टोकन नकद राशि:' : 'Total Token Cash Amount:',
    saveTokenToDayBook: isHi ? 'टोकन राशि डे बुक व लेज़र में सेव करें' : 'Save Token to Day Book & Ledger',

    // Member Book
    memberBookTitle: isHi ? 'सदस्य बहीखाता' : 'Member Book & Ledger',
    memberBookDesc: isHi
      ? 'सेवादार सदस्य मास्टर, माहवार अंशदान लेज़र, बकाया गणना एवं व्हाट्सएप्प संदेश'
      : 'Volunteer Member Master, Monthly Ledger, Balance Calculation & WhatsApp Receipts',
    memberMasterTab: isHi ? 'सदस्य मास्टर सूची' : 'Member Master List',
    memberLedgerTab: isHi ? 'सदस्य लेज़र व व्हाट्सएप्प' : 'Member Ledger & WhatsApp',
    addNewMember: isHi ? '+ नया सदस्य जोड़ें' : '+ Add New Member',
    memberSearchPlaceholder: isHi ? 'नाम, मोबाइल नं या बही नं से खोजें...' : 'Search by Name, Mobile or Ledger No...',
    ledgerNo: isHi ? 'बही नं' : 'Ledger No',
    memberName: isHi ? 'सदस्य का नाम' : 'Member Name',
    mobileNumber: isHi ? 'मोबाइल नंबर' : 'Mobile Number',
    address: isHi ? 'निवास पता' : 'Address',
    joiningMonthYear: isHi ? 'जुड़ने का माह/वर्ष' : 'Joining Month/Year',
    monthlyAmountCol: isHi ? 'मासिक अंशदान (₹)' : 'Monthly Pledge (₹)',
    statusCol: isHi ? 'स्थिति' : 'Status',
    actionsCol: isHi ? 'कार्रवाई' : 'Actions',
    totalPaidCol: isHi ? 'कुल जमा राशि (Paid)' : 'Total Paid',
    balanceAmountCol: isHi ? 'बकाया राशि (Balance Amount)' : 'Balance Amount (Due)',
    unpaidMonthsCol: isHi ? 'बकाया माह (Unpaid Months)' : 'Unpaid Months',
    sendWhatsApp: isHi ? 'WhatsApp संदेश' : 'Send WhatsApp',
    confirmDeleteTitle: isHi ? 'सदस्य हटाने की पुष्टि' : 'Confirm Member Deletion',
    confirmDeleteMsg: isHi
      ? 'क्या आप सचमुच इस सदस्य को सूची से हटाना चाहते हैं?'
      : 'Are you sure you want to remove this member from the list?',
    yesDelete: isHi ? 'हाँ, सदस्य हटाएँ' : 'Yes, Remove Member',
    cancel: isHi ? 'रद्द करें' : 'Cancel',

    // Mobile Mode
    mobileViewTitle: isHi ? 'मोबाइल सेवादार काउंटर' : 'Mobile Sevadar Counter',
    mobileMembersTab: isHi ? 'सदस्य सूची (Members)' : 'Members List',
    mobilePayTab: isHi ? 'सदस्य अंशदान (Pay Pledge)' : 'Member Payment',

    // Save All & LiveWebData Drive backup
    liveWebDataBackup: isHi ? 'LiveWebData बैकअप' : 'LiveWebData Backup',
    backupSavedDrive: isHi
      ? 'LiveWebData फ़ाइल जनरेट व सुरक्षित की गई (Google Drive/Apps Script तैयार)!'
      : 'LiveWebData backup generated and saved (Google Drive/Apps Script ready)!',

    // Ledger Book
    ledgerTitle: isHi ? 'लेज़र बही (सामान्य खाता)' : 'Ledger Book (General Ledger)',
    ledgerDesc: isHi
      ? 'समस्त प्रविष्टियों का एकीकृत खाता, कैश-बैंक शेष व संशोधन ऑडिट ट्रेल'
      : 'Unified Account Ledger, Cash-Bank Net Balances & Modification Audit Trail',
    tabLedgerSummary: isHi ? 'लेज़र सारांश व प्रविष्टियाँ' : 'Ledger Summary & Records',
    tabAuditTrail: isHi ? 'संशोधन ऑडिट ट्रेल (Highlight)' : 'Modification Audit Trail (Highlight)',
    exportLedgerExcel: isHi ? 'लेज़र एक्सेल डाउनलोड' : 'Export Ledger Excel',
    accountFilterAll: isHi ? 'सभी खाते (All)' : 'All Accounts',
    accountFilterCash: isHi ? 'केवल Cash' : 'Cash Only',
    accountFilterBank: isHi ? 'केवल Bank' : 'Bank Only',
    categoryFilterToken: isHi ? 'टोकन (Token)' : 'Token Only',

    // Vendor Book
    vendorTitle: isHi ? 'वेंडर बहीखाता (आपूर्तिकर्ता)' : 'Vendor Book (Suppliers)',
    vendorDesc: isHi
      ? 'सामग्री आपूर्तिकर्ता मास्टर, जीएसटी प्रतिशत, संलग्न वस्तुएँ एवं एक्सेल आयात-निर्यात'
      : 'Material Suppliers Master, GST %, Attached Items & Excel Import/Export',
    addNewVendor: isHi ? '+ नया वेंडर जोड़ें' : '+ Add New Vendor',

    // Item List Book
    itemTitle: isHi ? 'सामग्री सूची एवं दर सूची' : 'Item & Rate List',
    itemDesc: isHi
      ? 'रसोई सामग्री, इकाई प्रकार (Kg, Bag, Ltr), दर एवं जीएसटी प्रतिशत'
      : 'Kitchen Items, Units (Kg, Bag, Ltr), Rates & GST Percentages',
    addNewItem: isHi ? '+ नई सामग्री जोड़ें' : '+ Add New Item',

    // Common labels
    searchPlaceholder: isHi ? 'खोजें...' : 'Search...',
    editBtn: isHi ? 'संशोधित करें' : 'Edit',
    deleteBtn: isHi ? 'हटाएँ' : 'Remove',
    saveBtn: isHi ? 'सुरक्षित करें' : 'Save',
    cancelBtn: isHi ? 'रद्द करें' : 'Cancel',
    exportExcelBtn: isHi ? 'एक्सेल निर्यात' : 'Export Excel',
    importExcelBtn: isHi ? 'एक्सेल आयात' : 'Import Excel',
  };
};
