"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportStudentsUseCase = void 0;
const Student_1 = require("../../domain/entities/Student");
class ImportStudentsUseCase {
    constructor(studentRepo) {
        this.studentRepo = studentRepo;
    }
    validateCsvRow(row, rowNumber, existingCodes) {
        const errors = [];
        const studentCode = (row.studentCode || row['የተማሪ መለያ'] || row['Student Code'] || '').toString().trim();
        const fullName = (row.fullName || row['ስም (እንግሊዝኛ)'] || row['Full Name'] || '').toString().trim();
        const fullNameAmharic = (row.fullNameAmharic || row['ሙሉ ስም'] || row['Full Name Amharic'] || fullName).toString().trim();
        const gradeLevel = parseInt((row.gradeLevel || row['ክፍል'] || row['Grade'] || '').toString().trim(), 10);
        const rawGender = (row.gender || row['ጾታ'] || row['Gender'] || '').toString().trim().toUpperCase();
        const gender = (rawGender === 'F' || rawGender === 'ሴ' || rawGender === 'FEMALE') ? 'F' : 'M';
        if (!studentCode) {
            errors.push('Student Code is required / የተማሪ መለያ ያስፈልጋል');
        }
        else if (existingCodes.has(studentCode)) {
            errors.push(`Duplicate Student Code in import or system: ${studentCode}`);
        }
        if (!fullName && !fullNameAmharic) {
            errors.push('Student Name is required / የተማሪ ስም ያስፈልጋል');
        }
        if (isNaN(gradeLevel) || gradeLevel < 4 || gradeLevel > 10) {
            errors.push('Grade level must be between 4 and 10 / ክፍል ከ 4 እስከ 10 መሆን አለበት');
        }
        if (studentCode) {
            existingCodes.add(studentCode);
        }
        const data = {
            studentCode,
            fullName: fullName || fullNameAmharic,
            fullNameAmharic: fullNameAmharic || fullName,
            gradeLevel: isNaN(gradeLevel) ? 4 : gradeLevel,
            gender,
            section: '1'
        };
        return {
            rowNumber,
            data,
            isValid: errors.length === 0,
            errors
        };
    }
    async previewCsv(csvContent) {
        const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
        if (lines.length < 2) {
            return { totalRows: 0, validRowsCount: 0, invalidRowsCount: 0, rows: [] };
        }
        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        const allStudents = await this.studentRepo.findAll();
        const existingCodes = new Set(allStudents.map(s => s.studentCode));
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim())
                continue;
            const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
            const cleanValues = values.map(v => v.trim().replace(/^["']|["']$/g, ''));
            const rowObj = {};
            headers.forEach((h, idx) => {
                rowObj[h] = cleanValues[idx] || '';
            });
            const validation = this.validateCsvRow(rowObj, i, existingCodes);
            rows.push(validation);
        }
        const validRowsCount = rows.filter(r => r.isValid).length;
        const invalidRowsCount = rows.filter(r => !r.isValid).length;
        return {
            totalRows: rows.length,
            validRowsCount,
            invalidRowsCount,
            rows
        };
    }
    async commitImport(validRows) {
        const studentsToSave = validRows.map(row => {
            const id = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
            return new Student_1.Student(id, row.studentCode, row.fullName, row.fullNameAmharic, row.gradeLevel, row.gender, '1', 'ACTIVE');
        });
        return await this.studentRepo.saveMany(studentsToSave);
    }
}
exports.ImportStudentsUseCase = ImportStudentsUseCase;
//# sourceMappingURL=ImportStudentsUseCase.js.map