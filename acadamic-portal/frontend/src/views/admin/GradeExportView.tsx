import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { adminApi } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  FileSpreadsheet, 
  Download, 
  FileText, 
  Filter, 
  Layers, 
  CheckCircle, 
  XCircle, 
  Clock,
  Printer
} from 'lucide-react';

export const GradeExportView: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [selectedGrade, setSelectedGrade] = useState<number | undefined>(undefined);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadGrades();
  }, [selectedGrade]);

  const loadGrades = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getConsolidatedGrades(selectedGrade);
      setData(res);
    } catch (err: any) {
      console.error('Error fetching grades', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const blob = await adminApi.downloadCsv(selectedGrade);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_grades_${selectedGrade || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handleExportExcel = async () => {
    try {
      const blob = await adminApi.downloadExcel(selectedGrade);
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_grades_${selectedGrade || 'all'}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      alert('Failed to export Excel file');
    }
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Academic Portal - Consolidated Student Grade Report', 14, 20);
    doc.setFontSize(11);
    doc.text(`Department: Continuous Education Monitoring Dept | Grade: ${selectedGrade || 'All'}`, 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 34);

    const tableRows = data.map((row, idx) => [
      idx + 1,
      row.studentCode,
      row.fullName,
      `Grade ${row.gradeLevel}`,
      `${row.overallAverage}%`,
      row.overallStatus
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['#', 'Student Code', 'Full Name', 'Grade Level', 'Average', 'Decision']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [15, 23, 42], textColor: [212, 175, 55] },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`student_grades_report_${selectedGrade || 'all'}.pdf`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-gold-500" />
            {t('admin.export.title')}
          </h1>
          <p className="mt-1 text-sm text-slate-500 max-w-2xl">
            {t('admin.export.subtitle')}
          </p>
        </div>

        {/* Action Buttons: Excel, PDF, CSV */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow transition-all"
          >
            <Download className="w-4 h-4" />
            <span>{t('admin.export.exportExcel')}</span>
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-navy-900 hover:bg-navy-800 text-gold-400 border border-gold-500/40 font-bold text-sm shadow transition-all"
          >
            <Printer className="w-4 h-4 text-gold-500" />
            <span>{t('admin.export.exportPdf')}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-gold-500 text-navy-900 font-bold text-sm shadow-sm transition-all"
          >
            <FileText className="w-4 h-4 text-gold-500" />
            <span>{t('admin.export.exportCsv')}</span>
          </button>
        </div>
      </div>

      {/* Grade Level Filter Buttons */}
      <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
          <Filter className="w-3.5 h-3.5 text-navy-900" />
          {t('admin.export.filterGrade')}:
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

      {/* Summary Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-medium">
            Loading grades report...
          </div>
        ) : data.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-medium">
            No student grade records found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#0f172a] text-slate-200 text-xs uppercase font-bold border-b border-navy-800">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-5 py-3.5">{t('admin.export.colStudent')}</th>
                  <th className="px-5 py-3.5">{t('admin.export.colGrade')}</th>
                  <th className="px-5 py-3.5">{t('admin.export.colAverage')}</th>
                  <th className="px-5 py-3.5">{t('admin.export.colDecision')}</th>
                  <th className="px-5 py-3.5">Course Marks Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, idx) => (
                  <tr key={row.studentCode} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-4 text-xs font-mono text-slate-400">{idx + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy-900 text-sm">
                        {i18n.language === 'am' ? row.fullNameAmharic : row.fullName}
                      </div>
                      <div className="text-xs font-mono text-slate-400">
                        {row.studentCode} • {row.fullName}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-navy-50 text-navy-900 font-bold text-xs border border-navy-100">
                        {row.gradeLevel}ኛ ክፍል
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-extrabold text-navy-900 text-base">
                        {row.overallAverage}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {row.overallStatus === 'PASSED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          {t('admin.export.passed')}
                        </span>
                      ) : row.overallStatus === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          {t('admin.export.failed')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          {t('admin.export.pending')}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1.5 max-w-md">
                        {row.courses.map((c: any) => (
                          <span 
                            key={c.courseCode} 
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                            title={`${c.courseName}: Mid ${c.midMark ?? '-'} / Final ${c.finalMark ?? '-'}`}
                          >
                            {c.courseCode}: <strong className="text-navy-900">{c.totalScore ?? '-'}%</strong>
                          </span>
                        ))}
                      </div>
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
