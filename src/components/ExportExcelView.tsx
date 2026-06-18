import React, { useState } from 'react';
import { AppState } from '../types';
import { exportAttendanceReport } from '../utils/excelUtils';
import { FileSpreadsheet, Download, Info, CheckCircle, School } from 'lucide-react';

interface ExportExcelViewProps {
  state: AppState;
}

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function ExportExcelView({ state }: ExportExcelViewProps) {
  const [selectedClass, setSelectedClass] = useState('Semua');
  const [exportMonth, setExportMonth] = useState(5); // June is 5 (0-indexed)
  const [exportYear, setExportYear] = useState(2026);
  const [downloadsLogged, setDownloadsLogged] = useState<string[]>([]);

  const handleExport = () => {
    try {
      const schoolName = 'SDN 005 Gelora';
      const npsn = '10405436';

      exportAttendanceReport(
        schoolName,
        npsn,
        exportMonth + 1, // Convert back to 1-12 range
        exportYear,
        selectedClass,
        state.students,
        state.attendance
      );

      // Log successful generation
      const ts = new Date().toLocaleTimeString('id-ID');
      const label = `Rekap Kelas ${selectedClass}, Bulan ${INDONESIAN_MONTHS[exportMonth]} ${exportYear} (${ts})`;
      setDownloadsLogged(prev => [label, ...prev]);

    } catch (err) {
      console.error(err);
      alert('Gagal menghasilkan berkas unduhan Excel.');
    }
  };

  return (
    <div className="space-y-6" id="export-excel-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs" id="export-excel-hdr">
        <h2 className="text-xl font-bold text-gray-800 tracking-tight">Unduh Laporan Format Excel (.xlsx)</h2>
        <p className="text-xs text-gray-400">Ekspor laporan rekapitulasi presensi bulanan siswa SDN 005 Gelora ke format spreadsheet Microsoft Excel.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Export settings form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-gray-100 shadow-xs space-y-4">
          <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5 border-b border-gray-50 pb-2.5">
            <School className="w-4 h-4 text-blue-600" />
            Parameter Laporan Sekolah
          </h3>

          <div className="text-xs font-semibold text-gray-600 space-y-4">
            <div>
              <label className="block text-gray-500 mb-1">Pilih Kelas / Rombel</label>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-sm font-bold text-gray-700"
              >
                <option value="Semua">Semua Rombel Terdaftar</option>
                {state.classes.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nama} (Wali: {state.teachers.find(t => t.nip === c.waliKelasNip)?.nama || 'Belum diatur'})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Pilih Bulan Rekap</label>
                <select
                  value={exportMonth}
                  onChange={e => setExportMonth(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-xs font-bold text-gray-700"
                >
                  {INDONESIAN_MONTHS.map((m, idx) => (
                    <option key={m} value={idx}>{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-500 mb-1 font-semibold">Pilih Tahun</label>
                <select
                  value={exportYear}
                  onChange={e => setExportYear(Number(e.target.value))}
                  className="w-full bg-white border border-gray-200 rounded-lg p-2.5 outline-none focus:border-blue-500 text-xs font-bold text-gray-700"
                >
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 text-xs leading-relaxed border border-blue-100 font-medium font-sans">
              <Info className="h-4 w-4 shrink-0 text-blue-600 animate-pulse" />
              <div>
                <p className="font-bold">Informasi Header Sekolah</p>
                <p className="mt-0.5 text-blue-700 font-semibold">
                  Nama: <strong>SDN 005 Gelora</strong><br />
                  NPSN: <strong>10405436</strong><br />
                  Bulan: <strong>{INDONESIAN_MONTHS[exportMonth]} {exportYear}</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleExport}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 font-bold transition-all shadow-xs"
            >
              <Download className="w-4.5 h-4.5" />
              Unduh File Excel Sekarang
            </button>
          </div>
        </div>

        {/* Downloads list log history */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-100 shadow-xs flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Riwayat Aktivitas Ekspor</h3>
            <p className="text-xs text-gray-400">Daftar laporan rekapitulasi bulanan yang telah berhasil diproses and diunduh pada sesi ini.</p>

            {downloadsLogged.length === 0 ? (
              <div className="bg-gray-50/50 p-8 rounded-xl border border-gray-150 text-center text-gray-400 text-xs py-12" id="export-list-empty">
                <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                Belum ada berkas yang diunduh pada sesi aktif saat ini.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {downloadsLogged.map((log, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2.5 p-3 rounded-lg border border-gray-100 text-xs bg-emerald-50/20 text-emerald-800 font-semibold"
                  >
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4 text-[10.5px] text-gray-400 leading-relaxed font-sans">
            <p><strong>Note:</strong> Berkas akan otomatis berekstensi <code className="bg-gray-100 px-1 py-0.5 rounded font-mono font-bold">.xlsx</code> dan dapat langsung dibuka menggunakan Microsoft Excel, Google Sheets, atau aplikasi sejenis.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
