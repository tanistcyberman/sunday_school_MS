import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { studentApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Download, 
  FileText, 
  BookOpen, 
  Layers, 
  FolderDown,
  HardDrive
} from 'lucide-react';

export const MaterialDownloadHub: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [gradeLevel, setGradeLevel] = useState<number>(4);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadMaterials();
  }, [user]);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const res = await studentApi.getMaterials(user?.studentId);
      setCoursesData(res.courses || []);
      setGradeLevel(res.gradeLevel || 4);
    } catch (err) {
      console.error('Error fetching materials hub', err);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleDownload = (materialId: string) => {
    window.open(`/api/student/download/${materialId}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
              <FolderDown className="w-8 h-8 text-gold-500" />
              {t('student.materials.title')}
            </h1>
            <p className="mt-1 text-sm text-slate-500 max-w-2xl">
              {t('student.materials.subtitle')}
            </p>
          </div>

          <span className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white border border-slate-200 text-navy-900 font-bold text-sm shadow-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-gold-500" />
            Grade {gradeLevel} Curriculum
          </span>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 font-medium">
          Loading course materials hub...
        </div>
      ) : (
        /* Card-based Grid Displaying PDFs/Docs Organized by Course */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coursesData.map(({ course, materials }) => (
            <div 
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Course Header */}
                <div className="flex items-start justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-navy-900 text-gold-400 flex items-center justify-center font-bold shadow">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy-50 text-navy-900 border border-navy-100">
                        {course.code}
                      </span>
                      <h3 className="text-base font-bold text-navy-900 mt-1">
                        {i18n.language === 'am' ? course.nameAmharic : course.name}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                    {materials.length} {materials.length === 1 ? 'file' : 'files'}
                  </span>
                </div>

                {/* Materials List for Course */}
                {materials.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs italic">
                    {t('student.materials.noMaterials')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {materials.map((mat: any) => (
                      <div
                        key={mat.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-gold-400/50 flex items-center justify-between gap-3 transition-colors group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-navy-900 shrink-0 shadow-xs">
                            <FileText className="w-4 h-4 text-gold-600" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-navy-900 truncate">
                              {i18n.language === 'am' ? mat.titleAmharic : mat.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 truncate">
                              {mat.fileName} • {formatFileSize(mat.fileSize)}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDownload(mat.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-xs shadow transition-all shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{t('student.materials.download')}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 text-right">
                <span className="text-[11px] text-slate-400">
                  {i18n.language === 'am' ? course.descriptionAmharic : course.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
