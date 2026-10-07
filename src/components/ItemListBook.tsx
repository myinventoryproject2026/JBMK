import React, { useState, useMemo, useRef } from 'react';
import {
  Boxes,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Item, UnitType } from '../types';
import { exportItemsToExcel, parseExcelFile } from '../utils/excel';
import { t } from '../utils/translations';

export const ItemListBook: React.FC = () => {
  const {
    items,
    addItem,
    updateItem,
    deleteItem,
    importItemsList,
    currentUser,
    showNotification,
    lang,
  } = useApp();

  const strings = t(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitType>('Kg');
  const [defaultRate, setDefaultRate] = useState<number | ''>('');
  const [cgst, setCgst] = useState<number | ''>('');
  const [sgst, setSgst] = useState<number | ''>('');
  const [igst, setIgst] = useState<number | ''>('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        (i.category && i.category.toLowerCase().includes(q)) ||
        i.unit.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addItem({
      name: name.trim(),
      unit,
      defaultRate: defaultRate === '' ? undefined : Number(defaultRate),
      cgstPercent: cgst === '' ? 0 : Number(cgst),
      sgstPercent: sgst === '' ? 0 : Number(sgst),
      igstPercent: igst === '' ? 0 : Number(igst),
      category: category.trim() || 'General',
      notes: notes.trim(),
    });

    setName('');
    setDefaultRate('');
    setCgst('');
    setSgst('');
    setIgst('');
    setCategory('');
    setNotes('');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    updateItem(editingItem.id, {
      name: editingItem.name,
      unit: editingItem.unit,
      defaultRate: editingItem.defaultRate,
      cgstPercent: editingItem.cgstPercent,
      sgstPercent: editingItem.sgstPercent,
      igstPercent: editingItem.igstPercent,
      category: editingItem.category,
      notes: editingItem.notes,
    });
    setEditingItem(null);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile<any>(file);
      const newItems: Item[] = rows.map((r, i) => ({
        id: `item_imp_${Date.now()}_${i}`,
        name: r['Item Name'] || r['सामग्री नाम'] || 'सामग्री',
        unit: (r['Unit Type'] || r['इकाई'] || 'Kg') as UnitType,
        defaultRate: Number(r['Default Rate (₹)'] || r['दर'] || 0) || undefined,
        cgstPercent: Number(r['CGST %'] || 0),
        sgstPercent: Number(r['SGST %'] || 0),
        igstPercent: Number(r['IGST %'] || 0),
        category: r['Category'] || 'Ration',
        notes: r['Notes'] || '',
      }));
      importItemsList(newItems);
    } catch {
      showNotification('एक्सेल इम्पोर्ट विफल रहा!', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-5">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleExcelImport}
        accept=".xlsx,.xls,.csv"
        className="hidden"
      />

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Boxes className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              सामग्री सूची बही (Item List Book)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            रसोई राशन, किराना, फल-सब्जी, घी-तेल व बर्तनों का मास्टर कैटलॉग (GST सहित)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-xl text-xs font-bold transition border border-stone-300"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>इम्पोर्ट एक्सेल</span>
          </button>

          <button
            onClick={() => exportItemsToExcel(items)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>एक्सेल एक्सपोर्ट</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span>+ नई सामग्री जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="सामग्री नाम, इकाई या श्रेणी से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs"
          />
        </div>
        <div className="text-stone-500 font-semibold">
          कुल सामग्री: <b className="text-stone-900">{items.length} आइटम</b>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">सामग्री नाम (Item Name)</th>
                <th className="py-3 px-3">इकाई प्रकार (Unit)</th>
                <th className="py-3 px-3 text-right">अनुमानित दर (₹ Rate)</th>
                <th className="py-3 px-3 text-center">CGST %</th>
                <th className="py-3 px-3 text-center">SGST %</th>
                <th className="py-3 px-3 text-center">IGST %</th>
                <th className="py-3 px-3">श्रेणी (Category)</th>
                <th className="py-3 px-3">विवरण / नोट</th>
                <th className="py-3 px-3 text-center">क्रियाएँ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/30 transition">
                  <td className="py-3 px-3 font-bold text-stone-900">{item.name}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 font-mono text-stone-700 font-semibold border border-stone-200">
                      {item.unit}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-stone-800">
                    {item.defaultRate ? `₹${item.defaultRate.toLocaleString('en-IN')}` : '-'}
                  </td>
                  <td className="py-3 px-3 text-center text-stone-600">
                    {item.cgstPercent ? `${item.cgstPercent}%` : '0%'}
                  </td>
                  <td className="py-3 px-3 text-center text-stone-600">
                    {item.sgstPercent ? `${item.sgstPercent}%` : '0%'}
                  </td>
                  <td className="py-3 px-3 text-center text-stone-600">
                    {item.igstPercent ? `${item.igstPercent}%` : '0%'}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-medium text-[10px] border border-amber-200">
                      {item.category || 'General'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-stone-500 max-w-xs truncate">{item.notes || '-'}</td>
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1.5">
                      {currentUser.permissions.canEdit && (
                        <button
                          onClick={() => setEditingItem(item)}
                          className="p-1 rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {(currentUser.role === 'admin' || currentUser.permissions.canDelete) && (
                        <button
                          onClick={() => setItemToDelete(item)}
                          className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-800 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-600" />
                <span>नई सामग्री जोड़ें (Add Item)</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">सामग्री का नाम:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="उदा. शरबती गेहूं आटा, देशी घी, चना दाल..."
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">इकाई (Unit Type):</label>
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value as UnitType)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  >
                    <option value="Kg">Kg (किलोग्राम)</option>
                    <option value="Litre">Litre (लीटर)</option>
                    <option value="Quintal">Quintal (क्विंटल)</option>
                    <option value="Bag">Bag (बोरी/थैला)</option>
                    <option value="Pcs">Pcs (नग)</option>
                    <option value="Tin">Tin (टिन/पीपा)</option>
                    <option value="Packet">Packet (पैकेट)</option>
                    <option value="Box">Box (पेटी)</option>
                    <option value="Gram">Gram (ग्राम)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-stone-700 mb-1">अनुमानित दर ₹ (Optional):</label>
                  <input
                    type="number"
                    value={defaultRate}
                    onChange={(e) => setDefaultRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              {/* GST Inputs */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={cgst}
                    onChange={(e) => setCgst(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={sgst}
                    onChange={(e) => setSgst(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">IGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={igst}
                    onChange={(e) => setIgst(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="0"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">श्रेणी (Category):</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Ration, Dairy, Pulses..."
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">टिप्पणी (Notes):</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="उदा. 50 किलो बैग"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  सामग्री सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <span>सामग्री संशोधन (Edit Item)</span>
              </h3>
              <button onClick={() => setEditingItem(null)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">सामग्री का नाम:</label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">इकाई (Unit):</label>
                  <select
                    value={editingItem.unit}
                    onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value as UnitType })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  >
                    <option value="Kg">Kg</option>
                    <option value="Litre">Litre</option>
                    <option value="Quintal">Quintal</option>
                    <option value="Bag">Bag</option>
                    <option value="Pcs">Pcs</option>
                    <option value="Tin">Tin</option>
                    <option value="Packet">Packet</option>
                    <option value="Box">Box</option>
                    <option value="Gram">Gram</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">दर ₹:</label>
                  <input
                    type="number"
                    value={editingItem.defaultRate || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, defaultRate: Number(e.target.value) || undefined })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">CGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingItem.cgstPercent ?? ''}
                    onChange={(e) => setEditingItem({ ...editingItem, cgstPercent: Number(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">SGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingItem.sgstPercent ?? ''}
                    onChange={(e) => setEditingItem({ ...editingItem, sgstPercent: Number(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">IGST %:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingItem.igstPercent ?? ''}
                    onChange={(e) => setEditingItem({ ...editingItem, igstPercent: Number(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 text-center"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md"
                >
                  अपडेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {lang === 'hi' ? 'सामग्री हटाने की पुष्टि' : 'Confirm Item Deletion'}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? `क्या आप सचमुच सामग्री '${itemToDelete.name}' को सूची से हटाना चाहते हैं?`
                : `Are you sure you want to remove '${itemToDelete.name}' from items?`}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-3.5 py-1.5 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteItem(itemToDelete.id);
                  setItemToDelete(null);
                }}
                className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl shadow-xs"
              >
                {strings.yesDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
