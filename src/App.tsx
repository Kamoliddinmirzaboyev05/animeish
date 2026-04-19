import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const RegisterEmail = lazy(() => import('./pages/RegisterEmail'));
const RegisterOTP = lazy(() => import('./pages/RegisterOTP'));
const RegisterDetails = lazy(() => import('./pages/RegisterDetails'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ForgotPasswordEmail = lazy(() => import('./pages/ForgotPasswordEmail'));
const ForgotPasswordReset = lazy(() => import('./pages/ForgotPasswordReset'));
const Home = lazy(() => import('./pages/Home'));
const AnimeDetail = lazy(() => import('./pages/AnimeDetail'));
const VideoPlayer = lazy(() => import('./pages/VideoPlayer'));
const MyList = lazy(() => import('./pages/MyList'));
const Search = lazy(() => import('./pages/Search'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));

// Simple loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-dark">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          
          {/* New Registration Flow */}
          <Route path="/register" element={<RegisterEmail />} />
          <Route path="/register/verify-otp" element={<RegisterOTP />} />
          <Route path="/register/details" element={<RegisterDetails />} />
          
          {/* Forgot Password Flow */}
          <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
          <Route path="/forgot-password/verify" element={<ForgotPasswordReset />} />
          
          {/* Old routes for backward compatibility */}
          <Route path="/verify-otp" element={<VerifyOTP />} />
          
          <Route path="/home" element={<Home />} />
          
          <Route path="/anime/:id" element={<AnimeDetail />} />
          <Route path="/watch/:animeId/:episodeNumber" element={<VideoPlayer />} />
          <Route path="/search" element={<Search />} />
          
          <Route
            path="/my-list"
            element={
              <ProtectedRoute>
                <MyList />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
