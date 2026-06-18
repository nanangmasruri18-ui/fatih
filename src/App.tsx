import React, { useState, useEffect } from 'react';
import { AppState, Teacher } from './types';
import { getInitialState, saveState } from './data';

// Import Icons
import { 
  School, 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  FileSpreadsheet, 
  CalendarDays, 
  CheckSquare, 
  BarChart3, 
  Download, 
  UserCog, 
  LogOut, 
  Menu, 
  X,
  User,
  Shield,
  Clock
} from 'lucide-react';

// Import Custom Views
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import TeacherManagementView from './components/TeacherManagementView';
import ClassManagementView from './components/ClassManagementView';
import StudentManagementView from './components/StudentManagementView';
import ImportExcelView from './components/ImportExcelView';
import HolidayCalendarView from './components/HolidayCalendarView';
import DailyAttendanceView from './components/DailyAttendanceView';
import RecapView from './components/RecapView';
import ExportExcelView from './components/ExportExcelView';
import AccountSettingsView from './components/AccountSettingsView';

export default function App() {
  const [appState, setAppState] = useState<AppState>(getInitialState);
  const [activeView, setActiveView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('6');

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Sync state changes with localStorage
  const handleStateChange = (newState: AppState) => {
    setAppState(newState);
    saveState(newState);
  };

  const handleLogin = (user: Teacher) => {
    handleStateChange({
      ...appState,
      currentUser: user
    });
    setActiveView('dashboard');
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  // Check if current user is admin
  const isAdmin = appState.currentUser?.role === 'admin';

  // Toggle navigation handler
  const handleMenuClick = (viewName: string, requiredAdmin: boolean = false) => {
    if (requiredAdmin && !isAdmin) {
      alert('Akses Dibatasi! Menu ini hanya dapat diakses oleh Akun Administrator Utama.');
      return;
    }
    setActiveView(viewName);
    setSidebarOpen(false);
  };

  if (!appState.currentUser) {
    return <LoginView state={appState} onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800" id="main-app-shell">
      {/* Mobile Navbar Header */}
      <header className="md:hidden bg-blue-700 text-white p-4 flex items-center justify-between shadow-md" id="mobile-top-bar">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 uppercase" />
          <div>
            <h1 className="text-sm font-black tracking-tight leading-none">SDN 005 Gelora</h1>
            <span className="text-[10px] text-blue-200">Presensi Portal</span>
          </div>
        </div>
        
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1 text-blue-100 hover:text-white"
          id="btn-toggle-drawer"
        >
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 z-40 w-64 bg-blue-900 text-white flex flex-col justify-between p-5 transform transition-transform md:translate-x-0 border-r border-blue-950 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        id="app-sidebar"
        style={{ minHeight: '100vh' }}
      >
        <div className="space-y-6">
          {/* Brand Logo Header */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-blue-950" id="sidebar-logo">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <School className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight leading-none">SDN 005 Gelora</h2>
              <span className="text-[10px] text-blue-400 font-bold">NPSN: 10405436</span>
            </div>
          </div>

          {/* Active profile badge */}
          <div className="bg-blue-950/60 p-3.5 rounded-xl border border-blue-800/20 space-y-1" id="profile-widget">
            <div className="flex items-center gap-2 text-xs">
              <Shield className={`w-3.5 h-3.5 ${isAdmin ? 'text-orange-400' : 'text-blue-400'}`} />
              <span className={`font-black ${isAdmin ? 'text-orange-400' : 'text-blue-400'}`}>
                {isAdmin ? 'ADMINISTRATOR' : 'GURU UTAMA'}
              </span>
            </div>
            <p className="text-xs font-bold text-white truncate max-w-[190px]">
              {appState.currentUser.nama}
            </p>
            <p className="text-[10px] text-blue-400 font-mono">
              NIP: {appState.currentUser.nip}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 text-xs font-bold" id="sidebar-nav">
            <button
              onClick={() => handleMenuClick('dashboard')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'dashboard' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0" />
              <span>Dashboard</span>
            </button>

            {/* Admin only or restricted alerts */}
            <button
              onClick={() => handleMenuClick('guru', true)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed ' : ''
              }${activeView === 'guru' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <Users className="h-4 w-4 shrink-0" />
                <span>Data Guru</span>
              </span>
              {!isAdmin && <span className="text-[9px] bg-blue-950/40 text-blue-400 px-1.5 py-0.2 rounded">Lck</span>}
            </button>

            <button
              onClick={() => handleMenuClick('kelas', true)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed ' : ''
              }${activeView === 'kelas' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span>Data Kelas</span>
              </span>
              {!isAdmin && <span className="text-[9px] bg-blue-950/40 text-blue-400 px-1.5 py-0.2 rounded">Lck</span>}
            </button>

            <button
              onClick={() => handleMenuClick('siswa', true)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed ' : ''
              }${activeView === 'siswa' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <GraduationCap className="h-4 w-4 shrink-0" />
                <span>Data Siswa</span>
              </span>
              {!isAdmin && <span className="text-[9px] bg-blue-950/40 text-blue-400 px-1.5 py-0.2 rounded">Lck</span>}
            </button>

            <button
              onClick={() => handleMenuClick('import', true)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                !isAdmin ? 'opacity-50 cursor-not-allowed ' : ''
              }${activeView === 'import' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'}`}
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet className="h-4 w-4 shrink-0" />
                <span>Import Excel</span>
              </span>
              {!isAdmin && <span className="text-[9px] bg-blue-950/40 text-blue-400 px-1.5 py-0.2 rounded">Lck</span>}
            </button>

            <button
              onClick={() => handleMenuClick('kalender')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'kalender' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>Kalender Libur</span>
            </button>

            <div className="border-t border-blue-950 my-2 pt-2"></div>

            <button
              onClick={() => handleMenuClick('absensi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'absensi' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <CheckSquare className="h-4 w-4 shrink-0" />
              <span>Absensi Harian</span>
            </button>

            <button
              onClick={() => handleMenuClick('rekapitulasi')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'rekapitulasi' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0" />
              <span>Rekapitulasi</span>
            </button>

            <button
              onClick={() => handleMenuClick('export')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'export' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <Download className="h-4 w-4 shrink-0" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => handleMenuClick('pengaturan')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeView === 'pengaturan' ? 'bg-blue-700 text-white shadow-inner' : 'text-blue-200 hover:bg-blue-800/50 hover:text-white'
              }`}
            >
              <UserCog className="h-4 w-4 shrink-0" />
              <span>Pengaturan Akun</span>
            </button>
          </nav>
        </div>

        {/* Logout widget */}
        <div className="pt-4 border-t border-blue-950">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-300 hover:bg-red-950/20 hover:text-white text-xs font-bold transition-all"
            id="btn-logout"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area Container */}
      <main className="grow flex flex-col min-w-0" id="main-content-area">
        {/* Top Header Bar (Desktop Only) */}
        <header className="hidden md:flex bg-white border-b border-gray-100 p-5 items-center justify-between sticky top-0 z-10 shadow-xs" id="desktop-top-header">
          <div className="flex items-center gap-2">
            <School className="text-blue-600 h-5 w-5" />
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">MUHAMMAD AL FATIH</p>
              <h2 className="text-xs font-black text-gray-700 -mt-0.5 font-sans">SDN 005 Gelora • NPSN 10405436</h2>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
            {/* Clock Indicator */}
            <div className="flex items-center gap-1 text-gray-400 font-mono bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Wednesday, 17 June 2026</span>
            </div>

            <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-1.5 rounded-lg border border-blue-100">
              <User className="h-3.5 w-3.5 text-blue-600" />
              <span className="font-extrabold text-blue-800">{appState.currentUser.nama}</span>
            </div>
          </div>
        </header>

        {/* Switch View Container */}
        <div className="p-4 md:p-6 grow" id="active-screen-renderer">
          {activeView === 'dashboard' && (
            <DashboardView
              state={appState}
              setView={setActiveView}
              setSelectedClassId={setSelectedClassId}
            />
          )}

          {activeView === 'guru' && (
            <TeacherManagementView
              state={appState}
              onChange={handleStateChange}
            />
          )}

          {activeView === 'kelas' && (
            <ClassManagementView
              state={appState}
              onChange={handleStateChange}
            />
          )}

          {activeView === 'siswa' && (
            <StudentManagementView
              state={appState}
              onChange={handleStateChange}
            />
          )}

          {activeView === 'import' && (
            <ImportExcelView
              state={appState}
              onChange={handleStateChange}
              setView={setActiveView}
            />
          )}

          {activeView === 'kalender' && (
            <HolidayCalendarView
              state={appState}
              onChange={handleStateChange}
            />
          )}

          {activeView === 'absensi' && (
            <DailyAttendanceView
              state={appState}
              onChange={handleStateChange}
              selectedClassId={selectedClassId}
              setSelectedClassId={setSelectedClassId}
            />
          )}

          {activeView === 'rekapitulasi' && (
            <RecapView
              state={appState}
            />
          )}

          {activeView === 'export' && (
            <ExportExcelView
              state={appState}
            />
          )}

          {activeView === 'pengaturan' && (
            <AccountSettingsView
              state={appState}
              onChange={handleStateChange}
            />
          )}
        </div>
      </main>

      {/* Custom React Logout Confirm Modal Overlay */}
      {showLogoutModal && (
        <div 
          className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all duration-300" 
          id="logout-confirm-overlay"
        >
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-100 relative transform scale-100 transition-all text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 border border-red-200">
              <LogOut className="h-6 w-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">Keluar dari Portal?</h3>
              <p className="text-xs text-gray-400 font-medium">
                Pekerjaan yang belum disinkronkan akan hilang. NIP dan kata sandi Anda diperlukan untuk masuk kembali.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="py-2.5 px-4 text-xs font-bold text-gray-505 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutModal(false);
                  handleStateChange({
                    ...appState,
                    currentUser: null
                  });
                  setActiveView('dashboard');
                }}
                className="py-2.5 px-4 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-xs"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
