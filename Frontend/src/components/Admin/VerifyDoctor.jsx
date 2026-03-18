import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Users, Mail, ShieldCheck, Stethoscope, UserRound, Loader2, CheckCircle, XCircle, FileText, ExternalLink } from "lucide-react";
import { toast } from "react-hot-toast";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE = {
  admin: {
    label: "Admin",
    icon: ShieldCheck,
    bg: BRAND_LIGHT,
    color: BRAND_DARK,
    border: "#bfdbfe",
    avatarBg: BRAND,
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    bg: "#ecfdf5",
    color: "#16a34a",
    border: "#bbf7d0",
    avatarBg: "#22c55e",
  },
  patient: {
    label: "Patient",
    icon: UserRound,
    bg: "#fffbeb",
    color: "#d97706",
    border: "#fde68a",
    avatarBg: BRAND_DARK,
  },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function avatarInitial(name, fallback = "?") {
  if (!name || typeof name !== "string") return fallback;
  const letter = name.trim().match(/[A-Za-z]/)?.[0];
  return letter ? letter.toUpperCase() : fallback;
}

function RoleBadge({ role }) {
  const r = ROLE[role?.toLowerCase()] ?? ROLE.patient;
  const Icon = r.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: r.bg, color: r.color, border: `1px solid ${r.border}` }}
    >
      <Icon size={11} />
      {r.label}
    </span>
  );
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-slate-300">
      <Stethoscope size={36} strokeWidth={1.5} />
      <p className="text-sm font-medium">No pending doctors found</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function VerifyDoctor() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchPendingDoctors = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/admin/pending-doctors");
      setDoctors(res.data.doctors || []);
    } catch (err) {
      console.error("Error fetching pending doctors:", err);
      toast.error("Failed to load pending doctors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const handleVerify = async (doctorId, action) => {
    try {
      setProcessing(doctorId);
      const res = await axiosInstance.patch(`/api/admin/verify-doctor/${doctorId}`, { action });
      if (res.data.success) {
        toast.success(res.data.message);
        setDoctors(prev => prev.filter(d => d._id !== doctorId));
      }
    } catch (err) {
      console.error(`Error during doctor ${action}:`, err);
      toast.error(err.response?.data?.message || `Failed to ${action} doctor`);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
        .user-card {
          transition: box-shadow .15s, transform .15s;
        }
        .user-card:hover {
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
              <ShieldCheck size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Verify Doctors</h2>
              <p className="text-xs text-slate-400">Review and approve medical registrations</p>
            </div>
          </div>

          {!loading && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              {doctors.length} pending
            </span>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-300">
            <Loader2 size={28} className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {doctors.length === 0 ? (
              <EmptyState />
            ) : (
              doctors.map((doctor) => {
                const user = doctor.user || {};
                return (
                  <div
                    key={doctor._id}
                    className="user-card bg-white rounded-xl p-6 overflow-hidden"
                    style={{
                      border: "1.5px solid #dbeafe",
                      boxShadow: "0 1px 4px rgba(74,144,226,0.07)",
                    }}
                  >
                    {/* Header: Avatar, Name, Specialty */}
                    <div className="flex items-start gap-4 mb-5">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: BRAND }}
                      >
                        {avatarInitial(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-slate-800 truncate">
                          {user.name || "Unknown Doctor"}
                        </h3>
                        <p className="text-xs text-blue-600 font-semibold mb-1">
                          {doctor.specialization || "No Specialization"}
                        </p>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Mail size={12} />
                          <span className="text-xs truncate">{user.email}</span>
                        </div>
                      </div>
                      <RoleBadge role="doctor" />
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Experience</p>
                        <p className="text-sm font-bold text-slate-700">{doctor.experience || 0} Years</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">License No.</p>
                        <p className="text-sm font-bold text-slate-700">{doctor.licenseNumber || "N/A"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                        <p className="text-sm text-slate-600 truncate">{doctor.address || "No address provided"}</p>
                      </div>
                    </div>

                    {/* Certificate Preview */}
                    {doctor.certificateUrl && (
                      <div className="mb-6 p-4 rounded-xl border border-blue-100 bg-blue-50/50 flex items-center justify-between group/cert">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm border border-blue-50">
                            <FileText size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800">Medical Certificate</p>
                            <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tighter">Verified Upload</p>
                          </div>
                        </div>
                        <a 
                          href={doctor.certificateUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 border-t border-slate-100 pt-5">
                      <button
                        onClick={() => handleVerify(doctor._id, "reject")}
                        disabled={processing === doctor._id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => handleVerify(doctor._id, "approve")}
                        disabled={processing === doctor._id}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-colors shadow-lg shadow-green-200 disabled:opacity-50"
                      >
                        {processing === doctor._id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle size={16} />
                        )}
                        Approve
                      </button>
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