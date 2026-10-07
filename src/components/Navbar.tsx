import React from 'react';
import {
  Save,
  Download,
  Keyboard,
  UserCheck,
  Palette,
  Calendar,
  Clock,
  ShieldCheck,
  FileCode,
  Languages,
  Smartphone,
  Monitor,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MONTH_NAMES, YEARS_LIST } from '../data/initialData';
import { THEME_CONFIGS } from '../utils/theme';
import { ThemeType } from '../types';
import { backupAllDataToExcel } from '../utils/excel';
import { t } from '../utils/translations';

interface NavbarProps {
  onOpenLoginModal: () => void;
  onOpenGasModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenLoginModal, onOpenGasModal }) => {
  const {
    currentUser,
    theme,
    setTheme,
    selectedMonth,
    setSelectedMonth,
    selectedYear,
    setSelectedYear,
    secondsUntilAutoSave,
    saveAllNow,
    dayBook,
    members,
    memberLedgers,
    vendors,
    items,
    auditLogs,
    setIsShortcutModalOpen,
    lang,
    setLang,
    isMobileMode,
    setIsMobileMode,
  } = useApp();

  const currentThemeConfig = THEME_CONFIGS[theme];
  const strings = t(lang);

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
    <header className={`${currentThemeConfig.headerBg} text-white shadow-lg sticky top-0 z-30 transition-colors duration-300`}>
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-white/10">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center font-black text-xl border border-white/20 shadow-inner">
            🕉️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg sm:text-xl tracking-tight leading-none">
                {strings.appTitle}
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 border border-white/25">
                {strings.saasTag}
              </span>
            </div>
            <p className="text-[11px] opacity-90 font-medium">
              {strings.appSubtitle}
            </p>
          </div>
        </div>

        {/* Global Period Selector (Month & Year 2026-2030) */}
        <div className="flex items-center gap-2 bg-black/25 px-3 py-1.5 rounded-xl border border-white/15 backdrop-blur-sm">
          <Calendar className="w-4 h-4 text-amber-300 shrink-0" />
          <span className="text-xs font-semibold text-amber-200">{strings.sessionPeriod}</span>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-white/10 text-white text-xs font-semibold rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {MONTH_NAMES.map((m) => (
              <option key={m.value} value={m.value} className="text-stone-900 bg-white">
                {lang === 'hi' ? m.name : m.name.split(' ')[0]}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="bg-white/10 text-white text-xs font-bold rounded-lg px-2 py-1 border border-white/20 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
          >
            {YEARS_LIST.map((y) => (
              <option key={y} value={y} className="text-stone-900 bg-white">
                {strings.yearLabel} {y}
              </option>
            ))}
          </select>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Toggle (Hindi <-> English) */}
          <div className="flex items-center bg-black/30 rounded-xl p-0.5 border border-white/20 shadow-xs">
            <button
              onClick={() => setLang('hi')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition ${
                lang === 'hi' ? 'bg-amber-400 text-stone-900 shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="हिन्दी (Hindi)"
            >
              हिं
            </button>
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-xs font-black transition ${
                lang === 'en' ? 'bg-amber-400 text-stone-900 shadow-xs' : 'text-white/70 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Mobile Mode Toggle */}
          <button
            onClick={() => setIsMobileMode(!isMobileMode)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-extrabold transition shadow-xs ${
              isMobileMode
                ? 'bg-amber-400 text-stone-900 border-amber-300 shadow-md'
                : 'bg-black/25 text-white border-white/20 hover:bg-black/40'
            }`}
            title={isMobileMode ? strings.fullMode : strings.mobileMode}
          >
            {isMobileMode ? <Monitor className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5 text-amber-300" />}
            <span className="hidden sm:inline">
              {isMobileMode ? (lang === 'hi' ? 'डेस्कटॉप' : 'Desktop') : (lang === 'hi' ? 'मोबाइल' : 'Mobile')}
            </span>
          </button>

          {/* Theme Selector */}
          <div className="flex items-center bg-black/25 rounded-xl px-2 py-1 border border-white/15">
            <Palette className="w-3.5 h-3.5 text-amber-300 mr-1.5" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeType)}
              className="bg-transparent text-xs text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="saffron" className="text-stone-900 bg-white">भगवा (Saffron)</option>
              <option value="emerald" className="text-stone-900 bg-white">एमराल्ड (Emerald)</option>
              <option value="slate" className="text-stone-900 bg-white">स्लेट सास (Slate SaaS)</option>
              <option value="navy" className="text-stone-900 bg-white">रॉयल नेवी (Navy)</option>
              <option value="dark" className="text-stone-900 bg-white">डार्क मोड (Dark)</option>
            </select>
          </div>

          {/* Auto-save & Save All button */}
          <div className="flex items-center bg-black/25 px-2.5 py-1 rounded-xl border border-white/15 gap-2 text-xs">
            <Clock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="hidden lg:inline text-[11px] text-amber-100">
              {strings.autoSave} <b className="text-white">{secondsUntilAutoSave}s</b>
            </span>
            <button
              onClick={() => saveAllNow(true)}
              title="डेटा व LiveWebData सुरक्षित करें (Ctrl+S)"
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded text-[11px] font-bold transition shadow-sm"
            >
              <Save className="w-3 h-3 text-emerald-300" />
              <span>{strings.saveAll}</span>
            </button>
          </div>

          {/* Backup All File Excel */}
          <button
            onClick={handleBackupAll}
            title="सम्पूर्ण डेटा एक्सेल बैकअप (Single Excel with 8 Sheets)"
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-md active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{strings.backupExcel}</span>
          </button>

          {/* Apps Script (.gs) modal button */}
          <button
            onClick={onOpenGasModal}
            title="Google Apps Script (.gs) और HTML कोड"
            className="flex items-center gap-1 bg-white/15 hover:bg-white/25 text-white px-2.5 py-1.5 rounded-xl text-xs font-medium border border-white/20 transition"
          >
            <FileCode className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden md:inline">{strings.gasCode}</span>
          </button>

          {/* Shortcuts button */}
          <button
            onClick={() => setIsShortcutModalOpen(true)}
            title="कीबोर्ड शॉर्टकट सहायता (? या F1)"
            className="p-1.5 bg-white/15 hover:bg-white/25 rounded-xl border border-white/20 text-white transition"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Current User & Login Button */}
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-2 bg-black/35 hover:bg-black/50 px-2.5 py-1.5 rounded-xl border border-white/20 text-xs transition font-semibold"
          >
            <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-900 font-bold flex items-center justify-center text-[10px]">
              {currentUser.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-[11px] font-bold text-white max-w-[120px] truncate">{currentUser.displayName}</div>
              <div className="text-[9px] text-amber-200 flex items-center gap-1 capitalize">
                <span>{currentUser.role === 'admin' ? 'व्यवस्थापक (Admin)' : 'सेवादल'}</span>
                {currentUser.allowedVersion === 'mobile' && <span className="bg-amber-400 text-stone-900 px-1 rounded text-[8px] font-black">📱 मोबाइल</span>}
                {currentUser.allowedVersion === 'computer' && <span className="bg-blue-400 text-stone-900 px-1 rounded text-[8px] font-black">💻 PC</span>}
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
