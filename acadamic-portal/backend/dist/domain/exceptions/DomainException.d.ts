export declare class DomainException extends Error {
    constructor(message: string);
}
export declare class InvalidMarkException extends DomainException {
    constructor(message?: string);
}
export declare class StudentNotFoundException extends DomainException {
    constructor(studentId: string);
}
export declare class InvalidGradeLevelException extends DomainException {
    constructor(grade: number);
}
