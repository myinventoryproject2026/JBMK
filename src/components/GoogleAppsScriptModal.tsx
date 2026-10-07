import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Table,
  CheckCircle2,
  Terminal,
} from 'lucide-react';
import { generateGoogleAppsScriptCode, generateStandaloneHtml } from '../utils/gasGenerator';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleAppsScriptModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { gasWebAppUrl, setGasWebAppUrl, saveAllNow } = useApp();
  const [activeCodeTab, setActiveCodeTab] = useState<'gs' | 'html' | 'steps'>('gs');
  const [copiedGs, setCopiedGs] = useState(false);
  const [copiedHtml, setCopiedHtml] = useState(false);

  if (!isOpen) return null;

  const gsCode = generateGoogleAppsScriptCode();
  const htmlCode = generateStandaloneHtml();

  const handleCopyGs = () => {
    navigator.clipboard.writeText(gsCode);
    setCopiedGs(true);
    setTimeout(() => setCopiedGs(false), 2500);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2500);
  };

  const handleDownloadGs = () => {
    const blob = new Blob([gsCode], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Code.gs';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtml = () => {
    const blob = new Blob([htmlCode], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-100 rounded-xl text-cyan-800">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                Google Apps Script (.gs) &amp; .html सुइट (Web App Integration)
              </h3>
              <p className="text-[11px] text-stone-500">
                Google Sheets के साथ सीधा लाइव सिंक • Code.gs और HTML सर्विस फ़ाइलें
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
          <button
            onClick={() => setActiveCodeTab('gs')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCodeTab === 'gs'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Code.gs (Apps Script कोड)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('html')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCodeTab === 'html'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Index.html (Web App UI)</span>
          </button>

          <button
            onClick={() => setActiveCodeTab('steps')}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeCodeTab === 'steps'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>सेटअप निर्देश (How to Deploy)</span>
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {activeCodeTab === 'gs' && (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between bg-stone-100 p-2 rounded-xl text-[11px]">
                <span className="font-mono text-stone-600 font-bold">Code.gs • 150+ Lines</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyGs}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-200 rounded font-semibold text-stone-800 border"
                  >
                    {copiedGs ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedGs ? 'कॉपी हो गया' : 'कोड कॉपी करें'}</span>
                  </button>
                  <button
                    onClick={handleDownloadGs}
                    className="flex items-center gap-1 px-2.5 py-1 bg-cyan-700 hover:bg-cyan-800 text-white rounded font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>डाउनलोड Code.gs</span>
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-y-auto bg-stone-950 text-emerald-400 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-stone-800">
                {gsCode}
              </pre>
            </div>
          )}

          {activeCodeTab === 'html' && (
            <div className="flex-1 flex flex-col space-y-2">
              <div className="flex items-center justify-between bg-stone-100 p-2 rounded-xl text-[11px]">
                <span className="font-mono text-stone-600 font-bold">Index.html • Web App Template</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyHtml}
                    className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-stone-200 rounded font-semibold text-stone-800 border"
                  >
                    {copiedHtml ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHtml ? 'कॉपी हो गया' : 'HTML कॉपी करें'}</span>
                  </button>
                  <button
                    onClick={handleDownloadHtml}
                    className="flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold"
                  >
                    <Download className="w-3 h-3" />
                    <span>डाउनलोड Index.html</span>
                  </button>
                </div>
              </div>
              <pre className="flex-1 overflow-y-auto bg-stone-950 text-cyan-300 p-4 rounded-xl font-mono text-[11px] leading-relaxed border border-stone-800">
                {htmlCode}
              </pre>
            </div>
          )}

          {activeCodeTab === 'steps' && (
            <div className="flex-1 overflow-y-auto p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
              <h4 className="font-bold text-stone-900 text-sm">
                Google Sheets में वेब ऐप स्थापित (Deploy) करने की सरल विधि:
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-stone-700 leading-relaxed">
                <li>
                  एक नया Google Spreadsheet खोलें और नाम दें: <b>"जय बाबा महाकाल की रसोई - बहीखाता"</b>।
                </li>
                <li>
                  शीर्ष मेनू से <b>Extensions (एक्सटेंशन) &rarr; Apps Script</b> पर क्लिक करें।
                </li>
                <li>
                  बाईं ओर <code>Code.gs</code> फ़ाइल में ऊपर दिए गए <b>Code.gs</b> का कोड पेस्ट करें।
                </li>
                <li>
                  <b>+ बटन</b> दबाकर HTML फ़ाइल जोड़ें और उसका नाम <code>Index</code> रखें, फिर उसमें <b>Index.html</b> पेस्ट करें।
                </li>
                <li>
                  फ़ंक्शन सूची से <code>initialSetup</code> चुनकर एक बार <b>Run (चलाएँ)</b> पर क्लिक करें।
                  (यह गूगल शीट में DayBook, LedgerBook, Members, MemberLedger, Vendors, Items, Tokens, AuditLog की सभी 8 शीट्स स्वतः बना देगा!)
                </li>
                <li>
                  ऊपर दाईं ओर <b>Deploy &rarr; New deployment &rarr; Web app</b> चुनें।
                  <br />• Execute as: <b>Me</b>
                  <br />• Who has access: <b>Anyone</b>
                </li>
                <li>
                  Deploy पर क्लिक करें और प्राप्त Web App URL को नीचे दिए गए बॉक्स में पेस्ट करें ताकि Google Drive में <code>LiveWebData</code> फ़ाइल स्वतः अपडेट होती रहे (पुरानी फ़ाइल को रिप्लेस करते हुए)!
                </li>
              </ol>

              {/* Web App URL connection box */}
              <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200 space-y-2 mt-3">
                <span className="font-bold text-amber-950 block">
                  Google Drive / Apps Script Web App URL (LiveWebData ऑटो सिंक):
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={gasWebAppUrl}
                    onChange={(e) => setGasWebAppUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-white border border-amber-300 rounded-lg p-2 text-xs font-mono"
                  />
                  <button
                    onClick={() => {
                      if (gasWebAppUrl) {
                        saveAllNow(true);
                      }
                    }}
                    className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg text-xs shrink-0"
                  >
                    सिंक टेस्ट करें
                  </button>
                </div>
                <p className="text-[11px] text-amber-800">
                  जब भी आप "Save All" क्लिक करेंगे, <code>LiveWebData</code> बैकअप Google Drive में स्वतः अपडेट हो जाएगा और पुरानी फ़ाइल रिप्लेस हो जाएगी।
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
