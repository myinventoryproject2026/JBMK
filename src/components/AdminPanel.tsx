import React, { useState } from 'react';
import {
  Shield,
  Key,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  UserCheck,
  Monitor,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserAccount, UserPermissions, AppVersionType } from '../types';
import { t } from '../utils/translations';

export const AdminPanel: React.FC = () => {
  const {
    users,
    currentUser,
    updateAdminCredentials,
    createCustomUser,
    updateCustomUser,
    deleteCustomUser,
    showNotification,
    lang,
    gasWebAppUrl,
    setGasWebAppUrl,
    saveAllNow,
  } = useApp();

  const strings = t(lang);

  // Admin credential change state
  const [adminUsername, setAdminUsername] = useState(currentUser.username);
  const [adminPassword, setAdminPassword] = useState(currentUser.passwordHash);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserAccount | null>(null);
  const [gasUrlInput, setGasUrlInput] = useState(gasWebAppUrl);

  // New User creation state
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [newAllowedVersion, setNewAllowedVersion] = useState<AppVersionType>('computer');
  const [permissions, setPermissions] = useState<UserPermissions>({
    dashboard: true,
    dayBook: true,
    ledgerBook: true,
    memberBook: true,
    vendorBook: true,
    itemListBook: true,
    adminPanel: false,
    gasSuite: false,
    canEdit: true,
    canDelete: false,
  });

  // Edit user modal
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const handleUpdateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || !adminPassword.trim()) return;
    updateAdminCredentials(adminUsername.trim(), adminPassword.trim());
  };

  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim() || !newDisplayName.trim()) return;

    if (users.some((u) => u.username.toLowerCase() === newUsername.toLowerCase())) {
      showNotification('यह यूज़रनेम पहले से मौजूद है!', 'error');
      return;
    }

    createCustomUser({
      username: newUsername.trim(),
      passwordHash: newPassword.trim(),
      displayName: newDisplayName.trim(),
      role: newRole,
      permissions: permissions,
      allowedVersion: newAllowedVersion,
    });

    setNewUsername('');
    setNewPassword('');
    setNewDisplayName('');
    setNewAllowedVersion('computer');
    setPermissions({
      dashboard: true,
      dayBook: true,
      ledgerBook: true,
      memberBook: true,
      vendorBook: true,
      itemListBook: true,
      adminPanel: false,
      gasSuite: false,
      canEdit: true,
      canDelete: false,
    });
  };

  const handleTogglePermission = (key: keyof UserPermissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleToggleEditUserPermission = (key: keyof UserPermissions) => {
    if (!editingUser) return;
    setEditingUser({
      ...editingUser,
      permissions: {
        ...editingUser.permissions,
        [key]: !editingUser.permissions[key],
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-purple-100 text-purple-800">
            <Shield className="w-5 h-5" />
          </span>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              व्यवस्थापक पैनल (Admin Panel &amp; User RBAC)
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              एडमिन यूज़रनेम/पासवर्ड बदलाव, नए उपयोगकर्ता निर्माण एवं नेविगेशन व संपादन/डिलीट अनुमतियाँ (Permissions)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SECTION 1: CHANGE ADMIN USER & PASSWORD */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b pb-3">
            <Key className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-stone-900">
              मुख्य एडमिन क्रेडेंशियल बदलें (Change Admin Credentials)
            </h3>
          </div>

          <form onSubmit={handleUpdateAdminSubmit} className="space-y-3">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                एडमिन यूज़रनेम (Admin Username):
              </label>
              <input
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                required
                className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                एडमिन नया पासवर्ड (Admin Password):
              </label>
              <div className="relative">
                <input
                  type={showAdminPass ? 'text' : 'password'}
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPass(!showAdminPass)}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-700"
                >
                  {showAdminPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-md transition"
              >
                एडमिन क्रेडेंशियल अपडेट करें (Save Credentials)
              </button>
            </div>
          </form>
        </div>

        {/* SECTION 2: CREATE NEW USER WITH RBAC PERMISSIONS */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-4 text-xs">
          <div className="flex items-center gap-2 border-b pb-3">
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-stone-900">
              नया यूज़र बनाएँ एवं अनुमति सौंपें (Create User &amp; Assign Permissions)
            </h3>
          </div>

          <form onSubmit={handleCreateUserSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">यूज़रनेम (Login ID):</label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                  placeholder="sevadar2"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">पासवर्ड (Password):</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">पूरा नाम (Display Name):</label>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  required
                  placeholder="मोहन दास (लेखा सेवादार)"
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">भूमिका (Role):</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-medium"
                >
                  <option value="user">मानक उपयोगकर्ता (Staff User)</option>
                  <option value="admin">सह-व्यवस्थापक (Admin)</option>
                </select>
              </div>
            </div>

            {/* VERSION ACCESS SELECTION (Computer Version vs Mobile Version) */}
            <div className="border border-amber-200 bg-amber-50/70 rounded-xl p-3 space-y-2">
              <label className="block font-bold text-stone-800 text-[11px]">
                {lang === 'hi'
                  ? 'संस्करण एक्सेस चयन (Computer Version या Mobile Version):'
                  : 'Select Version Access (Computer Version or Mobile Version):'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewAllowedVersion('computer');
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                    newAllowedVersion === 'computer'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-md font-bold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Monitor className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">
                    {lang === 'hi' ? 'कंप्यूटर वर्ज़न' : 'Computer'}
                  </span>
                  <span className={`text-[9px] ${newAllowedVersion === 'computer' ? 'text-blue-100' : 'text-stone-500'}`}>
                    {lang === 'hi' ? 'डेस्कटॉप बहीखाता' : 'Desktop Books'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewAllowedVersion('mobile');
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                    newAllowedVersion === 'mobile'
                      ? 'bg-amber-600 text-white border-amber-700 shadow-md font-bold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">
                    {lang === 'hi' ? 'मोबाइल वर्ज़न' : 'Mobile'}
                  </span>
                  <span className={`text-[9px] ${newAllowedVersion === 'mobile' ? 'text-amber-100' : 'text-stone-500'}`}>
                    {lang === 'hi' ? 'सदस्य व भुगतान' : 'Member & Payment'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewAllowedVersion('both');
                  }}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition ${
                    newAllowedVersion === 'both'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-md font-bold'
                      : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1" />
                  <span className="text-[11px] font-bold">
                    {lang === 'hi' ? 'दोनों वर्ज़न' : 'Both Versions'}
                  </span>
                  <span className={`text-[9px] ${newAllowedVersion === 'both' ? 'text-emerald-100' : 'text-stone-500'}`}>
                    {lang === 'hi' ? 'कंप्यूटर + मोबाइल' : 'Desktop & Mobile'}
                  </span>
                </button>
              </div>
            </div>

            {/* Granular Permission Assignment */}
            <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/70 space-y-2">
              <span className="font-bold text-stone-800 block text-[11px]">
                नेविगेशन पैनल एवं सेक्शन अनुमति (Navigation Panel Access):
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'dashboard', label: 'मुख्य डैशबोर्ड (Dashboard)' },
                  { key: 'dayBook', label: 'डे बुक (Day Book)' },
                  { key: 'ledgerBook', label: 'लेज़र बही (Ledger Book)' },
                  { key: 'memberBook', label: 'सदस्य बही (Member Book)' },
                  { key: 'vendorBook', label: 'वेंडर बही (Vendor Book)' },
                  { key: 'itemListBook', label: 'सामग्री सूची (Item List)' },
                  { key: 'adminPanel', label: 'एडमिन पैनल एक्सेस' },
                  { key: 'gasSuite', label: 'Apps Script (.gs) केंद्र' },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions[key as keyof UserPermissions]}
                      onChange={() => handleTogglePermission(key as keyof UserPermissions)}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-stone-700">{label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-2 border-t border-stone-200">
                <span className="font-bold text-stone-800 block text-[11px] mb-1">
                  कार्यवाही अनुमतियाँ (Action Buttons Permissions):
                </span>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canEdit}
                      onChange={() => handleTogglePermission('canEdit')}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-stone-800 font-bold">एडिट बटन (Can Edit)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.canDelete}
                      onChange={() => handleTogglePermission('canDelete')}
                      className="rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-stone-800 font-bold">डिलीट बटन (Can Delete)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition"
              >
                नया उपयोगकर्ता बनाएँ (Create User)
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* SECTION 3: EXISTING USERS LIST */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-stone-700" />
            <h3 className="font-bold text-base text-stone-900">
              पंजीकृत यूज़र व अनुमतियाँ (Registered Users &amp; Permissions)
            </h3>
          </div>
          <span className="text-xs text-stone-500">कुल: {users.length} उपयोगकर्ता</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-stone-50 text-stone-600 border-b border-stone-200 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">यूज़रनेम</th>
                <th className="py-3 px-3">नाम (Name)</th>
                <th className="py-3 px-3">भूमिका (Role)</th>
                <th className="py-3 px-3 text-center">वर्ज़न एक्सेस</th>
                <th className="py-3 px-3">नेविगेशन एक्सेस</th>
                <th className="py-3 px-3 text-center">Edit अनुमति</th>
                <th className="py-3 px-3 text-center">Delete अनुमति</th>
                <th className="py-3 px-3 text-center">कार्रवाई</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {users.map((u) => {
                const allowedNavCount = Object.entries(u.permissions).filter(
                  ([k, v]) => k !== 'canEdit' && k !== 'canDelete' && v === true
                ).length;

                return (
                  <tr key={u.id} className="hover:bg-stone-50 transition">
                    <td className="py-3 px-3 font-mono font-bold text-stone-900">
                      @{u.username}
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-800">
                      {u.displayName}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-stone-100 text-stone-800'
                        }`}
                      >
                        {u.role === 'admin' ? 'व्यवस्थापक (Admin)' : 'स्टाफ़'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {u.allowedVersion === 'mobile' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                          <Smartphone className="w-3 h-3 text-amber-700" />
                          <span>{lang === 'hi' ? 'मोबाइल वर्ज़न' : 'Mobile'}</span>
                        </span>
                      ) : u.allowedVersion === 'computer' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 border border-blue-300">
                          <Monitor className="w-3 h-3 text-blue-700" />
                          <span>{lang === 'hi' ? 'कंप्यूटर वर्ज़न' : 'Computer'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-900 border border-emerald-300">
                          <Laptop className="w-3 h-3 text-emerald-700" />
                          <span>{lang === 'hi' ? 'दोनों वर्ज़न' : 'Both'}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-stone-600">
                      <span className="font-bold text-stone-900">{allowedNavCount}/8</span> पैनल सक्रिय
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.permissions.canEdit ? (
                        <span className="text-emerald-600 font-bold">अनुमत (Yes)</span>
                      ) : (
                        <span className="text-stone-400">अस्वीकृत</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {u.permissions.canDelete ? (
                        <span className="text-rose-600 font-bold">अनुमत (Yes)</span>
                      ) : (
                        <span className="text-stone-400">अस्वीकृत</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingUser(u)}
                          className="p-1 rounded bg-stone-100 hover:bg-amber-100 text-stone-600 hover:text-amber-800 transition"
                          title="अनुमतियाँ बदलें"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== currentUser.id && u.role !== 'admin' && (
                          <button
                            onClick={() => setUserToDelete(u)}
                            className="p-1 rounded bg-stone-100 hover:bg-rose-100 text-stone-600 hover:text-rose-800 transition"
                            title="यूज़र डिलीट करें"
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span>यूज़र अनुमतियाँ संशोधित करें (@{editingUser.username})</span>
              </h3>
              <button onClick={() => setEditingUser(null)} className="text-stone-400 hover:text-stone-800">
                &times;
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">नाम (Display Name):</label>
                <input
                  type="text"
                  value={editingUser.displayName}
                  onChange={(e) => setEditingUser({ ...editingUser, displayName: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1">पासवर्ड (Password):</label>
                <input
                  type="text"
                  value={editingUser.passwordHash}
                  onChange={(e) => setEditingUser({ ...editingUser, passwordHash: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg p-2 font-mono"
                />
              </div>

              {/* Version Access Editor in Modal */}
              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/70 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">
                  {lang === 'hi' ? 'संस्करण एक्सेस (Version Access):' : 'Version Access:'}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, allowedVersion: 'computer' })}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
                      editingUser.allowedVersion === 'computer'
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Monitor className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-bold">{lang === 'hi' ? 'कंप्यूटर' : 'Computer'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, allowedVersion: 'mobile' })}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
                      editingUser.allowedVersion === 'mobile'
                        ? 'bg-amber-600 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-bold">{lang === 'hi' ? 'मोबाइल' : 'Mobile'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingUser({ ...editingUser, allowedVersion: 'both' })}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
                      editingUser.allowedVersion === 'both' || !editingUser.allowedVersion
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                    }`}
                  >
                    <Laptop className="w-4 h-4 mb-0.5" />
                    <span className="text-[10px] font-bold">{lang === 'hi' ? 'दोनों' : 'Both'}</span>
                  </button>
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl p-3 bg-stone-50/70 space-y-2">
                <span className="font-bold text-stone-800 block text-[11px]">
                  नेविगेशन एक्सेस अनुमतियाँ:
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'dashboard', label: 'डैशबोर्ड' },
                    { key: 'dayBook', label: 'डे बुक' },
                    { key: 'ledgerBook', label: 'लेज़र बही' },
                    { key: 'memberBook', label: 'सदस्य बही' },
                    { key: 'vendorBook', label: 'वेंडर बही' },
                    { key: 'itemListBook', label: 'सामग्री सूची' },
                    { key: 'adminPanel', label: 'एडमिन पैनल' },
                    { key: 'gasSuite', label: 'Apps Script' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingUser.permissions[key as keyof UserPermissions]}
                        onChange={() => handleToggleEditUserPermission(key as keyof UserPermissions)}
                        className="rounded text-amber-600"
                      />
                      <span className="text-stone-700">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-200 flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canEdit}
                      onChange={() => handleToggleEditUserPermission('canEdit')}
                      className="rounded text-emerald-600"
                    />
                    <span className="text-stone-800 font-bold">Can Edit (संशोधन)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingUser.permissions.canDelete}
                      onChange={() => handleToggleEditUserPermission('canDelete')}
                      className="rounded text-rose-600"
                    />
                    <span className="text-stone-800 font-bold">Can Delete (हटाना)</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border rounded-xl hover:bg-stone-100 font-semibold"
                >
                  रद्द करें
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateCustomUser(editingUser);
                    setEditingUser(null);
                  }}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md"
                >
                  अनुमतियाँ सेव करें
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: GOOGLE DRIVE / APPS SCRIPT SYNC CONFIGURATION */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 space-y-3 text-xs">
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-bold text-sm text-stone-900">
            {lang === 'hi' ? 'Google Drive व Apps Script ऑटो-बैकअप सेटिंग्स' : 'Google Drive & Apps Script Auto-Backup'}
          </h3>
          <span className="text-[10px] font-mono bg-cyan-100 text-cyan-900 px-2 py-0.5 rounded-full font-bold">
            LiveWebData Sync
          </span>
        </div>
        <p className="text-stone-600 leading-relaxed">
          {lang === 'hi'
            ? 'जब आप Google Apps Script को Deploy as Web App करते हैं, तो प्राप्त URL यहाँ डालें। जब भी आप "डेटा सुरक्षित करें" पर क्लिक करेंगे, यह Google Drive में LiveWebData फ़ाइल को स्वचालित रूप से अपडेट कर पुरानी बैकअप फ़ाइल को रिप्लेस (Replace) कर देगा!'
            : 'Enter your deployed Google Apps Script Web App URL. Clicking "Save All" will automatically create and update the LiveWebData file in Google Drive, replacing the previous backup.'}
        </p>

        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={gasUrlInput}
            onChange={(e) => setGasUrlInput(e.target.value)}
            className="flex-1 bg-stone-50 border border-stone-300 rounded-xl p-2 font-mono text-xs"
          />
          <button
            onClick={() => {
              setGasWebAppUrl(gasUrlInput.trim());
              showNotification(
                lang === 'hi' ? 'Google Apps Script URL सुरक्षित हुआ!' : 'Apps Script URL saved!',
                'success'
              );
            }}
            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-800 text-white font-bold rounded-xl"
          >
            {lang === 'hi' ? 'URL सेव करें' : 'Save URL'}
          </button>
          <button
            onClick={() => saveAllNow(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            {lang === 'hi' ? 'Drive टेस्ट सिंक' : 'Test Sync'}
          </button>
        </div>
      </div>

      {/* Confirmation Modal for User Deletion */}
      {userToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-stone-200 space-y-3 text-xs">
            <div className="flex items-center gap-2 text-rose-600">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-bold text-sm text-stone-900">
                {lang === 'hi' ? 'यूज़र हटाने की पुष्टि' : 'Confirm User Deletion'}
              </h4>
            </div>

            <p className="text-stone-600 leading-relaxed">
              {lang === 'hi'
                ? `क्या आप सचमुच यूज़र '${userToDelete.displayName}' (@${userToDelete.username}) को हटाना चाहते हैं?`
                : `Are you sure you want to remove user '${userToDelete.displayName}'?`}
            </p>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-3.5 py-1.5 border rounded-xl hover:bg-stone-100 font-semibold text-stone-700"
              >
                {strings.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCustomUser(userToDelete.id);
                  setUserToDelete(null);
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
