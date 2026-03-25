import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout }        from './components/layouts/RootLayout';
import { LoginPage }         from './pages/auth/LoginPage';
import { SignupPage }        from './pages/auth/SignupPage';

// Student
import { StudentDashboard }  from './pages/student/StudentDashboard';
import { TutorDirectory }    from './pages/student/TutorDirectory';
import { TutorProfile }      from './pages/student/TutorProfile';
import { MyBookings }        from './pages/student/MyBookings';

// Tutor
import { TutorDashboard }    from './pages/tutor/TutorDashboard';
import { TutorAvailability } from './pages/tutor/TutorAvailability';
import { TutorStudents }     from './pages/tutor/TutorStudents';

// Admin
import { AdminDashboard }    from './pages/admin/AdminDashboard';
import { AdminUsers }        from './pages/admin/AdminUsers';
import { AdminSessions }     from './pages/admin/AdminSessions';

// Shared
import { ProfilePage }       from './pages/shared/ProfilePage';
import { NotFound }          from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      // ── Default ──────────────────────────────────────────────────────────
      { index: true,              element: <Navigate to="/login" replace /> },

      // ── Auth ─────────────────────────────────────────────────────────────
      { path: 'login',            Component: LoginPage   },
      { path: 'signup',           Component: SignupPage  },

      // ── Student ──────────────────────────────────────────────────────────
      { path: 'student/dashboard', Component: StudentDashboard },
      { path: 'student/tutors',    Component: TutorDirectory   },
      { path: 'student/tutor/:id', Component: TutorProfile     },
      { path: 'student/bookings',  Component: MyBookings       },

      // ── Tutor ─────────────────────────────────────────────────────────────
      { path: 'tutor/dashboard',   Component: TutorDashboard    },
      { path: 'tutor/schedule',    Component: TutorAvailability },
      { path: 'tutor/students',    Component: TutorStudents     },

      // ── Admin ─────────────────────────────────────────────────────────────
      { path: 'admin/dashboard',   Component: AdminDashboard },
      { path: 'admin/users',       Component: AdminUsers     },
      { path: 'admin/sessions',    Component: AdminSessions  },

      // ── Shared ────────────────────────────────────────────────────────────
      { path: 'profile',           Component: ProfilePage },

      // ── Catch-all → 404 ───────────────────────────────────────────────────
      { path: '*',                 Component: NotFound },
    ],
  },
]);