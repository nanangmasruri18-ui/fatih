import { AppState, Teacher, ClassRoom, Student, Holiday, Attendance } from './types';

export const DEFAULT_TEACHERS: Teacher[] = [
  {
    nip: 'admin',
    nama: 'Administrator Utama',
    jenisKelamin: 'L',
    noHp: '081122334455',
    role: 'admin',
    password: 'admin' // Simple default login
  },
  {
    nip: '198203112009032001',
    nama: 'Budi Santoso, S.Pd.',
    jenisKelamin: 'L',
    noHp: '081234567891',
    role: 'guru',
    password: 'guru'
  },
  {
    nip: '198504122010041002',
    nama: 'Siti Aminah, S.Pd.SD',
    jenisKelamin: 'P',
    noHp: '081298765432',
    role: 'guru',
    password: 'guru'
  },
  {
    nip: '199008232015052003',
    nama: 'Ahmad Fauzi, M.Pd.',
    jenisKelamin: 'L',
    noHp: '081345678903',
    role: 'guru',
    password: 'guru'
  },
  {
    nip: '199412152020061004',
    nama: 'Dian Sastrowardoyo, S.Pd.',
    jenisKelamin: 'P',
    noHp: '081398765414',
    role: 'guru',
    password: 'guru'
  },
  {
    nip: '198801102012022005',
    nama: 'Eko Prasetyo, S.Pd.',
    jenisKelamin: 'L',
    noHp: '081456789015',
    role: 'guru',
    password: 'guru'
  },
  {
    nip: '199205182018031006',
    nama: 'Fitri Handayani, S.Pd.SD',
    jenisKelamin: 'P',
    noHp: '081498765426',
    role: 'guru',
    password: 'guru'
  }
];

export const DEFAULT_CLASSES: ClassRoom[] = [
  { id: '1A', nama: 'Kelas 1-A', waliKelasNip: '198504122010041002' },
  { id: '1B', nama: 'Kelas 1-B', waliKelasNip: '199008232015052003' },
  { id: '1C', nama: 'Kelas 1-C', waliKelasNip: '199412152020061004' },
  { id: '2A', nama: 'Kelas 2-A', waliKelasNip: '198203112009032001' },
  { id: '2B', nama: 'Kelas 2-B', waliKelasNip: '198801102012022005' },
  { id: '2C', nama: 'Kelas 2-C', waliKelasNip: '199205182018031006' },
  { id: '3A', nama: 'Kelas 3-A', waliKelasNip: '198504122010041002' },
  { id: '3B', nama: 'Kelas 3-B', waliKelasNip: '199008232015052003' },
  { id: '4A', nama: 'Kelas 4-A', waliKelasNip: '199412152020061004' },
  { id: '4B', nama: 'Kelas 4-B', waliKelasNip: '198203112009032001' },
  { id: '5A', nama: 'Kelas 5-A', waliKelasNip: '198801102012022005' },
  { id: '5B', nama: 'Kelas 5-B', waliKelasNip: '199205182018031006' },
  { id: '6A', nama: 'Kelas 6-A', waliKelasNip: '199205182018031006' },
  { id: '6B', nama: 'Kelas 6-B', waliKelasNip: '198203112009032001' }
];

export const DEFAULT_STUDENTS: Student[] = [
  // Kelas 1-A
  { nisn: '0123450001', nama: 'Andi Wijaya', jenisKelamin: 'L', kelasId: '1A', statusAktif: true },
  { nisn: '0123450002', nama: 'Bella Saputra', jenisKelamin: 'P', kelasId: '1A', statusAktif: true },
  { nisn: '0123450021', nama: 'Cika Olivia', jenisKelamin: 'P', kelasId: '1A', statusAktif: true },
  
  // Kelas 2-A
  { nisn: '0123450003', nama: 'Candra Kirana', jenisKelamin: 'L', kelasId: '2A', statusAktif: true },
  { nisn: '0123450004', nama: 'Dewi Lestari', jenisKelamin: 'P', kelasId: '2A', statusAktif: true },
  { nisn: '0123450022', nama: 'Doni Pratama', jenisKelamin: 'L', kelasId: '2A', statusAktif: true },

  // Kelas 3-A
  { nisn: '0123450005', nama: 'Edo Pratama', jenisKelamin: 'L', kelasId: '3A', statusAktif: true },
  { nisn: '0123450006', nama: 'Farida Amelia', jenisKelamin: 'P', kelasId: '3A', statusAktif: true },
  { nisn: '0123450023', nama: 'Fajar Shiddiq', jenisKelamin: 'L', kelasId: '3A', statusAktif: true },

  // Kelas 4-A
  { nisn: '0123450007', nama: 'Guntur Wibowo', jenisKelamin: 'L', kelasId: '4A', statusAktif: true },
  { nisn: '0123450008', nama: 'Hany Safitri', jenisKelamin: 'P', kelasId: '4A', statusAktif: true },
  { nisn: '0123450024', nama: 'Gilang Ramadhan', jenisKelamin: 'L', kelasId: '4A', statusAktif: true },

  // Kelas 5-A
  { nisn: '0123450009', nama: 'Indra Lesmana', jenisKelamin: 'L', kelasId: '5A', statusAktif: true },
  { nisn: '0123450010', nama: 'Julia Perez', jenisKelamin: 'P', kelasId: '5A', statusAktif: true },
  { nisn: '0123450025', nama: 'Iwan Fals', jenisKelamin: 'L', kelasId: '5A', statusAktif: true },

  // Kelas 6-A
  { nisn: '0123450011', nama: 'Kiki Amalia', jenisKelamin: 'P', kelasId: '6A', statusAktif: true },
  { nisn: '0123450012', nama: 'Lukman Hakim', jenisKelamin: 'L', kelasId: '6A', statusAktif: true },
  { nisn: '0123450013', nama: 'Maman Suherman', jenisKelamin: 'L', kelasId: '6A', statusAktif: true },
  { nisn: '0123450026', nama: 'Nadia Saphira', jenisKelamin: 'P', kelasId: '6A', statusAktif: true }
];

export const DEFAULT_HOLIDAYS: Holiday[] = [
  { date: '2026-01-01', nama: 'Tahun Baru Masehi', tipe: 'nasional' },
  { date: '2026-01-29', nama: 'Tahun Baru Imlek 2577 Kongzili', tipe: 'nasional' },
  { date: '2026-02-17', nama: 'Isra Mi\'raj Nabi Muhammad SAW', tipe: 'nasional' },
  { date: '2026-03-19', nama: 'Hari Suci Nyepi (Tahun Baru Saka 1948)', tipe: 'nasional' },
  { date: '2026-04-03', nama: 'Wafat Yesus Kristus', tipe: 'nasional' },
  { date: '2026-04-05', nama: 'Hari Paskah', tipe: 'nasional' },
  { date: '2026-05-01', nama: 'Hari Buruh Internasional', tipe: 'nasional' },
  { date: '2026-05-14', nama: 'Kenaikan Yesus Kristus', tipe: 'nasional' },
  { date: '2026-05-20', nama: 'Hari Raya Idul Fitri 1447 H', tipe: 'nasional' },
  { date: '2026-05-21', nama: 'Cuti Bersama Idul Fitri', tipe: 'cuti' },
  { date: '2026-06-01', nama: 'Hari Lahir Pancasila', tipe: 'nasional' },
  { date: '2026-08-17', nama: 'Hari Kemerdekaan RI', tipe: 'nasional' },
  { date: '2026-11-27', nama: 'Hari Raya Idul Adha 1447 H', tipe: 'nasional' },
  { date: '2026-12-25', nama: 'Hari Raya Natal', tipe: 'nasional' },
  
  // School Holidays around current date: 2026-06-17
  { date: '2026-06-18', nama: 'Persiapan Pembagian Rapor', tipe: 'sekolah' },
  { date: '2026-06-19', nama: 'Rapat Kerja Guru Semester', tipe: 'sekolah' },
  { date: '2026-06-25', nama: 'Libur Akhir Semester Genap', tipe: 'sekolah' },
  { date: '2026-06-26', nama: 'Libur Akhir Semester Genap', tipe: 'sekolah' },
  { date: '2026-06-27', nama: 'Libur Akhir Semester Genap', tipe: 'sekolah' }
];

export const DEFAULT_ATTENDANCES: Attendance[] = [
  // June 15, 2026 (Monday)
  { date: '2026-06-15', nisn: '0123450001', kelasId: '1A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450002', kelasId: '1A', status: 'S', keterangan: 'Kram perut', createdAt: '2026-06-15T07:31:00Z', updatedAt: '2026-06-15T07:31:00Z' },
  { date: '2026-06-15', nisn: '0123450021', kelasId: '1A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:31:00Z', updatedAt: '2026-06-15T07:31:00Z' },
  
  { date: '2026-06-15', nisn: '0123450003', kelasId: '2A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450004', kelasId: '2A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450022', kelasId: '2A', status: 'I', keterangan: 'Kondangan keluarga', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },

  { date: '2026-06-15', nisn: '0123450005', kelasId: '3A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450006', kelasId: '3A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450023', kelasId: '3A', status: 'A', keterangan: 'Tanpa alasan', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },

  { date: '2026-06-15', nisn: '0123450007', kelasId: '4A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450008', kelasId: '4A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },
  { date: '2026-06-15', nisn: '0123450024', kelasId: '4A', status: 'H', keterangan: '', createdAt: '2026-06-15T07:30:00Z', updatedAt: '2026-06-15T07:30:00Z' },

  // June 16, 2026 (Tuesday)
  { date: '2026-06-16', nisn: '0123450001', kelasId: '1A', status: 'H', keterangan: '', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },
  { date: '2026-06-16', nisn: '0123450002', kelasId: '1A', status: 'H', keterangan: '', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },
  { date: '2026-06-16', nisn: '0123450021', kelasId: '1A', status: 'H', keterangan: '', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },

  { date: '2026-06-16', nisn: '0123450003', kelasId: '2A', status: 'H', keterangan: '', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },
  { date: '2026-06-16', nisn: '0123450004', kelasId: '2A', status: 'S', keterangan: 'Demam tinggi', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },
  { date: '2026-06-16', nisn: '0123450022', kelasId: '2A', status: 'H', keterangan: '', createdAt: '2026-06-16T07:30:00Z', updatedAt: '2026-06-16T07:30:00Z' },

  // June 17, 2026 (Wednesday - let's add partial entries for today)
  { date: '2026-06-17', nisn: '0123450011', kelasId: '6A', status: 'H', keterangan: '', createdAt: '2026-06-17T07:30:00Z', updatedAt: '2026-06-17T07:30:00Z' },
  { date: '2026-06-17', nisn: '0123450012', kelasId: '6A', status: 'H', keterangan: '', createdAt: '2026-06-17T07:30:00Z', updatedAt: '2026-06-17T07:30:00Z' },
  { date: '2026-06-17', nisn: '0123450013', kelasId: '6A', status: 'H', keterangan: '', createdAt: '2026-06-17T07:30:00Z', updatedAt: '2026-06-17T07:30:00Z' },
  { date: '2026-06-17', nisn: '0123450026', kelasId: '6A', status: 'I', keterangan: 'Lomba renang', createdAt: '2026-06-17T07:30:00Z', updatedAt: '2026-06-17T07:30:00Z' }
];

const LOCAL_STORAGE_KEY = 'sdn005_gelora_absensi_state';

export function getInitialState(): AppState {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) {
    try {
      const parsed = JSON.parse(data);
      
      // Auto-migrate or clean if there are older single-number classroom IDs (e.g., '1', '2', '6')
      const hasOldClassroomIds = parsed.classes && parsed.classes.some((c: any) => c.id === '1' || c.id === '2' || c.id === '6');
      
      if (hasOldClassroomIds) {
        console.log('Upgrading old class list data to parallel classrooms defaults...');
        const upgradedState: AppState = {
          currentUser: parsed.currentUser || null,
          teachers: parsed.teachers || DEFAULT_TEACHERS,
          classes: DEFAULT_CLASSES,
          students: DEFAULT_STUDENTS,
          holidays: parsed.holidays || DEFAULT_HOLIDAYS,
          attendance: DEFAULT_ATTENDANCES,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(upgradedState));
        return upgradedState;
      }

      return {
        currentUser: parsed.currentUser || null,
        teachers: parsed.teachers || DEFAULT_TEACHERS,
        classes: parsed.classes || DEFAULT_CLASSES,
        students: parsed.students || DEFAULT_STUDENTS,
        holidays: parsed.holidays || DEFAULT_HOLIDAYS,
        attendance: parsed.attendance || DEFAULT_ATTENDANCES,
      };
    } catch (e) {
      console.error('Error parsing local storage state, using defaults', e);
    }
  }

  const defaultState: AppState = {
    currentUser: null,
    teachers: DEFAULT_TEACHERS,
    classes: DEFAULT_CLASSES,
    students: DEFAULT_STUDENTS,
    holidays: DEFAULT_HOLIDAYS,
    attendance: DEFAULT_ATTENDANCES,
  };
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}

export function saveState(state: AppState) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}
