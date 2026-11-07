import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { ChurchFooter } from './components/ChurchFooter';
import { ProtectedRoute } from './components/ProtectedRoute';

// Views
import { LoginView } from './views/LoginView';
import { MasterScheduleView } from './views/admin/MasterScheduleView';
import { StudentImportView } from './views/admin/StudentImportView';
import { GradeExportView } from './views/admin/GradeExportView';
import { PromotionView } from './views/admin/PromotionView';

import { DigitalGradebookView } from './views/teacher/DigitalGradebookView';
import { MaterialUploadView } from './views/teacher/MaterialUploadView';

import { StudentDashboard } from './views/student/StudentDashboard';
import { MaterialDownloadHub } from './views/student/MaterialDownloadHub';
import { GradeReportCard } from './views/student/GradeReportCard';

const RootRedirect: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === 'ADMIN') return <Navigate to="/admin/schedule" replace />;
  if (role === 'TEACHER') return <Navigate to="/teacher/gradebook" replace />;
  if (role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-[#f8fafc]">
          <Header />
          <main className="flex-1 pb-16">
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<LoginView />} />

              {/* Admin Protected Views */}
              <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                <Route path="/admin/schedule" element={<MasterScheduleView />} />
                <Route path="/admin/import" element={<StudentImportView />} />
                <Route path="/admin/export" element={<GradeExportView />} />
                <Route path="/admin/promotion" element={<PromotionView />} />
              </Route>

              {/* Teacher Protected Views */}
              <Route element={<ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']} />}>
                <Route path="/teacher/gradebook" element={<DigitalGradebookView />} />
                <Route path="/teacher/materials" element={<MaterialUploadView />} />
              </Route>

              {/* Student Protected Views */}
              <Route element={<ProtectedRoute allowedRoles={['STUDENT', 'TEACHER', 'ADMIN']} />}>
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/materials" element={<MaterialDownloadHub />} />
                <Route path="/student/report-card" element={<GradeReportCard />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <ChurchFooter />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
