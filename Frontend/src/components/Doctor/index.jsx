import { useState, useEffect } from "react";
import { UserCircle, CalendarDays, Users, Clock, LogOut } from "lucide-react";
import Profile from "./Profile";
import Appointments from "./Appointments";
import Patients from "./Patients";
import Availability from "./Availability";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../utils/authSlice";
import { useNavigate } from "react-router-dom";
import { fetchDoctorData } from "../../utils/doctorSlice";

const options = [
  { key: "profile", label: "Profile", icon: <UserCircle className="w-6 h-6" /> },
  { key: "appointments", label: "Appointments", icon: <CalendarDays className="w-6 h-6" /> },
  { key: "patients", label: "Patients", icon: <Users className="w-6 h-6" /> },
  { key: "availability", label: "Availability", icon: <Clock className="w-6 h-6" /> },
];

export default function DoctorPanel() {
  const [selected, setSelected] = useState("profile");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, doctorData } = useSelector((state) => state.doctor);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch doctor data when component mounts
    dispatch(fetchDoctorData());
  }, [dispatch]);

  const handleTabChange = (tab) => {
    setSelected(tab);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => dispatch(fetchDoctorData())}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg flex flex-col py-8 px-4">
        <h2 className="text-2xl font-bold text-indigo-700 mb-8 text-center">Doctor Panel</h2>
        <nav className="flex-1">
          {options.map((opt) => (
            <button
              key={opt.key}
              onClick={() => handleTabChange(opt.key)}
              className={`flex items-center gap-3 w-full px-4 py-3 mb-2 rounded-lg text-lg font-medium transition ${
                selected === opt.key
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-8 px-4 py-3 rounded-lg bg-red-100 text-red-700 font-semibold hover:bg-red-200 transition"
        >
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {selected === "profile" && <Profile />}
        {selected === "appointments" && <Appointments />}
        {selected === "patients" && <Patients />}
        {selected === "availability" && <Availability />}
      </main>
    </div>
  );
}