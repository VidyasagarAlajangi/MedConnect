import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchAdminData, fetchAllDoctors, fetchAllPatients } from "../../utils/adminSlice";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

// ── Icons ─────────────────────────────────────────────────────────────────────
const IconAdmin = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 .5a.5.5 0 0 1 .293.085l7 4.5A.5.5 0 0 1 15.5 5.5v5a.5.5 0 0 1-.207.407l-7 5A.5.5 0 0 1 8 16a.5.5 0 0 1-.293-.093l-7-5A.5.5 0 0 1 .5 10.5v-5a.5.5 0 0 1 .207-.415l7-4.5A.5.5 0 0 1 8 .5Z" clipRule="evenodd" />
  </svg>
);
const IconDoctor = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
    <path d="M6 10.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1Z" />
    <path fillRule="evenodd" d="M2 13.5C2 11.015 4.686 9 8 9s6 2.015 6 4.5V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-.5Zm6-1.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
  </svg>
);
const IconPatient = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
  </svg>
);
const IconMail = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793l6.598 3.185c.206.1.446.1.652 0L15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
  </svg>
);
const IconStethoscope = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
    <path d="M4 2.5a.5.5 0 0 0-1 0v5.5A4.5 4.5 0 0 0 7.5 12.5v1a.5.5 0 0 0 1 0v-1A4.5 4.5 0 0 0 13 8V2.5a.5.5 0 0 0-1 0V8a3.5 3.5 0 0 1-7 0V2.5Z" />
    <circle cx="12" cy="3.5" r="1.5" />
  </svg>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="bg-white rounded-xl p-5 flex items-center gap-4"
      style={{ border: "1px solid #dbeafe", boxShadow: "0 1px 4px rgba(74,144,226,0.08)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: accent ? BRAND : BRAND_LIGHT, color: accent ? "#fff" : BRAND }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, count }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
      >
        {icon}
      </div>
      <h2 className="text-base font-bold text-slate-700">{title}</h2>
      <span
        className="ml-1 px-2 py-0.5 rounded-full text-xs font-semibold"
        style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
      >
        {count}
      </span>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="col-span-full py-10 flex flex-col items-center gap-2 text-slate-300">
      <svg width="32" height="32" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14Zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16Z" />
        <path d="M7.5 7.5a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0V8a.5.5 0 0 1 .5-.5Zm0-3a.75.75 0 1 1 0 1.5.75.75 0 0 1 0-1.5Z" />
      </svg>
      <p className="text-sm">No {label} found</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const adminData = useSelector((state) => state.admin.adminData);
  const doctors = useSelector((state) => state.admin.doctors);
  const patients = useSelector((state) => state.admin.patients);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAdminData());
    dispatch(fetchAllDoctors());
    dispatch(fetchAllPatients());
  }, [dispatch]);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .22s ease both; }
        .card-hover {
          transition: box-shadow .15s, transform .15s;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(74,144,226,0.13) !important;
        }
      `}</style>

      <div
        className="min-h-screen fade-up"
        style={{ backgroundColor: BRAND_LIGHT }}
      >
        {/* ── Top nav bar ── */}
        <div
          className="bg-white border-b px-6 sm:px-8 py-4 flex items-center justify-between"
          style={{ borderColor: "#dbeafe" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: BRAND, color: "#fff" }}
            >
              <IconAdmin />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: BRAND }}>
                Patient Portal
              </p>
              <p className="text-sm font-semibold text-slate-700 leading-tight">Admin Dashboard</p>
            </div>
          </div>

          {adminData && (
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{ backgroundColor: BRAND }}
              >
                {adminData.name?.[0]?.toUpperCase() ?? "A"}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-slate-700 leading-tight">{adminData.name}</p>
                <p className="text-xs text-slate-400">{adminData.email}</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Page content ── */}
        <div className="px-6 sm:px-8 py-8 max-w-6xl mx-auto">

          {/* Greeting */}
          <div className="mb-7">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Good morning{adminData?.name ? `, ${adminData.name.split(" ")[0]}` : ""} 👋
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Here's what's happening in the portal today.</p>
          </div>

          {/* Stat strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={<IconAdmin />} label="Admins" value="1" accent />
            <StatCard icon={<IconDoctor />} label="Doctors" value={doctors.length} />
            <StatCard icon={<IconPatient />} label="Patients" value={patients.length} />
          </div>

          {/* ── Doctors ── */}
          <section className="mb-8">
            <SectionHeader icon={<IconDoctor />} title="Doctors" count={doctors.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.length === 0 ? (
                <EmptyState label="doctors" />
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="bg-white rounded-xl p-5 card-hover"
                    style={{
                      border: "1px solid #dbeafe",
                      boxShadow: "0 1px 4px rgba(74,144,226,0.07)",
                    }}
                  >
                    {/* Avatar + name */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {doctor.name?.[0]?.toUpperCase() ?? "D"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{doctor.name}</p>
                        {doctor.specialization && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span style={{ color: BRAND }}><IconStethoscope /></span>
                            <p className="text-xs text-slate-500 truncate">{doctor.specialization}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <IconMail />
                        <p className="text-xs truncate">{doctor.email}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* ── Patients ── */}
          <section>
            <SectionHeader icon={<IconPatient />} title="Patients" count={patients.length} />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.length === 0 ? (
                <EmptyState label="patients" />
              ) : (
                patients.map((patient) => (
                  <div
                    key={patient._id}
                    className="bg-white rounded-xl p-5 card-hover"
                    style={{
                      border: "1px solid #dbeafe",
                      boxShadow: "0 1px 4px rgba(74,144,226,0.07)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: BRAND_DARK }}
                      >
                        {patient.name?.[0]?.toUpperCase() ?? "P"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{patient.name}</p>
                        <div className="flex items-center gap-1.5 mt-0.5 text-slate-400">
                          <IconMail />
                          <p className="text-xs truncate">{patient.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;