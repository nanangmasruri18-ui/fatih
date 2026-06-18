import React, { useState } from 'react';
import { Student, AppState } from '../types';
import { Plus, Edit2, Trash2, Search, UserPlus, GraduationCap, School } from 'lucide-react';

interface StudentManagementProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

export default function StudentManagementView({ state, onChange }: StudentManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('Semua');
  const [statusFilter, setStatusFilter] = useState('Semua');

  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [nisn, setNisn] = useState('');
  const [nama, setNama] = useState('');
  const [jenisKelamin, setJenisKelamin] = useState<'L' | 'P'>('L');
  const [kelasId, setKelasId] = useState(state.classes[0]?.id || '1A');
  const [statusAktif, setStatusAktif] = useState(true);

  const [formError, setFormError] = useState('');

  const filteredStudents = state.students.filter(s => {
    const matchesSearch = s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || s.nisn.includes(searchTerm);
    const matchesClass = classFilter === 'Semua' || s.kelasId === classFilter;
    const matchesStatus = statusFilter === 'Semua' || 
      (statusFilter === 'Aktif' && s.statusAktif) || 
      (statusFilter === 'Tidak Aktif' && !s.statusAktif);

    return matchesSearch && matchesClass && matchesStatus;
  });

  const resetForm = () => {
    setNisn('');
    setNama('');
    setJenisKelamin('L');
    setKelasId(state.classes[0]?.id || '1A');
    setStatusAktif(true);
    setFormError('');
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nisn || !nama || !kelasId) {
      setFormError('Harap lengkapi semua field!');
      return;
    }

    if (nisn.length < 5) {
      setFormError('NISN minimal 5 digit angka!');
      return;
    }

    // Check unique NISN
    const exists = state.students.some(s => s.nisn === nisn);
    if (exists) {
      setFormError('Siswa dengan NISN tersebut sudah ada di sistem!');
      return;
    }

    const newStudent: Student = {
      nisn: nisn.trim(),
      nama: nama.trim(),
      jenisKelamin,
      kelasId,
      statusAktif
    };

    onChange({
      ...state,
      students: [...state.students, newStudent]
    });

    resetForm();
    setShowAddForm(false);
  };

  const handleStartEdit = (student: Student) => {
    setEditingStudent(student);
    setNisn(student.nisn);
    setNama(student.nama);
    setJenisKelamin(student.jenisKelamin);
    setKelasId(student.kelasId);
    setStatusAktif(student.statusAktif);
    setFormError('');
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!nama || !kelasId) {
      setFormError('Nama Siswa dan Kelas wajib diisi!');
      return;
    }

    const updatedStudents = state.students.map(s => {
      if (s.nisn === editingStudent?.nisn) {
        return {
          ...s,
          nama: nama.trim(),
          jenisKelamin,
          kelasId,
          statusAktif
        };
      }
      return s;
    });

    onChange({
      ...state,
      students: updatedStudents
    });

    setEditingStudent(null);
    resetForm();
  };

  const handleDelete = (nisnToDelete: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data Siswa ini secara permanen?')) {
      const updatedStudents = state.students.filter(s => s.nisn !== nisnToDelete);
      // Clean attendance entries for this student as well
      const updatedAttendance = state.attendance.filter(a => a.nisn !== nisnToDelete);
      
      onChange({
        ...state,
        students: updatedStudents,
        attendance: updatedAttendance
      });
    }
  };

  return (
    <div className="space-y-6" id="student-management-view">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="student-hdr">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Manajemen Data Siswa</h2>
          <p className="text-xs text-gray-400">Kelola informasi NISN, pemetaan kelas rombel, status keaktifan belajar siswa, serta modifikasi data.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingStudent(null);
            setShowAddForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all w-full sm:w-auto"
          id="btn-add-student"
        >
          <UserPlus className="h-4 w-4" />
          Registrasi Siswa Baru
        </button>
      </div>

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
          {formError}
        </div>
      )}

      {/* Form Area */}
      {(showAddForm || editingStudent) && (
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 space-y-4" id="student-form">
          <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-blue-600" />
            {editingStudent ? `Ubah Data Siswa: ${editingStudent.nama}` : 'Registrasi Siswa Baru'}
          </h3>
          <form onSubmit={editingStudent ? handleUpdate : handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div>
              <label className="block text-gray-600 mb-1">NISN (Nomor Induk Siswa Nasional)</label>
              <input
                type="text"
                value={nisn}
                onChange={e => setNisn(e.target.value)}
                disabled={!!editingStudent}
                placeholder="Id unik 10 digit nasional"
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 disabled:opacity-65"
              />
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Nama Lengkap Siswa</label>
              <input
                type="text"
                value={nama}
                onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Muhammad Syamil"
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
              <label className="block text-gray-600 mb-1">Daftar Di Kelas</label>
              <select
                value={kelasId}
                onChange={e => setKelasId(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                {state.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-600 mb-1">Status Keaktifan</label>
              <select
                value={statusAktif ? 'Aktif' : 'Tidak Aktif'}
                onChange={e => setStatusAktif(e.target.value === 'Aktif')}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500"
              >
                <option value="Aktif">Aktif Belajar</option>
                <option value="Tidak Aktif">Tidak Aktif / Keluar</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setEditingStudent(null);
                  setShowAddForm(false);
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
                {editingStudent ? 'Simpan Perubahan' : 'Registrasi Siswa'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listing Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden" id="student-table-card">
        {/* Filters Top Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/20 grid grid-cols-1 md:grid-cols-3 gap-3" id="student-filters">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Cari siswa berdasarkan nama atau NISN..."
              className="w-full text-xs outline-none text-gray-600 pl-9 pr-3 bg-white border border-gray-200 rounded-lg py-2.5"
            />
          </div>

          <div>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-gray-600 font-medium"
            >
              <option value="Semua">Semua Kelas & Rombel</option>
              {state.classes.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nama}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none text-gray-600 font-medium"
            >
              <option value="Semua">Semua Status Keaktifan</option>
              <option value="Aktif">Aktif</option>
              <option value="Tidak Aktif">Tidak Aktif</option>
            </select>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-blue-50/55 text-blue-900 border-b border-gray-100 font-semibold">
                <th className="p-4 w-12 text-center">No</th>
                <th className="p-4">NISN</th>
                <th className="p-4">Nama Siswa</th>
                <th className="p-4">L/P</th>
                <th className="p-4">Rombel Kelas</th>
                <th className="p-4 text-center">Keaktifan</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-600">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400 font-medium">
                    Tidak ditemukan data siswa yang memenuhi filter pencarian.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, index) => (
                  <tr key={student.nisn} className="hover:bg-gray-50/50">
                    <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                    <td className="p-4 font-mono font-bold text-gray-900">{student.nisn}</td>
                    <td className="p-4 font-bold text-gray-800">{student.nama}</td>
                    <td className="p-4 font-medium">{student.jenisKelamin === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}</td>
                    <td className="p-4">
                      <span className="flex items-center gap-1 font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded text-[10.5px] w-fit">
                        <School className="w-3 h-3" />
                        Kelas {student.kelasId}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${student.statusAktif ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                        {student.statusAktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleStartEdit(student)}
                          className="p-1 px-2 border border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-500 hover:text-blue-600 rounded flex items-center gap-1 font-bold text-[11px]"
                          title="Edit"
                        >
                          <Edit2 className="h-3 w-3" />
                          Ubah
                        </button>
                        <button
                          onClick={() => handleDelete(student.nisn)}
                          className="p-1 px-2 border border-gray-200 hover:border-red-500 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded flex items-center gap-1 font-bold text-[11px]"
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
