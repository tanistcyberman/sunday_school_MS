import * as bcrypt from 'bcryptjs';
import { DatabaseService } from './DatabaseService';

export async function runSeed(db: DatabaseService) {
  console.log('Seeding initial data for Continuous Education Monitoring Dept Academic Portal...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('admin123', 10);
  const teacherHash = await bcrypt.hash('teacher123', 10);
  const studentHash = await bcrypt.hash('student123', 10);

  const users = [
    {
      id: 'usr_admin_1',
      username: 'admin',
      email: 'admin@academicportal.edu.et',
      passwordHash,
      role: 'ADMIN',
      fullName: 'Deacon Solomon Worku',
      fullNameAmharic: 'ዲ/ን ሰሎሞን ወርቁ',
      studentId: null
    },
    {
      id: 'usr_teacher_1',
      username: 'teacher',
      email: 'teacher@academicportal.edu.et',
      passwordHash: teacherHash,
      role: 'TEACHER',
      fullName: 'Teacher Yohannes Haile',
      fullNameAmharic: 'መምህር ዮሐንስ ኃይሌ',
      studentId: null
    },
    {
      id: 'usr_teacher_2',
      username: 'teacher2',
      email: 'teacher2@academicportal.edu.et',
      passwordHash: teacherHash,
      role: 'TEACHER',
      fullName: 'Sister Hanna Petros',
      fullNameAmharic: 'እህት ሐና ጴጥሮስ',
      studentId: null
    },
    {
      id: 'usr_student_1',
      username: 'student',
      email: 'student@academicportal.edu.et',
      passwordHash: studentHash,
      role: 'STUDENT',
      fullName: 'Yohannes Tesfaye',
      fullNameAmharic: 'ዮሐንስ ተስፋዬ',
      studentId: 'stu_g4_01'
    }
  ];

  for (const u of users) {
    await db.query(`
      INSERT INTO users (id, username, email, password_hash, role, full_name, full_name_amharic, student_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = EXCLUDED.role,
        full_name = EXCLUDED.full_name,
        full_name_amharic = EXCLUDED.full_name_amharic;
    `, [u.id, u.username, u.email, u.passwordHash, u.role, u.fullName, u.fullNameAmharic, u.studentId]);
    
    // In-memory fallback
    const memUsers = db.getMemoryStore().users;
    const existingIdx = memUsers.findIndex(x => x.id === u.id);
    const userRecord = {
      id: u.id,
      username: u.username,
      email: u.email,
      password_hash: u.passwordHash,
      passwordHash: u.passwordHash,
      role: u.role,
      full_name: u.fullName,
      full_name_amharic: u.fullNameAmharic,
      student_id: u.studentId,
      created_at: new Date()
    };
    if (existingIdx >= 0) {
      memUsers[existingIdx] = userRecord;
    } else {
      memUsers.push(userRecord);
    }
  }

  // 2. Seed 4 Courses per Grade Level (Grades 4-10) -> 28 courses with Teacher assignments
  const courseTemplates = [
    { codeSuffix: 'TH', name: 'Theology & Church Dogma', amharic: 'ትምህርተ ሃይማኖት' },
    { codeSuffix: 'CH', name: 'Church History', amharic: 'የቤተክርስቲያን ታሪክ' },
    { codeSuffix: 'CE', name: 'Christian Ethics & Morals', amharic: 'ክርስቲያናዊ ስነ-ምግባር' },
    { codeSuffix: 'LR', name: 'Liturgical Hymns & Rites', amharic: 'ዜማና ስነ-ስርዓት' }
  ];

  const courses: any[] = [];
  for (let grade = 4; grade <= 10; grade++) {
    courseTemplates.forEach((tmpl) => {
      const courseId = `crs_g${grade}_${tmpl.codeSuffix.toLowerCase()}`;
      const code = `G${grade}-${tmpl.codeSuffix}`;

      // Assign default teachers to specific courses for demonstration of course ownership RBAC:
      let teacherId: string | null = null;
      if (grade === 4) {
        if (tmpl.codeSuffix === 'TH' || tmpl.codeSuffix === 'CH') teacherId = 'usr_teacher_1';
        else if (tmpl.codeSuffix === 'CE' || tmpl.codeSuffix === 'LR') teacherId = 'usr_teacher_2';
      } else if (grade === 5 && tmpl.codeSuffix === 'TH') {
        teacherId = 'usr_teacher_1';
      }

      const courseObj = {
        id: courseId,
        code,
        name: `${tmpl.name} (Grade ${grade})`,
        nameAmharic: `${tmpl.amharic} (${grade}ኛ ክፍል)`,
        gradeLevel: grade,
        description: `Grade ${grade} core continuous curriculum for ${tmpl.name}`,
        descriptionAmharic: `የ${grade}ኛ ክፍል የ${tmpl.amharic} ትምህርት መመሪያ`,
        teacherId
      };
      courses.push(courseObj);
    });
  }

  for (const c of courses) {
    await db.query(`
      INSERT INTO courses (id, code, name, name_amharic, grade_level, description, description_amharic, teacher_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        name_amharic = EXCLUDED.name_amharic,
        description = EXCLUDED.description,
        description_amharic = EXCLUDED.description_amharic,
        teacher_id = EXCLUDED.teacher_id;
    `, [c.id, c.code, c.name, c.nameAmharic, c.gradeLevel, c.description, c.descriptionAmharic, c.teacherId]);

    const memCourses = db.getMemoryStore().courses;
    const existingIdx = memCourses.findIndex(x => x.id === c.id);
    const courseRecord = {
      id: c.id,
      code: c.code,
      name: c.name,
      name_amharic: c.nameAmharic,
      grade_level: c.gradeLevel,
      description: c.description,
      description_amharic: c.descriptionAmharic,
      teacher_id: c.teacherId,
      created_at: new Date()
    };
    if (existingIdx >= 0) {
      memCourses[existingIdx] = courseRecord;
    } else {
      memCourses.push(courseRecord);
    }
  }

  // 3. Seed Students across Grades 4-10 (Section: 1)
  const sampleStudents = [
    { id: 'stu_g4_01', code: 'STU-04-001', name: 'Yohannes Tesfaye', am: 'ዮሐንስ ተስፋዬ', grade: 4, gender: 'M', section: '1' },
    { id: 'stu_g4_02', code: 'STU-04-002', name: 'Maryamawit Bekele', am: 'ማርያማዊት በቀለ', grade: 4, gender: 'F', section: '1' },
    { id: 'stu_g5_01', code: 'STU-05-001', name: 'Bereket Dawit', am: 'በረከት ዳዊት', grade: 5, gender: 'M', section: '1' },
    { id: 'stu_g5_02', code: 'STU-05-002', name: 'Selamawit Alemu', am: 'ሰላማዊት አለሙ', grade: 5, gender: 'F', section: '1' },
    { id: 'stu_g6_01', code: 'STU-06-001', name: 'Natnael Gebre', am: 'ናትናኤል ገብሬ', grade: 6, gender: 'M', section: '1' },
    { id: 'stu_g7_01', code: 'STU-07-001', name: 'Hanna Daniel', am: 'ሐና ዳንኤል', grade: 7, gender: 'F', section: '1' },
    { id: 'stu_g8_01', code: 'STU-08-001', name: 'Abenezer Girma', am: 'አቤኔዘር ግርማ', grade: 8, gender: 'M', section: '1' },
    { id: 'stu_g9_01', code: 'STU-09-001', name: 'Tsion Kassahun', am: 'ፅዮን ካሣሁን', grade: 9, gender: 'F', section: '1' },
    { id: 'stu_g10_01', code: 'STU-10-001', name: 'Kidus Tadesse', am: 'ቅዱስ ታደሰ', grade: 10, gender: 'M', section: '1' },
    { id: 'stu_g10_02', code: 'STU-10-002', name: 'Ruth Mulugeta', am: 'ሩት ሙሉጌታ', grade: 10, gender: 'F', section: '1' }
  ];

  for (const s of sampleStudents) {
    await db.query(`
      INSERT INTO students (id, student_code, full_name, full_name_amharic, grade_level, gender, section, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE')
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        full_name_amharic = EXCLUDED.full_name_amharic,
        grade_level = EXCLUDED.grade_level,
        gender = EXCLUDED.gender,
        section = EXCLUDED.section;
    `, [s.id, s.code, s.name, s.am, s.grade, s.gender, s.section]);

    const memStudents = db.getMemoryStore().students;
    const existingIdx = memStudents.findIndex(x => x.id === s.id);
    const studentRecord = {
      id: s.id,
      student_code: s.code,
      full_name: s.name,
      full_name_amharic: s.am,
      grade_level: s.grade,
      gender: s.gender,
      section: s.section,
      status: 'ACTIVE',
      created_at: new Date()
    };
    if (existingIdx >= 0) {
      memStudents[existingIdx] = studentRecord;
    } else {
      memStudents.push(studentRecord);
    }
  }

  // 4. Seed Master Schedules
  for (const c of courses) {
    const schId = `sch_${c.id}`;
    const startDate = new Date('2026-09-15');
    const midExamDate = new Date('2026-11-20');
    const finalExamDate = new Date('2027-01-15');

    await db.query(`
      INSERT INTO schedules (id, course_id, grade_level, academic_year, semester, start_date, mid_exam_date, final_exam_date)
      VALUES ($1, $2, $3, '2026 E.C.', 'Term 1', $4, $5, $6)
      ON CONFLICT (id) DO NOTHING;
    `, [schId, c.id, c.gradeLevel, startDate, midExamDate, finalExamDate]);

    const memSchedules = db.getMemoryStore().schedules;
    if (!memSchedules.some(x => x.id === schId)) {
      memSchedules.push({
        id: schId,
        course_id: c.id,
        grade_level: c.gradeLevel,
        academic_year: '2026 E.C.',
        semester: 'Term 1',
        start_date: startDate,
        mid_exam_date: midExamDate,
        final_exam_date: finalExamDate,
        course_name: c.name,
        course_name_amharic: c.nameAmharic,
        created_at: new Date()
      });
    }
  }

  // 5. Seed Initial Grades for Student 1 (Grade 4)
  const g4Courses = courses.filter(c => c.gradeLevel === 4);
  const sampleMarks = [
    { mid: 36, final: 52 }, // 88%
    { mid: 34, final: 55 }, // 89%
    { mid: 38, final: 58 }, // 96%
    { mid: 32, final: 50 }  // 82%
  ];

  for (let i = 0; i < g4Courses.length; i++) {
    const crs = g4Courses[i];
    const mark = sampleMarks[i];
    const total = mark.mid + mark.final;
    const grdId = `grd_${sampleStudents[0].id}_${crs.id}`;

    await db.query(`
      INSERT INTO grade_records (id, student_id, course_id, academic_year, mid_mark, final_mark, total_score, pass_status)
      VALUES ($1, $2, $3, '2026 E.C.', $4, $5, $6, 'PASSED')
      ON CONFLICT (student_id, course_id, academic_year) DO UPDATE SET
        mid_mark = EXCLUDED.mid_mark,
        final_mark = EXCLUDED.final_mark,
        total_score = EXCLUDED.total_score,
        pass_status = EXCLUDED.pass_status;
    `, [grdId, sampleStudents[0].id, crs.id, mark.mid, mark.final, total]);

    const memGrades = db.getMemoryStore().grade_records;
    const existingIdx = memGrades.findIndex(x => x.id === grdId);
    const gradeRecord = {
      id: grdId,
      student_id: sampleStudents[0].id,
      course_id: crs.id,
      academic_year: '2026 E.C.',
      mid_mark: mark.mid,
      final_mark: mark.final,
      total_score: total,
      pass_status: 'PASSED',
      updated_at: new Date()
    };
    if (existingIdx >= 0) {
      memGrades[existingIdx] = gradeRecord;
    } else {
      memGrades.push(gradeRecord);
    }
  }

  // Seed sample material
  const sampleMatId = 'mat_sample_01';
  const firstCourse = courses[0];
  await db.query(`
    INSERT INTO materials (id, course_id, grade_level, title, title_amharic, description, file_name, file_path, file_size, mime_type, uploaded_by_teacher_id)
    VALUES ($1, $2, $3, 'Course Introduction & Syllabus', 'የትምህርቱ መግቢያና ማውጫ', 'Overview of church dogma and curriculum syllabus.', 'syllabus.pdf', 'course-materials/syllabus.pdf', 1048576, 'application/pdf', 'usr_teacher_1')
    ON CONFLICT (id) DO NOTHING;
  `, [sampleMatId, firstCourse.id, firstCourse.gradeLevel]);

  const memMaterials = db.getMemoryStore().materials;
  if (!memMaterials.some(x => x.id === sampleMatId)) {
    memMaterials.push({
      id: sampleMatId,
      course_id: firstCourse.id,
      grade_level: firstCourse.gradeLevel,
      title: 'Course Introduction & Syllabus',
      title_amharic: 'የትምህርቱ መግቢያና ማውጫ',
      description: 'Overview of church dogma and curriculum syllabus.',
      file_name: 'syllabus.pdf',
      file_path: 'course-materials/syllabus.pdf',
      file_size: 1048576,
      mime_type: 'application/pdf',
      uploaded_by_teacher_id: 'usr_teacher_1',
      course_name: firstCourse.name,
      course_name_amharic: firstCourse.nameAmharic,
      created_at: new Date()
    });
  }

  console.log('Seeding completed successfully!');
}
