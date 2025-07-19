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

const App = () => {
  const location = useLocation();
  const { isLoading, authUser } = useAuthUser();

  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  const isPublicRoute = ['/login', '/signup'].includes(location.pathname);

  // 🔒 Not Authenticated → Login
  if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to="/login" replace />;
  }

  // ✅ Authenticated but Not Onboarded → Onboarding
  if (isAuthenticated && !isOnboarded && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // 🛑 If onboarded user tries to access login/signup → redirect to Home
  if (isAuthenticated && isOnboarded && isPublicRoute) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        {/* Public Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        {/* Onboarding */}
        <Route path="/onboarding" element={<Onborad />} />

        {/* Authenticated and Onboarded Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/notification" element={<Notification />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/call" element={<Call />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
      </Routes>
      <Toaster />
    </div>
  );
};

export default App;
