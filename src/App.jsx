import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

import AppShell from './components/AppShell.jsx';
import CustomCursor, { CustomCursorProvider } from './components/ui/CustomCursor.jsx';
import { useAuth } from './app/AuthProvider.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FeaturePage from './pages/FeaturePage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function PublicOnly({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return children;
}

export default function App() {
  return (
    <CustomCursorProvider>
      <ScrollToTop />
      <CustomCursor />
      <Routes>
        <Route path="/" element={<Navigate to="/app" replace />} />
        <Route
          path="/login"
          element={(
            <PublicOnly>
              <LoginPage />
            </PublicOnly>
          )}
        />
        <Route
          path="/lupa-password"
          element={(
            <PublicOnly>
              <ForgotPasswordPage />
            </PublicOnly>
          )}
        />
        <Route
          path="/app"
          element={(
            <RequireAuth>
              <AppShell />
            </RequireAuth>
          )}
        >
          <Route index element={<DashboardPage />} />
          <Route path="kategori/:categorySlug" element={<CategoryPage />} />
          <Route path="fitur/:featureSlug" element={<FeaturePage />} />
          <Route path="*" element={<NotFoundPage embedded />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </CustomCursorProvider>
  );
}
