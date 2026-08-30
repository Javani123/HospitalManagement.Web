import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/Dashboard/DashboardPage';
import { PatientsPlaceholderPage } from '../pages/Patients/PatientsPlaceholderPage';
import { PathologyOverviewPage } from '../pages/Pathology/PathologyOverviewPage';
import { TestCategoriesPage } from '../pages/Pathology/TestCategoriesPage';
import { SampleTypesPage } from '../pages/Pathology/SampleTypesPage';
import { UnitsPage } from '../pages/Pathology/UnitsPage';
import { TestsPage } from '../pages/Pathology/TestsPage';
import { ReferenceRangesPage } from '../pages/Pathology/ReferenceRangesPage';
import { LabOrdersPage } from '../pages/Pathology/LabOrdersPage';
import { SamplesPage } from '../pages/Pathology/SamplesPage';
import { ResultsPage } from '../pages/Pathology/ResultsPage';
import { ReportsPage } from '../pages/Pathology/ReportsPage';
import { SettingsPlaceholderPage } from '../pages/Settings/SettingsPlaceholderPage';
import { NotFoundPage } from '../pages/NotFound/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Default route redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Patients Route */}
        <Route path="/patients" element={<PatientsPlaceholderPage />} />

        {/* Pathology Routes */}
        <Route path="/pathology" element={<PathologyOverviewPage />} />
        <Route path="/pathology/test-categories" element={<TestCategoriesPage />} />
        <Route path="/pathology/sample-types" element={<SampleTypesPage />} />
        <Route path="/pathology/units" element={<UnitsPage />} />
        <Route path="/pathology/tests" element={<TestsPage />} />
        <Route path="/pathology/reference-ranges" element={<ReferenceRangesPage />} />
        <Route path="/pathology/lab-orders" element={<LabOrdersPage />} />
        <Route path="/pathology/samples" element={<SamplesPage />} />
        <Route path="/pathology/results" element={<ResultsPage />} />
        <Route path="/pathology/reports" element={<ReportsPage />} />

        {/* Settings Route */}
        <Route path="/settings" element={<SettingsPlaceholderPage />} />

        {/* Fallback 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
