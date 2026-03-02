import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@/App.css';
import LandingPage from '@/pages/LandingPage';
import WorkspacesPage from '@/pages/WorkspacesPage';
import DashboardLayout from '@/pages/DashboardLayout';
import ArchitectureDashboard from '@/pages/ArchitectureDashboard';
import AnalysisDashboard from '@/pages/AnalysisDashboard';
import VulnerabilitiesDashboard from '@/pages/VulnerabilitiesDashboard';
import TaskBoard from '@/pages/TaskBoard';
import RepositoriesPage from '@/pages/RepositoriesPage';
import AuditDashboard from '@/pages/AuditDashboard';
import { Toaster } from '@/components/ui/sonner';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspaces" element={<WorkspacesPage />} />
          <Route path="/workspace/:workspaceId" element={<DashboardLayout />}>
            <Route path="audit" element={<AuditDashboard />} />
            <Route path="architecture" element={<ArchitectureDashboard />} />
            <Route path="analysis" element={<AnalysisDashboard />} />
            <Route path="vulnerabilities" element={<VulnerabilitiesDashboard />} />
            <Route path="board" element={<TaskBoard />} />
            <Route path="repos" element={<RepositoriesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" theme="dark" />
    </>
  );
}

export default App;