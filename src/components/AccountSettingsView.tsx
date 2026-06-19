import React, { useState } from 'react';
import { AppState, Teacher } from '../types';
import { Save, User, Key, Check, ShieldAlert, Database, RefreshCw, Globe, Wifi } from 'lucide-react';

interface AccountSettingsViewProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

export default function AccountSettingsView({ state, onChange }: AccountSettingsViewProps) {
  const current = state.currentUser;

  const [nama, setNama] = useState(current?.nama || '');
  const [noHp, setNoHp] = useState(current?.noHp || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  const [dbType, setDbType] = useState(
    typeof window !== 'undefined' ? localStorage.getItem('FIRESTORE_DB_TYPE') || 'custom' : 'custom'
  );
  const [dbSwitching, setDbSwitching] = useState(false);

  const handleSwitchDb = (type: 'system' | 'custom') => {
    if (type === dbType) return;
    setDbSwitching(true);
    localStorage.setItem('FIRESTORE_DB_TYPE', type);
    setDbType(type);
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  if (!current) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-xs font-bold font-mono">
        Kesalahan: Sesi Akun tidak terdeteksi! Silakan login kembali.
      </div>
    );
  }

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!nama || !noHp) {
      setFormError('Nama Lengkap dan Nomor HP wajib diisi!');
      return;
    }

    // Update in state
    const updatedTeachers = state.teachers.map(t => {
      if (t.nip === current.nip) {
        return {
          ...t,
          nama: nama.trim(),
          noHp: noHp.trim()
        };
      }
      return t;
    });

    const updatedUser: Teacher = {
      ...current,
      nama: nama.trim(),
      noHp: noHp.trim()
    };

    onChange({
      ...state,
      teachers: updatedTeachers,
      currentUser: updatedUser
    });

    setFormSuccess('Profil Anda berhasil diperbarui!');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setFormError('Harap isi semua field kata sandi!');
      return;
    }

    if (current.password && currentPassword !== current.password) {
      setFormError('Kata sandi saat ini tidak cocok!');
      return;
    }

    if (newPassword.length < 4) {
      setFormError('Kata sandi baru minimal 4 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Konfirmasi kata sandi baru tidak cocok!');
      return;
    }

    // Update in state
    const updatedTeachers = state.teachers.map(t => {
      if (t.nip === current.nip) {
        return {
          ...t,
          password: newPassword.trim()
        };
      }
      return t;
    });

    const updatedUser: Teacher = {
      ...current,
      password: newPassword.trim()
    };

    onChange({
      ...state,
      teachers: updatedTeachers,
      currentUser: updatedUser
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormSuccess('Kata sandi berhasil diperbarui!');
  };

  return (
    <div className="space-y-6" id="account-settings-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="account-settings-hdr">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Pengaturan Akun</h2>
        <p className="text-xs text-gray-400">Perbarui profil Anda, ganti sandi keamanan masuk sistem, dan kelola konfigurasi log pribadi.</p>
      </div>

      {formSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-2.5 px-4 rounded-lg border border-emerald-100 font-semibold flex items-center gap-1.5">
          <Check className="h-4 w-4 bg-emerald-500 text-white rounded-full p-0.5" />
          {formSuccess}
        </div>
      )}

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2.5 px-4 rounded-lg border border-red-100 font-semibold flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
            <User className="w-4 h-4 text-blue-600" />
            Biodata Diri Guru
          </h3>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs font-semibold text-gray-600">
            <div>
              <label className="block text-gray-400 mb-1">NIP / NUPTK</label>
              <input
                type="text"
                value={current.nip}
                disabled
                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Nama Lengkap (Gelar)</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Nomor HP / WhatsApp Aktif</label>
              <input
                type="text"
                value={noHp}
                onChange={e => setNoHp(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Status Level Sistem</label>
              <span className="block w-fit bg-blue-50 text-blue-700 text-[10px] font-black px-3 py-1 rounded-full border border-blue-100 uppercase">
                {current.role === 'admin' ? 'Administrator Utama' : 'Guru / Wali Kelas'}
               </span>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all shadow-xs"
            >
              <Save className="w-4 h-4" />
              Simpan Profil Diri
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
            <Key className="w-4 h-4 text-blue-600 animate-pulse" />
            Keamanan Sandi Masuk
          </h3>

          <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs font-semibold text-gray-600">
            <div>
              <label className="block text-gray-400 mb-1">Kata Sandi Saat Ini</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Masukkan password lama"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Kata Sandi Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Minimal 4 karakter"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-1">Ulangi Kata Sandi Baru</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Tulis ulang password baru"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-1.5 font-bold transition-all shadow-xs"
            >
              <Key className="w-4 h-4" />
              Ganti Kata Sandi Masuk
            </button>
          </form>
        </div>
      </div>

      {/* Koneksi Database & Kolaborasi Real-time */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4" id="db-settings-panel">
        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
          <Database className="w-4 h-4 text-blue-600" />
          Koneksi Database & Sinkronisasi Multi-Browser
        </h3>
        
        <p className="text-xs text-gray-500 leading-relaxed">
          Aplikasi presensi SDN 005 Gelora kini mendukung sinkronisasi database awan secara langsung (real-time). 
          Apabila Anda membuka aplikasi ini di HP, laptop, atau browser lain secara bersamaan, setiap perubahan data (tambah siswa, presensi harian, libur, dll) akan langsung saling terupdate secara instan.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Opsi 1: Database Default AI Studio */}
          <div 
            onClick={() => handleSwitchDb('system')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              dbType === 'system' 
                ? 'border-blue-500 bg-blue-50/50 shadow-xs' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${dbType === 'system' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Globe className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  Database Utama (AI Studio)
                  {dbType === 'system' && (
                    <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                      Aktif
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-gray-500 leading-normal">
                  Direkomendasikan. Sudah siap pakai secara instan ke database awan SDN 005 Gelora yang paling aman tanpa konfigurasi manual.
                </p>
                <div className="text-[10px] text-gray-400 font-mono pt-1">
                  ID: gen-lang-client-0850578
                </div>
              </div>
            </div>
          </div>

          {/* Opsi 2: Database Kustom */}
          <div 
            onClick={() => handleSwitchDb('custom')}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              dbType === 'custom' 
                ? 'border-purple-500 bg-purple-50/50 shadow-xs' 
                : 'border-gray-200 hover:border-gray-300 bg-white'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${dbType === 'custom' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                <Wifi className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  Database Kustom Anda
                  {dbType === 'custom' && (
                    <span className="bg-purple-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase">
                      Aktif
                    </span>
                  )}
                </span>
                <p className="text-[11px] text-gray-500 leading-normal">
                  Gunakan database Firebase pribadi Anda (Project ID: <b>fatih-8515b</b>).
                </p>
                <p className="text-[10px] text-amber-600 font-medium leading-normal bg-amber-50 p-1.5 rounded border border-amber-100 mt-1">
                  ⚠️ Aturan Keamanan: Harap atur <i>Cloud Firestore Rules</i> Anda menjadi <b>allow read, write: if true;</b> di Firebase Console agar terbebas dari kendala "Missing or insufficient permissions".
                </p>
              </div>
            </div>
          </div>
        </div>

        {dbSwitching && (
          <div className="bg-amber-50 text-amber-850 text-[11px] p-3 rounded-lg border border-amber-200 flex items-center gap-2 font-semibold animate-pulse">
            <RefreshCw className="h-4 w-4 animate-spin shrink-0 text-amber-600" />
            Sedang mengalihkan koneksi database dan menyinkronkan data presensi... mohon tunggu.
          </div>
        )}
      </div>
    </div>
  );
}
