export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class InvalidMarkException extends DomainException {
  constructor(message: string = 'Invalid mark provided') {
    super(message);
    this.name = 'InvalidMarkException';
  }
}

export class StudentNotFoundException extends DomainException {
  constructor(studentId: string) {
    super(`Student with ID or Code ${studentId} not found`);
    this.name = 'StudentNotFoundException';
  }
}

export class InvalidGradeLevelException extends DomainException {
  constructor(grade: number) {
    super(`Grade level must be between 4 and 10. Received: ${grade}`);
    this.name = 'InvalidGradeLevelException';
  }
}
