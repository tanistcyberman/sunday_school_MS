import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teacherApi } from '../../services/api';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  CheckCircle, 
  BookOpen, 
  Loader2,
  HardDrive,
  AlertCircle
} from 'lucide-react';

export const MaterialUploadView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState<boolean>(true);

  // Form states (English title removed per specification)
  const [titleAmharic, setTitleAmharic] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadMyCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      loadMaterials();
    } else {
      setMaterials([]);
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

  const loadMaterials = async () => {
    if (!selectedCourseId) return;
    try {
      const mats = await teacherApi.getMaterials(undefined, selectedCourseId);
      setMaterials(mats || []);
    } catch (err) {
      console.error('Error fetching materials', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const TEN_MB = 10 * 1024 * 1024;
      if (file.size > TEN_MB) {
        alert('File size exceeds the 10MB limit per course specification');
        return;
      }
      setSelectedFile(file);
      if (!titleAmharic) {
        setTitleAmharic(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCourseId || !titleAmharic.trim()) {
      alert('እባክዎ ርዕስ እና ፋይል ያስገቡ (Please fill the required title and file)');
      return;
    }

    const currentCourse = courses.find(c => c.id === selectedCourseId);
    setUploading(true);
    setSuccessMsg(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('courseId', selectedCourseId);
      formData.append('gradeLevel', (currentCourse?.gradeLevel || 4).toString());
      formData.append('title', titleAmharic.trim());
      formData.append('titleAmharic', titleAmharic.trim());
      formData.append('description', description.trim());

      await teacherApi.uploadCourseMaterial(selectedCourseId, formData);
      setSuccessMsg('የትምህርት ማቴሪያሉ በተሳካ ሁኔታ ተጭኗል! (Material uploaded successfully)');
      setTitleAmharic('');
      setDescription('');
      setSelectedFile(null);
      loadMaterials();
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error uploading material');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('ይህን ማቴሪያል መሰረዝ ይፈልጋሉ? (Are you sure you want to delete this material?)')) {
      try {
        await teacherApi.deleteMaterial(id);
        loadMaterials();
      } catch (err) {
        alert('Failed to delete material');
      }
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
          <UploadCloud className="w-8 h-8 text-gold-500" />
          {t('teacher.materials.title')}
        </h1>
        <p className="mt-1 text-sm text-slate-500 max-w-2xl">
          {t('teacher.materials.subtitle')}
        </p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Upload Form Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-navy-900 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-gold-500" />
              {t('teacher.materials.title')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Course Selection Dropdown - Strictly Assigned Courses */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-navy-900" />
                  ትምህርት ይምረጡ (Select Course)
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm font-semibold bg-white text-navy-900"
                  required
                >
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.gradeLevel}ኛ ክፍል - {c.code}: {i18n.language === 'am' ? c.nameAmharic : c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title (Only Amharic / Native Title - English part removed per user request) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  የማቴሪያሉ ርዕስ (Material Title) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={titleAmharic}
                  onChange={(e) => setTitleAmharic(e.target.value)}
                  placeholder="ለምሳሌ፡ የቤተክርስቲያን ታሪክ ክፍል አንድ"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('teacher.materials.description')}
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="የትምህርቱ ይዘት ማጠቃለያ..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-gold-500/50 text-sm"
                />
              </div>

              {/* File Uploader */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-navy-900" />
                  {t('teacher.materials.fileLabel')}
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-900 file:text-gold-400 hover:file:bg-navy-800 cursor-pointer"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  የሚፈቀደው: PDF, DOCX (እስከ 10MB)
                </p>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-sm shadow transition-colors disabled:opacity-50"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin text-gold-400" /> : <UploadCloud className="w-4 h-4 text-gold-500" />}
                <span>{uploading ? t('teacher.materials.uploading') : t('teacher.materials.uploadBtn')}</span>
              </button>
            </form>
          </div>

          {/* Uploaded Materials List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-500" />
                {t('teacher.materials.uploadedList')}
              </h3>
              {selectedCourse && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-navy-50 text-navy-900 border border-navy-100">
                  {selectedCourse.gradeLevel}ኛ ክፍል • {selectedCourse.code} ({materials.length} ሰነዶች)
                </span>
              )}
            </div>

            {materials.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm font-medium">
                ለዚህ ኮርስ የተጫነ ማቴሪያል የለም (No materials uploaded for this course yet).
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {materials.map((mat) => (
                  <div key={mat.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gold-50 border border-gold-200 flex items-center justify-center text-gold-700 shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-navy-900">
                          {mat.titleAmharic || mat.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {mat.fileName}
                        </p>
                        {mat.description && (
                          <p className="text-xs text-slate-600 mt-1 italic">
                            "{mat.description}"
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-400">
                          <span>{formatFileSize(mat.fileSize)}</span>
                          <span>•</span>
                          <span>{new Date(mat.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => handleDelete(mat.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={t('teacher.materials.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default MaterialUploadView;
