import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, CheckCircle2, Clock, Award } from 'lucide-react';

interface AcademicTimelineProps {
  startDate: string | Date;
  midExamDate: string | Date;
  finalExamDate: string | Date;
  progressPercentage: number;
  currentPhase: 'PRE_MID' | 'MID_TO_FINAL' | 'COMPLETED';
}

export const AcademicTimeline: React.FC<AcademicTimelineProps> = ({
  startDate,
  midExamDate,
  finalExamDate,
  progressPercentage,
  currentPhase
}) => {
  const { t } = useTranslation();

  const formatDate = (d: string | Date) => {
    if (!d) return '-';
    const date = new Date(d);
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gold-500" />
            {t('student.dashboard.timelineTitle')}
          </h3>
          <p className="text-sm text-slate-500">
            {currentPhase === 'PRE_MID' 
              ? t('student.dashboard.phasePreMid') 
              : currentPhase === 'MID_TO_FINAL' 
              ? t('student.dashboard.phaseMidToFinal') 
              : t('student.dashboard.phaseCompleted')}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1 rounded-full bg-gold-50 border border-gold-300 text-gold-800 text-sm font-semibold">
          <span>{t('student.dashboard.termProgress')}:</span>
          <span className="text-gold-600 font-extrabold">{progressPercentage}%</span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative mb-8">
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div 
            className="h-full bg-gradient-to-r from-navy-900 via-gold-500 to-amber-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
          />
        </div>

        {/* Milestone Pinpoints */}
        <div className="flex justify-between items-start mt-4">
          
          {/* Milestone 1: Start */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm ${
              progressPercentage >= 10 ? 'bg-navy-900 border-gold-500 text-gold-400' : 'bg-white border-slate-300 text-slate-400'
            }`}>
              <Calendar className="w-4 h-4" />
            </div>
            <span className="mt-2 text-xs font-bold text-navy-900">{t('student.dashboard.startDate')}</span>
            <span className="text-[11px] text-slate-500 font-medium">{formatDate(startDate)}</span>
          </div>

          {/* Milestone 2: Mid Exam */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm ${
              currentPhase !== 'PRE_MID' ? 'bg-gold-500 border-navy-900 text-navy-950 font-bold' : 'bg-white border-gold-400 text-gold-600'
            }`}>
              {currentPhase !== 'PRE_MID' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
            </div>
            <span className="mt-2 text-xs font-bold text-navy-900">{t('student.dashboard.midExam')} (40%)</span>
            <span className="text-[11px] text-slate-500 font-medium">{formatDate(midExamDate)}</span>
          </div>

          {/* Milestone 3: Final Exam */}
          <div className="flex flex-col items-center text-center w-1/3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-sm ${
              currentPhase === 'COMPLETED' ? 'bg-emerald-600 border-navy-900 text-white' : 'bg-white border-slate-300 text-slate-400'
            }`}>
              <Award className="w-4 h-4" />
            </div>
            <span className="mt-2 text-xs font-bold text-navy-900">{t('student.dashboard.finalExam')} (60%)</span>
            <span className="text-[11px] text-slate-500 font-medium">{formatDate(finalExamDate)}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
