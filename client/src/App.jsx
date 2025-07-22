import { Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'react-hot-toast';
import useAuthUser from './hooks/useAuthUser';
import PageLoader from './components/PageLoader';

// Pages
import Home from './pages/Home';
import Call from './pages/Call';
import Login from './pages/Login';
import Notification from './pages/Notification';
import SignUp from './pages/SignUp';
import Onborad from './pages/Onborad';
import Chat from './pages/Chat';
import Layout from './components/Layout';

// Route Guards
const PublicRoute = ({ children }) => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isAuthenticated && isOnboarded) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const ProtectedRoute = ({ children, requireOnboarding = true }) => {
  const { authUser } = useAuthUser();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireOnboarding && !isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!requireOnboarding && isOnboarded) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppWithLayout = ({ children, showSidebar = true }) => (
  <Layout showSidebar={showSidebar}>{children}</Layout>
);

const App = () => {
  const { isLoading } = useAuthUser();

  if (isLoading) return <PageLoader />;

  return (
    <div className="h-screen" data-theme="night">
      <Routes>
        {/* Public Routes */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <SignUp />
            </PublicRoute>
          } 
        />

        {/* Onboarding Route */}
        <Route 
          path="/onboarding" 
          element={
            <ProtectedRoute requireOnboarding={false}>
              <Onborad />
            </ProtectedRoute>
          } 
        />

        {/* Protected Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <AppWithLayout>
                <Home />
              </AppWithLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <AppWithLayout>
                <Notification />
              </AppWithLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/call" 
          element={
            <ProtectedRoute>
              <Call />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
      
      <Toaster />
    </div>
  );
};

export default App;