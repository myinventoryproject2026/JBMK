import React, { useState, useMemo, useRef } from 'react';
import {
  Store,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Search,
  X,
  Boxes,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Vendor } from '../types';
import { exportVendorsToExcel, parseExcelFile } from '../utils/excel';
import { t } from '../utils/translations';

export const VendorBook: React.FC = () => {
  const {
    vendors,
    addVendor,
    updateVendor,
    deleteVendor,
    importVendorsList,
    items,
    currentUser,
    showNotification,
    lang,
  } = useApp();

  const strings = t(lang);

  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [gstNo, setGstNo] = useState('');
  const [gstPercent, setGstPercent] = useState<number | ''>(5);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredVendors = useMemo(() => {
    if (!searchQuery.trim()) return vendors;
    const q = searchQuery.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.contactNumber.includes(q) ||
        v.address.toLowerCase().includes(q) ||
        (v.gstNumber && v.gstNumber.toLowerCase().includes(q))
    );
  }, [vendors, searchQuery]);

  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;

    addVendor({
      name: name.trim(),
      contactNumber: contact.trim(),
      address: address.trim() || 'उज्जैन (म.प्र.)',
      gstNumber: gstNo.trim() || undefined,
      gstPercent: gstPercent === '' ? undefined : Number(gstPercent),
      attachedItemIds: selectedItems,
      notes: notes.trim(),
    });

    setName('');
    setContact('');
    setAddress('');
    setGstNo('');
    setGstPercent(5);
    setSelectedItems([]);
    setNotes('');
    setIsAddOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVendor) return;

    updateVendor(editingVendor.id, {
      name: editingVendor.name,
      contactNumber: editingVendor.contactNumber,
      address: editingVendor.address,
      gstNumber: editingVendor.gstNumber,
      gstPercent: editingVendor.gstPercent,
      attachedItemIds: editingVendor.attachedItemIds,
      notes: editingVendor.notes,
    });
    setEditingVendor(null);
  };

  const handleExcelImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = await parseExcelFile<any>(file);
      const newVendors: Vendor[] = rows.map((r, i) => ({
        id: `ven_imp_${Date.now()}_${i}`,
        name: r['Vendor Name'] || r['वेंडर नाम'] || 'नया वेंडर',
        contactNumber: String(r['Contact Number'] || r['मोबाइल'] || '9800000000'),
        address: r['Address'] || r['पता'] || 'उज्जैन',
        gstNumber: r['GST Number'] || undefined,
        gstPercent: Number(r['GST %'] || 5),
        attachedItemIds: [],
        notes: r['Notes'] || '',
      }));
      importVendorsList(newVendors);
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
            <span className="p-2 rounded-xl bg-blue-100 text-blue-800">
              <Store className="w-5 h-5" />
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              वेंडर बहीखाता (Vendor Book)
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            सप्लायर व व्यापारी खाता, GST विवरण एवं संबंधित सामग्री सूची (Attached Items)
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
            onClick={() => exportVendorsToExcel(vendors, items)}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>एक्सेल एक्सपोर्ट</span>
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-1 bg-stone-900 hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>+ नया वेंडर जोड़ें</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-stone-200 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="वेंडर नाम, संपर्क नंबर या GST से खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 text-xs"
          />
        </div>
        <div className="text-stone-500 font-semibold">
          कुल वेंडर: <b className="text-stone-900">{vendors.length} व्यापारी</b>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">वेंडर / फर्म का नाम</th>
                <th className="py-3 px-3">संपर्क नंबर</th>
                <th className="py-3 px-3">पता (Address)</th>
                <th className="py-3 px-3">GSTIN No</th>
                <th className="py-3 px-3 text-center">GST %</th>
                <th className="py-3 px-3">संलग्न सामग्री (Attached Items)</th>
                <th className="py-3 px-3">टिप्पणी (Notes)</th>
                <th className="py-3 px-3 text-center">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredVendors.map((vendor) => {
                const attachedItemList = items.filter((i) => vendor.attachedItemIds.includes(i.id));

                return (
                  <tr key={vendor.id} className="hover:bg-blue-50/30 transition">
                    <td className="py-3 px-3 font-bold text-stone-900">{vendor.name}</td>
                    <td className="py-3 px-3 font-medium text-stone-700 whitespace-nowrap">
                      {vendor.contactNumber}
                    </td>
                    <td className="py-3 px-3 text-stone-600 max-w-xs truncate" title={vendor.address}>
                      {vendor.address}
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-700 whitespace-nowrap">
                      {vendor.gstNumber || '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-stone-800">
                      {vendor.gstPercent !== undefined ? `${vendor.gstPercent}%` : '-'}
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {attachedItemList.length === 0 ? (
                          <span className="text-stone-400 text-[10px]">कोई सामग्री संलग्न नहीं</span>
                        ) : (
                          attachedItemList.map((it) => (
                            <span
                              key={it.id}
                              className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 text-[10px] font-semibold border border-blue-200"
                            >
                              {it.name}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-stone-500 max-w-xs truncate">{vendor.notes || '-'}</td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {currentUser.permissions.canEdit && (
                          <button
                            onClick={() => setEditingVendor(vendor)}
                            className="p-1 rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {(currentUser.role === 'admin' || currentUser.permissions.canDelete) && (
                          <button
                            onClick={() => setVendorToDelete(vendor)}
                            className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-800 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-600" />
                <span>नया वेंडर / सप्लायर जोड़ें (Add Vendor)</span>
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">फर्म / वेंडर नाम:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="उदा. महाकाल अन्नपूर्णा किराना भंडार"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">संपर्क नंबर (Mobile):</label>
                  <input
                    type="tel"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    required
                    placeholder="9826012345"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">GSTIN नंबर (Optional):</label>
                  <input
                    type="text"
                    value={gstNo}
                    onChange={(e) => setGstNo(e.target.value)}
                    placeholder="23AAAAA0000A1Z5"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">दुकान / गोदाम का पता:</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="पटनी बाजार, उज्जैन"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">लागू GST % दर:</label>
                  <input
                    type="number"
                    step="0.1"
                    value={gstPercent}
                    onChange={(e) => setGstPercent(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="5"
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                  />
                </div>
              </div>

              {/* Attach Item List with Vendor */}
              <div>
                <label className="block font-bold text-stone-800 mb-1 flex items-center justify-between">
                  <span>सप्लाई की जाने वाली सामग्री जोड़ें (Attach Items):</span>
                  <span className="text-blue-700 font-semibold">{selectedItems.length} चयनित</span>
                </label>
                <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5">
                  {items.map((it) => {
                    const isSelected = selectedItems.includes(it.id);
                    return (
                      <div
                        key={it.id}
                        onClick={() => toggleItemSelection(it.id)}
                        className={`p-1.5 rounded-lg border cursor-pointer flex items-center justify-between text-[11px] transition ${
                          isSelected
                            ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                            : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="truncate">{it.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">विशेष नोट (Notes):</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="उदा. माह के अंत में चेक द्वारा भुगतान"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
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
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  वेंडर सुरक्षित करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingVendor && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Edit className="w-4 h-4 text-amber-600" />
                <span>वेंडर संशोधन (Edit Vendor)</span>
              </h3>
              <button onClick={() => setEditingVendor(null)} className="text-stone-400 hover:text-stone-800">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">फर्म / वेंडर नाम:</label>
                <input
                  type="text"
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">मोबाइल नंबर:</label>
                  <input
                    type="tel"
                    value={editingVendor.contactNumber}
                    onChange={(e) => setEditingVendor({ ...editingVendor, contactNumber: e.target.value })}
                    required
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">GSTIN नंबर:</label>
                  <input
                    type="text"
                    value={editingVendor.gstNumber || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, gstNumber: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">पता:</label>
                  <input
                    type="text"
                    value={editingVendor.address}
                    onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">GST % दर:</label>
                  <input
                    type="number"
                    value={editingVendor.gstPercent ?? ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, gstPercent: Number(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">संलग्न सामग्री (Attached Items):</label>
                <div className="p-2 bg-stone-50 border border-stone-200 rounded-xl max-h-36 overflow-y-auto grid grid-cols-2 gap-1.5">
                  {items.map((it) => {
                    const isSelected = editingVendor.attachedItemIds.includes(it.id);
                    return (
                      <div
                        key={it.id}
                        onClick={() => {
                          const updated = isSelected
                            ? editingVendor.attachedItemIds.filter((id) => id !== it.id)
                            : [...editingVendor.attachedItemIds, it.id];
                          setEditingVendor({ ...editingVendor, attachedItemIds: updated });
                        }}
                        className={`p-1.5 rounded-lg border cursor-pointer flex items-center justify-between text-[11px] ${
                          isSelected
                            ? 'bg-blue-100 border-blue-400 font-bold text-blue-900'
                            : 'bg-white border-stone-200 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <span className="truncate">{it.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-700 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingVendor(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  अपडेट करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* In-App Delete Confirmation Modal */}
      {vendorToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {lang === 'hi' ? 'वेंडर हटाने की पुष्टि' : 'Confirm Vendor Deletion'}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? `क्या आप सचमुच वेंडर '${vendorToDelete.name}' को हटाना चाहते हैं?`
                : `Are you sure you want to remove vendor '${vendorToDelete.name}'?`}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setVendorToDelete(null)}
                className="px-3.5 py-1.5 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteVendor(vendorToDelete.id);
                  setVendorToDelete(null);
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
