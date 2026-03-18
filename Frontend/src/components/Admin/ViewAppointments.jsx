import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { CalendarDays, UserCircle2, Users, Clock, CheckCircle2, AlertCircle, XCircle, Loader2 } from "lucide-react";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS = {
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    bg: "#f0fdf4",
    color: "#16a34a",
    border: "#bbf7d0",
    dot: "#22c55e",
  },
  pending: {
    label: "Pending",
    icon: AlertCircle,
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
    dot: "#f59e0b",
  },
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    bg: BRAND_LIGHT,
    color: BRAND_DARK,
    border: "#bfdbfe",
    dot: BRAND,
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    bg: "#fef2f2",
    color: "#dc2626",
    border: "#fecaca",
    dot: "#ef4444",
  },
};

function StatusBadge({ status }) {
  const s = STATUS[status] ?? STATUS.pending;
  const Icon = s.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      <Icon size={11} />
      {s.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-slate-300">
      <CalendarDays size={36} strokeWidth={1.5} />
      <p className="text-sm font-medium">No appointments found</p>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Formats any date string — ISO, YYYY-MM-DD, etc. — into "28 May 2025" */
function formatDate(raw) {
  if (!raw) return "—";
  const d = new Date(raw);
  if (isNaN(d)) return raw; // fall back to raw if unparseable
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Formats a 24-h time string like "11:00" into "11:00 AM" */
function formatTime(raw) {
  if (!raw) return null;
  const [h, m] = raw.split(":").map(Number);
  if (isNaN(h)) return raw;
  const suffix = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m ?? 0).padStart(2, "0")} ${suffix}`;
}

/** Safe avatar initial — only shows a letter, never a digit */
function avatarInitial(name, fallback = "?") {
  if (!name || typeof name !== "string") return fallback;
  const letter = name.trim().match(/[A-Za-z]/)?.[0];
  return letter ? letter.toUpperCase() : fallback;
}

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/view-appointments");
        setAppointments(res.data.appointments || []);
      } catch (err) {
        console.error("Error fetching appointments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
        .appt-card {
          transition: box-shadow .15s, transform .15s;
        }
        .appt-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(74,144,226,0.13) !important;
        }
      `}</style>

      <div className="fade-up">

        {/* Section heading */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              <CalendarDays size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Appointments</h2>
              <p className="text-xs text-slate-400">All scheduled sessions</p>
            </div>
          </div>

          {!loading && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              {appointments.length} total
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-300">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {appointments.length === 0 ? (
              <EmptyState />
            ) : (
              appointments.map((appt, idx) => {
                const status = appt.status?.toLowerCase() ?? "pending";
                const statusCfg = STATUS[status] ?? STATUS.pending;
                const doctorName = appt.doctor?.user?.name || appt.doctor?.name || "N/A";
                const patientName = appt.patient?.user?.name || appt.patient?.name || "N/A";

                return (
                  <div
                    key={idx}
                    className="appt-card bg-white rounded-xl p-5"
                    style={{
                      border: "1.5px solid #dbeafe",
                      boxShadow: "0 1px 4px rgba(74,144,226,0.07)",
                    }}
                  >
                    {/* Top row: date + status */}
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ backgroundColor: BRAND_LIGHT }}
                      >
                        <CalendarDays size={13} style={{ color: BRAND }} />
                        <span className="text-xs font-semibold" style={{ color: BRAND_DARK }}>
                          {formatDate(appt.date)}
                        </span>
                        {appt.time && (
                          <>
                            <span className="text-slate-300 text-xs">·</span>
                            <Clock size={12} style={{ color: BRAND }} />
                            <span className="text-xs font-semibold" style={{ color: BRAND_DARK }}>
                              {formatTime(appt.time)}
                            </span>
                          </>
                        )}
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 mb-3.5" />

                    {/* Doctor row */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {avatarInitial(doctorName, "D")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 leading-none mb-0.5">
                          Doctor
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {doctorName}
                        </p>
                        {appt.doctor?.specialization && (
                          <p className="text-xs text-slate-400 truncate">{appt.doctor.specialization}</p>
                        )}
                      </div>
                    </div>

                    {/* Patient row */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: BRAND_DARK }}
                      >
                        {avatarInitial(patientName, "P")}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 leading-none mb-0.5">
                          Patient
                        </p>
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {patientName}
                        </p>
                      </div>
                    </div>

                    {/* Status bottom strip */}
                    <div
                      className="mt-4 -mx-5 -mb-5 px-5 py-2.5 rounded-b-xl flex items-center gap-1.5"
                      style={{ backgroundColor: statusCfg.bg, borderTop: `1px solid ${statusCfg.border}` }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: statusCfg.dot }}
                      />
                      <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
                        Appointment is {statusCfg.label.toLowerCase()}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </>
  );
}