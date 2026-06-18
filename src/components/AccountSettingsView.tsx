import React, { useState } from 'react';
import { AppState, Teacher } from '../types';
import { Save, User, Key, Check, ShieldAlert } from 'lucide-react';

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
    </div>
  );
}
