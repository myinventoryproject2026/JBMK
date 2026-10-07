import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { MainDashboard } from './components/MainDashboard';
import { DayBook } from './components/DayBook';
import { LedgerBook } from './components/LedgerBook';
import { MemberBook } from './components/MemberBook';
import { ItemListBook } from './components/ItemListBook';
import { VendorBook } from './components/VendorBook';
import { AdminPanel } from './components/AdminPanel';
import { ShortcutSettingsModal } from './components/ShortcutSettingsModal';
import { GoogleAppsScriptModal } from './components/GoogleAppsScriptModal';
import { LoginModal } from './components/LoginModal';
import { MobileCounterView } from './components/MobileCounterView';
import { THEME_CONFIGS } from './utils/theme';
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  Users,
  Store,
  Boxes,
  Shield,
  FileCode,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    theme,
    currentUser,
    notification,
    isMobileMode,
    setIsMobileMode,
  } = useApp();
  const themeConfig = THEME_CONFIGS[theme];

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isGasOpen, setIsGasOpen] = useState(false);

  return (
    <div className={`min-h-screen ${themeConfig.bodyBg} text-stone-900 flex flex-col font-sans transition-colors duration-200`}>
      {/* Top Navbar */}
      <Navbar
        onOpenLoginModal={() => setIsLoginOpen(true)}
        onOpenGasModal={() => setIsGasOpen(true)}
      />

      {/* Mobile Tab Bar (When not in dedicated MobileCounterView) */}
      {!isMobileMode && (
        <div className="md:hidden bg-stone-900 text-stone-200 px-2 py-2 flex items-center overflow-x-auto gap-1 border-b border-stone-800 text-xs no-scrollbar">
          {[
            { id: 'dashboard', label: 'डैशबोर्ड', icon: LayoutDashboard, perm: currentUser.permissions.dashboard },
            { id: 'daybook', label: 'डे बुक', icon: BookOpen, perm: currentUser.permissions.dayBook },
            { id: 'ledger', label: 'लेज़र बही', icon: Receipt, perm: currentUser.permissions.ledgerBook },
            { id: 'members', label: 'सदस्य', icon: Users, perm: currentUser.permissions.memberBook },
            { id: 'vendors', label: 'वेंडर', icon: Store, perm: currentUser.permissions.vendorBook },
            { id: 'items', label: 'सामग्री', icon: Boxes, perm: currentUser.permissions.itemListBook },
            { id: 'admin', label: 'एडमिन', icon: Shield, perm: currentUser.role === 'admin' || currentUser.permissions.adminPanel },
          ].map((item) => {
            if (!item.perm) return null;
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap text-xs font-semibold ${
                  isActive ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Layout Area */}
      <div className="flex-1 flex max-w-[1920px] w-full mx-auto">
        {!isMobileMode && <Sidebar />}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-full">
          {isMobileMode ? (
            <MobileCounterView />
          ) : (
            <>
              {activeTab === 'dashboard' && <MainDashboard />}
              {activeTab === 'daybook' && <DayBook />}
              {activeTab === 'ledger' && <LedgerBook />}
              {activeTab === 'members' && <MemberBook />}
              {activeTab === 'vendors' && <VendorBook />}
              {activeTab === 'items' && <ItemListBook />}
              {activeTab === 'admin' && <AdminPanel />}
              {activeTab === 'gas' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-6 h-6 text-cyan-600" />
                        <div>
                          <h2 className="text-xl font-black text-stone-900">Google Apps Script (.gs) केंद्र</h2>
                          <p className="text-xs text-stone-500">
                            Google Sheets और Google Apps Script वेब ऐप के लिए तैयार स्क्रिप्ट
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => setIsGasOpen(true)}
                        className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold shadow hover:bg-stone-800"
                      >
                        कोड विंडो खोलें (Open Modal)
                      </button>
                    </div>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      इस सुइट में पूर्णतः कार्यशील <code>Code.gs</code> और <code>Index.html</code> उपलब्ध है जो आपकी Google Sheet में स्वतः 8 शीट्स (DayBook, LedgerBook, Members, MemberLedger, Vendors, Items, Tokens, AuditLog) बनाता है।
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Notification Toast */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all transform animate-bounce bg-stone-900 border border-stone-700">
          {notification.type === 'success' && <CheckCircle className="w-4 h-4 text-emerald-400" />}
          {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {notification.type === 'info' && <Info className="w-4 h-4 text-cyan-400" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Global Modals */}
      <ShortcutSettingsModal />
      <GoogleAppsScriptModal isOpen={isGasOpen} onClose={() => setIsGasOpen(false)} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
