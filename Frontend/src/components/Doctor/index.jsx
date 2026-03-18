import { useState, useEffect } from "react";
import { UserCircle, CalendarDays, Users, Clock, LogOut, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import Profile from "./Profile";
import Appointments from "./Appointments";
import Patients from "./Patients";
import Availability from "./Availability";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../utils/authSlice";
import { useNavigate } from "react-router-dom";
import { fetchDoctorData } from "../../utils/doctorSlice";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const options = [
  { key: "profile", label: "Profile", icon: UserCircle },
  { key: "appointments", label: "Appointments", icon: CalendarDays },
  { key: "patients", label: "Patients", icon: Users },
  { key: "availability", label: "Availability", icon: Clock },
];

function avatarInitial(name, fallback = "D") {
  if (!name || typeof name !== "string") return fallback;
  return name.trim().match(/[A-Za-z]/)?.[0]?.toUpperCase() ?? fallback;
}

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 .5a.5.5 0 0 1 .293.085l7 4.5A.5.5 0 0 1 15.5 5.5v5a.5.5 0 0 1-.207.407l-7 5A.5.5 0 0 1 8 16a.5.5 0 0 1-.293-.093l-7-5A.5.5 0 0 1 .5 10.5v-5a.5.5 0 0 1 .207-.415l7-4.5A.5.5 0 0 1 8 .5Z" clipRule="evenodd" />
  </svg>
);

export default function DoctorPanel() {
  const [selected, setSelected] = useState("profile");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, doctorData } = useSelector((state) => state.doctor);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchDoctorData());
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  if (!isAuthenticated || !user) return null;

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: BRAND }} />
          <p className="text-sm font-medium text-slate-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        <div
          className="bg-white rounded-2xl p-8 w-full max-w-sm text-center"
          style={{
            border: "1px solid #dbeafe",
            boxShadow: "0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.06)",
          }}
        >
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} className="text-red-400" />
          </div>
          <h2 className="text-base font-bold text-slate-800 mb-1">Something went wrong</h2>
          <p className="text-sm text-slate-400 mb-5">{error}</p>
          <button
            onClick={() => dispatch(fetchDoctorData())}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ backgroundColor: BRAND }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = BRAND_DARK)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = BRAND)}
          >
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      </div>
    );
  }

  const doctorName = doctorData?.user?.name || doctorData?.name || user?.name || "Doctor";
  const doctorSpecialization = doctorData?.specialization || "";
  const activeOption = options.find(o => o.key === selected);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }

        
        .nav-scroll::-webkit-scrollbar { display: none; }
        .nav-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: BRAND_LIGHT }}>

        
        <aside
          className="w-full md:w-60 md:min-h-screen bg-white flex flex-col shrink-0"
          style={{
            borderRight: "1px solid #dbeafe",
            boxShadow: "2px 0 12px rgba(74,144,226,0.06)",
          }}
        >
          


          
          <div
            className="px-5 py-4 border-b hidden md:flex items-center gap-3"
            style={{ borderColor: "#dbeafe" }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
              style={{ backgroundColor: BRAND }}
            >
              {avatarInitial(doctorName)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate leading-tight">{doctorName}</p>
              {doctorSpecialization && (
                <p className="text-xs text-slate-400 truncate">{doctorSpecialization}</p>
              )}
            </div>
          </div>

          
          <div
            className="md:hidden flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "#dbeafe" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center"
                style={{ backgroundColor: BRAND, color: "#fff" }}
              >
                <IconShield />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND }}>
                Patient Portal
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-all"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>

          
          <nav className="flex md:flex-col overflow-x-auto nav-scroll gap-1 px-3 py-3 md:px-3 md:py-4 md:flex-1">
            {options.map((opt) => {
              const Icon = opt.icon;
              const active = selected === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setSelected(opt.key)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 md:w-full text-left"
                  style={{
                    backgroundColor: active ? BRAND_LIGHT : "transparent",
                    color: active ? BRAND : "#64748b",
                    borderLeft: active ? `3px solid ${BRAND}` : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.backgroundColor = "#f8fafc"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <Icon size={17} />
                  {opt.label}
                </button>
              );
            })}
          </nav>

          
          <div className="hidden md:block px-3 pb-5">
            <div className="border-t border-slate-100 pt-4">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-500 hover:bg-red-50 transition-all duration-150"
              >
                <LogOut size={17} /> Logout
              </button>
            </div>
          </div>
        </aside>

        
        <main className="flex-1 overflow-y-auto">
          
          <div
            className="bg-white px-6 py-4 border-b flex items-center justify-between"
            style={{ borderColor: "#dbeafe" }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: BRAND }}>
                {activeOption?.label}
              </p>
              <h1 className="text-lg font-bold text-slate-800 leading-tight">
                {activeOption?.label === "Profile" && "Your Profile"}
                {activeOption?.label === "Appointments" && "Your Appointments"}
                {activeOption?.label === "Patients" && "Your Patients"}
                {activeOption?.label === "Availability" && "Set Availability"}
              </h1>
            </div>

            

          </div>

          
          <div className="p-5 md:p-8 fade-up" key={selected}>
            {selected === "profile" && <Profile />}
            {selected === "appointments" && <Appointments />}
            {selected === "patients" && <Patients />}
            {selected === "availability" && <Availability />}
          </div>
        </main>
      </div>
    </>
  );
}