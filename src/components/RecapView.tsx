import React, { useState } from 'react';
import { AppState, Student, Attendance } from '../types';
import { Calendar, Filter, Users, School, BookOpen, Clock, Activity, FileText } from 'lucide-react';

interface RecapViewProps {
  state: AppState;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function RecapView({ state }: RecapViewProps) {
  const [recapTab, setRecapTab] = useState<'harian' | 'mingguan' | 'bulanan' | 'semester'>('harian');
  
  // Shared filters
  const [selectedClassId, setSelectedClassId] = useState('6'); // Class 6 has nice prefilled data
  const [filterMonth, setFilterMonth] = useState(5); // June (0-indexed)
  const [filterYear, setFilterYear] = useState(2026);
  const [filterDay, setFilterDay] = useState('2026-06-17'); // Wednesday
  const [filterSemester, setFilterSemester] = useState<'ganjil' | 'genap'>('genap');

  // Helper date lists for weekly recap
  // Returns list of date strings for current week (Monday - Saturday)
  const getWeeklyDates = (baseDateStr: string) => {
    const base = new Date(baseDateStr);
    const day = base.getDay(); // Sun = 0, Mon = 1...
    // Let's find Monday
    const diff = base.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(base.setDate(diff));

    const dates: string[] = [];
    for (let i = 0; i < 6; i++) {
      const next = new Date(monday);
      next.setDate(monday.getDate() + i);
      const yStr = next.getFullYear();
      const mStr = String(next.getMonth() + 1).padStart(2, '0');
      const dStr = String(next.getDate()).padStart(2, '0');
      dates.push(`${yStr}-${mStr}-${dStr}`);
    }
    return dates;
  };

  const weeklyDates = getWeeklyDates(filterDay);

  // Filter students
  const activeStudents = state.students.filter(s => s.kelasId === selectedClassId && s.statusAktif);

  // Helper to retrieve status for a student on a specific date
  const getAttendanceOnDate = (nisn: string, date: string): { status: string; ket: string } => {
    const entry = state.attendance.find(a => a.nisn === nisn && a.date === date);
    if (!entry) return { status: '-', ket: '' };
    return { status: entry.status, ket: entry.keterangan };
  };

  // Helper for monthly aggregates
  const getMonthlyAggregateForStudent = (nisn: string) => {
    const entries = state.attendance.filter(a => {
      if (a.nisn !== nisn) return false;
      const d = new Date(a.date);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    });

    const H = entries.filter(e => e.status === 'H').length;
    const S = entries.filter(e => e.status === 'S').length;
    const I = entries.filter(e => e.status === 'I').length;
    const A = entries.filter(e => e.status === 'A').length;
    const total = H + S + I + A;
    const rate = total > 0 ? Math.round((H / total) * 100) : 100; // Default to 100 if no data logged

    return { H, S, I, A, total, rate };
  };

  // Helper for semester aggregates (S, I, A, H)
  const getSemesterAggregateForStudent = (nisn: string) => {
    const entries = state.attendance.filter(a => {
      if (a.nisn !== nisn) return false;
      const d = new Date(a.date);
      if (d.getFullYear() !== filterYear) return false;
      const m = d.getMonth(); // 0-11
      if (filterSemester === 'ganjil') {
        return m >= 6 && m <= 11; // July - Dec
      } else {
        return m >= 0 && m <= 5; // Jan - Jun
      }
    });

    const H = entries.filter(e => e.status === 'H').length;
    const S = entries.filter(e => e.status === 'S').length;
    const I = entries.filter(e => e.status === 'I').length;
    const A = entries.filter(e => e.status === 'A').length;
    const total = H + S + I + A;
    const rate = total > 0 ? Math.round((H / total) * 100) : 100;

    return { H, S, I, A, total, rate };
  };

  // Total school class stats in current selections
  const selectedClass = state.classes.find(c => c.id === selectedClassId);
  const waliKelasName = selectedClass ? 
    (state.teachers.find(t => t.nip === selectedClass.waliKelasNip)?.nama || 'Belum diatur') 
    : 'Belum diatur';

  return (
    <div className="space-y-6" id="recap-view">
      {/* Tab Selectors */}
      <div className="bg-white p-2.5 rounded-xl border border-gray-100 shadow-xs flex flex-wrap gap-2 inline-flex" id="recap-tabs-nav">
        <button
          onClick={() => setRecapTab('harian')}
          className={`px-4.5 py-2 font-bold text-xs rounded-lg transition-all ${
            recapTab === 'harian'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Rekapitulasi Harian
        </button>
        <button
          onClick={() => setRecapTab('mingguan')}
          className={`px-4.5 py-2 font-bold text-xs rounded-lg transition-all ${
            recapTab === 'mingguan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Rekapitulasi Mingguan
        </button>
        <button
          onClick={() => setRecapTab('bulanan')}
          className={`px-4.5 py-2 font-bold text-xs rounded-lg transition-all ${
            recapTab === 'bulanan'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Rekapitulasi Bulanan
        </button>
        <button
          onClick={() => setRecapTab('semester')}
          className={`px-4.5 py-2 font-bold text-xs rounded-lg transition-all ${
            recapTab === 'semester'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
          }`}
        >
          Rekapitulasi Semester
        </button>
      </div>

      {/* Filter Control Board */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end" id="recap-filters">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Kelas</label>
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-700"
          >
            {state.classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.nama} (Wali: {state.teachers.find(t => t.nip === c.waliKelasNip)?.nama || 'Belum diatur'})
              </option>
            ))}
          </select>
        </div>

        {recapTab === 'harian' && (
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Tanggal</label>
            <input
              type="date"
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 outline-none font-bold text-gray-700"
            />
          </div>
        )}

        {recapTab === 'mingguan' && (
          <div className="lg:col-span-3">
            <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Tanggal Acuan Minggu</label>
            <input
              type="date"
              value={filterDay}
              onChange={e => setFilterDay(e.target.value)}
              className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 outline-none font-bold text-gray-700"
            />
          </div>
        )}

        {recapTab === 'bulanan' && (
          <>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Bulan</label>
              <select
                value={filterMonth}
                onChange={e => setFilterMonth(Number(e.target.value))}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-700"
              >
                {INDONESIAN_MONTHS.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>
            </div>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Tahun</label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(Number(e.target.value))}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-700"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>
          </>
        )}

        {recapTab === 'semester' && (
          <>
            <div className="lg:col-span-2">
              <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Semester</label>
              <select
                value={filterSemester}
                onChange={e => setFilterSemester(e.target.value as 'ganjil' | 'genap')}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-700 hover:border-blue-500 transition-colors"
              >
                <option value="genap">Semester Genap (Januari - Juni)</option>
                <option value="ganjil">Semester Ganjil (Juli - Desember)</option>
              </select>
            </div>
            <div className="lg:col-span-1">
              <label className="block text-xs font-bold text-gray-400 mb-1">Pilih Tahun</label>
              <select
                value={filterYear}
                onChange={e => setFilterYear(Number(e.target.value))}
                className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2.5 outline-none font-bold text-gray-700 hover:border-blue-500 transition-colors"
              >
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
                <option value={2028}>2028</option>
              </select>
            </div>
          </>
        )}

        <div className="text-right text-xs text-gray-400 font-bold" id="recap-wali-kelas-info">
          <span>Wali Kelas: </span>
          <span className="text-blue-800 bg-blue-50 px-2.5 py-1 rounded border border-blue-100 font-extrabold truncate inline-block max-w-full">
            {waliKelasName}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      {activeStudents.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400 font-semibold" id="recap-empty">
          <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Kelas {selectedClassId} belum memiliki siswa aktif.</p>
          <p className="text-xs text-gray-400 font-medium mt-1">Daftarkan siswa baru terlebih dahulu.</p>
        </div>
      ) : (
        /* Tabs Tables Switcher */
        <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden" id="recap-tables-wrapper">
          {/* 1. HARIAN TAB */}
          {recapTab === 'harian' && (
            <div>
              <div className="p-4 border-b border-gray-100 bg-gray-50/20">
                <span className="bg-blue-600 text-white rounded-md px-3 py-1 font-bold font-mono text-[10.5px]">
                  REKAP HARIAN: {filterDay}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-50/40 text-blue-900 border-b border-gray-100 font-semibold">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4 w-32">NISN</th>
                      <th className="p-4">Nama Lengkap Siswa</th>
                      <th className="p-4 w-20 text-center">L/P</th>
                      <th className="p-4 w-36 text-center">Status Kehadiran</th>
                      <th className="p-4">Keterangan Tambahan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {activeStudents.map((siswa, i) => {
                      const rec = getAttendanceOnDate(siswa.nisn, filterDay);
                      return (
                        <tr key={siswa.nisn} className="hover:bg-gray-50/30">
                          <td className="p-4 text-center font-bold text-gray-400">{i + 1}</td>
                          <td className="p-4 font-mono font-bold text-gray-900">{siswa.nisn}</td>
                          <td className="p-4 font-bold text-gray-800">{siswa.nama}</td>
                          <td className="p-4 text-center font-semibold">{siswa.jenisKelamin}</td>
                          <td className="p-4 text-center">
                            {rec.status === '-' ? (
                              <span className="text-gray-400 font-semibold text-[10.5px]">Belum Presensi</span>
                            ) : (
                              <span className={`px-3 py-1 rounded text-[10.5px] font-extrabold ${
                                rec.status === 'H' 
                                  ? 'bg-emerald-500 text-white' 
                                  : rec.status === 'S' 
                                  ? 'bg-blue-500 text-white' 
                                  : rec.status === 'I' 
                                  ? 'bg-amber-500 text-white' 
                                  : 'bg-rose-500 text-white'
                              }`}>
                                {rec.status === 'H' ? 'Hadir' : rec.status === 'S' ? 'Sakit' : rec.status === 'I' ? 'Izin' : 'Alpha'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-gray-500 font-semibold italic">{rec.ket || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. WEEKLY TAB */}
          {recapTab === 'mingguan' && (
            <div>
              <div className="p-4 border-b border-gray-100 bg-gray-50/20">
                <span className="bg-blue-600 text-white rounded-md px-3 py-1 font-bold font-mono text-[10.5px]">
                  REKAP MINGGUAN (MON - SAT)
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-50/40 text-blue-900 border-b border-gray-100 font-bold">
                      <th className="p-3 w-10 text-center">No</th>
                      <th className="p-3 w-28">NISN</th>
                      <th className="p-3">Nama Lengkap Siswa</th>
                      <th className="p-3 text-center">L/P</th>
                      {weeklyDates.map(dateStr => {
                        const d = new Date(dateStr);
                        const daysLabel = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
                        return (
                          <th key={dateStr} className="p-3 text-center w-20">
                            <div>{daysLabel[d.getDay()]}</div>
                            <div className="text-[10px] text-blue-800 font-mono font-bold leading-none mt-0.5">{d.getDate()}/{d.getMonth() + 1}</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {activeStudents.map((siswa, i) => (
                      <tr key={siswa.nisn} className="hover:bg-gray-50/30">
                        <td className="p-3 text-center font-bold text-gray-400">{i + 1}</td>
                        <td className="p-3 font-mono font-bold text-gray-900">{siswa.nisn}</td>
                        <td className="p-3 font-bold text-gray-800">{siswa.nama}</td>
                        <td className="p-3 text-center font-semibold">{siswa.jenisKelamin}</td>
                        {weeklyDates.map(dateStr => {
                          const { status } = getAttendanceOnDate(siswa.nisn, dateStr);
                          return (
                            <td key={dateStr} className="p-3 text-center font-bold">
                              {status === '-' ? (
                                <span className="text-gray-300">-</span>
                              ) : (
                                <span className={`inline-block w-6 h-6 leading-6 text-center rounded font-extrabold text-[10.5px] ${
                                  status === 'H' 
                                    ? 'bg-emerald-50 text-emerald-700' 
                                    : status === 'S' 
                                    ? 'bg-blue-50 text-blue-700' 
                                    : status === 'I' 
                                    ? 'bg-amber-50 text-amber-700' 
                                    : 'bg-red-50 text-red-700'
                                }`}>
                                  {status}
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MONTHLY RECAP TAB */}
          {recapTab === 'bulanan' && (
            <div>
              <div className="p-4 border-b border-gray-100 bg-gray-50/20 flex items-center justify-between">
                <span className="bg-blue-600 text-white rounded-md px-3 py-1 font-bold font-mono text-[10.5px]">
                  REKAP BULANAN: OTO-REKAP BULAN {INDONESIAN_MONTHS[filterMonth].toUpperCase()} {filterYear}
                </span>
                <span className="text-[10.5px] text-gray-400 font-semibold">
                  Mencakup akumulasi Presensi Tanggal 1 s.d {new Date(filterYear, filterMonth + 1, 0).getDate()}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-50/40 text-blue-900 border-b border-gray-100 font-bold">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4 w-32">NISN</th>
                      <th className="p-4">Nama Lengkap Siswa</th>
                      <th className="p-4 w-16 text-center">L/P</th>
                      <th className="p-4 text-center w-24">Hadir (H)</th>
                      <th className="p-4 text-center w-24">Sakit (S)</th>
                      <th className="p-4 text-center w-24">Izin (I)</th>
                      <th className="p-4 text-center w-24">Alpha (A)</th>
                      <th className="p-4 text-center w-28">Presensi Total</th>
                      <th className="p-4 text-center w-36">Tingkat Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {activeStudents.map((siswa, i) => {
                      const agg = getMonthlyAggregateForStudent(siswa.nisn);
                      return (
                        <tr key={siswa.nisn} className="hover:bg-gray-50/30">
                          <td className="p-4 text-center font-bold text-gray-400">{i + 1}</td>
                          <td className="p-4 font-mono font-bold text-gray-900">{siswa.nisn}</td>
                          <td className="p-4 font-bold text-gray-800">{siswa.nama}</td>
                          <td className="p-4 text-center font-medium">{siswa.jenisKelamin}</td>
                          
                          {/* Aggregations list */}
                          <td className="p-4 text-center text-emerald-600 font-extrabold">{agg.H}</td>
                          <td className="p-4 text-center text-blue-600 font-extrabold">{agg.S}</td>
                          <td className="p-4 text-center text-amber-600 font-extrabold">{agg.I}</td>
                          <td className="p-4 text-center text-red-600 font-extrabold">{agg.A}</td>
                          
                          <td className="p-4 text-center font-mono font-bold text-gray-900 bg-gray-50/30">
                            {agg.total} Hari
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              agg.rate >= 90 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : agg.rate >= 75 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {agg.rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. SEMESTER RECAP TAB */}
          {recapTab === 'semester' && (
            <div>
              <div className="p-4 border-b border-gray-100 bg-gray-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
                <span className="bg-indigo-600 text-white rounded-md px-3 py-1 font-bold font-mono text-[10.5px] uppercase tracking-wide">
                  REKAP SEMESTER: SEMESTER {filterSemester.toUpperCase()} TAHUN {filterYear}
                </span>
                <span className="text-[10.5px] text-gray-400 font-semibold italic">
                  Akumulasi {filterSemester === 'ganjil' ? 'Juli s/d Desember' : 'Januari s/d Juni'} {filterYear}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-indigo-50/40 text-indigo-900 border-b border-gray-100 font-bold">
                      <th className="p-4 w-12 text-center">No</th>
                      <th className="p-4 w-32">NISN</th>
                      <th className="p-4">Nama Lengkap Siswa</th>
                      <th className="p-4 w-16 text-center">L/P</th>
                      <th className="p-4 text-center w-24 bg-rose-50/50 text-red-700">Alpha (A)</th>
                      <th className="p-4 text-center w-24 bg-blue-50/50 text-blue-700">Sakit (S)</th>
                      <th className="p-4 text-center w-24 bg-amber-50/50 text-amber-700">Izin (I)</th>
                      <th className="p-4 text-center w-24 bg-emerald-50/50 text-emerald-700">Hadir (H)</th>
                      <th className="p-4 text-center w-28 border-l border-gray-100 bg-gray-50/50">Total Hari</th>
                      <th className="p-4 text-center w-36 bg-indigo-50/30">% Presensi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600 font-sans">
                    {activeStudents.map((siswa, i) => {
                      const agg = getSemesterAggregateForStudent(siswa.nisn);
                      return (
                        <tr key={siswa.nisn} className="hover:bg-gray-50/30 transition-colors">
                          <td className="p-4 text-center font-bold text-gray-400">{i + 1}</td>
                          <td className="p-4 font-mono font-bold text-gray-900">{siswa.nisn}</td>
                          <td className="p-4 font-extrabold text-gray-800">{siswa.nama}</td>
                          <td className="p-4 text-center font-bold text-gray-500">{siswa.jenisKelamin}</td>
                          
                          {/* S, I, A details specifically demanded by user shown cleanly */}
                          <td className="p-4 text-center bg-rose-50/25 text-red-650 font-black text-sm">{agg.A}</td>
                          <td className="p-4 text-center bg-blue-50/25 text-blue-650 font-black text-sm">{agg.S}</td>
                          <td className="p-4 text-center bg-amber-50/25 text-amber-655 font-black text-sm">{agg.I}</td>
                          <td className="p-4 text-center bg-emerald-50/25 text-emerald-650 font-black text-sm">{agg.H}</td>
                          
                          <td className="p-4 text-center font-mono font-black text-gray-900 bg-gray-50/55 border-l border-gray-100">
                            {agg.total} Hari
                          </td>
                          <td className="p-4 text-center bg-indigo-50/10">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-black ${
                              agg.rate >= 90 
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                                : agg.rate >= 75 
                                ? 'bg-blue-50 text-blue-700 border border-blue-100' 
                                : 'bg-red-50 text-red-700 border border-red-100'
                            }`}>
                              {agg.rate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
