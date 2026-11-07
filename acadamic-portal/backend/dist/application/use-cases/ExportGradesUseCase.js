"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportGradesUseCase = void 0;
const XLSX = require("xlsx");
class ExportGradesUseCase {
    constructor(gradeRepo, studentRepo, courseRepo) {
        this.gradeRepo = gradeRepo;
        this.studentRepo = studentRepo;
        this.courseRepo = courseRepo;
    }
    async getConsolidatedGrades(gradeLevel, academicYear = '2026 E.C.') {
        const students = gradeLevel
            ? await this.studentRepo.findByGrade(gradeLevel)
            : await this.studentRepo.findAll();
        const courses = await this.courseRepo.findAll();
        const rows = [];
        for (const student of students) {
            const grades = await this.gradeRepo.findByStudentId(student.id);
            const studentCourses = courses.filter(c => c.gradeLevel === student.gradeLevel);
            const courseList = studentCourses.map(c => {
                const grade = grades.find(g => g.courseId === c.id);
                return {
                    courseCode: c.code,
                    courseName: c.name,
                    courseNameAmharic: c.nameAmharic,
                    midMark: grade?.midMark ? grade.midMark.getValue() : null,
                    finalMark: grade?.finalMark ? grade.finalMark.getValue() : null,
                    totalScore: grade?.totalScore ? grade.totalScore.getValue() : null,
                    passStatus: grade?.passStatus ? grade.passStatus.getStatus() : 'PENDING'
                };
            });
            const totalScoresWithValues = courseList.filter(c => c.totalScore !== null).map(c => c.totalScore);
            const avg = totalScoresWithValues.length > 0
                ? Math.round((totalScoresWithValues.reduce((a, b) => a + b, 0) / totalScoresWithValues.length) * 100) / 100
                : 0;
            const overallStatus = totalScoresWithValues.length === 0
                ? 'PENDING'
                : (avg >= 50.0 ? 'PASSED' : 'FAILED');
            rows.push({
                studentCode: student.studentCode,
                fullName: student.fullName,
                fullNameAmharic: student.fullNameAmharic,
                gradeLevel: student.gradeLevel,
                courses: courseList,
                overallAverage: avg,
                overallStatus
            });
        }
        return rows;
    }
    generateCsv(data) {
        const BOM = '\uFEFF';
        const headers = [
            'የተማሪ መለያ / Student ID',
            'ሙሉ ስም / Full Name (Amharic)',
            'Full Name (English)',
            'ክፍል / Grade',
            'አማካይ ውጤት / Average Score',
            'ውጤት ሁኔታ / Status',
            'የትምህርት ውጤቶች ዝርዝር / Course Breakdown'
        ];
        const lines = [headers.join(',')];
        for (const row of data) {
            const courseSummary = row.courses
                .map(c => `${c.courseNameAmharic || c.courseName}: ${c.totalScore ?? 'N/A'}`)
                .join('; ');
            const statusAmharic = row.overallStatus === 'PASSED' ? 'አልፏል / Passed' : (row.overallStatus === 'FAILED' ? 'ወድቋል / Failed' : 'በሂደት / Pending');
            const fields = [
                `"${row.studentCode}"`,
                `"${row.fullNameAmharic.replace(/"/g, '""')}"`,
                `"${row.fullName.replace(/"/g, '""')}"`,
                `"${row.gradeLevel}"`,
                `"${row.overallAverage}%"`,
                `"${statusAmharic}"`,
                `"${courseSummary.replace(/"/g, '""')}"`
            ];
            lines.push(fields.join(','));
        }
        return Buffer.from(BOM + lines.join('\r\n'), 'utf-8');
    }
    generateExcel(data) {
        const flatRows = data.map(row => {
            const obj = {
                'የተማሪ መለያ (Code)': row.studentCode,
                'ሙሉ ስም (Amharic)': row.fullNameAmharic,
                'Full Name (English)': row.fullName,
                'ክፍል (Grade)': row.gradeLevel,
                'አማካይ ውጤት (Average %)': row.overallAverage,
                'ውሳኔ (Status)': row.overallStatus === 'PASSED' ? 'አልፏል (PASSED)' : (row.overallStatus === 'FAILED' ? 'ወድቋል (FAILED)' : 'በሂደት (PENDING)')
            };
            row.courses.forEach(c => {
                obj[`${c.courseNameAmharic} (Mid)`] = c.midMark ?? '-';
                obj[`${c.courseNameAmharic} (Final)`] = c.finalMark ?? '-';
                obj[`${c.courseNameAmharic} (Total)`] = c.totalScore ?? '-';
            });
            return obj;
        });
        const worksheet = XLSX.utils.json_to_sheet(flatRows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'የውጤት መዝገብ (Grades)');
        return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    }
}
exports.ExportGradesUseCase = ExportGradesUseCase;
//# sourceMappingURL=ExportGradesUseCase.js.map