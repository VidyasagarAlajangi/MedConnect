import MainComponent from "./components/MainComponent";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';
import Register from "./components/MainPage/Register";
import Login from "./components/MainPage/Login";
import Header from "./components/MainPage/Header";
import Footer from "./components/MainPage/Footer";
import AboutUs from "./components/MainPage/AboutUs";
import Profile from "./components/MainPage/Profile";
import ChatBot from "./components/MainPage/ChatBot";
import DoctorRegistrationForm from "./components/MainPage/JoinDoctor.jsx";
import FindDoctor from "./components/MainPage/FindDoctor.jsx";
import DoctorDetails from "./components/MainPage/DoctorDetails.jsx";
import Appointments from "./components/MainPage/Appointments.jsx";
import AdminPanel from "./components/Admin";
import DoctorPanel from "./components/Doctor";
import { useSelector, useDispatch } from "react-redux";
import { initializeAuth, verifyToken } from "./utils/authSlice";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import VideoCall from "./components/VideoCall";

// Create router with future flags
const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

export default function App() {
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();
  const initialized = useRef(false);
  const lastVerification = useRef(0);
  const VERIFICATION_INTERVAL = 5 * 60 * 1000; // 5 minutes

  // Initialize auth state only once on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!initialized.current) {
        try {
          // First initialize from storage
          const initResult = await dispatch(initializeAuth()).unwrap();
          
          // Then verify token if it exists and hasn't been verified recently
          const token = localStorage.getItem("token");
          const now = Date.now();
          
          if (token && (now - lastVerification.current > VERIFICATION_INTERVAL)) {
            await dispatch(verifyToken()).unwrap();
            lastVerification.current = now;
          } else if (!token) {
            delete axios.defaults.headers.common['Authorization'];
          }
        } catch (error) {
          // Clear invalid data
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete axios.defaults.headers.common['Authorization'];
        } finally {
          initialized.current = true;
        }
      }
    };

    initAuth();
  }, [dispatch]);

  // Show loading spinner only during initial load
  const showLoading = loading && !initialized.current;

  return (
    <Router future={router.future}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          {showLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <AppContent user={user} isAuthenticated={isAuthenticated} />
          )}
        </div>
        <Footer />
      </div>
    </Router>
  );
}

function AppContent({ user = null, isAuthenticated = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const hasNavigated = useRef(false);
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  // Handle navigation based on auth state
  useEffect(() => {
    const path = location.pathname;
    const isDoctorRoute = path.startsWith("/doctor-dashboard");
    const isAdminRoute = path.startsWith("/admin");
    const isVideoCallRoute = path.startsWith("/video-call");
    const isPublicRoute = ["/login", "/register", "/AboutUs", "/"].includes(path);

    // Helper function to check if user is on correct route
    const isCorrectRoute = () => {
      if (!isAuthenticated || !user) return false;
      return (
        (user.role === "doctor" && isDoctorRoute) ||
        (user.role === "admin" && isAdminRoute) ||
        (user.role === "patient" && !isDoctorRoute && !isAdminRoute)
      );
    };

    // If not authenticated and trying to access protected route
    if (!isAuthenticated && !isPublicRoute && !isVideoCallRoute && !hasNavigated.current) {
      hasNavigated.current = true;
      navigate("/login", { replace: true });
      return;
    }

    // If authenticated and on public route, redirect to appropriate dashboard
    if (isAuthenticated && user && isPublicRoute && !isVideoCallRoute && !hasNavigated.current) {
      hasNavigated.current = true;
      
      switch (user.role) {
        case "doctor":
          navigate("/doctor-dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
      return;
    }

    // If authenticated but on wrong role route
    if (isAuthenticated && user && !hasNavigated.current && !isCorrectRoute() && !isVideoCallRoute) {
      hasNavigated.current = true;
      
      switch (user.role) {
        case "doctor":
          navigate("/doctor-dashboard", { replace: true });
          break;
        case "admin":
          navigate("/admin", { replace: true });
          break;
        default:
          navigate("/", { replace: true });
      }
      return;
    }

    // Reset navigation flag if we're on the correct route
    if (isCorrectRoute() || isVideoCallRoute) {
      hasNavigated.current = false;
    }
  }, [location, isAuthenticated, user, navigate]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainComponent />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/AboutUs" element={<AboutUs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chatbot" element={<ChatBot />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/find-doctor" element={<FindDoctor />} />
      <Route path="/doctor/:doctorId" element={<DoctorDetails />} />
      <Route path="/doctorRegistration" element={<DoctorRegistrationForm />} />
      <Route path="/video-call/:appointmentId" element={<VideoCall />} />

      {/* Protected Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminPanel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorPanel />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

AppContent.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  isAuthenticated: PropTypes.bool
};
  