import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const routeByRole = (role: string) => {
    if (role === 'ADMIN') navigate('/admin/schedule');
    else if (role === 'TEACHER') navigate('/teacher/gradebook');
    else if (role === 'STUDENT') navigate('/student/dashboard');
    else navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const loggedUser = await login({ username: username.trim(), password });
      routeByRole(loggedUser.role);
    } catch (err: any) {
      if (!err?.response) {
        setError('የሰርቨር ግንኙነት ችግር ተፈጥሯል፤ እባክዎ ሰርቨሩ መብራቱን ያረጋግጡ (Cannot connect to backend server. Please verify the server is running.)');
      } else {
        setError(err?.response?.data?.message || t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
    setLoading(true);
    try {
      const loggedUser = await login({ username: u, password: p });
      routeByRole(loggedUser.role);
    } catch (err: any) {
      if (!err?.response) {
        setError('የሰርቨር ግንኙነት ችግር ተፈጥሯል፤ እባክዎ ሰርቨሩ መብራቱን ያረጋግጡ (Cannot connect to backend server. Please verify the server is running.)');
      } else {
        setError(err?.response?.data?.message || t('auth.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-8 sm:py-12">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 relative overflow-hidden">
        
        {/* Top Gold Border */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-navy-900 via-gold-500 to-navy-900" />

        {/* Header with Church Cross Symbol */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 rounded-2xl bg-navy-900 border-2 border-gold-500/60 flex items-center justify-center mx-auto mb-4 shadow">
            <svg viewBox="0 0 100 100" className="w-10 h-10 text-gold-500">
              <path d="M50 10 L50 90 M25 38 L75 38 M35 28 L65 28 M35 48 L65 48 M30 80 L70 80" stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="none"/>
              <circle cx="50" cy="38" r="8" fill="none" stroke="currentColor" strokeWidth="4"/>
              <circle cx="50" cy="16" r="4" fill="currentColor"/>
              <circle cx="20" cy="38" r="4" fill="currentColor"/>
              <circle cx="80" cy="38" r="4" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900">
            {t('auth.loginTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {t('app.title')}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-navy-900" />
              {t('auth.username')}
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
              placeholder="e.g. admin, teacher, teacher2, student"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-navy-900" />
              {t('auth.password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-6 border border-gold-500/30"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin text-gold-400" />}
            <span>{loading ? t('auth.loggingIn') : t('auth.submit')}</span>
          </button>
        </form>

        {/* Quick Demo Test Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">
            {t('auth.testAccounts')}
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              className="p-2 rounded-xl bg-navy-50 hover:bg-navy-100 border border-navy-100 text-center transition-all group"
            >
              <span className="block text-xs font-bold text-navy-900">Admin</span>
              <span className="text-[10px] text-slate-400 font-mono">admin123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('teacher', 'teacher123')}
              className="p-2 rounded-xl bg-gold-50 hover:bg-gold-100 border border-gold-200 text-center transition-all group"
            >
              <span className="block text-xs font-bold text-gold-900">Teacher 1</span>
              <span className="text-[10px] text-slate-400 font-mono">teacher123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('teacher2', 'teacher123')}
              className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-center transition-all group"
            >
              <span className="block text-xs font-bold text-amber-900">Teacher 2</span>
              <span className="text-[10px] text-slate-400 font-mono">teacher123</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('student', 'student123')}
              className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-center transition-all group"
            >
              <span className="block text-xs font-bold text-emerald-900">Student</span>
              <span className="text-[10px] text-slate-400 font-mono">student123</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
