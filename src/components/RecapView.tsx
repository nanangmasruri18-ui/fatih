import React, { useState } from 'react';
import { AppState, Student, Attendance } from '../types';
import { Calendar, Filter, Users, School, BookOpen, Clock, Activity, FileText, Download, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const [selectedClassId, setSelectedClassId] = useState('6A'); // Class 6A has nice prefilled data
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

  // Helper to fetch all days of a month
  const getDaysInMonth = (month: number, year: number) => {
    const date = new Date(year, month, 1);
    const days: string[] = [];
    while (date.getMonth() === month) {
      const yStr = date.getFullYear();
      const mStr = String(date.getMonth() + 1).padStart(2, '0');
      const dStr = String(date.getDate()).padStart(2, '0');
      days.push(`${yStr}-${mStr}-${dStr}`);
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const monthDates = getDaysInMonth(filterMonth, filterYear);

  // Helper to verify if a date is a Sunday or high/national holiday
  const isHoliday = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.getDay() === 0) return true; // Minggu is holiday
    return state.holidays.some(h => h.date === dateStr);
  };

  const getHolidayName = (dateStr: string) => {
    const d = new Date(dateStr);
    if (d.getDay() === 0) return 'Hari Minggu';
    const h = state.holidays.find(h => h.date === dateStr);
    return h ? h.nama : '';
  };

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

  // Export to PDF function with proper layout matching tab orientation
  const exportToPDF = () => {
    const isLandscape = recapTab === 'bulanan' || recapTab === 'mingguan';
    const doc = new jsPDF({
      orientation: isLandscape ? 'landscape' : 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. School Header
    doc.setFillColor(30, 41, 59); // Premium Slate header
    doc.rect(0, 0, pageWidth, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('SDN 005 GELORA KECAMATAN BAGAN SINEMBAH', 15, 11);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(200, 220, 255);
    doc.text('NPSN: 10405436  •  Laporan Presensi Bulanan Resmi Sekolah  •  Kabupaten Rokan Hilir', 15, 17);
    
    // Aesthetic Blue Line border
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 24, pageWidth, 4, 'F');

    // 2. Report Subheading
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    
    let title = '';
    let metaLeft = `Kelas: ${selectedClass?.nama || selectedClassId}`;
    let metaRight = `Wali Kelas: ${waliKelasName}`;

    if (recapTab === 'harian') {
      title = `REKAPITULASI PRESENSI HARIAN SISWA - TANGGAL ${filterDay}`;
    } else if (recapTab === 'mingguan') {
      title = `REKAPITULASI PRESENSI MINGGUAN - ACUAN: ${filterDay}`;
    } else if (recapTab === 'bulanan') {
      title = `REKAPITULASI PRESENSI BULANAN: ${INDONESIAN_MONTHS[filterMonth].toUpperCase()} ${filterYear}`;
    } else if (recapTab === 'semester') {
      title = `REKAPITULASI PRESENSI SEMESTER ${filterSemester.toUpperCase()} - TAHUN ${filterYear}`;
    }

    doc.text(title, 15, 38);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(metaLeft, 15, 43);
    
    const rightMarginTextWidth = doc.getTextWidth(metaRight);
    doc.text(metaRight, pageWidth - 15 - rightMarginTextWidth, 43);

    // 3. Columns & Rows Builder
    let headers: string[][] = [];
    let body: any[][] = [];

    if (recapTab === 'harian') {
      headers = [['No', 'NISN', 'Nama Lengkap Siswa', 'L/P', 'Status Kehadiran', 'Keterangan']];
      body = activeStudents.map((siswa, i) => {
        const rec = getAttendanceOnDate(siswa.nisn, filterDay);
        const statusText = rec.status === 'H' ? 'Hadir' : rec.status === 'S' ? 'Sakit' : rec.status === 'I' ? 'Izin' : rec.status === 'A' ? 'Alpha' : 'Belum Presensi';
        return [
          i + 1,
          siswa.nisn,
          siswa.nama,
          siswa.jenisKelamin,
          statusText,
          rec.ket || '-'
        ];
      });
    } else if (recapTab === 'mingguan') {
      const daysHeader = weeklyDates.map(dStr => {
        const d = new Date(dStr);
        const labels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        return `${labels[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1})`;
      });
      headers = [['No', 'NISN', 'Nama Lengkap Siswa', 'L/P', ...daysHeader]];
      body = activeStudents.map((siswa, i) => {
        const rowData: any[] = [i + 1, siswa.nisn, siswa.nama, siswa.jenisKelamin];
        weeklyDates.forEach(dStr => {
          const rec = getAttendanceOnDate(siswa.nisn, dStr);
          rowData.push(rec.status === '-' ? '-' : rec.status);
        });
        return rowData;
      });
    } else if (recapTab === 'bulanan') {
      const daysHeader = monthDates.map(dStr => {
        const d = new Date(dStr);
        return `${d.getDate()}`;
      });
      headers = [['No', 'NISN', 'Nama Lengkap Siswa', 'L/P', ...daysHeader, 'H', 'S', 'I', 'A', '%']];
      body = activeStudents.map((siswa, i) => {
        const agg = getMonthlyAggregateForStudent(siswa.nisn);
        const rowData: any[] = [i + 1, siswa.nisn, siswa.nama, siswa.jenisKelamin];
        monthDates.forEach(dStr => {
          const rec = getAttendanceOnDate(siswa.nisn, dStr);
          
          if (rec.status === '-') {
            const isSun = new Date(dStr).getDay() === 0;
            const isHol = state.holidays.some(h => h.date === dStr);
            if (isSun) rowData.push('M');
            else if (isHol) rowData.push('L');
            else rowData.push('-');
          } else {
            rowData.push(rec.status);
          }
        });
        rowData.push(agg.H, agg.S, agg.I, agg.A, `${agg.rate}%`);
        return rowData;
      });
    } else if (recapTab === 'semester') {
      headers = [['No', 'NISN', 'Nama Lengkap Siswa', 'L/P', 'Alpha (A)', 'Sakit (S)', 'Izin (I)', 'Hadir (H)', 'Total Presensi', '% Kehadiran']];
      body = activeStudents.map((siswa, i) => {
        const agg = getSemesterAggregateForStudent(siswa.nisn);
        return [
          i + 1,
          siswa.nisn,
          siswa.nama,
          siswa.jenisKelamin,
          agg.A,
          agg.S,
          agg.I,
          agg.H,
          `${agg.total} Hari`,
          `${agg.rate}%`
        ];
      });
    }

    // 4. Generate AutoTable with Custom Styles
    autoTable(doc, {
      startY: 48,
      head: headers,
      body: body,
      theme: 'grid',
      styles: {
        fontSize: recapTab === 'bulanan' ? 6 : 8.5,
        cellPadding: recapTab === 'bulanan' ? 0.8 : 2,
        valign: 'middle',
        halign: 'center',
        font: 'Helvetica'
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold', cellWidth: 7 },
        1: { halign: 'center', cellWidth: recapTab === 'bulanan' ? 15 : 22 },
        2: { halign: 'left', fontStyle: 'bold', cellWidth: recapTab === 'bulanan' ? 32 : 55 },
        3: { halign: 'center', cellWidth: 7 }
      },
      // Decorate Sunday/Holidays cells in red/yellow
      didDrawCell: (data) => {
        if (recapTab === 'bulanan' && data.section === 'body' && data.column.index >= 4 && data.column.index < 4 + monthDates.length) {
          const dayIdx = data.column.index - 4;
          const dateStr = monthDates[dayIdx];
          const isSun = new Date(dateStr).getDay() === 0;
          const isHol = state.holidays.some(h => h.date === dateStr);
          
          if (isSun) {
            doc.setFillColor(254, 226, 226); // Light Rose color for Sunday
          } else if (isHol) {
            doc.setFillColor(254, 243, 199); // Light Amber color for Holiday
          }
        }
      }
    });

    // Signature Area
    const finalY = (doc as any).lastAutoTable.finalY + 12;
    if (finalY + 30 < pageHeight) {
      doc.setFontSize(8.5);
      doc.setFont('Helvetica', 'normal');
      doc.text('Mengetahui,', pageWidth - 65, finalY);
      doc.text('Kepala Sekolah SDN 005 Gelora', pageWidth - 65, finalY + 5);
      doc.setFont('Helvetica', 'bold');
      doc.text('MUHAMMAD AL FATIH, S.Pd.', pageWidth - 65, finalY + 24);
      doc.setFont('Helvetica', 'normal');
      doc.text('NIP. 197804152005011003', pageWidth - 65, finalY + 28);
    }

    doc.save(`SDN005_Rekap_${recapTab.toUpperCase()}_Kelas_${selectedClassId}_${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6" id="recap-view">
      {/* Header with Tabs and PDF Button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4" id="recap-head-actions">
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
        <button
          onClick={exportToPDF}
          className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md self-start md:self-auto cursor-pointer"
          id="recap-pdf-download-btn"
        >
          <Printer className="h-4 w-4" />
          Unduh Format PDF (Rekap {recapTab === 'harian' ? 'Harian' : recapTab === 'mingguan' ? 'Mingguan' : recapTab === 'bulanan' ? 'Bulanan' : 'Semester'})
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
              <div className="p-4 border-b border-gray-100 bg-gray-50/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                <span className="bg-blue-600 text-white rounded-lg px-3 py-1.5 font-bold font-mono text-[10.5px] shadow-xs">
                  REKAP BULANAN: JURNAL ABSENSI {INDONESIAN_MONTHS[filterMonth].toUpperCase()} {filterYear}
                </span>
                <span className="text-[10.5px] text-gray-500 font-medium font-sans">
                  Mencakup Jurnal Tanggal 1 s.d {new Date(filterYear, filterMonth + 1, 0).getDate()} | Hari minggu berwarna merah (M), hari libur berwarna kuning (L).
                </span>
              </div>
              <div className="overflow-x-auto" id="monthly-recap-table-container">
                <table className="w-full text-left border-collapse text-xs border border-gray-150">
                  <thead>
                    <tr className="bg-blue-50/40 text-blue-900 border-b border-gray-200 font-bold">
                      <th className="p-2 border border-gray-150 w-10 text-center">No</th>
                      <th className="p-2 border border-gray-150 w-24">NISN</th>
                      <th className="p-2 border border-gray-150 min-w-[140px]">Nama Lengkap Siswa</th>
                      <th className="p-2 border border-gray-150 w-10 text-center">L/P</th>
                      
                      {/* Generates dates columns 1..30/31 */}
                      {monthDates.map(dateStr => {
                        const d = new Date(dateStr);
                        const isSun = d.getDay() === 0;
                        const isHol = state.holidays.some(h => h.date === dateStr);
                        const holName = getHolidayName(dateStr);
                        return (
                          <th 
                            key={dateStr}
                            title={holName || `Tanggal ${d.getDate()}`}
                            className={`p-1 border border-gray-150 text-center w-7 min-w-[28px] text-[10px] ${
                              isSun 
                                ? 'bg-red-100 text-red-700' 
                                : isHol 
                                ? 'bg-amber-100 text-amber-800' 
                                : 'bg-gray-100/70 text-gray-700'
                            }`}
                          >
                            {d.getDate()}
                          </th>
                        );
                      })}
                      
                      <th className="p-2 border border-gray-150 text-center w-10 bg-emerald-100 text-emerald-800 font-extrabold">H</th>
                      <th className="p-2 border border-gray-150 text-center w-10 bg-blue-100 text-blue-800 font-extrabold">S</th>
                      <th className="p-2 border border-gray-150 text-center w-10 bg-amber-100 text-amber-800 font-extrabold">I</th>
                      <th className="p-2 border border-gray-150 text-center w-10 bg-rose-100 text-rose-800 font-extrabold">A</th>
                      <th className="p-2 border border-gray-150 text-center w-16 bg-gray-100 text-gray-800 font-bold">Total</th>
                      <th className="p-2 border border-gray-150 text-center w-16 bg-blue-600 text-white font-bold">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {activeStudents.map((siswa, i) => {
                      const agg = getMonthlyAggregateForStudent(siswa.nisn);
                      return (
                        <tr key={siswa.nisn} className="hover:bg-gray-50/50 transition-colors">
                          <td className="p-2 border border-gray-150 text-center font-bold text-gray-400">{i + 1}</td>
                          <td className="p-2 border border-gray-150 font-mono font-bold text-gray-950">{siswa.nisn}</td>
                          <td className="p-2 border border-gray-150 font-bold text-gray-900 truncate max-w-[200px]" title={siswa.nama}>{siswa.nama}</td>
                          <td className="p-2 border border-gray-150 text-center font-semibold text-gray-500">{siswa.jenisKelamin}</td>
                          
                          {/* Calendar days statuses */}
                          {monthDates.map(dateStr => {
                            const rec = getAttendanceOnDate(siswa.nisn, dateStr);
                            const isSun = new Date(dateStr).getDay() === 0;
                            const isHol = state.holidays.some(h => h.date === dateStr);
                            
                            let bgClass = '';
                            if (isSun) bgClass = 'bg-red-50/40 text-red-505 font-medium';
                            else if (isHol) bgClass = 'bg-amber-50/40 text-amber-705 font-medium';

                            return (
                              <td 
                                key={dateStr}
                                title={getHolidayName(dateStr) || `${siswa.nama} - Tanggal ${new Date(dateStr).getDate()}`}
                                className={`p-1 border border-gray-150 text-center font-black text-[10px] w-7 min-w-[28px] ${bgClass}`}
                              >
                                {rec.status === '-' ? (
                                  isSun ? 'M' : isHol ? 'L' : '-'
                                ) : (
                                  <span className={`inline-block w-5.5 h-5.5 leading-5.5 text-center rounded-md font-black text-[9.5px] ${
                                    rec.status === 'H' 
                                      ? 'bg-emerald-500 text-white shadow-xs' 
                                      : rec.status === 'S' 
                                      ? 'bg-blue-500 text-white shadow-xs' 
                                      : rec.status === 'I' 
                                      ? 'bg-amber-500 text-white shadow-xs' 
                                      : 'bg-rose-500 text-white shadow-xs'
                                  }`}>
                                    {rec.status}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          
                          {/* Aggregates */}
                          <td className="p-2 border border-gray-150 text-center text-emerald-600 font-extrabold bg-emerald-50/20">{agg.H}</td>
                          <td className="p-2 border border-gray-150 text-center text-blue-600 font-extrabold bg-blue-50/20">{agg.S}</td>
                          <td className="p-2 border border-gray-150 text-center text-amber-600 font-extrabold bg-amber-50/20">{agg.I}</td>
                          <td className="p-2 border border-gray-150 text-center text-rose-600 font-extrabold bg-rose-50/20">{agg.A}</td>
                          
                          <td className="p-2 border border-gray-150 text-center font-mono font-bold text-gray-900 bg-gray-50/50">
                            {agg.total} H
                          </td>
                          <td className="p-2 border border-gray-150 text-center bg-blue-50/30">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-black ${
                              agg.rate >= 90 
                                ? 'bg-emerald-600 text-white' 
                                : agg.rate >= 75 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-red-650 text-white'
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
