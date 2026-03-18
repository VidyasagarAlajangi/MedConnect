import { useState } from "react";
import { UserPlus, Users, CalendarDays, UserCircle2, ChevronRight, ArrowLeft } from "lucide-react";
import VerifyDoctor from "./VerifyDoctor";
import ViewDoctors from "./ViewDoctors";
import ViewAppointments from "./ViewAppointments";
import ViewUsers from "./ViewUsers";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const options = [
  {
    key: "verifyDoctor",
    label: "Verify Doctors",
    description: "Review and approve pending doctor registrations",
    icon: UserPlus,
    iconBg: "#eaf2fb",
    iconColor: "#4a90e2",
  },
  {
    key: "viewDoctors",
    label: "View Doctors",
    description: "Browse all registered doctors and their profiles",
    icon: UserCircle2,
    iconBg: "#ecfdf5",
    iconColor: "#10b981",
  },
  {
    key: "viewAppointments",
    label: "View Appointments",
    description: "Monitor all scheduled and past appointments",
    icon: CalendarDays,
    iconBg: "#faf5ff",
    iconColor: "#8b5cf6",
  },
  {
    key: "viewUsers",
    label: "View Users",
    description: "Manage patient accounts and user records",
    icon: Users,
    iconBg: "#fff7ed",
    iconColor: "#f97316",
  },
];

const IconShield = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path fillRule="evenodd" d="M8 .5a.5.5 0 0 1 .293.085l7 4.5A.5.5 0 0 1 15.5 5.5v5a.5.5 0 0 1-.207.407l-7 5A.5.5 0 0 1 8 16a.5.5 0 0 1-.293-.093l-7-5A.5.5 0 0 1 .5 10.5v-5a.5.5 0 0 1 .207-.415l7-4.5A.5.5 0 0 1 8 .5Z" clipRule="evenodd" />
  </svg>
);

export default function AdminPanel() {
  const [selected, setSelected] = useState(null);

  const activeOption = options.find((o) => o.key === selected);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }

        .panel-card {
          transition: box-shadow .15s, transform .15s, border-color .15s;
        }
        .panel-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(74,144,226,0.13) !important;
          border-color: ${BRAND} !important;
        }
        .panel-card:hover .panel-arrow {
          opacity: 1;
          transform: translateX(0);
        }
        .panel-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: opacity .15s, transform .15s;
        }
      `}</style>

      <div className="min-h-screen py-6 px-4" style={{ backgroundColor: BRAND_LIGHT }}>
        <div className="w-full max-w-2xl mx-auto">

          
          <div className="mb-7 fade-up">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
              {selected ? activeOption?.label : "Admin Panel"}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {selected
                ? activeOption?.description
                : "Select an option below to manage the portal."}
            </p>
          </div>

          
          <div
            className="bg-white rounded-2xl overflow-hidden fade-up"
            style={{
              border: "1px solid #dbeafe",
              boxShadow: "0 2px 8px rgba(74,144,226,0.08), 0 8px 32px rgba(74,144,226,0.06)",
            }}
          >
            
            <div className="h-1" style={{ backgroundColor: BRAND }} />

            <div className="p-6 sm:p-8">
              {!selected ? (
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {options.map((opt) => {
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        onClick={() => setSelected(opt.key)}
                        className="panel-card text-left w-full flex items-center gap-4 p-4 rounded-xl bg-white"
                        style={{
                          border: "1.5px solid #e2e8f0",
                          boxShadow: "0 1px 3px rgba(74,144,226,0.06)",
                        }}
                      >
                        
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: opt.iconBg }}
                        >
                          <Icon size={20} style={{ color: opt.iconColor }} />
                        </div>

                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">{opt.label}</p>
                          <p className="text-xs text-slate-400 mt-0.5 leading-snug">{opt.description}</p>
                        </div>

                        
                        <div className="panel-arrow flex-shrink-0" style={{ color: BRAND }}>
                          <ChevronRight size={16} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                
                <div className="fade-up">
                  
                  <div className="flex items-center gap-3 mb-6">
                    <button
                      onClick={() => setSelected(null)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-semibold text-slate-600 bg-white hover:bg-slate-50 transition-all duration-150"
                      style={{ borderColor: "#dbeafe" }}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>

                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span>Admin Panel</span>
                      <ChevronRight size={12} />
                      <span className="font-semibold" style={{ color: BRAND }}>
                        {activeOption?.label}
                      </span>
                    </div>
                  </div>

                  
                  <div className="border-t border-slate-100 mb-6" />

                  
                  {selected === "verifyDoctor" && <VerifyDoctor />}
                  {selected === "viewDoctors" && <ViewDoctors />}
                  {selected === "viewAppointments" && <ViewAppointments />}
                  {selected === "viewUsers" && <ViewUsers />}
                </div>
              )}
            </div>
          </div>

          

        </div>
      </div>
    </>
  );
}