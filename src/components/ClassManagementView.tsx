import React, { useState } from 'react';
import { ClassRoom, AppState } from '../types';
import { Edit2, ShieldAlert, Users, School } from 'lucide-react';

interface ClassManagementProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

export default function ClassManagementView({ state, onChange }: ClassManagementProps) {
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [waliKelasNip, setWaliKelasNip] = useState('');
  const [namaKelas, setNamaKelas] = useState('');

  const [formError, setFormError] = useState('');

  const handleStartEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setNamaKelas(cls.nama);
    setWaliKelasNip(cls.waliKelasNip);
    setFormError('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!namaKelas || !waliKelasNip) {
      setFormError('Semua field wajib diisi!');
      return;
    }

    const updatedClasses = state.classes.map(c => {
      if (c.id === editingClass?.id) {
        return {
          ...c,
          nama: namaKelas.trim(),
          waliKelasNip: waliKelasNip
        };
      }
      return c;
    });

    onChange({
      ...state,
      classes: updatedClasses
    });

    setEditingClass(null);
  };

  // Helper to find teacher name by NIP
  const getTeacherName = (nip: string) => {
    const t = state.teachers.find(teacher => teacher.nip === nip);
    return t ? t.nama : 'Belum ditentukan';
  };

  return (
    <div className="space-y-6" id="class-management-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="class-hdr">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Manajemen Data Rombel / Kelas</h2>
        <p className="text-xs text-gray-400">Hubungkan Kelas 1 s.d Kelas 6 dengan Guru yang bertindak resmi sebagai Wali Kelas.</p>
      </div>

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
          {formError}
        </div>
      )}

      {/* Edit Form */}
      {editingClass && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4" id="class-edit-form">
          <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-blue-600" />
            Atur Wali Kelas: {editingClass.nama}
          </h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="block text-gray-600 mb-1">Nama Kelas</label>
              <input
                type="text"
                value={namaKelas}
                onChange={e => setNamaKelas(e.target.value)}
                placeholder="Nama Kelas (Contoh: Kelas 1)"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Pilih Wali Kelas (Guru)</label>
              <select
                value={waliKelasNip}
                onChange={e => setWaliKelasNip(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                <option value="">-- Pilih Guru Wali Kelas --</option>
                {state.teachers
                  .filter(t => t.role !== 'admin' || t.nip === 'admin') // Allow admin if needed, but prioritize teachers
                  .map(t => (
                    <option key={t.nip} value={t.nip}>
                      {t.nama} (NIP: {t.nip})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="class-list-grid">
        {state.classes.map(cls => {
          const totalStudentsInClass = state.students.filter(s => s.kelasId === cls.id && s.statusAktif).length;
          return (
            <div key={cls.id} className="bg-white rounded-xl border border-gray-100 shadow-xs p-5 space-y-4 hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute right-0 top-0 text-blue-50 hover:text-blue-100 w-16 h-16 pointer-events-none transition-colors">
                <School className="h-full w-full object-contain -translate-y-2 translate-x-2" />
              </div>

              <div className="space-y-1 relative z-10">
                <h3 className="text-lg font-bold text-gray-800 font-sans tracking-tight">{cls.nama}</h3>
                <p className="text-xs text-gray-400">Sekolah Dasar SDN 005 Gelora</p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs relative z-10" id="class-stats-body">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Wali Kelas:</span>
                  <span className="font-bold text-gray-700 truncate max-w-[170px] inline-block" title={getTeacherName(cls.waliKelasNip)}>
                    {getTeacherName(cls.waliKelasNip)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Jumlah Siswa:</span>
                  <span className="font-bold text-blue-600 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {totalStudentsInClass} Siswa Aktif
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-end relative z-10">
                <button
                  onClick={() => handleStartEdit(cls)}
                  className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Edit2 className="h-3.5 h-3.5" />
                  Atur Wali Kelas
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
