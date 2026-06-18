export interface Teacher {
  nip: string; // NIP or NUPTK
  nama: string;
  jenisKelamin: 'L' | 'P';
  noHp: string;
  role: 'admin' | 'guru';
  password?: string; // Standard local auth pass
}

export interface ClassRoom {
  id: string; // "1", "2", "3", "4", "5", "6"
  nama: string; // e.g. "Kelas 1", "Kelas 2", etc.
  waliKelasNip: string; // NIP of teacher
}

export interface Student {
  nisn: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelasId: string; // e.g. "1" - "6"
  statusAktif: boolean;
}

export interface Holiday {
  date: string; // YYYY-MM-DD
  nama: string;
  tipe: 'nasional' | 'cuti' | 'sekolah';
}

export interface Attendance {
  date: string; // YYYY-MM-DD
  nisn: string;
  kelasId: string;
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alpha
  keterangan: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  currentUser: Teacher | null;
  teachers: Teacher[];
  classes: ClassRoom[];
  students: Student[];
  holidays: Holiday[];
  attendance: Attendance[];
}
