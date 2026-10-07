import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Receipt,
  Users,
  Store,
  Boxes,
  Shield,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEME_CONFIGS } from '../utils/theme';
import { t } from '../utils/translations';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, theme, shortcuts, lang } = useApp();
  const themeConfig = THEME_CONFIGS[theme];
  const strings = t(lang);

  const navItems = [
    {
      id: 'dashboard',
      label: strings.navDashboard,
      icon: LayoutDashboard,
      shortcut: shortcuts.navDashboard,
      permission: currentUser.permissions.dashboard,
    },
    {
      id: 'daybook',
      label: strings.navDayBook,
      icon: BookOpen,
      shortcut: shortcuts.navDayBook,
      permission: currentUser.permissions.dayBook,
    },
    {
      id: 'ledger',
      label: strings.navLedger,
      icon: Receipt,
      shortcut: shortcuts.navLedger,
      permission: currentUser.permissions.ledgerBook,
    },
    {
      id: 'members',
      label: strings.navMembers,
      icon: Users,
      shortcut: shortcuts.navMember,
      permission: currentUser.permissions.memberBook,
    },
    {
      id: 'vendors',
      label: strings.navVendors,
      icon: Store,
      shortcut: shortcuts.navVendor,
      permission: currentUser.permissions.vendorBook,
    },
    {
      id: 'items',
      label: strings.navItems,
      icon: Boxes,
      shortcut: shortcuts.navItem,
      permission: currentUser.permissions.itemListBook,
    },
    {
      id: 'admin',
      label: strings.navAdmin,
      icon: Shield,
      shortcut: shortcuts.navAdmin,
      permission: currentUser.role === 'admin' || currentUser.permissions.adminPanel,
    },
    {
      id: 'gas',
      label: strings.navGas,
      icon: FileCode,
      shortcut: 'Alt+G',
      permission: currentUser.role === 'admin' || currentUser.permissions.gasSuite,
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 shrink-0 border-r border-stone-800 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-65px)]">
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold tracking-wider uppercase text-stone-400 flex items-center justify-between">
          <span>नेविगेशन पैनल</span>
          <span className="text-[10px] bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded font-mono">
            2026-2030
          </span>
        </div>

        {navItems.map((item) => {
          if (!item.permission) return null;
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? `${themeConfig.activeNav} shadow-md font-bold`
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  isActive ? 'bg-black/20 text-white' : 'bg-stone-800 text-stone-400'
                }`}
              >
                {item.shortcut}
              </span>
            </button>
          );
        })}
      </div>

      {/* Footer Branding Card */}
      <div className="p-3 m-3 bg-stone-950/80 rounded-2xl border border-stone-800/80 text-xs">
        <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>बाबा महाकाल की कृपा</span>
        </div>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          अन्नदान महादान • निष्काम सेवा भाव से संचालित डिजिटल बहीखाता।
        </p>
        <div className="mt-2.5 pt-2 border-t border-stone-800 text-[10px] text-stone-500 flex justify-between items-center">
          <span>संस्करण v2.6 SaaS</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            सक्रिय
          </span>
        </div>
      </div>
    </aside>
  );
};
