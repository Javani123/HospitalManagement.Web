import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { PublicRoute } from '../components/common/PublicRoute';
import { LoginPage } from '../pages/Auth/LoginPage';
import { ForbiddenPage } from '../pages/Forbidden/ForbiddenPage';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { PatientsListPage } from '../pages/Patients/PatientsListPage';
import { PatientDetailPage } from '../pages/Patients/PatientDetailPage';
import { PatientFormPage } from '../pages/Patients/PatientFormPage';
import { DepartmentsPage } from '../pages/Departments/DepartmentsPage';
import { StaffPage } from '../pages/Staff/StaffPage';
import { RolesPage } from '../pages/Roles/RolesPage';
import { DoctorsPage } from '../pages/Doctors/DoctorsPage';
import { TechniciansPage } from '../pages/Technicians/TechniciansPage';
import { AuditActorPage } from '../pages/Audit/AuditActorPage';
import { PathologyOverviewPage } from '../pages/Pathology/PathologyOverviewPage';
import { TestCategoriesPage } from '../pages/Pathology/TestCategoriesPage';
import { SampleTypesPage } from '../pages/Pathology/SampleTypesPage';
import { UnitsPage } from '../pages/Pathology/UnitsPage';
import { TestsPage } from '../pages/Pathology/TestsPage';
import { ReferenceRangesPage } from '../pages/Pathology/ReferenceRangesPage';
import { LabOrdersPage } from '../pages/Pathology/LabOrdersPage';
import { PathologyLabOrderFormPage } from '../pages/Pathology/PathologyLabOrderFormPage';
import { PathologyLabOrderDetailPage } from '../pages/Pathology/PathologyLabOrderDetailPage';
import { SamplesPage } from '../pages/Pathology/SamplesPage';
import { SampleDetailPage } from '../pages/Pathology/SampleDetailPage';
import { ResultsPage } from '../pages/Pathology/ResultsPage';
import { PathologyResultDetailPage } from '../pages/Pathology/PathologyResultDetailPage';
import { ReportsPage } from '../pages/Pathology/ReportsPage';
import { PathologyLabReportPage } from '../pages/Pathology/PathologyLabReportPage';
import { SettingsPlaceholderPage } from '../pages/Settings/SettingsPlaceholderPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ─── Public Authentication Route ──────────────────────────────────── */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* ─── Protected Application Routes (Requires Authentication) ────────── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Default route redirect to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* ─── Patient Routes (F3) ─────────────────────────────────────────── */}
          <Route path="/patients" element={<PatientsListPage />} />
          <Route path="/patients/new" element={<PatientFormPage />} />
          <Route path="/patients/:id" element={<PatientDetailPage />} />
          <Route path="/patients/:id/edit" element={<PatientFormPage />} />

          {/* ─── Department Master Routes (F14.2) ─────────────────────────────── */}
          <Route path="/departments" element={<DepartmentsPage />} />

          {/* ─── Staff Master Routes (F14.3) ──────────────────────────────────── */}
          <Route path="/staff" element={<StaffPage />} />

          {/* ─── Roles & Permissions Routes (F14.4) ───────────────────────────── */}
          <Route path="/roles" element={<RolesPage />} />

          {/* ─── Doctor Profile Master Routes (F14.5) ─────────────────────────── */}
          <Route path="/doctors" element={<DoctorsPage />} />

          {/* ─── Technician Profile Master Routes (F14.6) ─────────────────────── */}
          <Route path="/technicians" element={<TechniciansPage />} />

          {/* ─── Audit Actor & User-Staff Linkage (F14.7) ────────────────────── */}
          <Route path="/audit-actor" element={<AuditActorPage />} />

          {/* ─── Pathology Routes ────────────────────────────────────────────── */}
          <Route path="/pathology" element={<PathologyOverviewPage />} />
          <Route path="/pathology/test-categories" element={<TestCategoriesPage />} />
          <Route path="/pathology/sample-types" element={<SampleTypesPage />} />
          <Route path="/pathology/units" element={<UnitsPage />} />
          <Route path="/pathology/tests" element={<TestsPage />} />
          <Route path="/pathology/reference-ranges" element={<ReferenceRangesPage />} />
          <Route path="/pathology/lab-orders" element={<LabOrdersPage />} />
          <Route path="/pathology/lab-orders/new" element={<PathologyLabOrderFormPage />} />
          <Route path="/pathology/lab-orders/:id" element={<PathologyLabOrderDetailPage />} />
          <Route path="/pathology/samples" element={<SamplesPage />} />
          <Route path="/pathology/samples/:id" element={<SampleDetailPage />} />
          <Route path="/pathology/results" element={<ResultsPage />} />
          <Route path="/pathology/results/:id" element={<PathologyResultDetailPage />} />
          <Route path="/pathology/reports" element={<ReportsPage />} />
          <Route path="/pathology/reports/:orderId" element={<PathologyLabReportPage />} />

          {/* ─── Settings / Configuration ────────────────────────────────────── */}
          <Route path="/settings" element={<SettingsPlaceholderPage />} />

          {/* ─── Forbidden Access Restricted Route ───────────────────────────── */}
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* ─── Fallback 404 Route ──────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
