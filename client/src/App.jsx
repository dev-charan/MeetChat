import { Route, Routes, Navigate, useLocation } from 'react-router';
import Home from './pages/Home';
import Call from './pages/Call';
import Login from './pages/Login';
import Notification from './pages/Notification';
import SignUp from './pages/SignUp';
import Onborad from './pages/Onborad';
import Chat from './pages/Chat';
import { Toaster } from 'react-hot-toast';
import PageLoader from './components/PageLoader';
import useAuthUser from './hooks/useAuthUser';

const ProtectedRoute = ({ children, isAuth }) => {
  return isAuth ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const location = useLocation();
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  // Optional: Force onboarding before accessing app
  if (isAuthenticated && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route path="/" element={<ProtectedRoute isAuth={isAuthenticated}><Home /></ProtectedRoute>} />
        <Route path="/notification" element={<ProtectedRoute isAuth={isAuthenticated}><Notification /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute isAuth={isAuthenticated}><Onborad /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute isAuth={isAuthenticated}><Chat /></ProtectedRoute>} />
        <Route path="/call" element={<ProtectedRoute isAuth={isAuthenticated}><Call /></ProtectedRoute>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
