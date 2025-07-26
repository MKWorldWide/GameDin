import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress, CssBaseline, ThemeProvider } from '@mui/material';
import { theme } from '@/theme';
import { useAuth } from '@/hooks/useAuth';
import { PrivateRoute } from '@/components/routing/PrivateRoute';
import { PublicRoute } from '@/components/routing/PublicRoute';
import { Layout } from '@/components/layout/Layout';
import { AnalyticsProvider } from '@/contexts/AnalyticsContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage'));
const UsersPage = React.lazy(() => import('@/pages/UsersPage'));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage'));
const UserDetailsPage = React.lazy(() => import('@/pages/UserDetailsPage'));
const OnboardingAnalyticsPage = React.lazy(() => import('@/pages/OnboardingAnalyticsPage'));
const SystemHealthPage = React.lazy(() => import('@/pages/SystemHealthPage'));
const ActivityLogsPage = React.lazy(() => import('@/pages/ActivityLogsPage'));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'));
const LoginPage = React.lazy(() => import('@/pages/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = React.lazy(() => import('@/pages/ResetPasswordPage'));
const NotFoundPage = React.lazy(() => import('@/pages/NotFoundPage'));
const SegmentsPage = React.lazy(() => import('@/pages/analytics/SegmentsPage'));

// Loading component for Suspense fallback
const Loading = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
    }}
  >
    <CircularProgress />
  </Box>
);

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

const App = () => {
  const { isAuthenticated } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AnalyticsProvider>
          <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public routes */}
          <Route
            path="/login"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <PublicRoute isAuthenticated={isAuthenticated}>
                <ResetPasswordPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <PrivateRoute isAuthenticated={isAuthenticated}>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="analytics">
              <Route index element={<AnalyticsPage />} />
              <Route path="overview" element={<AnalyticsPage />} />
              <Route path="users" element={<div>User Analytics</div>} />
              <Route path="segments" element={<SegmentsPage />} />
              <Route path="segments/:segmentId" element={<SegmentsPage />} />
              <Route path="segments/:segmentId/:action" element={<SegmentsPage />} />
            </Route>

            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </AnalyticsProvider>
      </ThemeProvider>
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
};

export default App;
