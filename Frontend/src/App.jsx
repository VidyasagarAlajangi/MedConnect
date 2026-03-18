import MainComponent from "./components/MainComponent";
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from "react-router-dom";
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
import { initializeAuth, verifyToken, logout } from "./utils/authSlice";
import { addNotification } from "./utils/notificationSlice";
import { connectSocket, disconnectSocket, getSocket } from "./utils/socket";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import VideoCall from "./components/MainPage/VideoCall";
import CompleteAppointmentPage from "./components/MainPage/CompleteAppointmentPage";
import IncomingCallOverlay from "./components/IncomingCallOverlay";
import toast, { Toaster } from "react-hot-toast";
import axiosInstance from "./utils/axiosInstance";

const router = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

// Map appointment status to toast style
const STATUS_TOAST = {
  confirmed: { icon: '✅', msg: 'Your appointment has been confirmed!' },
  cancelled: { icon: '❌', msg: 'An appointment was cancelled.' },
  rejected:  { icon: '🚫', msg: 'Your appointment was rejected by the doctor.' },
  completed: { icon: '🏁', msg: 'Appointment marked as completed.' },
};

export default function App() {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();
  const initialized = useRef(false);

  // Global incoming call state
  const [incomingCall, setIncomingCall] = useState(null); // { appointmentId, doctorName }
  const callTimerRef = useRef(null);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      if (!initialized.current) {
        initialized.current = true;
        try {
          await dispatch(initializeAuth()).unwrap();
          if (localStorage.getItem("token")) {
            await dispatch(verifyToken()).unwrap();
          }
        } catch (error) {
          console.error("Auth initialization failed:", error);
        }
      }
    };
    initAuth();
  }, [dispatch]);

  // Listen for 401 events from axiosInstance and clear Redux state
  useEffect(() => {
    const handleAuthLogout = () => {
      dispatch(logout());
    };
    window.addEventListener("auth:logout", handleAuthLogout);
    return () => window.removeEventListener("auth:logout", handleAuthLogout);
  }, [dispatch]);

  // Socket: connect when authenticated, disconnect on logout
  useEffect(() => {
    if (isAuthenticated && token) {
      const socket = connectSocket(token);

      // ── Join appointment rooms so patient can receive call notifications ──
      if (user?.role === "patient") {
        const joinAppointmentRooms = async () => {
          try {
            const res = await axiosInstance.get("/api/appointment/my-appointments");
            const apts = res.data?.data || [];
            apts.forEach((apt) => {
              if (apt.status === "confirmed") {
                socket.emit("appointment:join", apt._id.toString());
              }
            });
          } catch (_) {
            // silently ignore — not critical
          }
        };
        // Wait for socket to connect before joining rooms
        if (socket.connected) {
          joinAppointmentRooms();
        } else {
          socket.once("connect", joinAppointmentRooms);
        }
      }

      // ── Global video call listener ────────────────────────────────────────
      const handleIncomingCall = ({ appointmentId, doctorName }) => {
        if (user?.role !== "patient") return; // only patients get call notifications
        setIncomingCall({ appointmentId, doctorName });
        // Auto-dismiss after 60 seconds
        clearTimeout(callTimerRef.current);
        callTimerRef.current = setTimeout(() => setIncomingCall(null), 60000);
      };

      const handleCallEnded = ({ appointmentId }) => {
        setIncomingCall((prev) =>
          prev?.appointmentId === appointmentId ? null : prev
        );
      };

      socket.on("video:call:incoming", handleIncomingCall);
      socket.on("video:call:ended", handleCallEnded);

      // ── Appointment status changes ────────────────────────────────────────
      socket.on('appointment:statusChanged', (data) => {
        const info = STATUS_TOAST[data.status];
        if (info) {
          toast(info.msg, { icon: info.icon, duration: 5000 });
          dispatch(addNotification({
            type: data.status === 'confirmed' ? 'success' : 'warning',
            message: info.msg,
            timestamp: data.timestamp,
          }));
        }
      });

      // New appointment (for doctors)
      socket.on('appointment:new', (data) => {
        if (user?.role === 'doctor') {
          toast('📅 New appointment booked!', { duration: 5000 });
          dispatch(addNotification({
            type: 'info',
            message: `New appointment from ${data.patientName} on ${data.date} at ${data.time}`,
            timestamp: data.timestamp,
          }));
        }
      });

      // Generic notification
      socket.on('notification:new', (data) => {
        if (!data.targetUserId || data.targetUserId === user?._id) {
          dispatch(addNotification({ type: data.type || 'info', message: data.message }));
        }
      });

      return () => {
        const s = getSocket();
        if (s) {
          s.off('video:call:incoming', handleIncomingCall);
          s.off('video:call:ended', handleCallEnded);
          s.off('appointment:statusChanged');
          s.off('appointment:new');
          s.off('notification:new');
        }
        clearTimeout(callTimerRef.current);
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, token, user, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router future={router.future}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {/* Global incoming call overlay — appears on top of everything */}
      <IncomingCallOverlay
        call={incomingCall}
        onDecline={() => {
          setIncomingCall(null);
          clearTimeout(callTimerRef.current);
        }}
      />
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          <AppContent user={user} isAuthenticated={isAuthenticated} />
        </div>
        <Footer />
      </div>
    </Router>
  );
}

function AppContent({ user = null, isAuthenticated = false }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const path = location.pathname;
    const isPublicRoute = ["/login", "/register", "/about", "/doctorRegistration"].includes(path);
    const isVideoCallRoute = path.startsWith("/video-call");
    const isCompleteRoute = path.startsWith("/complete-appointment");
    const isDoctorRoute = path.startsWith("/doctor-dashboard");
    const isAdminRoute = path.startsWith("/admin");
    const isRootRoute = path === "/";

    if (!isAuthenticated && !isPublicRoute && !isVideoCallRoute && !isCompleteRoute && !isRootRoute && !path.startsWith("/doctor/") && !path.startsWith("/find-doctor")) {
      navigate("/login", { replace: true });
      return;
    }

    if (isAuthenticated && user && (isPublicRoute && !path.startsWith("/doctorRegistration") && path !== "/about")) {
      switch (user.role) {
        case "doctor": navigate("/doctor-dashboard", { replace: true }); break;
        case "admin": navigate("/admin", { replace: true }); break;
        default: navigate("/", { replace: true });
      }
      return;
    }

    if (isAuthenticated && user?.role === "doctor" && !isDoctorRoute && !isVideoCallRoute && !isCompleteRoute && !isPublicRoute && !isRootRoute && !path.startsWith("/doctor/")) {
      navigate("/doctor-dashboard", { replace: true });
      return;
    }

    if (isAuthenticated && user?.role === "admin" && !isAdminRoute && !isPublicRoute && !isRootRoute) {
      navigate("/admin", { replace: true });
      return;
    }
  }, [location.pathname, isAuthenticated, user, navigate]);

  return (
    <Routes>
      <Route path="/" element={<MainComponent />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chatbot" element={<ChatBot />} />
      <Route path="/appointments" element={<Appointments />} />
      <Route path="/find-doctor" element={<FindDoctor />} />
      <Route path="/doctor/:doctorId" element={<DoctorDetails />} />
      <Route path="/doctorRegistration" element={<DoctorRegistrationForm />} />
      <Route path="/video-call/:appointmentId" element={<VideoCall />} />
      <Route path="/complete-appointment/:appointmentId" element={<CompleteAppointmentPage />} />
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
  user: PropTypes.shape({ role: PropTypes.string, name: PropTypes.string, email: PropTypes.string }),
  isAuthenticated: PropTypes.bool,
};