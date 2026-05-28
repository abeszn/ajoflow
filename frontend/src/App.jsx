import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LandingPage     from './pages/LandingPage';
import Login           from './pages/Login';
import Register        from './pages/Register';
import ForgotPassword  from './pages/ForgotPassword';
import ResetPassword   from './pages/ResetPassword';
import Dashboard       from './pages/Dashboard';
import Groups          from './pages/Groups';
import Contributions   from './pages/Contributions';
import Settings        from './pages/Settings';
import Payouts         from './pages/Payouts';
import Reports         from './pages/Reports';

export default function App() {
  return (
    <ThemeProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"              element={<LandingPage />} />
          <Route path="/login"              element={<Login />} />
          <Route path="/register"           element={<Register />} />
          <Route path="/forgot-password"    element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/dashboard"     element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/groups"        element={<ProtectedRoute><Groups /></ProtectedRoute>} />
          <Route path="/contributions" element={<ProtectedRoute><Contributions /></ProtectedRoute>} />
          <Route path="/payouts"       element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
          <Route path="/reports"       element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings"      element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
}
