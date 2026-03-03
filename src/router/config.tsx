import { RouteObject, Navigate } from 'react-router-dom';
import { lazy } from 'react';
import { AuthGuard, GuestGuard } from './guards';

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
  // 根路径：已登录跳 /dashboard，未登录跳 /login
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  // 登录页：已登录自动跳 /dashboard
  {
    path: '/login',
    element: <GuestGuard><LoginPage /></GuestGuard>,
  },
  { path: '/home', element: <HomePage /> },
  // 以下需要登录
  { path: '/dashboard', element: <AuthGuard><DashboardPage /></AuthGuard> },
  { path: '/stations', element: <AuthGuard><StationsPage /></AuthGuard> },
  { path: '/sop-config', element: <AuthGuard><SopConfigPage /></AuthGuard> },
  { path: '/monitoring', element: <AuthGuard><MonitoringPage /></AuthGuard> },
  { path: '/devices', element: <AuthGuard><DevicesPage /></AuthGuard> },
  { path: '/alerts', element: <AuthGuard><AlertsPage /></AuthGuard> },
  { path: '/reports', element: <AuthGuard><ReportsPage /></AuthGuard> },
  { path: '/datasets', element: <AuthGuard><DatasetsPage /></AuthGuard> },
  { path: '/annotation', element: <AuthGuard><AnnotationPage /></AuthGuard> },
  { path: '/training', element: <AuthGuard><TrainingPage /></AuthGuard> },
  { path: '/models', element: <AuthGuard><ModelsPage /></AuthGuard> },
  { path: '*', element: <NotFound /> },
];

export default routes;
