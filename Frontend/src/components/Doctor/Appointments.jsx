import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAppointments, updateAppointmentStatus } from "../../utils/appointmentSlice";
import {
  Video,
  Loader2,
  Check,
  X,
  Clock,
  User,
  Calendar,
  MessageCircle,
  Shield,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import useSocket from "../../utils/useSocket";
import DoctorChat from "../MainPage/DoctorChat";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const getInitials = (name = "") => name.trim().match(/[A-Za-z]/)?.[0]?.toUpperCase() || "?";

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric"
  });
};

const formatTime = (time) => {
  if (!time) return "";
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};


const StatusBadge = ({ status }) => {
  const configs = {
    confirmed: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0', icon: <Check size={12} /> },
    pending: { bg: '#fffbeb', text: '#d97706', border: '#fde68a', icon: <Clock size={12} /> },
    completed: { bg: BRAND_LIGHT, text: BRAND_DARK, border: '#bfdbfe', icon: <Check size={12} /> },
    cancelled: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca', icon: <X size={12} /> },
  };
  const config = configs[status] || configs.pending;

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border"
      style={{ backgroundColor: config.bg, color: config.text, borderColor: config.border }}
    >
      {config.icon}
      <span className="capitalize">{status}</span>
    </div>
  );
};

const SectionHeader = ({ title, icon, count }) => (
  <div className="flex items-center gap-2.5 mb-6 mt-8 first:mt-0">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}>
      {React.cloneElement(icon, { size: 16 })}
    </div>
    <h2 className="text-base font-bold text-slate-700">{title}</h2>
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}>
      {count}
    </span>
  </div>
);


const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { appointments, loading, error } = useSelector((state) => state.appointments);
  const [activeChat, setActiveChat] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const token = localStorage.getItem("token");
  const socket = useSocket(token);

  useEffect(() => {
    dispatch(fetchAppointments());
  }, [dispatch]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => dispatch(fetchAppointments());
    socket.on('appointment:statusChanged', refresh);
    socket.on('appointment:new', refresh);
    return () => {
      socket.off('appointment:statusChanged', refresh);
      socket.off('appointment:new', refresh);
    };
  }, [socket, dispatch]);

  const handleStatusUpdate = async (appointmentId, status) => {
    try {
      await dispatch(updateAppointmentStatus({ appointmentId, status })).unwrap();
      toast.success(`Appointment ${status} successfully`);
    } catch (err) {
      toast.error(err.message || "Action failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen" style={{ backgroundColor: BRAND_LIGHT }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
      </div>
    );
  }

  const grouped = {
    pending: appointments.filter(app => app.status === "pending"),
    confirmed: appointments.filter(app => app.status === "confirmed"),
    completed: appointments.filter(app => app.status === "completed"),
    cancelled: appointments.filter(app => app.status === "cancelled"),
  };

  return (
    <div className="min-h-screen p-6 md:p-2" style={{ backgroundColor: BRAND_LIGHT }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
        
        .card-shadow {
          box-shadow: 0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74,144,226,0.15), 0 12px 48px rgba(74,144,226,0.10);
        }
      `}</style>

      <div className="max-w-5xl mx-auto">

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#dbeafe] card-shadow">
            <Calendar size={32} strokeWidth={1.5} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No appointments found in your schedule.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(grouped).map(([status, list]) => {
              if (list.length === 0) return null;
              return (
                <div key={status} className="fade-up">
                  <SectionHeader
                    title={`${status.charAt(0).toUpperCase() + status.slice(1)} Appointments`}
                    icon={status === 'pending' ? <Clock /> : <Calendar />}
                    count={list.length}
                  />
                  <div className="grid gap-4">
                    {list.map((app) => (
                      <AppointmentCard
                        key={app._id}
                        app={app}
                        onConfirm={() => handleStatusUpdate(app._id, "confirmed")}
                        onCancel={() => handleStatusUpdate(app._id, "cancelled")}
                        onVideo={() => navigate(`/video-call/${app._id}`)}
                        onChat={() => setActiveChat({ id: app._id, name: app.patient?.name })}
                        onViewDetails={() => setSelectedAppointment(app)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {activeChat && (
        <DoctorChat
          appointmentId={activeChat.id}
          otherUserName={activeChat.name}
          onClose={() => setActiveChat(null)}
        />
      )}

      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">Appointment Details</h2>
              <button onClick={() => setSelectedAppointment(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xl font-bold">
                  {getInitials(selectedAppointment.patient?.name)}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{selectedAppointment.patient?.name}</h3>
                  <p className="text-sm text-slate-500">{selectedAppointment.patient?.email || "No email provided"}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-semibold text-slate-700">{formatDate(selectedAppointment.date)}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Time</p>
                  <p className="text-sm font-semibold text-slate-700">{formatTime(selectedAppointment.time)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Patient Notes / Symptoms</p>
                <div className="bg-slate-50 p-4 rounded-xl text-sm text-slate-600 leading-relaxed border border-slate-100">
                  {selectedAppointment.notes || "No additional notes provided by the patient."}
                </div>
              </div>

              {selectedAppointment.prescription && (
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prescription Provided</p>
                  <a 
                    href={selectedAppointment.prescription} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Shield size={16} />
                    </div>
                    <span className="text-sm font-semibold">View Prescription Document</span>
                    <ChevronRight size={16} className="ml-auto" />
                  </a>
                </div>
              )}
            </div>
            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setSelectedAppointment(null)}
                className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AppointmentCard = ({ app, onConfirm, onCancel, onVideo, onChat, onViewDetails }) => {
  const [btnHover, setBtnHover] = useState(null);

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#dbeafe] card-shadow">
      <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />
      <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-center gap-6">

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold flex-shrink-0"
            style={{ backgroundColor: BRAND_DARK }}>
            {getInitials(app.patient?.name)}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-800">{app.patient?.name || "Unknown Patient"}</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Calendar size={13} style={{ color: BRAND }} /> {formatDate(app.date)}
              </span>
              <span className="flex items-center gap-1.5 text-xs text-slate-400">
                <Clock size={13} style={{ color: BRAND }} /> {formatTime(app.time)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
          <StatusBadge status={app.status} />

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
            {app.status === "pending" && (
              <>
                <button
                  onClick={onConfirm}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-[.98]"
                  style={{ backgroundColor: BRAND }}
                >
                  Confirm
                </button>
                <button
                  onClick={onCancel}
                  className="flex-1 sm:flex-none px-4 py-2 border-[1.5px] border-[#dbeafe] text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  Decline
                </button>
              </>
            )}

            {app.status === "confirmed" && (
              <>
                <button
                  onClick={onVideo}
                  onMouseEnter={() => setBtnHover('video')}
                  onMouseLeave={() => setBtnHover(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all active:scale-[.98]"
                  style={{ backgroundColor: btnHover === 'video' ? BRAND_DARK : BRAND }}
                >
                  <Video size={14} /> Video Call
                </button>
                <button
                  onClick={onChat}
                  className="flex items-center gap-2 px-4 py-2 border-[1.5px] border-[#dbeafe] text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  <MessageCircle size={14} /> Chat
                </button>
              </>
            )}

            {(app.status === "completed" || app.status === "cancelled") && (
              <button 
                onClick={onViewDetails}
                className="flex items-center gap-1 text-xs font-bold text-slate-400 uppercase tracking-widest group"
              >
                View Details <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;