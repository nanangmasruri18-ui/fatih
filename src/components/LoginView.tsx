import React, { useState } from 'react';
import { AppState, Teacher } from '../types';
import { School, ShieldCheck, Key, LogIn, AlertCircle, Info, Lock } from 'lucide-react';

interface LoginViewProps {
  state: AppState;
  onLoginSuccess: (user: Teacher) => void;
}

export default function LoginView({ state, onLoginSuccess }: LoginViewProps) {
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!nip || !password) {
      setErrorMsg('Harap masukkan NIP dan Sandi!');
      return;
    }

    // Lookup user
    const foundUser = state.teachers.find(
      t => t.nip.trim() === nip.trim() && t.password?.trim() === password.trim()
    );

    if (foundUser) {
      onLoginSuccess(foundUser);
    } else {
      setErrorMsg('NIP atau Kata Sandi salah!');
    }
  };

  // Quick helper login autofill
  const handleAutofill = (type: 'admin' | 'guru') => {
    setErrorMsg('');
    if (type === 'admin') {
      setNip('admin');
      setPassword('admin');
    } else {
      // Budi Santoso (Guru)
      setNip('198203112009032001');
      setPassword('guru');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans" id="login-view-wrapper">
      <div className="sm:mx-auto sm:w-full sm:max-w-md" id="login-header-group">
        {/* Logo Shield */}
        <div className="flex justify-center">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-md border border-blue-500 flex items-center justify-center">
            <School className="h-10 w-10" />
          </div>
        </div>
        
        <h2 className="mt-4 text-center text-2xl font-black text-gray-900 tracking-tight leading-none">
          PRESENSI SDN 005 GELORA
        </h2>
        <p className="mt-1 text-center text-xs text-gray-500 font-bold uppercase tracking-wider">
          NPSN: 10405436 • GELORA KECAMATAN TANAH ABANG
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md" id="login-card-wrapper">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-150/80 rounded-2xl space-y-6" id="login-card">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-3.5 py-3 rounded-xl font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              {errorMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs font-semibold text-gray-700">
            <div>
              <label htmlFor="nip-input" className="block text-gray-500 mb-1">
                NIP / NUPTK Akun Guru
              </label>
              <div className="relative">
                <input
                  id="nip-input"
                  type="text"
                  value={nip}
                  onChange={e => setNip(e.target.value)}
                  placeholder="Masukkan NIP atau admin"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password-input" className="block text-gray-500 mb-1">
                Kata Sandi Masuk (Password)
              </label>
              <div className="relative">
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="w-full bg-white border border-gray-200 text-gray-900 rounded-xl p-3 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-xs font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-extrabold flex items-center justify-center gap-1.5 transition-all shadow-xs text-xs"
            >
              <LogIn className="h-4 w-4" />
              Masuk Ke Portal Presensi
            </button>
          </form>

          {/* Quick Login Info Card helper */}
          <div className="border-t border-gray-100 pt-5 space-y-3" id="quick-login-pills">
            <h4 className="font-bold text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              Bantuan Penguji / Quick Demo
            </h4>
            <p className="text-[10.5px] text-gray-400 leading-relaxed">
              Pilih salah satu tombol akun di bawah ini untuk mengautofill kredensial login presensi secara instan:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleAutofill('admin')}
                className="py-2.5 px-3 border border-orange-200 hover:bg-orange-50 text-orange-850 font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                Masuk: Admin
              </button>
              
              <button
                type="button"
                onClick={() => handleAutofill('guru')}
                className="py-2.5 px-3 border border-blue-200 hover:bg-blue-50 text-blue-850 font-bold rounded-xl flex items-center justify-center gap-1 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-blue-600" />
                Masuk: Guru Budi
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-[10px] text-gray-400 font-medium space-y-0.5 leading-normal">
              <p>🔑 <strong>Kredensial Manual:</strong></p>
              <p>• Admin: <code className="bg-white px-1 font-bold">admin</code> / Sandi: <code className="bg-white px-1 font-bold">admin</code></p>
              <p>• Guru: <code className="bg-white px-1 font-bold">198203112009032001</code> / Sandi: <code className="bg-white px-1 font-bold">guru</code></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
