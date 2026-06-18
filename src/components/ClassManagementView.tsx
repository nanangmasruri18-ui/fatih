import React, { useState } from 'react';
import { ClassRoom, AppState } from '../types';
import { Edit2, ShieldAlert, Users, School, Plus, Trash2, X, CheckCircle } from 'lucide-react';

interface ClassManagementProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

export default function ClassManagementView({ state, onChange }: ClassManagementProps) {
  const [editingClass, setEditingClass] = useState<ClassRoom | null>(null);
  const [editClassId, setEditClassId] = useState('');
  const [waliKelasNip, setWaliKelasNip] = useState('');
  const [namaKelas, setNamaKelas] = useState('');

  // Add Class Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassId, setNewClassId] = useState('');
  const [newClassName, setNewClassName] = useState('');
  const [newWaliKelasNip, setNewWaliKelasNip] = useState('');

  // Confirm Delete Dialog State
  const [deletingClassId, setDeletingClassId] = useState<string | null>(null);

  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleStartEdit = (cls: ClassRoom) => {
    setEditingClass(cls);
    setEditClassId(cls.id);
    setNamaKelas(cls.nama);
    setWaliKelasNip(cls.waliKelasNip);
    setShowAddForm(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!editClassId || !namaKelas || !waliKelasNip) {
      setFormError('Semua field form wajib diisi!');
      return;
    }

    const oldId = editingClass?.id;
    const newId = editClassId.trim().toUpperCase();

    if (!oldId) return;

    // ID duplicate check if changed
    if (newId.toLowerCase() !== oldId.toLowerCase()) {
      if (state.classes.some(c => c.id.toLowerCase() === newId.toLowerCase())) {
        setFormError(`Kode/ID Kelas "${newId}" sudah terdaftar pada kelas lain!`);
        return;
      }
    }

    // Map through classes
    const updatedClasses = state.classes.map(c => {
      if (c.id === oldId) {
        return {
          ...c,
          id: newId,
          nama: namaKelas.trim(),
          waliKelasNip: waliKelasNip
        };
      }
      return c;
    });

    // Cascade update to Students and Attendance
    let updatedStudents = state.students;
    let updatedAttendance = state.attendance;

    if (newId !== oldId) {
      updatedStudents = state.students.map(s => {
        if (s.kelasId === oldId) {
          return { ...s, kelasId: newId };
        }
        return s;
      });

      updatedAttendance = state.attendance.map(a => {
        if (a.kelasId === oldId) {
          return { ...a, kelasId: newId };
        }
        return a;
      });
    }

    onChange({
      ...state,
      classes: updatedClasses,
      students: updatedStudents,
      attendance: updatedAttendance
    });

    setFormSuccess(`Berhasil memperbarui data kelas ${namaKelas.trim()}`);
    setEditingClass(null);
  };

  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!newClassId || !newClassName || !newWaliKelasNip) {
      setFormError('Semua field form kelas baru wajib diisi!');
      return;
    }

    const cleanedId = newClassId.trim();
    const cleanedName = newClassName.trim();

    // ID duplicate check
    if (state.classes.some(c => c.id.toLowerCase() === cleanedId.toLowerCase())) {
      setFormError(`Kode/ID Kelas "${cleanedId}" sudah terdaftar! Harap gunakan kode unik lain.`);
      return;
    }

    const newClassRoom: ClassRoom = {
      id: cleanedId,
      nama: cleanedName,
      waliKelasNip: newWaliKelasNip
    };

    onChange({
      ...state,
      classes: [...state.classes, newClassRoom]
    });

    setFormSuccess(`Berhasil menambahkan kelas baru: ${cleanedName}`);
    setNewClassId('');
    setNewClassName('');
    setNewWaliKelasNip('');
    setShowAddForm(false);
  };

  const handleDeleteClass = (id: string) => {
    const classRoom = state.classes.find(c => c.id === id);
    if (!classRoom) return;

    // Filter out the class
    const updatedClasses = state.classes.filter(c => c.id !== id);
    
    onChange({
      ...state,
      classes: updatedClasses
    });

    setFormSuccess(`Kelas ${classRoom.nama} berhasil dihapus.`);
    setDeletingClassId(null);
  };

  // Helper to find teacher name by NIP
  const getTeacherName = (nip: string) => {
    const t = state.teachers.find(teacher => teacher.nip === nip);
    return t ? t.nama : 'Belum ditentukan';
  };

  return (
    <div className="space-y-6" id="class-management-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" id="class-hdr">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Manajemen Data Rombel / Kelas</h2>
          <p className="text-xs text-gray-400">Kelola daftar rombongan belajar (rombel) dan fasilitasi wali kelas pendidik SDN 005 Gelora.</p>
        </div>
        <div>
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingClass(null);
              setFormError('');
              setFormSuccess('');
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black flex items-center gap-2 transition-all shadow-xs"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Tutup Form' : 'Tambah Kelas Baru'}
          </button>
        </div>
      </div>

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2.5 px-4 rounded-lg border border-red-100 font-bold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-red-650 font-black" />
          {formError}
        </div>
      )}

      {formSuccess && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-2.5 px-4 rounded-lg border border-emerald-100 font-bold flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-650 font-black" />
          {formSuccess}
        </div>
      )}

      {/* Add Class Form */}
      {showAddForm && (
        <div className="bg-emerald-50/40 p-5 rounded-xl border border-emerald-100 space-y-4" id="class-add-form">
          <h3 className="font-extrabold text-emerald-950 text-sm flex items-center gap-2 shadow-xs bg-emerald-50 max-w-fit px-3 py-1 rounded-lg">
            <Plus className="h-4 w-4 text-emerald-650" />
            Form Tambah rombel / Kelas Baru
          </h3>
          <form onSubmit={handleAddClass} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="block text-gray-600 mb-1">Kode / ID Kelas (Unik)</label>
              <input
                type="text"
                value={newClassId}
                onChange={e => setNewClassId(e.target.value)}
                placeholder="Contoh: 1A, 2B, 7"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold placeholder-gray-300 focus:border-emerald-500 uppercase font-mono text-gray-850"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Nama Lengkap Kelas</label>
              <input
                type="text"
                value={newClassName}
                onChange={e => setNewClassName(e.target.value)}
                placeholder="Contoh: Kelas 1-A Pasundan"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold placeholder-gray-300 focus:border-emerald-500 text-gray-850"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Pilih Wali Kelas (Guru)</label>
              <select
                value={newWaliKelasNip}
                onChange={e => setNewWaliKelasNip(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-850 font-bold rounded-lg p-2.5 outline-none focus:border-emerald-500"
              >
                <option value="">-- Pilih Guru Wali Kelas --</option>
                {state.teachers
                  .filter(t => t.role !== 'admin' || t.nip === 'admin')
                  .map(t => (
                    <option key={t.nip} value={t.nip}>
                      {t.nama} (NIP: {t.nip})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-lg font-bold transition-colors"
              >
                Simpan Rombel Baru
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Form */}
      {editingClass && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4" id="class-edit-form">
          <h3 className="font-extrabold text-blue-955 text-sm flex items-center gap-2 bg-blue-50 max-w-fit px-3 py-1 rounded-lg shadow-xs">
            <Edit2 className="h-4 w-4 text-blue-650" />
            Form Edit Data Kelas & Wali Kelas: {editingClass.nama}
          </h3>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-semibold text-gray-700">
            <div>
              <label className="block text-gray-600 mb-1">Kode / ID Kelas (Unik)</label>
              <input
                type="text"
                value={editClassId}
                onChange={e => setEditClassId(e.target.value)}
                placeholder="Contoh: 1A, 2B, 7"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold focus:border-blue-500 uppercase font-mono text-gray-850"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Nama Lengkap Kelas</label>
              <input
                type="text"
                value={namaKelas}
                onChange={e => setNamaKelas(e.target.value)}
                placeholder="Nama Kelas (Contoh: Kelas 1)"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 font-bold text-gray-850"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Pilih Wali Kelas (Guru)</label>
              <select
                value={waliKelasNip}
                onChange={e => setWaliKelasNip(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-850 font-bold rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                <option value="">-- Pilih Guru Wali Kelas --</option>
                {state.teachers
                  .filter(t => t.role !== 'admin' || t.nip === 'admin')
                  .map(t => (
                    <option key={t.nip} value={t.nip}>
                      {t.nama} (NIP: {t.nip})
                    </option>
                  ))
                }
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditingClass(null)}
                className="bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-lg font-bold"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold transition-colors"
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
              <div className="absolute right-0 top-0 text-blue-50/50 hover:text-blue-105/50 w-16 h-16 pointer-events-none transition-colors">
                <School className="h-full w-full object-contain -translate-y-2 translate-x-2" />
              </div>

              <div className="space-y-1 relative z-10">
                <div className="flex items-center gap-1.5">
                  <span className="bg-blue-50 text-blue-700 font-mono text-[10px] px-2 py-0.5 rounded font-black uppercase">
                    ID: {cls.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 font-sans tracking-tight">{cls.nama}</h3>
                <p className="text-xs text-gray-400">Sekolah Dasar SDN 005 Gelora</p>
              </div>

              <div className="space-y-2.5 pt-2 text-xs relative z-10" id="class-stats-body">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 font-medium">Wali Kelas:</span>
                  <span className="font-bold text-gray-750 truncate max-w-[170px] inline-block" title={getTeacherName(cls.waliKelasNip)}>
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

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between relative z-10 gap-2">
                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeletingClassId(cls.id)}
                  className="p-2 border border-red-100 text-red-650 hover:bg-red-50 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 hover:text-red-700"
                  title="Hapus Rombel Kelas"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Edit Button */}
                <button
                  onClick={() => handleStartEdit(cls)}
                  className="bg-blue-50 text-blue-750 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 grow justify-center"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Edit Kelas / Rombel
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Custom Modal for Delete Class */}
      {deletingClassId && (() => {
        const targetClass = state.classes.find(c => c.id === deletingClassId);
        if (!targetClass) return null;
        const studentCount = state.students.filter(s => s.kelasId === deletingClassId).length;

        return (
          <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4" id="delete-class-modal">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-100 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-650 border border-red-200">
                <Trash2 className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-gray-800">Hapus Rombel {targetClass.nama}?</h3>
                <p className="text-xs text-gray-400 font-medium">
                  Tindakan ini tidak bisa dibatalkan secara otomatis.
                </p>
                {studentCount > 0 && (
                  <div className="bg-amber-55 border border-amber-200 text-amber-900 p-3 rounded-lg text-[10.5px] font-bold text-left mt-2 space-y-1">
                    <p className="text-amber-950">⚠️ Peringatan Penting:</p>
                    <p className="font-semibold text-amber-800">
                      Terdapat <strong>{studentCount} siswa</strong> terdaftar dalam kelas ini. Menghapus kelas akan membiarkan siswa-siswa tersebut kehilangan rombel aktif mereka.
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setDeletingClassId(null)}
                  className="py-2.5 px-4 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClass(deletingClassId)}
                  className="py-2.5 px-4 text-xs font-bold text-white bg-red-650 hover:bg-red-700 rounded-xl transition-all shadow-xs"
                >
                  Ya, Hapus Kelas
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
