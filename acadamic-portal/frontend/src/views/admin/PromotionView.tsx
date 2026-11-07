import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import { PromotionTriggerComponent } from '../../components/PromotionTriggerComponent';
import { UserCheck, CheckCircle2, XCircle, ArrowRight, Layers, Sparkles } from 'lucide-react';

export const PromotionView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>(undefined);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCandidates();
  }, [selectedGrade]);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPromotionCandidates(selectedGrade);
      setCandidates(res);
    } catch (err: any) {
      console.error('Error fetching promotion candidates', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Promotion Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <UserCheck className="w-8 h-8 text-gold-500" />
            {t('admin.promotion.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t('admin.promotion.subtitle')}
          </p>
        </div>

        {/* Promotion Trigger Component with Modal */}
        <PromotionTriggerComponent 
          gradeLevel={selectedGrade} 
          onCompleted={() => loadCandidates()} 
        />
      </div>

      {/* Grade Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
          <Layers className="w-3.5 h-3.5 text-navy-900" />
          {t('admin.schedule.gradeFilter')}:
        </span>
        <button
          onClick={() => setSelectedGrade(undefined)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
            selectedGrade === undefined
              ? 'bg-navy-900 text-gold-400 shadow'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t('admin.export.allGrades')}
        </button>
        {[4, 5, 6, 7, 8, 9, 10].map(grade => (
          <button
            key={grade}
            onClick={() => setSelectedGrade(grade)}
            className={`w-9 h-8 rounded-xl text-xs font-bold transition-all ${
              selectedGrade === grade
                ? 'bg-navy-900 text-gold-400 shadow'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {grade}
          </button>
        ))}
      </div>

      {/* Candidates Evaluation Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-medium">
            Evaluating student candidates...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f172a] text-slate-200 text-xs uppercase font-bold border-b border-navy-800">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Current Grade</th>
                  <th className="px-5 py-3.5">Average Score</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Projected Progression</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((cand, idx) => (
                  <tr key={cand.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy-900">
                        {i18n.language === 'am' ? cand.fullNameAmharic : cand.fullName}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {cand.studentCode} • {cand.fullName}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-900 font-bold text-xs border border-navy-100">
                        Grade {cand.previousGrade}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-extrabold text-navy-900">
                      {cand.averageScore}%
                    </td>
                    <td className="px-5 py-4">
                      {cand.passed ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Meets Passing Mark (≥50%)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Below Passing Mark (&lt;50%)
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {cand.actionTaken === 'GRADUATED' ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                          Graduates (Completed Grade 10)
                        </span>
                      ) : cand.actionTaken === 'PROMOTED' ? (
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                          <span>Grade {cand.previousGrade}</span>
                          <ArrowRight className="w-3 h-3 text-emerald-600" />
                          <span>Grade {cand.newGrade}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs">
                          Retained (Grade {cand.previousGrade})
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
