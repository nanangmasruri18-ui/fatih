import React from 'react';
import { AppState } from '../types';
import { Users, GraduationCap, School, CheckCircle, Clock, AlertTriangle, UserX, BarChart2 } from 'lucide-react';

interface ChangeViewProps {
  state: AppState;
  setView: (v: string) => void;
  setSelectedClassId?: (c: string) => void;
}

export default function DashboardView({ state, setView, setSelectedClassId }: ChangeViewProps) {
  const totalTeachers = state.teachers.length;
  const totalStudents = state.students.length;
  const totalClasses = state.classes.length;

  // Let's use June 17, 2026 as the standard current date (matching server metadata)
  const todayDateStr = '2026-06-17';

  // Check if today is Sunday or holiday
  const isSunday = new Date(todayDateStr).getDay() === 0;
  const holidayToday = state.holidays.find(h => h.date === todayDateStr);

  // Today's attendance calculation
  const totalClass6Students = state.students.filter(s => s.kelasId === '6').length;
  const todayAttendance = state.attendance.filter(a => a.date === todayDateStr);
  const totalRecorded = todayAttendance.length;

  const hadirCount = todayAttendance.filter(a => a.status === 'H').length;
  const sakitCount = todayAttendance.filter(a => a.status === 'S').length;
  const izinCount = todayAttendance.filter(a => a.status === 'I').length;
  const alphaCount = todayAttendance.filter(a => a.status === 'A').length;

  // Let's get general attendance stats
  const todayRate = totalRecorded > 0 ? Math.round((hadirCount / totalRecorded) * 100) : 0;

  // Calculate stats by Class to draw a gorgeous CSS bar graph
  const classStats = state.classes.map(cls => {
    const clsStudents = state.students.filter(s => s.kelasId === cls.id);
    const clsStudentsActive = clsStudents.filter(s => s.statusAktif).length;
    
    // Find last recorded attendance for this class
    // Find all attendance for this class
    const clsAttendance = state.attendance.filter(a => a.kelasId === cls.id);
    // Find distinct dates
    const dates = Array.from(new Set(clsAttendance.map(a => a.date))).sort();
    const lastDate = dates[dates.length - 1];

    let lastHadirPerc = 100;
    let recordedOnLastDate = 0;
    
    if (lastDate) {
      const lastDayAtt = clsAttendance.filter(a => a.date === lastDate);
      const h = lastDayAtt.filter(a => a.status === 'H').length;
      recordedOnLastDate = lastDayAtt.length;
      if (recordedOnLastDate > 0) {
        lastHadirPerc = Math.round((h / recordedOnLastDate) * 100);
      }
    } else {
      // Dummy baseline for beautiful empty charts
      lastHadirPerc = 0;
    }

    return {
      ...cls,
      totalStudents: clsStudentsActive,
      lastDate: lastDate || 'Belum ada data',
      percentage: lastHadirPerc,
      recordedCount: recordedOnLastDate
    };
  });

  return (
    <div className="space-y-6" id="dashboard-view-container">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-2xl p-6 text-white shadow-md relative overflow-hidden" id="dashboard-welcome-banner">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 w-1/3 flex items-center justify-center">
          <GraduationCap className="h-44 w-44" />
        </div>
        <div className="relative z-10 space-y-2">
          <div className="bg-blue-800/40 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border border-blue-400/30">
            NPSN: 10405436 • SDN 005 Gelora
          </div>
          <h1 className="text-2xl md:text-3xl font-bold font-sans tracking-tight">
            Selamat Datang di Portal Presensi SDN 005 Gelora!
          </h1>
          <p className="text-blue-100 max-w-2xl text-sm md:text-base leading-relaxed">
            Sistem informasi absensi digital untuk membantu para guru merekapitulasi kehadiran siswa dengan cepat,
            menganalisis data harian, dan menghasilkan laporan terstandar.
          </p>
        </div>
      </div>

      {/* Main KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-grid">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-blue-50 hover:shadow-md transition-shadow flex items-center gap-4 py-6" id="kpi-guru">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Jumlah Guru</p>
            <h3 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">{totalTeachers}</h3>
            <span className="text-[11px] text-blue-500 font-medium">Aktif Mengajar</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-blue-50 hover:shadow-md transition-shadow flex items-center gap-4 py-6" id="kpi-siswa">
          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Jumlah Siswa</p>
            <h3 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">{totalStudents}</h3>
            <span className="text-[11px] text-indigo-500 font-medium">Terdaftar Aktif</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-blue-50 hover:shadow-md transition-shadow flex items-center gap-4 py-6" id="kpi-kelas">
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
            <School className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Jumlah Rombel</p>
            <h3 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">{totalClasses}</h3>
            <span className="text-[11px] text-emerald-500 font-medium">Kelas 1 s.d Kelas 6</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-blue-50 hover:shadow-md transition-shadow flex items-center gap-4 py-6" id="kpi-kehadiran">
          <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Kehadiran Hari Ini</p>
            <h3 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">
              {totalRecorded > 0 ? `${todayRate}%` : 'Belum Rekap'}
            </h3>
            <span className="text-[11px] text-orange-500 font-medium">Hari Ini: Rabu, 17 Juni 2026</span>
          </div>
        </div>
      </div>

      {/* Highlights & Recaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="dashboard-secondary-grid">
        {/* Today's Detail Stats */}
        <div className="lg:col-span-4 bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between" id="today-details-container">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 text-sm tracking-tight flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Status Absensi Hari Ini
              </h3>
              <span className="text-[11.5px] bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
                17 Jun 2026
              </span>
            </div>

            {holidayToday ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 text-xs leading-relaxed border border-red-100">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold">Hari Libur Terdeteksi</p>
                  <p className="mt-0.5 text-red-600">{holidayToday.nama} ({holidayToday.tipe})</p>
                </div>
              </div>
            ) : isSunday ? (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg flex gap-3 text-xs leading-relaxed border border-red-100">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-bold">Hari Minggu</p>
                  <p className="mt-0.5 text-red-600">Hari Minggu adalah libur rutin mingguan.</p>
                </div>
              </div>
            ) : totalRecorded === 0 ? (
              <div className="bg-orange-50 text-orange-700 p-4 rounded-lg text-xs leading-relaxed border border-orange-100 space-y-2">
                <p className="font-bold">Presensi Kelas Belum Dimulai</p>
                <p className="text-orange-600">
                  Belum ada guru yang mengunggah rekapitulasi data absensi hari ini.
                </p>
                {setSelectedClassId && (
                  <button
                    onClick={() => {
                      setSelectedClassId('6'); // Class 6 has 4 students seeded, fast access
                      setView('absensi');
                    }}
                    className="w-full mt-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-1.5 px-3 rounded text-center block transition-all"
                    id="btn-goto-recaps"
                  >
                    Mulai Absensi Sekarang
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-500 leading-relaxed">
                Terdapat <strong>{totalRecorded}</strong> siswa dari Kelas 6 yang telah dipresensi oleh Wali Kelas hari ini.
              </p>
            )}

            {totalRecorded > 0 && (
              <div className="space-y-2.5 pt-2" id="attendance-today-bars">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                      Hadir
                    </span>
                    <span className="font-semibold text-gray-700">{hadirCount} Siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full transition-all" style={{ width: `${(hadirCount / totalRecorded) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                      Sakit
                    </span>
                    <span className="font-semibold text-gray-700">{sakitCount} Siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${(sakitCount / totalRecorded) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                      Izin
                    </span>
                    <span className="font-semibold text-gray-700">{izinCount} Siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all" style={{ width: `${(izinCount / totalRecorded) * 100}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-gray-500 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                      Alpha (Tanpa Keterangan)
                    </span>
                    <span className="font-semibold text-gray-700">{alphaCount} Siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full rounded-full transition-all" style={{ width: `${(alphaCount / totalRecorded) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4" id="today-actions-footer">
            <button
              onClick={() => setView('rekapitulasi')}
              className="w-full flex items-center justify-center gap-2 border border-blue-200 text-blue-700 hover:bg-blue-50 py-2 rounded-lg font-medium text-xs transition-all"
            >
              <BarChart2 className="w-4 h-4" />
              Lihat Laporan Rekap Lengkap
            </button>
          </div>
        </div>

        {/* Attendance Rates by Class Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4" id="class-performance-chart">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm tracking-tight">
              Tingkat Kehadiran Terakhir Berdasarkan Kelas
            </h3>
            <p className="text-xs text-gray-400">
              Menampilkan persentase kehadiran siswa saat terakhir kali presensi dilakukan di tiap rombel.
            </p>
          </div>

          <div className="space-y-4" id="charts-bar-list">
            {classStats.map(stat => (
              <div key={stat.id} className="relative group">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-700">Kelas {stat.id}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-400">Total Siswa: {stat.totalStudents}</span>
                    <span className="text-gray-400 hidden sm:inline">•</span>
                    <span className="text-gray-400 hidden sm:inline">Presensi: {stat.lastDate === 'Belum ada data' ? 'Belum Presensi' : stat.lastDate}</span>
                  </div>
                  <span className={`font-bold ${stat.percentage >= 90 ? 'text-emerald-600' : stat.percentage >= 75 ? 'text-blue-600' : stat.percentage > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
                    {stat.recordedCount > 0 ? `${stat.percentage}% Hadir` : 'Belum Ada Data'}
                  </span>
                </div>
                
                {/* Visual Custom Bar */}
                <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden relative shadow-inner">
                  {stat.recordedCount > 0 ? (
                    <div 
                      className={`h-full rounded-full transition-all duration-500 flex items-center justify-end px-2 ${
                        stat.percentage >= 90 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' 
                          : stat.percentage >= 75 
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-r from-amber-500 to-amber-600'
                      }`}
                      style={{ width: `${stat.percentage}%` }}
                    >
                      {stat.percentage > 10 && (
                        <span className="text-[9px] font-bold text-white leading-none whitespace-nowrap">
                          {stat.percentage}%
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="w-[10%] bg-gray-300 h-full flex items-center justify-center rounded-l-full">
                      <span className="text-[9px] font-bold text-gray-500 leading-none">0%</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 text-[11px] text-gray-400 flex flex-wrap gap-4 items-center border-t border-gray-100 justify-between">
            <p><strong>Note:</strong> Untuk mengisi atau meninjau absensi kelas, silakan menuju menu <strong>Absensi Harian</strong>.</p>
            <div className="flex gap-3">
              <span className="flex items-center gap-1 font-medium text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Tinggi (&ge;90%)
              </span>
              <span className="flex items-center gap-1 font-medium text-blue-600">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Cukup (75% - 89%)
              </span>
              <span className="flex items-center gap-1 font-medium text-amber-600">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span> Kurang (&lt;75%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
