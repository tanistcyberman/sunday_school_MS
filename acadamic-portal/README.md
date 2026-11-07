# Academic Portal (Continuous Education Monitoring Dept)

> **Digitized Educational Material Distribution and Examination Grading for Grades 4–10**  
> Strictly fulfilling department mandate without encroaching on Member Administration duties (No NFC, no attendance, no SMS).

---

## 🏛️ System Overview

The **Academic Portal** is built according to the **Antigravity CLI Master Specification** for the **Continuous Education Monitoring Department**.

- **Frontend**: React.js configured as a Progressive Web App (PWA) with Tailwind CSS, `react-i18next` (Amharic `am-ET` as default), and Google Fonts `Noto Sans Ethiopic`.
- **Theming**: Navy Blue (`#0f172a`), Gold (`#d4af37`), and Slate/White (`#f8fafc`, `#ffffff`) with custom SVG church architecture branding.
- **Backend**: Node.js with NestJS implementing strict **Hexagonal Architecture** (Domain, Application Ports & Use Cases, Infrastructure Adapters, Presentation Controllers).
- **Database**: PostgreSQL with strict `UTF-8` encoding to prevent Amharic character corruption.
- **Deployment**: Docker Compose orchestrated, ready for Linux VPS hosting (HahuCloud). 

---

## 📐 Hexagonal Architecture (Backend File Structure)

The backend follows the clean Hexagonal Architecture specified in Section 7 of the specification:

```
backend/src/
├── domain/                         # Core business logic (Zero external dependencies)
│   ├── entities/                   # Student, Course, GradeRecord, Schedule, Material, User
│   ├── value-objects/              # MidMark (0-40), FinalMark (0-60), TotalScore (0-100), PassStatus
│   └── exceptions/                 # InvalidMarkException, StudentNotFoundException, etc.
├── application/                    # Application Layer (Use Cases & Ports)
│   ├── use-cases/                  # PromoteStudentsUseCase, CalculateFinalGradeUseCase,
│   │                               # ImportStudentsUseCase, ExportGradesUseCase,
│   │                               # MasterScheduleUseCase, MaterialUseCase, AuthUseCase
│   └── ports/
│       ├── in/                     # Input port interfaces
│       └── out/                    # Output ports (StudentRepositoryPort, GradeRepositoryPort,
│                                   # CourseRepositoryPort, ScheduleRepositoryPort,
│                                   # MaterialRepositoryPort, UserRepositoryPort, FileStoragePort)
├── infrastructure/                 # Adapters (Database, Storage, Security)
│   ├── database/postgres/          # PostgresStudentRepo, PostgresGradeRepo, PostgresCourseRepo,
│   │                               # PostgresScheduleRepo, PostgresMaterialRepo, PostgresUserRepo,
│   │                               # DatabaseService, schema.sql, seed.ts
│   ├── storage/                    # LocalFileStorageAdapter (uploads directory)
│   ├── security/                   # JwtAuthGuard, RolesGuard, RolesDecorator
│   └── config/                     # configuration.ts
└── presentation/                   # Entry Points / Controllers
    ├── http/controllers/           # AdminController, TeacherController, StudentController, AuthController
    ├── app.module.ts               # Dependency injection wireup
    └── server.ts / main.ts         # NestFactory bootstrap & seed initialization
```

---

## 👥 Roles & Feature Matrix

### 1. 🛡️ Admin Role
- **MasterScheduleView**: Calendar form configuring Start, Mid, and Final exam dates for 4 courses per grade level across Grades 4–10.
- **StudentImportView**: CSV drag-and-drop zone with validation preview table (supports UTF-8 Amharic names).
- **GradeExportView**: Summary data table with direct actions to **Export to Excel (.xlsx)**, **Export to PDF**, and **Export to CSV (UTF-8 with BOM)**.
- **PromotionTriggerComponent**: Secured button with confirmation modal executing bulk student promotions (advancing passed students $\ge 50\%$ to the next grade tier, graduating Grade 10 students).

### 2. 👨‍🏫 Teacher Role
- **MaterialUploadView**: Form with file uploader (supports PDF, DOCX up to 10MB per course limit), course dropdown, and description.
- **DigitalGradebookView**: Dynamic data grid with editable Mid (40%) and Final (60%) columns, auto-calculating total percentage ($0-100\%$) and pass status in real-time.

### 3. 🎓 Student Role
- **StudentDashboard**: Landing page featuring the **AcademicTimeline** progress bar with phase milestones.
- **MaterialDownloadHub**: Card-based grid displaying PDFs and docs organized by course with one-click download.
- **GradeReportCard**: Official read-only table displaying personal exam results, course breakdowns, and final pass/fail decisions.

---

## 🌐 Localization & Amharic Support (i18n)

- **Default Language**: አማርኛ (`am-ET`) is the primary default language.
- **Font**: `Noto Sans Ethiopic` applied globally across all views and typography.
- **Translations**: Configured via `react-i18next` with complete Amharic (`am.json`) and English (`en.json`) dictionaries.
- **Language Switcher**: Persistent toggle in the shared navigation header.
- **Database / CSV Export**: UTF-8 BOM (`\uFEFF`) encoded to ensure Microsoft Excel natively displays Ge'ez / Amharic characters without distortion.

---

## 🚀 Quick Start & Development

### Prerequisites
- Node.js >= 18 (Tested on Node v24)
- PostgreSQL (or Docker)

### 1. Start with Docker Compose (Recommended for Local / VPS)
```bash
docker-compose up --build -d
```
- Frontend will be live at: `http://localhost:3000`
- Backend API will be live at: `http://localhost:3001`
- PostgreSQL will be running on port `5434` with UTF-8 encoding.

### 2. Run Manually (Local Development)

#### Backend:
```bash
cd backend
npm install
npm run build
npm run start:dev
```
Backend runs on `http://localhost:3001`. The seed database automatically seeds sample users, 28 courses (4 per grade level for Grades 4-10), and demo students.

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000` with hot module reloading and proxying `/api` requests to backend.

---

## 🔑 Demo Test Accounts

| Role | Username | Password | Default Home View |
|---|---|---|---|
| **Admin** | `admin` | `admin123` | Master Schedule / CSV Import / Grade Export |
| **Teacher** | `teacher` | `teacher123` | Digital Gradebook / Material Upload |
| **Student** | `student` | `student123` | Student Dashboard / Timeline / Report Card |

*(1-click login buttons are also provided on the login page for rapid evaluation)*

---

## ☁️ Deployment Target: Linux VPS (HahuCloud)

1. Connect to your HahuCloud Linux VPS instance via SSH.
2. Clone the repository into `/var/www/acadamic-portal` or your deployment directory.
3. Configure your production domain and `.env` file.
4. Run:
```bash
docker-compose up -d --build
```
5. Ensure Nginx / reverse proxy forwards port 80/443 to `3000` and `/api` to `3001`.
