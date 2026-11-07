import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../services/api';
import { 
  BookOpen, 
  Save, 
  CheckCircle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Loader2,
  AlertCircle
} from 'lucide-react';

interface GradeRow {
  studentId: string;
  studentCode: string;
  fullName: string;
  fullNameAmharic: string;
  gradeLevel: number;
  courseId: string;
  academicYear: string;
  midMark: number | string | null;
  finalMark: number | string | null;
  totalScore: number | null;
  passStatus: string;
  isDirty?: boolean;
}

export const DigitalGradebookView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [gradeRows, setGradeRows] = useState<GradeRow[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);
  const [loadingStudents, setLoadingStudents] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadCourseStudents(selectedCourseId);
    } else {
      setGradeRows([]);
    }
  }, [selectedCourseId]);

  const loadMyCourses = async () => {
    setLoadingCourses(true);
    try {
      // Strictly fetch courses assigned to this authenticated teacher
      const myCourses = await teacherApi.getMyCourses();
      setCourses(myCourses || []);
      if (myCourses && myCourses.length > 0) {
        setSelectedCourseId(myCourses[0].id);
      } else {
        setSelectedCourseId('');
      }
    } catch (err) {
      console.error('Error fetching teacher assigned courses', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadCourseStudents = async (courseId: string) => {
    setLoadingStudents(true);
    try {
      // Load students enrolled in this specific course's grade level
      const rows = await teacherApi.getCourseStudents(courseId);
      setGradeRows(rows.map((r: any) => ({ ...r, isDirty: false })));
    } catch (err) {
      console.error('Error loading students for course', err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleMarkChange = (studentId: string, field: 'midMark' | 'finalMark', valStr: string) => {
    setGradeRows(prev => prev.map(row => {
      if (row.studentId !== studentId) return row;

      let numVal: number | null = null;
      if (valStr.trim() !== '') {
        const parsed = parseFloat(valStr);
        if (!isNaN(parsed)) {
          // Boundary validation
          if (field === 'midMark') {
            numVal = Math.min(40, Math.max(0, parsed));
          } else {
            numVal = Math.min(60, Math.max(0, parsed));
          }
        }
      }

      const updatedRow = {
        ...row,
        [field]: numVal,
        isDirty: true
      };

      // Dynamic computation of Total Score and Pass Status
      const mid = field === 'midMark' ? numVal : (typeof row.midMark === 'number' ? row.midMark : null);
      const final = field === 'finalMark' ? numVal : (typeof row.finalMark === 'number' ? row.finalMark : null);

      if (mid !== null && final !== null) {
        const total = Math.round((mid + final) * 100) / 100;
        updatedRow.totalScore = total;
        updatedRow.passStatus = total >= 50.0 ? 'PASSED' : 'FAILED';
      } else {
        updatedRow.totalScore = null;
        updatedRow.passStatus = 'PENDING';
      }

      return updatedRow;
    }));
  };

  const handleSaveAll = async () => {
    if (!selectedCourseId) return;
    setSaving(true);
    setSuccessMsg(null);
    try {
      const payload = gradeRows.map(r => ({
        studentId: r.studentId,
        courseId: selectedCourseId,
        academicYear: r.academicYear || '2026 E.C.',
        midMark: typeof r.midMark === 'number' ? r.midMark : null,
        finalMark: typeof r.finalMark === 'number' ? r.finalMark : null
      }));

      await teacherApi.batchUpdateGrades(payload);
      setSuccessMsg('ውጤቶች በተሳካ ሁኔታ ተመዝግበዋል! (All grades saved and computed successfully)');
      setGradeRows(prev => prev.map(r => ({ ...r, isDirty: false })));
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error saving gradebook');
    } finally {
      setSaving(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-gold-500" />
            {t('teacher.gradebook.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t('teacher.gradebook.subtitle')}
          </p>
        </div>

        {courses.length > 0 && (
          <button
            onClick={handleSaveAll}
            disabled={saving || loadingStudents || gradeRows.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-sm shadow-md transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin text-gold-400" /> : <Save className="w-4 h-4 text-gold-500" />}
            <span>{saving ? 'በመመዝገብ ላይ...' : t('teacher.gradebook.saveAll')}</span>
          </button>
        )}
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loadingCourses ? (
        <div className="py-20 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          <span>ትምህርቶችን በመጫን ላይ... (Loading assigned courses...)</span>
        </div>
      ) : courses.length === 0 ? (
        /* Empty State Required by Spec */
        <div className="bg-amber-50 border-2 border-amber-200/80 rounded-2xl p-8 text-center max-w-2xl mx-auto shadow-sm my-10">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-amber-700">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2 font-['Noto_Sans_Ethiopic']">
            ምንም የተመደበልዎት ትምህርት የለም። እባክዎ አድሚኑን ያነጋግሩ።
          </h2>
          <p className="text-sm text-amber-700">
            You have no assigned courses. Please contact the administrator.
          </p>
        </div>
      ) : (
        <>
          {/* Course Selector Dropdown (ትምህርት ይምረጡ) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <label className="text-sm font-bold text-navy-900 flex items-center gap-1.5 whitespace-nowrap">
                <BookOpen className="w-4 h-4 text-gold-600" />
                ትምህርት ይምረጡ (Select Course):
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full sm:w-80 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-bold bg-white text-navy-900"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.gradeLevel}ኛ ክፍል - {c.code}: {i18n.language === 'am' ? c.nameAmharic : c.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedCourse && (
              <div className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-navy-50 text-navy-900 border border-navy-100">
                ክፍል፡ {selectedCourse.gradeLevel}ኛ ክፍል (1 ክፍል ብቻ)
              </div>
            )}
          </div>

          {/* Dynamic Data Grid */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-500 gap-2">
              <span className="italic">{t('teacher.gradebook.autoCalcNote')}</span>
              <span className="font-semibold text-navy-900">ጠቅላላ የተመዘገቡ ተማሪዎች: {gradeRows.length}</span>
            </div>

            {loadingStudents ? (
              <div className="py-20 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
                <span>የተማሪዎችን ውጤት መረጃ በመጫን ላይ...</span>
              </div>
            ) : gradeRows.length === 0 ? (
              <div className="py-20 text-center text-slate-400 font-medium">
                በዚህ ክፍል ውስጥ የተመዘገበ ተማሪ አልተገኘም (No students found enrolled).
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm min-w-[650px]">
                  <thead className="bg-[#0f172a] text-slate-200 text-xs uppercase font-bold border-b border-navy-800">
                    <tr>
                      <th className="px-5 py-3.5">{t('teacher.gradebook.colCode')}</th>
                      <th className="px-5 py-3.5">{t('teacher.gradebook.colName')}</th>
                      <th className="px-5 py-3.5 w-36 text-center">{t('teacher.gradebook.colMid')}</th>
                      <th className="px-5 py-3.5 w-36 text-center">{t('teacher.gradebook.colFinal')}</th>
                      <th className="px-5 py-3.5 w-36 text-center">{t('teacher.gradebook.colTotal')}</th>
                      <th className="px-5 py-3.5 text-center">{t('teacher.gradebook.colStatus')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {gradeRows.map((row) => (
                      <tr key={row.studentId} className={`hover:bg-slate-50/70 transition-colors ${row.isDirty ? 'bg-amber-50/30' : ''}`}>
                        <td className="px-5 py-4 font-mono font-bold text-navy-900 text-xs">
                          {row.studentCode}
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-navy-900 text-sm">
                            {i18n.language === 'am' ? row.fullNameAmharic : row.fullName}
                          </div>
                          <div className="text-xs text-slate-400">
                            {row.fullName}
                          </div>
                        </td>

                        {/* Editable Mid Mark Input (0-40) */}
                        <td className="px-5 py-4 text-center">
                          <div className="relative inline-block w-24">
                            <input
                              type="number"
                              min="0"
                              max="40"
                              step="0.5"
                              value={row.midMark ?? ''}
                              onChange={(e) => handleMarkChange(row.studentId, 'midMark', e.target.value)}
                              placeholder="0-40"
                              className="w-full px-3 py-1.5 text-center font-bold text-navy-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 bg-white shadow-inner"
                            />
                          </div>
                        </td>

                        {/* Editable Final Mark Input (0-60) */}
                        <td className="px-5 py-4 text-center">
                          <div className="relative inline-block w-24">
                            <input
                              type="number"
                              min="0"
                              max="60"
                              step="0.5"
                              value={row.finalMark ?? ''}
                              onChange={(e) => handleMarkChange(row.studentId, 'finalMark', e.target.value)}
                              placeholder="0-60"
                              className="w-full px-3 py-1.5 text-center font-bold text-navy-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 bg-white shadow-inner"
                            />
                          </div>
                        </td>

                        {/* Dynamic Total Score Column */}
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block px-3 py-1.5 rounded-xl font-extrabold text-sm shadow-sm ${
                            row.totalScore !== null
                              ? row.totalScore >= 50
                                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                : 'bg-rose-50 text-rose-800 border border-rose-200'
                              : 'bg-slate-100 text-slate-400 border border-slate-200'
                          }`}>
                            {row.totalScore !== null ? `${row.totalScore}%` : '-'}
                          </span>
                        </td>

                        {/* Dynamic Status Badge */}
                        <td className="px-5 py-4 text-center">
                          {row.passStatus === 'PASSED' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> አልፏል (Passed)
                            </span>
                          ) : row.passStatus === 'FAILED' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> ወድቋል (Failed)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              <Clock className="w-3.5 h-3.5 text-slate-400" /> በመጠባበቅ ላይ
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
        </>
      )}
    </div>
  );
};

export default DigitalGradebookView;
