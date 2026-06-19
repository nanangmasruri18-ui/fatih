import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  writeBatch,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { customFirebaseConfig } from './firebaseConfig';
import { Teacher, ClassRoom, Student, Holiday, Attendance, AppState } from './types';
import { DEFAULT_TEACHERS, DEFAULT_CLASSES, DEFAULT_STUDENTS, DEFAULT_HOLIDAYS, DEFAULT_ATTENDANCES } from './data';

// Menentukan konfigurasi aktif: Utamakan custom config buatan pengguna
const activeConfig = customFirebaseConfig && customFirebaseConfig.projectId
  ? customFirebaseConfig
  : firebaseConfig;

// Initialize Firebase App
const app = initializeApp(activeConfig);
export const db = getFirestore(app);

/**
 * Seeds the database with default data if empty
 */
export async function seedDatabaseIfEmpty() {
  try {
    const teachersSnap = await getDocs(collection(db, 'teachers'));
    if (teachersSnap.empty) {
      console.log('Firebase Firestore is empty. Seeding defaults for SDN 005 Gelora...');
      const batch = writeBatch(db);

      // 1. Seed Teachers
      DEFAULT_TEACHERS.forEach(t => {
        const ref = doc(db, 'teachers', t.nip);
        batch.set(ref, t);
      });

      // 2. Seed Classes
      DEFAULT_CLASSES.forEach(c => {
        const ref = doc(db, 'classes', c.id);
        batch.set(ref, c);
      });

      // 3. Seed Students
      DEFAULT_STUDENTS.forEach(s => {
        const ref = doc(db, 'students', s.nisn);
        batch.set(ref, s);
      });

      // 4. Seed Holidays
      DEFAULT_HOLIDAYS.forEach(h => {
        const safeId = h.date.replace(/-/g, '_');
        const ref = doc(db, 'holidays', safeId);
        batch.set(ref, h);
      });

      // 5. Seed Attendances
      DEFAULT_ATTENDANCES.forEach(a => {
        const safeId = `${a.date.replace(/-/g, '_')}_${a.nisn}`;
        const ref = doc(db, 'attendance', safeId);
        batch.set(ref, a);
      });

      await batch.commit();
      console.log('Successfully completed seeding default data to Firestore!');
    } else {
      console.log('Firestore collections are already populated.');
    }
  } catch (error) {
    console.error('Error during Firestore database seeding:', error);
  }
}

/**
 * Incremental synchronization from State differences to Firestore
 */
export async function syncStateDifferenceToFirestore(oldState: AppState, newState: AppState) {
  try {
    const batch = writeBatch(db);
    let operationsCount = 0;

    // 1. Synchronize Teachers
    if (oldState.teachers !== newState.teachers) {
      // Added or modified
      newState.teachers.forEach(t => {
        const oldT = oldState.teachers.find(x => x.nip === t.nip);
        if (!oldT || JSON.stringify(oldT) !== JSON.stringify(t)) {
          const ref = doc(db, 'teachers', t.nip);
          batch.set(ref, t);
          operationsCount++;
        }
      });
      // Deleted
      oldState.teachers.forEach(t => {
        if (!newState.teachers.some(x => x.nip === t.nip)) {
          const ref = doc(db, 'teachers', t.nip);
          batch.delete(ref);
          operationsCount++;
        }
      });
    }

    // 2. Synchronize Classes
    if (oldState.classes !== newState.classes) {
      newState.classes.forEach(c => {
        const oldC = oldState.classes.find(x => x.id === c.id);
        if (!oldC || JSON.stringify(oldC) !== JSON.stringify(c)) {
          const ref = doc(db, 'classes', c.id);
          batch.set(ref, c);
          operationsCount++;
        }
      });
      oldState.classes.forEach(c => {
        if (!newState.classes.some(x => x.id === c.id)) {
          const ref = doc(db, 'classes', c.id);
          batch.delete(ref);
          operationsCount++;
        }
      });
    }

    // 3. Synchronize Students
    if (oldState.students !== newState.students) {
      newState.students.forEach(s => {
        const oldS = oldState.students.find(x => x.nisn === s.nisn);
        if (!oldS || JSON.stringify(oldS) !== JSON.stringify(s)) {
          const ref = doc(db, 'students', s.nisn);
          batch.set(ref, s);
          operationsCount++;
        }
      });
      oldState.students.forEach(s => {
        if (!newState.students.some(x => x.nisn === s.nisn)) {
          const ref = doc(db, 'students', s.nisn);
          batch.delete(ref);
          operationsCount++;
        }
      });
    }

    // 4. Synchronize Holidays
    if (oldState.holidays !== newState.holidays) {
      newState.holidays.forEach(h => {
        const oldH = oldState.holidays.find(x => x.date === h.date);
        if (!oldH || JSON.stringify(oldH) !== JSON.stringify(h)) {
          const safeId = h.date.replace(/-/g, '_');
          const ref = doc(db, 'holidays', safeId);
          batch.set(ref, h);
          operationsCount++;
        }
      });
      oldState.holidays.forEach(h => {
        if (!newState.holidays.some(x => x.date === h.date)) {
          const safeId = h.date.replace(/-/g, '_');
          const ref = doc(db, 'holidays', safeId);
          batch.delete(ref);
          operationsCount++;
        }
      });
    }

    // 5. Synchronize Attendance
    if (oldState.attendance !== newState.attendance) {
      newState.attendance.forEach(a => {
        const oldA = oldState.attendance.find(x => x.date === a.date && x.nisn === a.nisn);
        if (!oldA || JSON.stringify(oldA) !== JSON.stringify(a)) {
          const safeId = `${a.date.replace(/-/g, '_')}_${a.nisn}`;
          const ref = doc(db, 'attendance', safeId);
          batch.set(ref, a);
          operationsCount++;
        }
      });
      oldState.attendance.forEach(a => {
        if (!newState.attendance.some(x => x.date === a.date && x.nisn === a.nisn)) {
          const safeId = `${a.date.replace(/-/g, '_')}_${a.nisn}`;
          const ref = doc(db, 'attendance', safeId);
          batch.delete(ref);
          operationsCount++;
        }
      });
    }

    if (operationsCount > 0) {
      await batch.commit();
      console.log(`Successfully synced ${operationsCount} operations to Firestore.`);
    }
  } catch (error) {
    console.error('Error synchronizing local updates to Firestore:', error);
  }
}

/**
 * Sets up real-time onSnapshot listeners from Firestore collections to keep local state up to date
 */
export function setupRealtimeListeners(onUpdate: (updates: Partial<AppState>) => void) {
  const unsubscribers: (() => void)[] = [];

  // Listen to Teachers
  const unsubTeachers = onSnapshot(collection(db, 'teachers'), snap => {
    const list: Teacher[] = [];
    snap.forEach(doc => {
      list.push(doc.data() as Teacher);
    });
    // Sort teachers to maintain original consistency of displaying them
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    onUpdate({ teachers: list });
  }, err => {
    console.error('Error listening to teachers updates:', err);
  });
  unsubscribers.push(unsubTeachers);

  // Listen to Classes
  const unsubClasses = onSnapshot(collection(db, 'classes'), snap => {
    const list: ClassRoom[] = [];
    snap.forEach(doc => {
      list.push(doc.data() as ClassRoom);
    });
    list.sort((a, b) => a.id.localeCompare(b.id));
    onUpdate({ classes: list });
  }, err => {
    console.error('Error listening to classes updates:', err);
  });
  unsubscribers.push(unsubClasses);

  // Listen to Students
  const unsubStudents = onSnapshot(collection(db, 'students'), snap => {
    const list: Student[] = [];
    snap.forEach(doc => {
      list.push(doc.data() as Student);
    });
    list.sort((a, b) => a.nama.localeCompare(b.nama));
    onUpdate({ students: list });
  }, err => {
    console.error('Error listening to students updates:', err);
  });
  unsubscribers.push(unsubStudents);

  // Listen to Holidays
  const unsubHolidays = onSnapshot(collection(db, 'holidays'), snap => {
    const list: Holiday[] = [];
    snap.forEach(doc => {
      list.push(doc.data() as Holiday);
    });
    list.sort((a, b) => a.date.localeCompare(b.date));
    onUpdate({ holidays: list });
  }, err => {
    console.error('Error listening to holidays updates:', err);
  });
  unsubscribers.push(unsubHolidays);

  // Listen to Attendance
  const unsubAttendance = onSnapshot(collection(db, 'attendance'), snap => {
    const list: Attendance[] = [];
    snap.forEach(doc => {
      list.push(doc.data() as Attendance);
    });
    onUpdate({ attendance: list });
  }, err => {
    console.error('Error listening to attendance updates:', err);
  });
  unsubscribers.push(unsubAttendance);

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
}