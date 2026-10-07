import React, { useState } from 'react';
import {
  Lock,
  User,
  X,
  ShieldCheck,
  UserCheck,
  LogOut,
  Key,
  Monitor,
  Smartphone,
  Laptop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    users,
    currentUser,
    loginUser,
    logoutUser,
    lang,
  } = useApp();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    const success = loginUser(username.trim(), password.trim());
    if (success) {
      setUsername('');
      setPassword('');
      onClose();
    }
  };

  const handleQuickSwitch = (u: typeof users[0]) => {
    loginUser(u.username, u.passwordHash);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-100 rounded-xl text-amber-800">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-stone-900">
                उपयोगकर्ता लॉगिन व खाता बदलें (Login / Switch User)
              </h3>
              <p className="text-[11px] text-stone-500">
                वर्तमान सक्रिय: <b>{currentUser.displayName}</b> ({currentUser.role})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">यूज़रनेम (Username):</label>
            <div className="relative">
              <User className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin या sevadar1"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-8 p-2 font-bold focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">पासवर्ड (Password):</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="पासवर्ड दर्ज करें"
                className="w-full bg-stone-50 border border-stone-300 rounded-lg pl-8 p-2 font-mono focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition"
            >
              लॉगिन करें (Sign In)
            </button>
          </div>
        </form>

        {/* Quick Switch for Demo / Admin Ease */}
        <div className="pt-3 border-t">
          <span className="text-[11px] font-bold text-stone-500 block mb-2">
            त्वरित खाता चयन (Quick Switch User Profiles):
          </span>
          <div className="space-y-1.5">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => handleQuickSwitch(u)}
                className={`w-full p-2 rounded-xl border flex items-center justify-between text-left transition ${
                  u.id === currentUser.id
                    ? 'bg-amber-100 border-amber-400 font-bold'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center text-[10px] font-bold">
                    {u.role === 'admin' ? 'A' : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-stone-900">{u.displayName}</div>
                    <div className="text-[10px] text-stone-500 font-mono">@{u.username}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  {u.allowedVersion === 'mobile' ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                      <Smartphone className="w-3 h-3 text-amber-700" />
                      <span>{lang === 'hi' ? 'मोबाइल' : 'Mobile'}</span>
                    </span>
                  ) : u.allowedVersion === 'computer' ? (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold">
                      <Monitor className="w-3 h-3 text-blue-700" />
                      <span>{lang === 'hi' ? 'कंप्यूटर' : 'Computer'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                      <Laptop className="w-3 h-3 text-emerald-700" />
                      <span>{lang === 'hi' ? 'दोनों' : 'Both'}</span>
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border font-bold capitalize">
                    {u.role}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Logout Option */}
        <div className="pt-2 flex justify-between items-center text-xs text-stone-500">
          <button
            onClick={() => {
              logoutUser();
              onClose();
            }}
            className="flex items-center gap-1 text-rose-600 hover:underline font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट (Logout)</span>
          </button>
          <button onClick={onClose} className="px-3 py-1 border rounded-lg hover:bg-stone-100">
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );
};
