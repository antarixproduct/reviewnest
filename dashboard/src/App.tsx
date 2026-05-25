import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { getSetupStatusApi, refreshApi } from './api/auth';
import { setAccessToken } from './api/client';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublicReviewPage from './pages/PublicReviewPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import ReviewRequestsPage from './pages/ReviewRequestsPage';
import FeedbackPage from './pages/FeedbackPage';
import SettingsPage from './pages/SettingsPage';
import DashboardLayout from './components/DashboardLayout';

const FullPageLoader = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
        <span style={{ color: 'white', fontSize: '20px', fontWeight: 800 }}>R</span>
      </div>
      <p style={{ color: '#2563eb', fontWeight: 700, fontSize: '14px' }}>Loading ReviewNest...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  if (isLoading) return <FullPageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const RootRoute = ({ setupComplete }: { setupComplete: boolean | null }) => {
  const { isAuthenticated } = useAuthStore();
  if (setupComplete === null) return <FullPageLoader />;
  if (!setupComplete) return <Navigate to="/register" replace />;
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

const RegisterRoute = ({ setupComplete }: { setupComplete: boolean | null }) => {
  if (setupComplete === null) return <FullPageLoader />;
  if (setupComplete) return <Navigate to="/login" replace />;
  return <RegisterPage />;
};

export default function App() {
  const { login, setLoading } = useAuthStore();
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);

  useEffect(() => {
    const init = async () => {
      const isPublicReview = window.location.pathname.startsWith('/r/');
      try {
        const setup = await getSetupStatusApi();
        setSetupComplete(setup.isSetupComplete);

        if (!setup.isSetupComplete || isPublicReview) {
          setLoading(false);
          return;
        }

        try {
          const data = await refreshApi();
          login(data.business, data.accessToken);
          setAccessToken(data.accessToken);
        } catch {
          setLoading(false);
        }
      } catch {
        setSetupComplete(false);
        setLoading(false);
      }
    };

    init();
  }, [login, setLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute setupComplete={setupComplete} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterRoute setupComplete={setupComplete} />} />
        <Route path="/r/:token" element={<PublicReviewPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms-and-conditions" element={<TermsConditionsPage />} />

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="requests" element={<ReviewRequestsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
