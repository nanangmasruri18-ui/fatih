import React, { useState } from 'react';
import { AppState, Student } from '../types';
import { downloadStudentTemplate, parseStudentExcel } from '../utils/excelUtils';
import { Download, Upload, Check, AlertTriangle, FileSpreadsheet, Group, Users, PlusCircle } from 'lucide-react';

interface ImportExcelViewProps {
  state: AppState;
  onChange: (updatedState: AppState) => void;
  setView: (v: string) => void;
}

export default function ImportExcelView({ state, onChange, setView }: ImportExcelViewProps) {
  const [fileDetails, setFileDetails] = useState<{ name: string; size: number } | null>(null);
  const [parsedStudents, setParsedStudents] = useState<Student[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [isDragging, setIsDragging] = useState(false);

  // File loading helper
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    setSuccessMsg('');
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    // Check type
    if (!file.name.endsWith('.xlsx')) {
      setErrorMsg('Tipe file tidak didukung! Pastikan file berekstensi .xlsx (Excel).');
      return;
    }

    setFileDetails({ name: file.name, size: file.size });

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (data && data instanceof ArrayBuffer) {
          const students = parseStudentExcel(data);
          if (students.length === 0) {
            setErrorMsg('Tidak dapat membaca data siswa dari file. Pastikan struktur kolom sesuai contoh template.');
          } else {
            setParsedStudents(students);
          }
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Gagal memproses file Excel. Hubungi administrator.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setErrorMsg('');
    setSuccessMsg('');

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleImportSave = () => {
    if (parsedStudents.length === 0) return;

    // Merge or overwrite strategy: Let's insert new students based on non-duplicate NISN. 
    // If NISN is already there, overwrite their details (update class, name, jk etc.) so they don't break.
    const currentStudentsMap = new Map(state.students.map(s => [s.nisn, s]));
    
    parsedStudents.forEach(s => {
      currentStudentsMap.set(s.nisn, {
        nisn: s.nisn,
        nama: s.nama,
        jenisKelamin: s.jenisKelamin,
        kelasId: s.kelasId,
        statusAktif: s.statusAktif
      });
    });

    const mergedStudents = Array.from(currentStudentsMap.values());

    onChange({
      ...state,
      students: mergedStudents
    });

    setSuccessMsg(`Berhasil mengimpor ${parsedStudents.length} data siswa ke database!`);
    setParsedStudents([]);
    setFileDetails(null);
  };

  return (
    <div className="space-y-6" id="import-excel-view">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4" id="import-hdr">
        <div>
          <h2 className="text-xl font-bold text-gray-800 tracking-tight">Unggah / Impor Data Siswa</h2>
          <p className="text-xs text-gray-400">
            Daftarkan ratusan siswa terpadu secara kolektif dengan mengunggah tabel format Excel .xlsx.
          </p>
        </div>
        <button
          onClick={downloadStudentTemplate}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs px-4 py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all self-start md:self-auto"
          id="btn-download-template"
        >
          <Download className="h-4 w-4" />
          Unduh Template Excel
        </button>
      </div>

      {/* Alert Notices */}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 text-xs py-3 px-4 rounded-lg border border-red-100 font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 text-xs py-3 px-4 rounded-lg border border-emerald-100 font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Container Area */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-xs space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Petunjuk Impor Data</h3>
            <ol className="text-xs text-gray-500 list-decimal list-inside space-y-2 leading-relaxed">
              <li>Silakan unduh atau pakai <strong>Template Excel Resmi</strong> yang telah disediakan di kanan atas.</li>
              <li>Isi baris data anak didik Anda (kolom NISN wajib unik, jenis kelamin isi <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">L</code> / <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">P</code>, kelas diisi kode kelas paralel seperti <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">1A</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">1B</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-bold font-mono">2A</code>, dst).</li>
              <li>Seret & Jatuhkan file Excel (.xlsx) tersebut pada kotak penarik di bawah ini.</li>
              <li>Periksa ringkasan baris siswa hasil bacaan, lalu ketuk tombol <strong>Simpan Impor Data</strong>.</li>
            </ol>
          </div>

          {/* Dnd Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative ${
              isDragging
                ? 'border-blue-600 bg-blue-50/70'
                : 'border-gray-200 bg-white hover:border-blue-400 hover:bg-gray-50/30'
            }`}
            id="dropzone-area"
          >
            {/* Native input hidden overlay */}
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />

            <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-3">
              <FileSpreadsheet className="h-8 w-8" />
            </div>
            
            <p className="text-sm font-bold text-gray-700">Tarik & Letakkan File Excel Di Sini</p>
            <p className="text-xs text-gray-400 mt-1">Atau cari secara manual (Maksimal 10MB, berekstensi .xlsx)</p>
            
            {fileDetails && (
              <div className="mt-4 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5" />
                {fileDetails.name} ({(fileDetails.size / 1024).toFixed(1)} KB)
              </div>
            )}
          </div>
        </div>

        {/* Preview and Save Section */}
        <div className="lg:col-span-7">
          {parsedStudents.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-xs overflow-hidden flex flex-col max-h-[500px]" id="import-preview-box">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-blue-600" />
                    Preview Data Impor ({parsedStudents.length} Siswa)
                  </h3>
                  <p className="text-[11px] text-gray-400">Tinjau struktur data sebelum disimpan permanen ke database.</p>
                </div>
                <button
                  onClick={handleImportSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs"
                  id="btn-confirm-import"
                >
                  <PlusCircle className="h-4 w-4" />
                  Simpan Impor Data
                </button>
              </div>

              {/* Data Rows scrollable */}
              <div className="overflow-y-auto grow">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-blue-50/30 text-blue-900 border-b border-gray-100 font-bold sticky top-0">
                      <th className="p-3 w-12 text-center">No</th>
                      <th className="p-3">NISN</th>
                      <th className="p-3">Nama Siswa</th>
                      <th className="p-3">L/P</th>
                      <th className="p-3">Kelas Rombel</th>
                      <th className="p-3 text-center">Keaktifan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-600">
                    {parsedStudents.map((siswa, i) => (
                      <tr key={i} className="hover:bg-gray-50/50">
                        <td className="p-3 text-center font-bold text-gray-400">{i + 1}</td>
                        <td className="p-3 font-mono font-bold text-gray-800">{siswa.nisn}</td>
                        <td className="p-3 font-bold text-gray-800">{siswa.nama}</td>
                        <td className="p-3 font-semibold">{siswa.jenisKelamin === 'L' ? 'Laki-Laki (L)' : 'Perempuan (P)'}</td>
                        <td className="p-3">
                          <span className="font-bold text-blue-700 bg-blue-50/70 border border-blue-100 px-2 py-0.5 rounded text-[10.5px]">
                            Kelas {siswa.kelasId}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10.5px] font-bold ${siswa.statusAktif ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                            {siswa.statusAktif ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-gray-200/60 p-12 text-center flex flex-col items-center justify-center h-full min-h-[300px]" id="empty-preview-box">
              <FileSpreadsheet className="h-12 w-12 text-gray-300 mb-2" />
              <p className="text-sm font-bold text-gray-400">Pratinjau Data Kosong</p>
              <p className="text-xs text-gray-400 mt-1 max-w-sm leading-relaxed">
                Harap unggah berkas formulir Excel terlebih dahulu untuk menampilkan data konfirmasi siswa di sini.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
