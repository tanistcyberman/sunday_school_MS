import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Printer, 
  BookOpen, 
  FileCheck
} from 'lucide-react';

export const GradeReportCard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadReport();
  }, [user]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getReportCard(user?.studentId);
      setReport(res);
    } catch (err) {
      console.error('Error loading report card', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center text-slate-400 font-medium">
        Loading official grade report card...
      </div>
    );
  }

  const student = report?.student;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <Award className="w-8 h-8 text-gold-500" />
            {t('student.reportCard.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t('student.reportCard.subtitle')}
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 self-start sm:self-auto px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-gold-500 text-navy-900 font-bold text-sm shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-gold-600" />
          <span>Print / Save PDF</span>
        </button>
      </div>

      {/* Official Certificate Style Report Card Container */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-md p-6 sm:p-10 relative overflow-hidden">
        
        {/* Top Gold Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-navy-900 via-gold-500 to-navy-900" />

        {/* Institution Header */}
        <div className="text-center pb-6 border-b border-slate-200 mb-8">
          <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-400 flex items-center justify-center mx-auto mb-3 shadow">
            <svg viewBox="0 0 24 24" className="w-7 h-7 fill-none stroke-current" strokeWidth="2">
              <path d="M12 2v20M7 7h10M8 12h8M6 18h12" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-navy-900 tracking-wide uppercase">
            {t('app.title')}
          </h2>
          <p className="text-xs text-gold-600 font-bold uppercase tracking-widest mt-1">
            Continuous Education Monitoring Department
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {t('student.reportCard.academicYear', { year: report?.academicYear || '2026 E.C.' })}
          </p>
        </div>

        {/* Student Profile Info Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 mb-8 text-xs">
          <div>
            <span className="text-slate-400 font-medium block">Full Name:</span>
            <span className="font-extrabold text-navy-900 text-sm">
              {i18n.language === 'am' ? (student?.fullNameAmharic || student?.fullName) : student?.fullName}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Student ID:</span>
            <span className="font-mono font-bold text-navy-900 text-sm">{student?.studentCode}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Grade Level:</span>
            <span className="font-bold text-navy-900 text-sm">{student?.gradeLevel}ኛ ክፍል</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium block">Academic Status:</span>
            <span className="font-bold text-emerald-700 text-sm">{student?.status}</span>
          </div>
        </div>

        {/* Read-only Exam Results Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#0f172a] text-slate-100 text-xs uppercase font-bold border-b border-navy-800">
              <tr>
                <th className="px-5 py-3.5">#</th>
                <th className="px-5 py-3.5">{t('student.reportCard.colCourse')}</th>
                <th className="px-5 py-3.5 text-center">{t('student.reportCard.colMid')}</th>
                <th className="px-5 py-3.5 text-center">{t('student.reportCard.colFinal')}</th>
                <th className="px-5 py-3.5 text-center">{t('student.reportCard.colTotal')}</th>
                <th className="px-5 py-3.5 text-center">{t('student.reportCard.colPassStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report?.entries?.map((item: any, idx: number) => (
                <tr key={item.courseId} className="hover:bg-slate-50/50">
                  <td className="px-5 py-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-navy-900">
                      {i18n.language === 'am' ? item.courseNameAmharic : item.courseName}
                    </div>
                    <span className="text-xs text-slate-400 font-mono">{item.courseCode}</span>
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700">
                    {item.midMark !== null ? `${item.midMark} / 40` : '-'}
                  </td>
                  <td className="px-5 py-4 text-center font-bold text-slate-700">
                    {item.finalMark !== null ? `${item.finalMark} / 60` : '-'}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="px-3 py-1 rounded-xl bg-slate-100 font-black text-navy-900 text-sm">
                      {item.totalScore !== null ? `${item.totalScore}%` : '-'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    {item.passStatus === 'PASSED' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Passed
                      </span>
                    ) : item.passStatus === 'FAILED' ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle className="w-3 h-3 text-rose-600" /> Failed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
                        <Clock className="w-3 h-3 text-slate-400" /> Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Final Cumulative Summary Footer */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-navy-900 to-navy-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gold-300 font-bold uppercase tracking-wider block">
              {t('student.reportCard.overallAvg')}
            </span>
            <div className="text-3xl font-black text-white mt-1">
              {report?.averageScore !== null ? `${report.averageScore}%` : 'N/A'}
            </div>
          </div>

          <div className="sm:text-right">
            <span className="text-xs text-gold-300 font-bold uppercase tracking-wider block">
              {t('student.reportCard.overallResult')}
            </span>
            <div className="mt-1">
              {report?.overallStatus === 'PASSED' ? (
                <span className="px-4 py-1.5 rounded-full bg-emerald-500 text-white font-extrabold text-sm shadow">
                  PASSED / አልፏል
                </span>
              ) : report?.overallStatus === 'FAILED' ? (
                <span className="px-4 py-1.5 rounded-full bg-rose-500 text-white font-extrabold text-sm shadow">
                  FAILED / ወድቋል
                </span>
              ) : (
                <span className="px-4 py-1.5 rounded-full bg-slate-600 text-white font-bold text-sm">
                  PENDING / በሂደት ላይ
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
