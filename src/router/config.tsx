import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const LoginPage = lazy(() => import('../pages/login/page'));
const HomePage = lazy(() => import('../pages/home/page'));
const DashboardPage = lazy(() => import('../pages/dashboard/page'));
const SopConfigPage = lazy(() => import('../pages/sop-config/page'));
const MonitoringPage = lazy(() => import('../pages/monitoring/page'));
const DevicesPage = lazy(() => import('../pages/devices/page'));
const ReportsPage = lazy(() => import('../pages/reports/page'));
const DatasetsPage = lazy(() => import('../pages/datasets/page'));
const AnnotationPage = lazy(() => import('../pages/annotation/page'));
const TrainingPage = lazy(() => import('../pages/training/page'));
const ModelsPage = lazy(() => import('../pages/models/page'));
const NotFound = lazy(() => import('../pages/NotFound'));
const StationsPage = lazy(() => import('../pages/stations/page'));
const AlertsPage = lazy(() => import('../pages/alerts/page'));

const routes: RouteObject[] = [
  { path: '/', element: <LoginPage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/home', element: <HomePage /> },
  { path: '/dashboard', element: <DashboardPage /> },
  { path: '/stations', element: <StationsPage /> },
  { path: '/sop-config', element: <SopConfigPage /> },
  { path: '/monitoring', element: <MonitoringPage /> },
  { path: '/devices', element: <DevicesPage /> },
  { path: '/alerts', element: <AlertsPage /> },
  { path: '/reports', element: <ReportsPage /> },
  { path: '/datasets', element: <DatasetsPage /> },
  { path: '/annotation', element: <AnnotationPage /> },
  { path: '/training', element: <TrainingPage /> },
  { path: '/models', element: <ModelsPage /> },
  { path: '*', element: <NotFound /> },
];

export default routes;
