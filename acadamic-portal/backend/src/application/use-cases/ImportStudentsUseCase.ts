import { StudentRepositoryPort } from '../ports/out/StudentRepositoryPort';
import { Student } from '../../domain/entities/Student';

export interface CSVStudentRow {
  studentCode: string;
  fullName: string;
  fullNameAmharic: string;
  gradeLevel: number;
  gender: 'M' | 'F';
  section?: string;
}

export interface RowValidationResult {
  rowNumber: number;
  data: CSVStudentRow;
  isValid: boolean;
  errors: string[];
}

export interface CSVPreviewResult {
  totalRows: number;
  validRowsCount: number;
  invalidRowsCount: number;
  rows: RowValidationResult[];
}

export class ImportStudentsUseCase {
  constructor(private readonly studentRepo: StudentRepositoryPort) {}

  public validateCsvRow(row: any, rowNumber: number, existingCodes: Set<string>): RowValidationResult {
    const errors: string[] = [];
    const studentCode = (row.studentCode || row['የተማሪ መለያ'] || row['Student Code'] || '').toString().trim();
    const fullName = (row.fullName || row['ስም (እንግሊዝኛ)'] || row['Full Name'] || '').toString().trim();
    const fullNameAmharic = (row.fullNameAmharic || row['ሙሉ ስም'] || row['Full Name Amharic'] || fullName).toString().trim();
    const gradeLevel = parseInt((row.gradeLevel || row['ክፍል'] || row['Grade'] || '').toString().trim(), 10);
    const rawGender = (row.gender || row['ጾታ'] || row['Gender'] || '').toString().trim().toUpperCase();
    const gender: 'M' | 'F' = (rawGender === 'F' || rawGender === 'ሴ' || rawGender === 'FEMALE') ? 'F' : 'M';

    if (!studentCode) {
      errors.push('Student Code is required / የተማሪ መለያ ያስፈልጋል');
    } else if (existingCodes.has(studentCode)) {
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

    const data: CSVStudentRow = {
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

  public async previewCsv(csvContent: string): Promise<CSVPreviewResult> {
    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      return { totalRows: 0, validRowsCount: 0, invalidRowsCount: 0, rows: [] };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const allStudents = await this.studentRepo.findAll();
    const existingCodes = new Set<string>(allStudents.map(s => s.studentCode));

    const rows: RowValidationResult[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV regex for quotes
      const values = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(',');
      const cleanValues = values.map(v => v.trim().replace(/^["']|["']$/g, ''));
      
      const rowObj: any = {};
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

  public async commitImport(validRows: CSVStudentRow[]): Promise<Student[]> {
    const studentsToSave: Student[] = validRows.map(row => {
      const id = `stu_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      return new Student(
        id,
        row.studentCode,
        row.fullName,
        row.fullNameAmharic,
        row.gradeLevel,
        row.gender,
        '1',
        'ACTIVE'
      );
    });

    return await this.studentRepo.saveMany(studentsToSave);
  }
}
