import React, { useState, useEffect } from 'react';
import { AppState, Attendance, Student } from '../types';
import { Check, Info, ShieldAlert, Save, Calendar, CheckSquare, Edit, ListFilter, HelpCircle } from 'lucide-react';

interface DailyAttendanceViewProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
  selectedClassId?: string;
  setSelectedClassId?: (c: string) => void;
}

export default function DailyAttendanceView({ state, onChange, selectedClassId, setSelectedClassId }: DailyAttendanceViewProps) {
  // Let's anchor on 2026-06-17 as default current day (Wednesday)
  const [selectedDate, setSelectedDate] = useState('2026-06-17');
  const [currentClassId, setCurrentClassId] = useState('6'); // Class 6 has some prefilled nice data

  // Local drafts of attendance state mapping NISN -> { status: 'H'|'S'|'I'|'A', keterangan: string }
  const [attendanceDraft, setAttendanceDraft] = useState<{ [nisn: string]: { status: 'H' | 'S' | 'I' | 'A'; keterangan: string } }>({});
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Sync passed prop if it exists
  useEffect(() => {
    if (selectedClassId) {
      setCurrentClassId(selectedClassId);
    }
  }, [selectedClassId]);

  // Load attendance data from state into local draft whenever date or class changes
  useEffect(() => {
    setSuccessMessage('');
    setErrorMessage('');
    
    // Get students in this class
    const classStudents = state.students.filter(s => s.kelasId === currentClassId && s.statusAktif);
    
    // Build draft mapping
    const draft: typeof attendanceDraft = {};
    
    classStudents.forEach(student => {
      // Look for already saved attendance on this date/nisn
      const existing = state.attendance.find(a => a.date === selectedDate && a.nisn === student.nisn);
      
      if (existing) {
        draft[student.nisn] = {
          status: existing.status,
          keterangan: existing.keterangan
        };
      } else {
        // Default to "H" (Hadir) for convenience! Very nice UX.
        draft[student.nisn] = {
          status: 'H',
          keterangan: ''
        };
      }
    });

    setAttendanceDraft(draft);
  }, [selectedDate, currentClassId, state.attendance, state.students]);

  // Active students filtered for chosen class room
  const classStudents = state.students.filter(s => s.kelasId === currentClassId && s.statusAktif);
  const selectedClass = state.classes.find(c => c.id === currentClassId);
  
  // Find Wali Kelas Name
  const waliKelasName = selectedClass ? 
    (state.teachers.find(t => t.nip === selectedClass.waliKelasNip)?.nama || 'Belum diatur') 
    : 'Belum diatur';

  // Holiday validations for selected date
  const isSunday = new Date(selectedDate).getDay() === 0;
  const holiday = state.holidays.find(h => h.date === selectedDate);
  const isBlockedDate = isSunday || !!holiday;

  // Change single status
  const handleStatusChange = (nisn: string, status: 'H' | 'S' | 'I' | 'A') => {
    if (isBlockedDate) return;
    setAttendanceDraft(prev => ({
      ...prev,
      [nisn]: {
        ...prev[nisn],
        status
      }
    }));
  };

  // Change single remarks
  const handleKeteranganChange = (nisn: string, keterangan: string) => {
    if (isBlockedDate) return;
    setAttendanceDraft(prev => ({
      ...prev,
      [nisn]: {
        ...prev[nisn],
        keterangan
      }
    }));
  };

  // Set all class to "H" shortcut
  const handleMarkAllHadir = () => {
    if (isBlockedDate) return;
    const draft: typeof attendanceDraft = {};
    classStudents.forEach(s => {
      draft[s.nisn] = {
        status: 'H',
        keterangan: ''
      };
    });
    setAttendanceDraft(draft);
  };

  // Save drafts into main App state
  const handleSaveAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (isBlockedDate) {
      setErrorMessage('Tanggal tersebut merupakan hari libur/Minggu. Mengisi absensi dinonaktifkan.');
      return;
    }

    if (classStudents.length === 0) {
      setErrorMessage('Kelas ini belum memiliki data siswa aktif.');
      return;
    }

    // Prepare updated list of attendance items
    // First, filter out existing attendance entries for this Class and Date
    const filteredAttendance = state.attendance.filter(
      a => !(a.date === selectedDate && a.kelasId === currentClassId)
    );

    // Build new entries
    const newEntries: Attendance[] = classStudents.map(student => {
      const draft = attendanceDraft[student.nisn] || { status: 'H', keterangan: '' };
      return {
        date: selectedDate,
        nisn: student.nisn,
        kelasId: currentClassId,
        status: draft.status,
        keterangan: draft.keterangan || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const updatedState = {
      ...state,
      attendance: [...filteredAttendance, ...newEntries]
    };

    onChange(updatedState);
    setSuccessMessage(`Berhasil menyimpan data absensi Kelas ${currentClassId} untuk tanggal ${selectedDate}!`);
  };

  // Count live stats in current drafts
  const liveCount = {
    H: (Object.values(attendanceDraft) as any[]).filter(v => v.status === 'H').length,
    S: (Object.values(attendanceDraft) as any[]).filter(v => v.status === 'S').length,
    I: (Object.values(attendanceDraft) as any[]).filter(v => v.status === 'I').length,
    A: (Object.values(attendanceDraft) as any[]).filter(v => v.status === 'A').length
  };

  return (
    <div className="space-y-6" id="daily-attendance-view">
      {/* Selector Filters Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-4 items-center" id="attendance-filter-grp">
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-gray-500 mb-1">1. Pilih Tanggal Absensi</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-blue-600" />
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 pl-9 outline-none focus:border-blue-500 text-gray-700 font-bold"
            />
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-bold text-gray-500 mb-1">2. Pilih Rombel Kelas</label>
          <select
            value={currentClassId}
            onChange={e => {
              setCurrentClassId(e.target.value);
              if (setSelectedClassId) setSelectedClassId(e.target.value);
            }}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-gray-700 font-bold"
          >
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nama} (Wali: {state.teachers.find(t => t.nip === c.waliKelasNip)?.nama || 'Belum diatur'})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-3 text-right">
          <div className="text-xs text-gray-400 font-semibold mb-1">Wali Kelas Aktif</div>
          <p className="text-xs font-bold text-blue-800 bg-blue-50 py-2.5 px-3 rounded-lg border border-blue-100 truncate inline-block w-full text-center">
            {waliKelasName}
          </p>
        </div>
      </div>

      {/* Notices */}
      {successMessage && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-3 px-4 rounded-lg border border-emerald-100 font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0 bg-emerald-500 text-white rounded-full p-0.5" />
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-50 text-red-700 text-xs py-3 px-4 rounded-lg border border-red-100 font-semibold flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Grid Blocking Warning */}
      {isBlockedDate ? (
        <div className="bg-red-50 text-red-700 rounded-2xl p-8 border border-red-100 text-center space-y-3 shadow-xs" id="blocked-date-notice">
          <ShieldAlert className="h-10 w-10 mx-auto text-red-600 animate-bounce" />
          <h3 className="font-bold text-base">Tanggal Dinonaktifkan (Hari Libur Red-Zone)</h3>
          <p className="text-xs text-red-600 max-w-lg mx-auto leading-relaxed">
            Presensi tidak dapat dibuka pada tanggal <strong>{selectedDate}</strong> karena tercatat sebagai{' '}
            {holiday ? (
              <strong className="underline">Hari Libur: {holiday.nama} ({holiday.tipe})</strong>
            ) : (
              <strong className="underline">Hari Minggu (Hari Libur Rutin Mingguan)</strong>
            )}
            . Harap pilih tanggal aktif sekolah (Senin sampai Sabtu).
          </p>
        </div>
      ) : classStudents.length === 0 ? (
        <div className="bg-blue-50/50 text-blue-700 rounded-2xl p-12 text-center space-y-3" id="blank-class-notice">
          <HelpCircle className="h-10 w-10 mx-auto text-blue-500" />
          <h3 className="font-bold text-sm">Tidak Ada Siswa Terdaftar</h3>
          <p className="text-xs text-blue-600 max-w-sm mx-auto leading-relaxed">
            Belum ada data siswa aktif di Kelas {currentClassId}. Silakan daftarkan siswa lewat menu <strong>Data Siswa</strong> atau impor via Excel.
          </p>
        </div>
      ) : (
        /* Live Forms and Tables */
        <form onSubmit={handleSaveAttendance} className="space-y-4" id="attendance-active-form">
          {/* Quick Stats Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs flex flex-col sm:flex-row justify-between items-center gap-4" id="attendance-toolbar">
            <div className="flex flex-wrap gap-3" id="live-rekap-pill">
              <span className="text-[10.5px] font-bold text-gray-500 bg-gray-50 px-3 py-1 rounded-full border border-gray-200">
                Pilihan Hari Ini:
              </span>
              <span className="text-[10.5px] font-bold text-emerald-700 bg-emerald-5 w-fit bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full flex items-center gap-1">
                Hadir: {liveCount.H}
              </span>
              <span className="text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">
                Sakit: {liveCount.S}
              </span>
              <span className="text-[10.5px] font-bold text-amber-700 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full flex items-center gap-1">
                Izin: {liveCount.I}
              </span>
              <span className="text-[10.5px] font-bold text-rose-700 bg-red-50 border border-red-100 px-3 py-1 rounded-full flex items-center gap-1">
                Alpha: {liveCount.A}
              </span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleMarkAllHadir}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3.5 py-1.5 rounded-lg font-bold transition-all w-full sm:w-auto text-center"
              >
                Setel Hadir Semua Siswa
              </button>
              
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs w-full sm:w-auto text-center shrink-0"
              >
                <Save className="h-3.5 w-3.5" />
                Simpan Presensi
              </button>
            </div>
          </div>

          {/* Student Grid Table list */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-blue-50/55 text-blue-900 border-b border-gray-100 font-semibold">
                    <th className="p-4 w-12 text-center">No</th>
                    <th className="p-4 w-28">NISN</th>
                    <th className="p-4">Nama Lengkap Siswa</th>
                    <th className="p-4 w-16 text-center">L/P</th>
                    <th className="p-4 w-[280px] text-center">Kehadiran (Pilih Status)</th>
                    <th className="p-4">Keterangan / Alasan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-600">
                  {classStudents.map((siswa, index) => {
                    const rowDraft = attendanceDraft[siswa.nisn] || { status: 'H', keterangan: '' };
                    return (
                      <tr key={siswa.nisn} className="hover:bg-gray-50/40">
                        <td className="p-4 text-center font-bold text-gray-400">{index + 1}</td>
                        <td className="p-4 font-mono font-bold text-gray-900">{siswa.nisn}</td>
                        <td className="p-4 font-bold text-gray-800">{siswa.nama}</td>
                        <td className="p-4 text-center font-semibold">{siswa.jenisKelamin}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex rounded-lg border border-gray-200 p-0.5 bg-gray-50" id={`pilihan-${siswa.nisn}`}>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'H')}
                              className={`px-3 py-1 text-[10.5px] font-extrabold rounded-md transition-all ${
                                rowDraft.status === 'H'
                                  ? 'bg-emerald-500 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-emerald-600'
                              }`}
                            >
                              H
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'S')}
                              className={`px-3 py-1 text-[10.5px] font-extrabold rounded-md transition-all ${
                                rowDraft.status === 'S'
                                  ? 'bg-blue-500 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-blue-600'
                              }`}
                            >
                              S
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'I')}
                              className={`px-3 py-1 text-[10.5px] font-extrabold rounded-md transition-all ${
                                rowDraft.status === 'I'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-amber-600'
                              }`}
                            >
                              I
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(siswa.nisn, 'A')}
                              className={`px-3 py-1 text-[10.5px] font-extrabold rounded-md transition-all ${
                                rowDraft.status === 'A'
                                  ? 'bg-rose-500 text-white shadow-xs'
                                  : 'text-gray-500 hover:text-rose-600'
                              }`}
                            >
                              A
                            </button>
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="text"
                            value={rowDraft.keterangan}
                            onChange={e => handleKeteranganChange(siswa.nisn, e.target.value)}
                            placeholder={
                              rowDraft.status === 'H' 
                                ? 'Hadir tepat waktu (opsional)' 
                                : rowDraft.status === 'S' 
                                ? 'Misal: Demam, Surat Dokter' 
                                : rowDraft.status === 'I' 
                                ? 'Misal: Acara Keluarga' 
                                : 'Tanpa Keterangan'
                            }
                            className="w-full bg-white border border-gray-150 rounded px-2.5 py-1.5 focus:border-blue-500 text-xs font-semibold outline-none text-gray-700"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Interactive footer warning */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between font-semibold flex-wrap gap-2 text-gray-500 text-[11px]">
              <p className="flex items-center gap-1.5">
                <Info className="h-4 w-4 text-blue-600" />
                *Keterangan Status: H = Hadir; S = Sakit; I = Izin; A = Alpha (Alpa / Tanpa Keterangan).
              </p>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2 rounded-lg font-bold transition-all shadow-xs"
              >
                Simpan Presensi Kelas {currentClassId}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
