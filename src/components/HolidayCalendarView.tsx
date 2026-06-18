import React, { useState } from 'react';
import { AppState, Holiday } from '../types';
import { Calendar, Plus, Trash2, CalendarDays, ShieldAlert, ArrowLeft, ArrowRight, Info } from 'lucide-react';

interface HolidayCalendarViewProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function HolidayCalendarView({ state, onChange }: HolidayCalendarViewProps) {
  // Anchored on 2026 since we have seeded standard 2026 holidays
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(5); // June is 5 (0-indexed)

  const [holidayDate, setHolidayDate] = useState('2026-06-18');
  const [holidayName, setHolidayName] = useState('');
  const [holidayType, setHolidayType] = useState<'nasional' | 'cuti' | 'sekolah'>('sekolah');
  const [formError, setFormError] = useState('');

  // Calendar logic helpers
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => {
    const day = new Date(year, month, 1).getDay(); // Sunday = 0, Monday = 1...
    // Adjust Sunday to be at the end, or keep Standard calendar (Sun-Sat)
    // Standard calendar is Sunday=0. Let's list Sun, Mon, Tue, Wed, Thu, Fri, Sat
    return day;
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  // Check if date is Sunday
  const checkIsSunday = (dateStr: string) => {
    return new Date(dateStr).getDay() === 0;
  };

  // Get holiday on date
  const getHolidayOnDate = (dateStr: string) => {
    return state.holidays.find(h => h.date === dateStr);
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!holidayDate || !holidayName) {
      setFormError('Harap isi Tanggal Libur dan Deskripsi Libur!');
      return;
    }

    // Check unique date
    const exists = state.holidays.some(h => h.date === holidayDate);
    if (exists) {
      setFormError('Tanggal tersebut sudah diatur sebagai Hari Libur!');
      return;
    }

    const newHoliday: Holiday = {
      date: holidayDate,
      nama: holidayName.trim(),
      tipe: holidayType
    };

    onChange({
      ...state,
      holidays: [...state.holidays, newHoliday]
    });

    setHolidayName('');
    setFormError('');
  };

  const handleDeleteHoliday = (dateToDelete: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus hari libur ini? Seterusnya absensi dapat dicatat di tanggal ini.')) {
      onChange({
        ...state,
        holidays: state.holidays.filter(h => h.date !== dateToDelete)
      });
    }
  };

  // Render Days Grid
  const totalDays = daysInMonth(currentMonth, currentYear);
  const startDayOffset = firstDayOfMonth(currentMonth, currentYear);

  const daysArray: (string | null)[] = [];
  // Fill offset days
  for (let i = 0; i < startDayOffset; i++) {
    daysArray.push(null);
  }
  // Fill actual dates
  for (let day = 1; day <= totalDays; day++) {
    const monthStr = String(currentMonth + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    daysArray.push(`${currentYear}-${monthStr}-${dayStr}`);
  }

  // Filter list of holidays for selected month/year
  const monthHolidays = state.holidays.filter(h => {
    const d = new Date(h.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).sort((a,b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6" id="holiday-calendar-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="calendar-hdr">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Manajemen Kalender Akademik</h2>
        <p className="text-xs text-gray-400">Atur hari libur nasional, cuti bersama, dan libur tahunan sekolah. Hari Minggu otomatis diwarnai merah.</p>
      </div>

      {formError && (
        <div className="bg-red-50 text-red-700 text-xs py-2 px-3 rounded-lg border border-red-100 font-medium">
          {formError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar visualizer column */}
        <div className="lg:col-span-8 bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <CalendarDays className="h-4.5 w-4.5 text-blue-600" />
              Kalender Kehadiran: {INDONESIAN_MONTHS[currentMonth]} {currentYear}
            </h3>
            
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1 px-2 border border-gray-200 hover:bg-gray-50 rounded text-gray-500"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextMonth}
                className="p-1 px-2 border border-gray-200 hover:bg-gray-50 rounded text-gray-500"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Grid visual calendar */}
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
            {/* Week Headers */}
            <div className="p-2 bg-red-50 text-red-600 rounded">Minggu</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Senin</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Selasa</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Rabu</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Kamis</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Jumat</div>
            <div className="p-2 bg-gray-50 text-gray-600 rounded">Sabtu</div>

            {/* Days list */}
            {daysArray.map((dateStr, index) => {
              if (!dateStr) {
                return <div key={`empty-${index}`} className="p-3 bg-gray-50/20 text-transparent"></div>;
              }

              const d = new Date(dateStr);
              const dayNum = d.getDate();
              const isSunday = checkIsSunday(dateStr);
              const holiday = getHolidayOnDate(dateStr);

              // Colors based on characteristics
              let tileClass = 'bg-white text-gray-700 hover:bg-blue-50/40 border border-gray-100/70 ';
              if (isSunday) {
                tileClass = 'bg-red-50 text-red-600 border border-red-100 font-extrabold ';
              } else if (holiday) {
                if (holiday.tipe === 'nasional') {
                  tileClass = 'bg-rose-500 text-white font-extrabold shadow-xs ';
                } else if (holiday.tipe === 'cuti') {
                  tileClass = 'bg-amber-500 text-white font-extrabold shadow-xs ';
                } else {
                  tileClass = 'bg-blue-600 text-white font-extrabold shadow-xs ';
                }
              }

              return (
                <div
                  key={dateStr}
                  className={`p-3 min-h-[50px] relative rounded-lg flex flex-col items-center justify-between transition-colors group cursor-pointer ${tileClass}`}
                  title={`${dayNum} ${INDONESIAN_MONTHS[currentMonth]}, ${holiday ? `${holiday.nama} (${holiday.tipe})` : isSunday ? 'Hari Minggu' : 'Hari Aktif Sekolah'}`}
                >
                  <span className="text-xs">{dayNum}</span>
                  
                  {/* Small pointer markers */}
                  {holiday && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white block mt-1 animate-pulse"></span>
                  )}
                  {isSunday && !holiday && (
                    <span className="text-[9px] font-medium leading-none text-red-400 mt-1">Libur</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Color Legend */}
          <div className="flex flex-wrap gap-4 pt-3 border-t border-gray-100 text-[10.5px] text-gray-400 justify-center">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-red-50 text-red-600 flex items-center justify-center font-bold text-[9px] border border-red-200">M</span> Hari Minggu
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block"></span> Libur Nasional
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-amber-505 bg-amber-500 inline-block"></span> Cuti Bersama
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block"></span> Libur Sekolah
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-gray-500">
              <span className="w-3.5 h-3.5 rounded bg-white border border-gray-200 inline-block"></span> Hari Aktif Absensi
            </span>
          </div>
        </div>

        {/* Configurations input column (Admin actions list of holidays) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Add Holiday */}
          {state.currentUser?.role === 'admin' && (
            <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
              <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1">
                <Plus className="h-4 w-4 text-blue-600" />
                Tambah Hari Libur
              </h3>
              <form onSubmit={handleAddHoliday} className="space-y-3 text-xs font-semibold text-gray-600">
                <div>
                  <label className="block mb-1 text-gray-500">Tanggal Libur</label>
                  <input
                    type="date"
                    value={holidayDate}
                    onChange={e => setHolidayDate(e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-500">Keterangan / Nama Libur</label>
                  <input
                    type="text"
                    value={holidayName}
                    onChange={e => setHolidayName(e.target.value)}
                    placeholder="Contoh: Tahun Baru Hijriah"
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 text-gray-700"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-gray-500">Klasifikasi Tipe Libur</label>
                  <select
                    value={holidayType}
                    onChange={e => setHolidayType(e.target.value as 'nasional' | 'cuti' | 'sekolah')}
                    className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none focus:border-blue-500 text-gray-700 font-medium"
                  >
                    <option value="sekolah">Libur Semester Sekolah</option>
                    <option value="nasional">Libur Nasional</option>
                    <option value="cuti">Cuti Bersama Pemerintah</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
                >
                  Tambahkan ke Kalender
                </button>
              </form>
            </div>
          )}

          {/* List holidays for selected month */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-3">
            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-600 animate-pulse" />
              Daftar Libur Bulan Ini ({monthHolidays.length})
            </h3>

            {monthHolidays.length === 0 ? (
              <p className="text-center text-gray-400 py-6 text-xs font-medium">
                Belum ada hari libur di bulan {INDONESIAN_MONTHS[currentMonth]} {currentYear}.
              </p>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {monthHolidays.map(hol => {
                  const day = new Date(hol.date).getDate();
                  return (
                    <div
                      key={hol.date}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-[11px] leading-relaxed"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-extrabold text-blue-700">{day} {INDONESIAN_MONTHS[currentMonth]}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            hol.tipe === 'nasional' 
                              ? 'bg-rose-100 text-rose-700' 
                              : hol.tipe === 'cuti' 
                              ? 'bg-amber-100 text-amber-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {hol.tipe === 'nasional' ? 'Nasional' : hol.tipe === 'cuti' ? 'Cuti' : 'Sekolah'}
                          </span>
                        </div>
                        <p className="font-bold text-gray-700">{hol.nama}</p>
                      </div>

                      {state.currentUser?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteHoliday(hol.date)}
                          className="text-gray-400 hover:text-red-500 p-1 rounded"
                          title="Hapus Libur"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
