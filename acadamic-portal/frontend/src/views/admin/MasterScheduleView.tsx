import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import { Calendar, Save, CheckCircle2, Clock, BookOpen, Layers, UserCheck, Loader2 } from 'lucide-react';

export const MasterScheduleView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<number>(4);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<{ [courseId: string]: any }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingCourseId, setSavingCourseId] = useState<string | null>(null);
  const [assigningCourseId, setAssigningCourseId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, [selectedGrade]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [crs, sched, teacherList] = await Promise.all([
        adminApi.getCourses(selectedGrade),
        adminApi.getSchedule(selectedGrade),
        adminApi.getTeachers()
      ]);
      setCourses(crs);
      setTeachers(teacherList || []);

      const map: { [courseId: string]: any } = {};
      sched.forEach((s: any) => {
        map[s.courseId] = {
          id: s.id,
          startDate: s.startDate ? new Date(s.startDate).toISOString().split('T')[0] : '2026-09-15',
          midExamDate: s.midExamDate ? new Date(s.midExamDate).toISOString().split('T')[0] : '2026-11-20',
          finalExamDate: s.finalExamDate ? new Date(s.finalExamDate).toISOString().split('T')[0] : '2027-01-15',
          academicYear: s.academicYear || '2026 E.C.',
          semester: s.semester || 'Term 1'
        };
      });

      // Populate default empty inputs for courses without schedule yet
      crs.forEach((c: any) => {
        if (!map[c.id]) {
          map[c.id] = {
            startDate: '2026-09-15',
            midExamDate: '2026-11-20',
            finalExamDate: '2027-01-15',
            academicYear: '2026 E.C.',
            semester: 'Term 1'
          };
        }
      });

      setSchedules(map);
    } catch (err: any) {
      console.error('Failed to load schedule data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (courseId: string, field: string, value: string) => {
    setSchedules(prev => ({
      ...prev,
      [courseId]: {
        ...prev[courseId],
        [field]: value
      }
    }));
  };

  const handleSave = async (courseId: string) => {
    setSavingCourseId(courseId);
    setNotification(null);
    try {
      const data = schedules[courseId];
      await adminApi.saveSchedule({
        id: data.id,
        courseId,
        gradeLevel: selectedGrade,
        academicYear: data.academicYear || '2026 E.C.',
        semester: data.semester || 'Term 1',
        startDate: data.startDate,
        midExamDate: data.midExamDate,
        finalExamDate: data.finalExamDate
      });
      setNotification(`${t('admin.schedule.savedSuccess')}`);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error saving schedule');
    } finally {
      setSavingCourseId(null);
    }
  };

  const handleAssignTeacher = async (courseId: string, teacherId: string) => {
    setAssigningCourseId(courseId);
    try {
      const val = teacherId === '' ? null : teacherId;
      await adminApi.assignTeacher(courseId, val);
      setCourses(prev => prev.map(c => c.id === courseId ? { ...c, assignedTeacherId: val } : c));
      setNotification('መምህሩ ለኮርሱ በተሳካ ሁኔታ ተመድቧል! (Teacher assigned successfully)');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to assign teacher');
    } finally {
      setAssigningCourseId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
              <Calendar className="w-8 h-8 text-gold-500" />
              {t('admin.schedule.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-3xl">
              {t('admin.schedule.subtitle')}
            </p>
          </div>

          {/* Grade Selector (4 to 10) */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-1.5 rounded-2xl border border-slate-300 shadow-sm overflow-x-auto">
            <span className="text-xs font-bold text-navy-900 px-2 flex items-center gap-1 whitespace-nowrap">
              <Layers className="w-4 h-4 text-gold-500" />
              {t('admin.schedule.gradeFilter')}:
            </span>
            {[4, 5, 6, 7, 8, 9, 10].map(grade => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${
                  selectedGrade === grade
                    ? 'bg-navy-900 text-gold-400 shadow-md scale-105'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-navy-900'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>
      </div>

      {notification && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
          <span>የመርሃ-ግብር መረጃዎችን በመጫን ላይ...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => {
            const sched = schedules[course.id] || {};
            const isSaving = savingCourseId === course.id;
            const isAssigning = assigningCourseId === course.id;

            return (
              <div 
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-900 font-bold shrink-0">
                        <BookOpen className="w-5 h-5 text-gold-600" />
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy-900 text-gold-400">
                          {course.code}
                        </span>
                        <h3 className="text-base font-bold text-navy-900 mt-0.5">
                          {i18n.language === 'am' ? course.nameAmharic : course.name}
                        </h3>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 self-start sm:self-auto">
                      {selectedGrade}ኛ ክፍል (1 ክፍል)
                    </span>
                  </div>

                  {/* Course Teacher Assignment Dropdown (መምህር መድብ) */}
                  <div className="mb-5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <label className="block text-xs font-bold text-navy-900 mb-1.5 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-gold-600" />
                      መምህር መድብ (Assign Teacher):
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={course.assignedTeacherId || ''}
                        disabled={isAssigning}
                        onChange={(e) => handleAssignTeacher(course.id, e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-xs sm:text-sm font-semibold bg-white text-navy-900"
                      >
                        <option value="">-- መምህር አልተመደበም (Unassigned) --</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.id}>
                            {i18n.language === 'am' ? (t.fullNameAmharic || t.fullName) : t.fullName} ({t.username})
                          </option>
                        ))}
                      </select>
                      {isAssigning && <Loader2 className="w-4 h-4 animate-spin text-gold-600 shrink-0" />}
                    </div>
                  </div>

                  {/* Calendar Form Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-navy-600" />
                        {t('admin.schedule.startDate')}
                      </label>
                      <input
                        type="date"
                        value={sched.startDate || ''}
                        onChange={(e) => handleDateChange(course.id, 'startDate', e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gold-600" />
                          {t('admin.schedule.midExamDate')}
                        </label>
                        <input
                          type="date"
                          value={sched.midExamDate || ''}
                          onChange={(e) => handleDateChange(course.id, 'midExamDate', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {t('admin.schedule.finalExamDate')}
                        </label>
                        <input
                          type="date"
                          value={sched.finalExamDate || ''}
                          onChange={(e) => handleDateChange(course.id, 'finalExamDate', e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => handleSave(course.id)}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-sm shadow transition-colors"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-gold-400" /> : <Save className="w-4 h-4 text-gold-500" />}
                    <span>{isSaving ? 'በመመዝገብ ላይ...' : t('admin.schedule.saveBtn')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MasterScheduleView;
