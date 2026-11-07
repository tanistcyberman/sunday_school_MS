import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../services/api';
import { AcademicTimeline } from '../../components/AcademicTimeline';
import { 
  GraduationCap, 
  BookOpen, 
  FileText, 
  Award, 
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const StudentDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, [user]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getDashboard(user?.studentId);
      setData(res);
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-slate-400 font-medium">
        Loading student dashboard...
      </div>
    );
  }

  const student = data?.student;
  const timeline = data?.timeline;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#1a2542] to-[#0f172a] border-2 border-gold-500/60 p-8 sm:p-10 text-white shadow-xl mb-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold-500/10 blur-3xl rounded-full pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold-500/20 text-gold-300 border border-gold-500/40">
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              Continuous Education Monitoring Dept
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              {t('student.dashboard.welcome', { name: i18n.language === 'am' ? (student?.fullNameAmharic || student?.fullName) : student?.fullName })}
            </h1>
            <p className="text-sm text-slate-300">
              {t('student.dashboard.gradeLevel', { grade: student?.gradeLevel })} • Code: {student?.studentCode}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/report-card"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-navy-950 font-bold text-sm shadow transition-all"
            >
              <Award className="w-4 h-4" />
              <span>{t('nav.myReportCard')}</span>
            </Link>

            <Link
              to="/student/materials"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800/90 hover:bg-navy-800 text-gold-400 border border-gold-500/40 font-bold text-sm shadow transition-all"
            >
              <FileText className="w-4 h-4 text-gold-400" />
              <span>{t('nav.myMaterials')}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-900">
            <BookOpen className="w-6 h-6 text-gold-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('student.dashboard.totalCourses')}</span>
            <div className="text-2xl font-black text-navy-900">{data?.courseCount || 4}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('student.dashboard.totalMaterials')}</span>
            <div className="text-2xl font-black text-navy-900">{data?.materialsCount || 0}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">{t('student.dashboard.averageScore')}</span>
            <div className="text-2xl font-black text-navy-900">
              {data?.averageScore !== null ? `${data.averageScore}%` : 'N/A'}
            </div>
          </div>
        </div>

      </div>

      {/* Academic Timeline Progress Bar */}
      {timeline && (
        <AcademicTimeline
          startDate={timeline.startDate}
          midExamDate={timeline.midExamDate}
          finalExamDate={timeline.finalExamDate}
          progressPercentage={timeline.progressPercentage}
          currentPhase={timeline.currentPhase}
        />
      )}
    </div>
  );
};
