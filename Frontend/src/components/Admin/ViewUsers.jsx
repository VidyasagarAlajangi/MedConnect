import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Users, Mail, ShieldCheck, Stethoscope, UserRound, Loader2 } from "lucide-react";

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
    bg: "#f0fdf4",
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

function RoleBadge({ role }) {
  const r = ROLE[role] ?? ROLE.patient;
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

function avatarInitial(name, fallback = "?") {
  if (!name || typeof name !== "string") return fallback;
  const letter = name.trim().match(/[A-Za-z]/)?.[0];
  return letter ? letter.toUpperCase() : fallback;
}

function EmptyState() {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 py-16 text-slate-300">
      <Users size={36} strokeWidth={1.5} />
      <p className="text-sm font-medium">No users found</p>
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ViewUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get("/api/admin/view-users");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
              <Users size={17} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">Users</h2>
              <p className="text-xs text-slate-400">All registered accounts</p>
            </div>
          </div>

          {!loading && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}
            >
              {users.length} total
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
            {users.length === 0 ? (
              <EmptyState />
            ) : (
              users.map((user) => {
                const role = user.role?.toLowerCase() ?? "patient";
                const roleCfg = ROLE[role] ?? ROLE.patient;

                return (
                  <div
                    key={user._id}
                    className="user-card bg-white rounded-xl p-5"
                    style={{
                      border: "1.5px solid #dbeafe",
                      boxShadow: "0 1px 4px rgba(74,144,226,0.07)",
                    }}
                  >
                    {/* Avatar + name + role badge */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: roleCfg.avatarBg }}
                      >
                        {avatarInitial(user.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate leading-tight">
                          {user.name}
                        </p>
                        <div className="mt-1">
                          <RoleBadge role={role} />
                        </div>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Mail size={13} />
                        <p className="text-xs truncate">{user.email}</p>
                      </div>
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