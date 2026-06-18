import React, { useState } from 'react';
import { Teacher, AppState } from '../types';
import { Plus, Edit2, Trash2, Search, UserPlus, ShieldAlert, Key } from 'lucide-react';

interface TeacherManagementProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

export default function TeacherManagementView({ state, onChange }: TeacherManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [nip, setNip] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [noHp, setNoHp] = useState('');
  const [role, setRole] = useState<'admin' | 'guru'>('guru');
  const [password, setPassword] = useState('guru123');

  const [formError, setFormError] = useState('');

  const filteredTeachers = state.teachers.filter(
    t => t.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
         t.nip.includes(searchTerm)
  );

  const resetForm = () => {
    setNip('');
    setNama('');
    setJenisKelamin('L');
    setNoHp('');
    setRole('guru');
    setPassword('guru123');
    setFormError('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nip || !nama || !noHp || !password) {
      setFormError('Harap lengkapi semua field!');
      return;
    }

    // Check unique username/nip
    const exists = state.teachers.some(t => t.nip === nip);
    if (exists) {
      setFormError('NIP/NUPTK sudah terdaftar!');
      return;
    }

    const newTeacher: Teacher = {
      nip: nip.trim(),
      nama: nama.trim(),
      jenisKelamin,
      noHp: noHp.trim(),
      role,
      password: password.trim()
    };

    const newState = {
      ...state,
      teachers: [...state.teachers, newTeacher]
    };

    onChange(newState);
    resetForm();
    setShowAddModal(false);
  };

  const handleStartEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setNip(teacher.nip);
    setNama(teacher.nama);
    setJenisKelamin(teacher.jenisKelamin);
    setNoHp(teacher.noHp);
    setRole(teacher.role);
    setPassword(teacher.password || 'guru123');
    setFormError('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nama || !noHp) {
      setFormError('Nama dan No HP wajib diisi!');
      return;
    }

    const updatedTeachers = state.teachers.map(t => {
      if (t.nip === editingTeacher?.nip) {
        return {
          ...t,
          nama: nama.trim(),
          jenisKelamin,
          noHp: noHp.trim(),
          role,
          password: password.trim()
        };
      }
      return t;
    });

    const newState = {
      ...state,
      teachers: updatedTeachers
    };

    // Update currentUser if current user edited themselves
    if (state.currentUser && state.currentUser.nip === editingTeacher?.nip) {
      newState.currentUser = {
        ...state.currentUser,
        nama: nama.trim(),
        jenisKelamin,
        noHp: noHp.trim(),
        role,
        password: password.trim()
      };
    }

    onChange(newState);
    setEditingTeacher(null);
    resetForm();
  };

  const handleDelete = (nipToDelete: string) => {
    if (nipToDelete === 'admin') {
      alert('Akun Administrator Utama tidak boleh dihapus!');
      return;
    }

    if (state.currentUser?.nip === nipToDelete) {
      alert('Anda tidak bisa menghapus akun Anda sendiri yang sedang aktif digunakan!');
      return;
    }

    if (confirm('Apakah Anda yakin ingin menghapus data Guru ini?')) {
      const updatedTeachers = state.teachers.filter(t => t.nip !== nipToDelete);
      onChange({
        ...state,
        teachers: updatedTeachers
      });
    }
  };

  return (
    <div className="space-y-6" id="teacher-management-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="teacher-hdr">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Manajemen Data Guru</h2>
          <p className="text-xs text-gray-400">Atur akun tenaga pendidik, wali kelas, serta kustomisasi level hak akses admin/guru.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingTeacher(null);
            setShowAddModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
          id="btn-add-teacher"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Akun Guru
        </button>
      </div>

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
          {formError}
        </div>
      )}

      {/* Form Area - either adding or editing */}
      {(showAddModal || editingTeacher) && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4" id="teacher-form-panel">
          <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            {editingTeacher ? `Ubah Data Guru: ${editingTeacher.nama}` : 'Tambah Data Guru Baru'}
          </h3>
          <form onSubmit={editingTeacher ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div>
              <label className="block text-gray-600 mb-1">NIP / NUPTK</label>
              <input
                type="text"
                value={nip}
                onChange={e => setNip(e.target.value)}
                disabled={!!editingTeacher}
                placeholder="Masukkan NIP atau ID unik"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:opacity-65"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Nama Lengkap Guru (Gelar)</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Budi Santoso, S.Pd."
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Jenis Kelamin</label>
              <select
                value={jenisKelamin}
                onChange={e => setJenisKelamin(e.target.value as 'L' | 'P')}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                <option value="L">Laki-Laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Nomor HP / WhatsApp</label>
              <input
                type="text"
                value={noHp}
                onChange={e => setNoHp(e.target.value)}
                placeholder="Contoh: 0812XXXXXXXX"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Sandi Akses (Password)</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Sandi login"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Hak Akses Sistem</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as 'admin' | 'guru')}
                disabled={editingTeacher?.nip === 'admin'}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:opacity-65"
              >
                <option value="guru">Guru (Akses Kelas & Absen)</option>
                <option value="admin">Admin (Akses Penuh Kelola Data)</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTeacher(null);
                  setShowAddModal(false);
                  resetForm();
                }}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
              >
                {editingTeacher ? 'Simpan Perubahan' : 'Simpan Akun'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden" id="teacher-table-card">
        {/* Search */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Cari guru berdasarkan nama atau NIP..."
            className="w-full text-xs outline-none text-gray-600"
          />
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/55 text-blue-900 border-b border-gray-100 font-semibold">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">NIP / NUPTK</th>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">L/P</th>
                <th className="p-4">Nomor HP</th>
                <th className="p-4">Hak Akses</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filteredTeachers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    Tidak ditemukan data guru yang cocok.
                  </td>
                </tr>
              ) : (
                filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.nip} className="hover:bg-gray-50/50">
                    <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                    <td className="p-4 font-mono font-bold text-gray-900">{teacher.nip}</td>
                    <td className="p-4 font-bold text-gray-800">{teacher.nama}</td>
                    <td className="p-4 font-medium">{teacher.jenisKelamin === 'L' ? 'Laki-Laki' : 'Perempuan'}</td>
                    <td className="p-4 text-gray-500 font-mono">{teacher.noHp}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-bold ${teacher.role === 'admin' ? 'bg-orange-50 text-orange-700 border border-orange-100' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                        {teacher.role === 'admin' ? 'Administrator' : 'Guru Kelas'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(teacher)}
                          className="p-1 px-2 border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded flex items-center gap-1 font-bold text-[11px]"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.nip)}
                          disabled={teacher.nip === 'admin'}
                          className="p-1 px-2 border border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded flex items-center gap-1 font-bold text-[11px] disabled:opacity-40"
                          title="Hapus"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
