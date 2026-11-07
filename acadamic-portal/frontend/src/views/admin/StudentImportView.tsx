import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle, 
  Download, 
  Check, 
  Loader2,
  FileText
} from 'lucide-react';

export const StudentImportView: React.FC = () => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [committing, setCommitting] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setPreviewData(null);
    setImportSuccessMessage(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await adminApi.previewCsv(formData);
      setPreviewData(res);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error processing CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData || previewData.validRowsCount === 0) return;
    setCommitting(true);
    try {
      const validRows = previewData.rows.filter((r: any) => r.isValid).map((r: any) => r.data);
      const res = await adminApi.commitImport(validRows);
      setImportSuccessMessage(`${res.importedCount} ${t('admin.import.commitSuccess')}`);
      setPreviewData(null);
      setSelectedFile(null);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Error importing students');
    } finally {
      setCommitting(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvHeader = '\uFEFFstudentCode,fullName,fullNameAmharic,gradeLevel,gender\n';
    const sampleRows = [
      'STU-04-101,Abebe Kebede,አበበ ከበደ,4,M',
      'STU-04-102,Tigist Haile,ትዕግስት ኃይሌ,4,F',
      'STU-05-101,Samuel Tadesse,ሳሙኤል ታደሰ,5,M',
      'STU-06-101,Bethlehem Girma,ቤተልሔም ግርማ,6,F',
      'STU-07-101,Ephrem Assefa,ኤፍሬም አሰፋ,7,M',
      'STU-08-101,Meseret Desta,መሰረት ደስታ,8,F',
      'STU-09-101,Henok Getachew,ሄኖክ ጌታቸው,9,M',
      'STU-10-101,Kalkidan Berhanu,ቃልኪዳን ብርሃኑ,10,F'
    ].join('\n');

    const blob = new Blob([csvHeader + sampleRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'sample_students_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <UploadCloud className="w-8 h-8 text-gold-500" />
            {t('admin.import.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-3xl">
            {t('admin.import.subtitle')}
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-gold-500 text-navy-900 font-bold text-sm shadow-sm transition-all"
        >
          <Download className="w-4 h-4 text-gold-500" />
          <span>{t('admin.import.downloadTemplate')}</span>
        </button>
      </div>

      {importSuccessMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-600" />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-gold-500 bg-gold-50/50 scale-[1.01]'
            : 'border-slate-300 hover:border-gold-500/70 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-navy-50 border border-gold-500/30 flex items-center justify-center text-navy-900 mx-auto mb-4">
          <FileSpreadsheet className="w-8 h-8 text-gold-600" />
        </div>

        <h3 className="text-lg font-bold text-navy-900 mb-1">
          {selectedFile ? selectedFile.name : t('admin.import.dragDrop')}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto mb-3">
          {t('admin.import.supportsUtf8')}
        </p>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-gold-600 font-semibold mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Validating CSV rows...</span>
          </div>
        )}
      </div>

      {/* Validation Preview Table */}
      {previewData && (
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
            <div>
              <h3 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gold-500" />
                {t('admin.import.previewTitle')}
              </h3>
              <div className="flex items-center gap-4 mt-1 text-xs font-semibold">
                <span className="text-slate-600">
                  {t('admin.import.totalRows')}: <strong className="text-navy-900">{previewData.totalRows}</strong>
                </span>
                <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {t('admin.import.validRows')}: {previewData.validRowsCount}
                </span>
                {previewData.invalidRowsCount > 0 && (
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    {t('admin.import.invalidRows')}: {previewData.invalidRowsCount}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleCommit}
              disabled={committing || previewData.validRowsCount === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 font-bold text-sm shadow transition-all disabled:opacity-50"
            >
              {committing ? <Loader2 className="w-4 h-4 animate-spin text-gold-400" /> : <Check className="w-4 h-4 text-gold-400" />}
              <span>{t('admin.import.commitBtn')} ({previewData.validRowsCount})</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100/70 text-slate-700 text-xs uppercase font-bold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">{t('admin.import.colRow')}</th>
                  <th className="px-4 py-3">{t('admin.import.colCode')}</th>
                  <th className="px-4 py-3">{t('admin.import.colNameAm')}</th>
                  <th className="px-4 py-3">{t('admin.import.colNameEn')}</th>
                  <th className="px-4 py-3">{t('admin.import.colGrade')}</th>
                  <th className="px-4 py-3">{t('admin.import.colGender')}</th>
                  <th className="px-4 py-3">{t('admin.import.colStatus')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {previewData.rows.map((row: any) => (
                  <tr key={row.rowNumber} className={row.isValid ? 'hover:bg-slate-50/50' : 'bg-rose-50/40'}>
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{row.rowNumber}</td>
                    <td className="px-4 py-3 font-mono font-bold text-navy-900">{row.data.studentCode}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.data.fullNameAmharic}</td>
                    <td className="px-4 py-3 text-slate-600">{row.data.fullName}</td>
                    <td className="px-4 py-3 font-bold text-navy-900">{row.data.gradeLevel}</td>
                    <td className="px-4 py-3 text-slate-600">{row.data.gender}</td>
                    <td className="px-4 py-3">
                      {row.isValid ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle className="w-3 h-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800" title={row.errors.join('; ')}>
                          <AlertCircle className="w-3 h-3" /> {row.errors[0]}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
