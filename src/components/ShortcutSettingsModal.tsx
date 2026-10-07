import React, { useState } from 'react';
import {
  Keyboard,
  X,
  RotateCcw,
  Save,
  CheckCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ShortcutKeyMap } from '../types';
import { DEFAULT_SHORTCUTS } from '../data/initialData';

export const ShortcutSettingsModal: React.FC = () => {
  const {
    shortcuts,
    updateShortcuts,
    isShortcutModalOpen,
    setIsShortcutModalOpen,
  } = useApp();

  const [formShortcuts, setFormShortcuts] = useState<ShortcutKeyMap>({ ...shortcuts });

  if (!isShortcutModalOpen) return null;

  const handleChange = (field: keyof ShortcutKeyMap, value: string) => {
    setFormShortcuts({ ...formShortcuts, [field]: value });
  };

  const handleSave = () => {
    updateShortcuts(formShortcuts);
    setIsShortcutModalOpen(false);
  };

  const handleResetDefaults = () => {
    setFormShortcuts(DEFAULT_SHORTCUTS);
    updateShortcuts(DEFAULT_SHORTCUTS);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                कीबोर्ड शॉर्टकट प्रबंधक (Keyboard Shortcuts Manager)
              </h3>
              <p className="text-[11px] text-stone-500">
                नेविगेशन पैनल, डे बुक, सदस्य बही व नोट गणक टोकन बटन हेतु कस्टमाइज़ करें
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutModalOpen(false)}
            className="text-stone-400 hover:text-stone-800 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts Form in 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
          {/* Section A: Menu Panel */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
            <span className="font-bold text-stone-900 block text-xs border-b pb-1">
              1. मेनू व नेविगेशन पैनल (Menu Panel):
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">मुख्य डैशबोर्ड:</span>
                <input
                  type="text"
                  value={formShortcuts.navDashboard}
                  onChange={(e) => handleChange('navDashboard', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">डे बुक (Day Book):</span>
                <input
                  type="text"
                  value={formShortcuts.navDayBook}
                  onChange={(e) => handleChange('navDayBook', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">लेज़र बही (Ledger):</span>
                <input
                  type="text"
                  value={formShortcuts.navLedger}
                  onChange={(e) => handleChange('navLedger', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">सदस्य बही (Members):</span>
                <input
                  type="text"
                  value={formShortcuts.navMember}
                  onChange={(e) => handleChange('navMember', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">वेंडर बही (Vendors):</span>
                <input
                  type="text"
                  value={formShortcuts.navVendor}
                  onChange={(e) => handleChange('navVendor', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">सामग्री सूची (Items):</span>
                <input
                  type="text"
                  value={formShortcuts.navItem}
                  onChange={(e) => handleChange('navItem', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Section B: Page Actions & Entry Buttons */}
          <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-2.5">
            <span className="font-bold text-stone-900 block text-xs border-b pb-1">
              2. पेज एक्शन व एंट्री बटन (Action Buttons):
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-stone-700">सामान्य प्रविष्टि (General):</span>
                <input
                  type="text"
                  value={formShortcuts.newGeneralEntry}
                  onChange={(e) => handleChange('newGeneralEntry', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">सदस्य अंशदान (Member Pay):</span>
                <input
                  type="text"
                  value={formShortcuts.newMemberPayment}
                  onChange={(e) => handleChange('newMemberPayment', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">सामग्री क्रय (Purchase):</span>
                <input
                  type="text"
                  value={formShortcuts.newPurchase}
                  onChange={(e) => handleChange('newPurchase', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">नोट गणक टोकन (Token Calc):</span>
                <input
                  type="text"
                  value={formShortcuts.openTokenCalc}
                  onChange={(e) => handleChange('openTokenCalc', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">डेटा सुरक्षित करें (Save All):</span>
                <input
                  type="text"
                  value={formShortcuts.saveAll}
                  onChange={(e) => handleChange('saveAll', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-700">एक्सेल एक्सपोर्ट:</span>
                <input
                  type="text"
                  value={formShortcuts.exportExcel}
                  onChange={(e) => handleChange('exportExcel', e.target.value)}
                  className="w-24 text-center bg-white border border-stone-300 rounded font-mono font-bold p-1 text-[11px]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-1.5 text-stone-600 hover:text-stone-900 border border-stone-300 rounded-xl"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>डिफ़ॉल्ट रीसेट करें</span>
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => setIsShortcutModalOpen(false)}
              className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold text-stone-600"
            >
              रद्द करें
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>शॉर्टकट सुरक्षित करें</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
