-- Ensure UTF-8 client encoding
SET client_encoding = 'UTF8';

-- Users table (RBAC: ADMIN, TEACHER, STUDENT)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    full_name_amharic VARCHAR(150) NOT NULL,
    student_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Students table (Grades 4-10)
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(64) PRIMARY KEY,
    student_code VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    full_name_amharic VARCHAR(150) NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level >= 4 AND grade_level <= 10),
    gender VARCHAR(10) NOT NULL,
    section VARCHAR(10) NOT NULL DEFAULT '1',
    status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Courses table (4 courses per grade level) with teacher_id assignment
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(64) PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    name_amharic VARCHAR(150) NOT NULL,
    grade_level INT NOT NULL CHECK (grade_level >= 4 AND grade_level <= 10),
    description TEXT,
    description_amharic TEXT,
    teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Migration check for existing installations
ALTER TABLE courses ADD COLUMN IF NOT EXISTS teacher_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL;

-- Master Schedule (Start, Mid, Final dates)
CREATE TABLE IF NOT EXISTS schedules (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    grade_level INT NOT NULL,
    academic_year VARCHAR(50) NOT NULL,
    semester VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    mid_exam_date DATE NOT NULL,
    final_exam_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Materials table (Files up to 10MB per course)
CREATE TABLE IF NOT EXISTS materials (
    id VARCHAR(64) PRIMARY KEY,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    grade_level INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    title_amharic VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_by_teacher_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Grade Records (Evaluation Context: MidMark, FinalMark, TotalScore, PassStatus)
CREATE TABLE IF NOT EXISTS grade_records (
    id VARCHAR(64) PRIMARY KEY,
    student_id VARCHAR(64) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    course_id VARCHAR(64) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    academic_year VARCHAR(50) NOT NULL,
    mid_mark NUMERIC(5, 2),
    final_mark NUMERIC(5, 2),
    total_score NUMERIC(5, 2),
    pass_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_student_course_year UNIQUE(student_id, course_id, academic_year)
);
