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
      'Kode Kelas Rombel (Misal: 1A, 1B, 1C, 2A, dst)': '1A',
      'Status (Aktif/Tidak Aktif)': 'Aktif',
    },
    {
      NISN: '0123456790',
      'Nama Siswa': 'Siti Rahma',
      'Jenis Kelamin (L/P)': 'P',
      'Kode Kelas Rombel (Misal: 1A, 1B, 1C, 2A, dst)': '1A',
      'Status (Aktif/Tidak Aktif)': 'Aktif',
    },
    {
      NISN: '0123456791',
      'Nama Siswa': 'Budi Santoso',
      'Jenis Kelamin (L/P)': 'L',
      'Kode Kelas Rombel (Misal: 1A, 1B, 1C, 2A, dst)': '2A',
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
    { wch: 45 }, // Kode Kelas Rombel
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

    let kelasId = String(
      row['Kode Kelas Rombel (Misal: 1A, 1B, 1C, 2A, dst)'] ||
      row['Kelas (1-6)'] ||
      row['Kelas'] ||
      row['kelas'] ||
      '1A'
    ).trim().toUpperCase();

    // Map legacy or single digit numeric strings to standard parallel codes
    if (kelasId === '1') kelasId = '1A';
    else if (kelasId === '2') kelasId = '2A';
    else if (kelasId === '3') kelasId = '3A';
    else if (kelasId === '4') kelasId = '4A';
    else if (kelasId === '5') kelasId = '5A';
    else if (kelasId === '6') kelasId = '6A';

    const validClassIds = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
    if (!validClassIds.includes(kelasId)) {
      const matched = validClassIds.find(cls => kelasId.includes(cls));
      if (matched) {
        kelasId = matched;
      } else {
        kelasId = '1A';
      }
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

/**
 * Export customized semester attendance report Excel sheet
 */
export function exportSemesterAttendanceReport(
  schoolName: string,
  npsn: string,
  semester: 'ganjil' | 'genap',
  year: number,
  className: string,
  students: Student[],
  attendance: Attendance[]
) {
  // Filter students for the class
  const classStudents = students.filter(s => s.kelasId === className || className === 'Semua');

  // Create document header structure
  const rows: any[] = [];
  rows.push(['REKAPITULASI ABSENSI SEMESTER SISWA']);
  rows.push(['Nama Sekolah:', schoolName]);
  rows.push(['NPSN:', npsn]);
  rows.push(['Semester:', semester === 'ganjil' ? 'GANJIL (JULI - DESEMBER)' : 'GENAP (JANUARI - JUNI)']);
  rows.push(['Tahun:', year]);
  rows.push(['Kelas:', className === 'Semua' ? 'Semua Kelas' : `Kelas ${className}`]);
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

  // Fill data
  classStudents.forEach((student, index) => {
    const studentAtt = attendance.filter(a => {
      if (a.nisn !== student.nisn) return false;
      const d = new Date(a.date);
      if (d.getFullYear() !== year) return false;
      const m = d.getMonth(); // 0-11
      if (semester === 'ganjil') {
        return m >= 6 && m <= 11; // July - Dec
      } else {
        return m >= 0 && m <= 5; // Jan - Jun
      }
    });

    const hadir = studentAtt.filter(a => a.status === 'H').length;
    const sakit = studentAtt.filter(a => a.status === 'S').length;
    const izin = studentAtt.filter(a => a.status === 'I').length;
    const alpha = studentAtt.filter(a => a.status === 'A').length;

    const total = hadir + sakit + izin + alpha;
    const rate = total > 0 ? `${Math.round((hadir / total) * 100)}%` : '100%';

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
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekap Semester');

  // Set column widths
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

  const filename = `rekap_semester_sdn005_kelas_${className}_semester_${semester}_${year}.xlsx`;
  XLSX.writeFile(workbook, filename);
}
