import { DomainException } from './DomainException';

export class UnauthorizedCourseAccessException extends DomainException {
  constructor(message: string = 'ይህንን ትምህርት ለማስተካከል ፈቃድ የለዎትም (You are not authorized to modify this course)') {
    super(message);
    this.name = 'UnauthorizedCourseAccessException';
  }
}
