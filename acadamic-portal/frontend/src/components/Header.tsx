import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Calendar, 
  UploadCloud, 
  FileSpreadsheet, 
  UserCheck, 
  BookOpen, 
  Download, 
  Award, 
  LogOut, 
  User,
  GraduationCap,
  Menu,
  X
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-[#0f172a] text-white border-b-2 border-[#d4af37] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Department Branding */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-navy-800 to-navy-900 border-2 border-gold-500/80 flex items-center justify-center p-2 shadow-inner group-hover:border-gold-400 transition-all shrink-0">
              {/* Church Motif Cross Icon in Gold */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-gold-500">
                <path d="M50 10 L50 90 M25 38 L75 38 M35 28 L65 28 M35 48 L65 48 M30 80 L70 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none"/>
                <circle cx="50" cy="38" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
                <circle cx="50" cy="16" r="4" fill="currentColor"/>
                <circle cx="20" cy="38" r="4" fill="currentColor"/>
                <circle cx="80" cy="38" r="4" fill="currentColor"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-xl tracking-tight text-white font-sans">
                  {t('app.title')}
                </span>
                {/* 4-10 bumper removed per user request */}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-light truncate max-w-[200px] sm:max-w-none">
                {t('app.subtitle')}
              </p>
            </div>
          </Link>

          {/* Right Action Bar (User Info, Language, Mobile Toggle) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-slate-700">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-100">
                    {i18n.language === 'am' ? (user.fullNameAmharic || user.fullName) : user.fullName}
                  </span>
                  <span className="text-xs text-gold-400 font-medium">
                    {role === 'ADMIN' ? t('nav.roleAdmin') : role === 'TEACHER' ? t('nav.roleTeacher') : t('nav.roleStudent')}
                  </span>
                </div>

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-navy-800 border border-gold-500/50 flex items-center justify-center text-gold-400 font-bold shadow">
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>

                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg bg-navy-800/80 hover:bg-red-950/60 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-colors"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>

                {/* Mobile Hamburger Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 rounded-lg bg-navy-800 md:hidden text-gold-400 border border-slate-700"
                  aria-label="Toggle Navigation"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-xs sm:text-sm shadow-md transition-all"
              >
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {user && mobileMenuOpen && (
          <nav className="md:hidden py-3 px-2 border-t border-slate-800 space-y-1">
            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/schedule"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/admin/schedule') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-gold-400" />
                  {t('nav.masterSchedule')}
                </Link>

                <Link
                  to="/admin/import"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/admin/import') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-gold-400" />
                  {t('nav.studentImport')}
                </Link>

                <Link
                  to="/admin/export"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/admin/export') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4 text-gold-400" />
                  {t('nav.gradeExport')}
                </Link>

                <Link
                  to="/admin/promotion"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/admin/promotion') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-gold-400" />
                  {t('nav.promotion')}
                </Link>
              </>
            )}

            {role === 'TEACHER' && (
              <>
                <Link
                  to="/teacher/gradebook"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/teacher/gradebook') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-gold-400" />
                  {t('nav.gradebook')}
                </Link>

                <Link
                  to="/teacher/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/teacher/materials') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <UploadCloud className="w-4 h-4 text-gold-400" />
                  {t('nav.materialUpload')}
                </Link>
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <Link
                  to="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/student/dashboard') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-gold-400" />
                  {t('nav.dashboard')}
                </Link>

                <Link
                  to="/student/materials"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/student/materials') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <Download className="w-4 h-4 text-gold-400" />
                  {t('nav.myMaterials')}
                </Link>

                <Link
                  to="/student/report-card"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-semibold ${
                    isActive('/student/report-card') ? 'bg-gold-500 text-navy-950 font-bold' : 'text-slate-300 hover:bg-navy-800'
                  }`}
                >
                  <Award className="w-4 h-4 text-gold-400" />
                  {t('nav.myReportCard')}
                </Link>
              </>
            )}
          </nav>
        )}

        {/* RBAC Navigation Tabs (Tablet / Desktop) */}
        {user && (
          <nav className="hidden md:flex items-center gap-2 overflow-x-auto pb-3 pt-1 text-sm border-t border-slate-800/80 no-scrollbar">
            {role === 'ADMIN' && (
              <>
                <Link
                  to="/admin/schedule"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/admin/schedule')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  {t('nav.masterSchedule')}
                </Link>

                <Link
                  to="/admin/import"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/admin/import')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  {t('nav.studentImport')}
                </Link>

                <Link
                  to="/admin/export"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/admin/export')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  {t('nav.gradeExport')}
                </Link>

                <Link
                  to="/admin/promotion"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/admin/promotion')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  {t('nav.promotion')}
                </Link>
              </>
            )}

            {role === 'TEACHER' && (
              <>
                <Link
                  to="/teacher/gradebook"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/teacher/gradebook')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  {t('nav.gradebook')}
                </Link>

                <Link
                  to="/teacher/materials"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/teacher/materials')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  {t('nav.materialUpload')}
                </Link>
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <Link
                  to="/student/dashboard"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/student/dashboard')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  {t('nav.dashboard')}
                </Link>

                <Link
                  to="/student/materials"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/student/materials')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <Download className="w-4 h-4" />
                  {t('nav.myMaterials')}
                </Link>

                <Link
                  to="/student/report-card"
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                    isActive('/student/report-card')
                      ? 'bg-gold-500 text-navy-950 shadow font-bold'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-gold-300'
                  }`}
                >
                  <Award className="w-4 h-4" />
                  {t('nav.myReportCard')}
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};
