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
export declare class ImportStudentsUseCase {
    private readonly studentRepo;
    constructor(studentRepo: StudentRepositoryPort);
    validateCsvRow(row: any, rowNumber: number, existingCodes: Set<string>): RowValidationResult;
    previewCsv(csvContent: string): Promise<CSVPreviewResult>;
    commitImport(validRows: CSVStudentRow[]): Promise<Student[]>;
}
