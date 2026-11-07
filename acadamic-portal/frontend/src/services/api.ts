import axios from 'axios';

const api = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/api/auth/login', credentials);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/api/auth/me');
    return res.data;
  },
};

export const adminApi = {
  getSchedule: async (grade?: number) => {
    const res = await api.get('/api/admin/schedule', { params: { grade } });
    return res.data;
  },
  saveSchedule: async (data: any) => {
    const res = await api.post('/api/admin/schedule', data);
    return res.data;
  },
  getCourses: async (grade?: number) => {
    const res = await api.get('/api/admin/courses', { params: { grade } });
    return res.data;
  },
  getTeachers: async () => {
    const res = await api.get('/api/admin/teachers');
    return res.data;
  },
  assignTeacher: async (courseId: string, teacherId: string | null) => {
    const res = await api.patch(`/api/admin/courses/${courseId}/assign-teacher`, { teacherId });
    return res.data;
  },
  getStudents: async (grade?: number) => {
    const res = await api.get('/api/admin/students', { params: { grade } });
    return res.data;
  },
  previewCsv: async (formData: FormData) => {
    const res = await api.post('/api/admin/students/preview-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  commitImport: async (rows: any[]) => {
    const res = await api.post('/api/admin/students/import', { rows });
    return res.data;
  },
  getConsolidatedGrades: async (grade?: number, year?: string) => {
    const res = await api.get('/api/admin/grades/consolidated', { params: { grade, year } });
    return res.data;
  },
  downloadCsv: async (grade?: number, year?: string) => {
    const res = await api.get('/api/admin/grades/export/csv', {
      params: { grade, year },
      responseType: 'blob',
    });
    return res.data;
  },
  downloadExcel: async (grade?: number, year?: string) => {
    const res = await api.get('/api/admin/grades/export/excel', {
      params: { grade, year },
      responseType: 'blob',
    });
    return res.data;
  },
  getPromotionCandidates: async (grade?: number) => {
    const res = await api.get('/api/admin/promotion/candidates', { params: { grade } });
    return res.data;
  },
  executePromotion: async (grade?: number) => {
    const res = await api.post('/api/admin/promotion/execute', { grade });
    return res.data;
  },
};

export const teacherApi = {
  // Course Ownership: returns only courses belonging to the authenticated teacher
  getMyCourses: async () => {
    const res = await api.get('/api/teacher/my-courses');
    return res.data;
  },
  getCourses: async (grade?: number) => {
    const res = await api.get('/api/teacher/courses', { params: { grade } });
    return res.data;
  },
  getCourseStudents: async (courseId: string, year?: string) => {
    const res = await api.get(`/api/teacher/courses/${courseId}/students`, { params: { year } });
    return res.data;
  },
  saveCourseGrade: async (courseId: string, data: any) => {
    const res = await api.post(`/api/teacher/courses/${courseId}/grades`, data);
    return res.data;
  },
  getGradebook: async (courseId: string, grade: number, year?: string) => {
    const res = await api.get('/api/teacher/gradebook', { params: { courseId, grade, year } });
    return res.data;
  },
  updateGrade: async (data: any) => {
    const res = await api.post('/api/teacher/gradebook/update', data);
    return res.data;
  },
  batchUpdateGrades: async (grades: any[]) => {
    const res = await api.post('/api/teacher/gradebook/batch', { grades });
    return res.data;
  },
  getMaterials: async (grade?: number, courseId?: string) => {
    const res = await api.get('/api/teacher/materials', { params: { grade, courseId } });
    return res.data;
  },
  uploadCourseMaterial: async (courseId: string, formData: FormData) => {
    const res = await api.post(`/api/teacher/courses/${courseId}/materials`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  uploadMaterial: async (formData: FormData) => {
    const res = await api.post('/api/teacher/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
  deleteMaterial: async (id: string) => {
    const res = await api.delete(`/api/teacher/materials/${id}`);
    return res.data;
  },
};

export const studentApi = {
  getDashboard: async (studentId?: string) => {
    const res = await api.get('/api/student/dashboard', { params: { studentId } });
    return res.data;
  },
  getTimeline: async (studentId?: string) => {
    const res = await api.get('/api/student/timeline', { params: { studentId } });
    return res.data;
  },
  getMaterials: async (studentId?: string) => {
    const res = await api.get('/api/student/materials', { params: { studentId } });
    return res.data;
  },
  getReportCard: async (studentId?: string, year?: string) => {
    const res = await api.get('/api/student/report-card', { params: { studentId, year } });
    return res.data;
  },
};

export default api;
