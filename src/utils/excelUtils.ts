import * as XLSX from 'xlsx';
import { Student, Attendance } from '../types';

/**
 * Downloads a sample student template Excel spreadsheet
 */
export function downloadStudentTemplate() {
  const headers = [
    {
      NISN: '0123456789',
      'Nama Siswa': 'Andi Pratama',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas (1-6)': '1',
      'Status (Aktif/Tidak Aktif)': 'Aktif',
    },
    {
      NISN: '0123456790',
      'Nama Siswa': 'Siti Rahma',
      'Jenis Kelamin (L/P)': 'P',
      'Kelas (1-6)': '1',
      'Status (Aktif/Tidak Aktif)': 'Aktif',
    },
    {
      NISN: '0123456791',
      'Nama Siswa': 'Budi Santoso',
      'Jenis Kelamin (L/P)': 'L',
      'Kelas (1-6)': '2',
      'Status (Aktif/Tidak Aktif)': 'Aktif',
    }
  ];

  const worksheet = XLSX.utils.json_to_sheet(headers);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template Siswa');

  // Adjust column widths
  worksheet['!cols'] = [
    { wch: 15 }, // NISN
    { wch: 25 }, // Nama Siswa
    { wch: 20 }, // Jenis Kelamin
    { wch: 15 }, // Kelas
    { wch: 25 }, // Status
  ];

  XLSX.writeFile(workbook, 'template_siswa_sdn005.xlsx');
}

/**
 * Parses uploaded Excel file into Student object array
 */
export function parseStudentExcel(fileBuffer: ArrayBuffer): Student[] {
  const workbook = XLSX.read(fileBuffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const rawData = XLSX.utils.sheet_to_json(worksheet) as any[];

  return rawData.map((row, index) => {
    // Find key names regardless of minor typos/whitespace
    const nisn = String(row['NISN'] || row['nisn'] || '').trim();
    const nama = String(row['Nama Siswa'] || row['Nama'] || row['nama_siswa'] || `Siswa Baru ${index + 1}`).trim();
    
    let jkRaw = String(row['Jenis Kelamin (L/P)'] || row['Jenis Kelamin'] || row['jk'] || 'L').trim().toUpperCase();
    const jenisKelamin: 'L' | 'P' = jkRaw.startsWith('P') ? 'P' : 'L';

    let kelasId = String(row['Kelas (1-6)'] || row['Kelas'] || row['kelas'] || '1').trim();
    // sanitize class to "1" to "6"
    if (!['1', '2', '3', '4', '5', '6'].includes(kelasId)) {
      kelasId = '1';
    }

    const statusRaw = String(row['Status (Aktif/Tidak Aktif)'] || row['Status'] || row['status'] || 'Aktif').trim().toLowerCase();
    const statusAktif = statusRaw.includes('tidak') || statusRaw === 'inactive' ? false : true;

    return {
      nisn,
      nama,
      jenisKelamin,
      kelasId,
      statusAktif,
    };
  }).filter(s => s.nisn !== '');
}

/**
 * Brand names for Indonesian months
 */
const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Export customized attendance report Excel sheet
 */
export function exportAttendanceReport(
  schoolName: string,
  npsn: string,
  month: number, // 1-12
  year: number,
  className: string,
  students: Student[],
  attendance: Attendance[]
) {
  // Filter students for the class
  const classStudents = students.filter(s => s.kelasId === className || className === 'Semua');

  // Create document header structure
  const rows: any[] = [];
  rows.push(['REKAPITULASI ABSENSI SISWA']);
  rows.push(['Nama Sekolah:', schoolName]);
  rows.push(['NPSN:', npsn]);
  rows.push(['Bulan/Tahun:', `${BULAN_NAMES[month - 1]} ${year}`]);
  rows.push(['Kelas:', className === 'Semua' ? 'Semua Kelas (1-6)' : `Kelas ${className}`]);
  rows.push([]); // Empty spacing

  // Table Headers
  rows.push([
    'No',
    'NISN',
    'Nama Siswa',
    'L/P',
    'Kelas',
    'Hadir (H)',
    'Sakit (S)',
    'Izin (I)',
    'Alpha (A)',
    'Total Hari Sekolah',
    'Persentase Kehadiran'
  ]);

  // Fill raw rows
  classStudents.forEach((student, index) => {
    const studentAtt = attendance.filter(
      a => a.nisn === student.nisn &&
      new Date(a.date).getMonth() + 1 === month &&
      new Date(a.date).getFullYear() === year
    );

    const hadir = studentAtt.filter(a => a.status === 'H').length;
    const sakit = studentAtt.filter(a => a.status === 'S').length;
    const izin = studentAtt.filter(a => a.status === 'I').length;
    const alpha = studentAtt.filter(a => a.status === 'A').length;

    const total = hadir + sakit + izin + alpha;
    const rate = total > 0 ? `${Math.round((hadir / total) * 100)}%` : '0%';

    rows.push([
      index + 1,
      student.nisn,
      student.nama,
      student.jenisKelamin,
      `Kelas ${student.kelasId}`,
      hadir,
      sakit,
      izin,
      alpha,
      total,
      rate
    ]);
  });

  // Create sheet
  const worksheet = XLSX.utils.aoa_to_sheet(rows);

  // Styling merges
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 10 } } // title merge
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Absensi');

  // Let's optimize column widths
  worksheet['!cols'] = [
    { wch: 5 },  // No
    { wch: 15 }, // NISN
    { wch: 25 }, // Nama Siswa
    { wch: 8 },  // L/P
    { wch: 12 }, // Kelas
    { wch: 12 }, // H
    { wch: 12 }, // S
    { wch: 12 }, // I
    { wch: 12 }, // A
    { wch: 18 }, // Total
    { wch: 20 }  // Rate
  ];

  const filename = `rekap_absensi_sdn005_kelas_${className}_bulan_${month}_${year}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
