import { ThemeType } from '../types';

export interface ThemeConfig {
  name: string;
  badge: string;
  headerBg: string;
  headerText: string;
  primaryBg: string;
  primaryHover: string;
  primaryText: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  bodyBg: string;
  cardBg: string;
  sidebarBg: string;
  activeNav: string;
}

export const THEME_CONFIGS: Record<ThemeType, ThemeConfig> = {
  saffron: {
    name: 'भगवा महाकाल (Saffron Divine)',
    badge: 'ॐ महाकाल',
    headerBg: 'bg-gradient-to-r from-amber-700 via-orange-600 to-amber-800',
    headerText: 'text-amber-50',
    primaryBg: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    primaryText: 'text-white',
    accentBorder: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    bodyBg: 'bg-stone-50',
    cardBg: 'bg-white',
    sidebarBg: 'bg-stone-900',
    activeNav: 'bg-amber-600 text-white',
  },
  emerald: {
    name: 'एमराल्ड ग्रीन (Emerald Fresh)',
    badge: 'स्वच्छ सेवा',
    headerBg: 'bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-900',
    headerText: 'text-emerald-50',
    primaryBg: 'bg-emerald-600',
    primaryHover: 'hover:bg-emerald-700',
    primaryText: 'text-white',
    accentBorder: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    bodyBg: 'bg-slate-50',
    cardBg: 'bg-white',
    sidebarBg: 'bg-slate-900',
    activeNav: 'bg-emerald-600 text-white',
  },
  slate: {
    name: 'मॉडर्न स्लेट सास (Modern SaaS)',
    badge: 'Enterprise',
    headerBg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900',
    headerText: 'text-slate-100',
    primaryBg: 'bg-indigo-600',
    primaryHover: 'hover:bg-indigo-700',
    primaryText: 'text-white',
    accentBorder: 'border-indigo-300',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    bodyBg: 'bg-slate-100',
    cardBg: 'bg-white',
    sidebarBg: 'bg-slate-900',
    activeNav: 'bg-indigo-600 text-white',
  },
  navy: {
    name: 'रॉयल नेवी ब्लू (Royal Blue)',
    badge: 'पवित्र अन्न',
    headerBg: 'bg-gradient-to-r from-blue-900 via-cyan-900 to-blue-950',
    headerText: 'text-blue-50',
    primaryBg: 'bg-blue-600',
    primaryHover: 'hover:bg-blue-700',
    primaryText: 'text-white',
    accentBorder: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    bodyBg: 'bg-blue-50/40',
    cardBg: 'bg-white',
    sidebarBg: 'bg-slate-950',
    activeNav: 'bg-blue-600 text-white',
  },
  dark: {
    name: 'ऑब्सिडियन डार्क (Night Dark)',
    badge: 'Dark Mode',
    headerBg: 'bg-gradient-to-r from-zinc-900 via-neutral-900 to-stone-900',
    headerText: 'text-amber-400',
    primaryBg: 'bg-amber-600',
    primaryHover: 'hover:bg-amber-700',
    primaryText: 'text-white',
    accentBorder: 'border-zinc-700',
    badgeBg: 'bg-zinc-800',
    badgeText: 'text-amber-300',
    bodyBg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900',
    sidebarBg: 'bg-black',
    activeNav: 'bg-amber-600 text-white',
  },
};
