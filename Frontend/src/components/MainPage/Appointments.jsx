import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { Calendar, Clock, User, XCircle, Video, MessageCircle, FileText } from "lucide-react";
import VideoCall from "./VideoCall";
import DoctorChat from "./DoctorChat";
import { fetchPatientData, fetchPatientAppointments, updateAppointment } from "../../utils/patientSlice";
import { fetchDoctorData, fetchDoctorAppointments } from "../../utils/doctorSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import useSocket from "../../utils/useSocket";

const Appointments = () => {
  const [error, setError] = useState("");
  const [activeVideoCall, setActiveVideoCall] = useState(null);
  const [activeChat, setActiveChat] = useState(null);
  const [activeFilter, setActiveFilter] = useState("pending");

  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role;
  const token = useSelector((state) => state.auth.token);

  const patientData = useSelector((state) => state.patient.patientData);
  const doctorData = useSelector((state) => state.doctor.doctorData);
  const appointments = useSelector((state) =>
    userRole === "doctor" ? state.doctor.appointments : state.patient.appointments
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const socket = useSocket(token);

  useEffect(() => {
    if (userRole === "doctor") {
      dispatch(fetchDoctorData());
      dispatch(fetchDoctorAppointments());
    } else {
      dispatch(fetchPatientData());
      dispatch(fetchPatientAppointments());
    }
  }, [dispatch, userRole]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      dispatch(updateAppointment({
        _id: data.appointmentId,
        status: data.status
      }));
    };

    socket.on('appointment:statusChanged', handleStatusUpdate);

    return () => {
      socket.off('appointment:statusChanged', handleStatusUpdate);
    };
  }, [socket, dispatch]);

  const handleCancel = async (appointmentId) => {
    try {
      const res = await axiosInstance.put(`/api/appointment/cancel/${appointmentId}`);
      const data = res.data;

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      dispatch(updateAppointment({
        _id: appointmentId,
        status: "cancelled"
      }));

      toast.success("Appointment cancelled successfully");
    } catch (err) {
      toast.error(err.message || "Failed to cancel appointment");
    }
  };

  const handleVideoCall = (appointment) => {
    navigate(`/video-call/${appointment._id}`);
  };

  const handleEndVideoCall = async () => {
    if (!activeVideoCall) return;

    try {
      const res = await axiosInstance.post(`/api/video/appointment/${activeVideoCall.appointmentId}/end`);
      const data = res.data;
      if (!res.ok) throw new Error(data.message || "Failed to end video call");
      setActiveVideoCall(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const isNow = (date, time) => {
    if (!date || !time) return false;

    try {
      let hour, minute;
      if (time.includes('AM') || time.includes('PM')) {
        const [timeStr, meridian] = time.split(' ');
        [hour, minute] = timeStr.split(':').map(Number);
        if (meridian === 'PM' && hour !== 12) hour += 12;
        if (meridian === 'AM' && hour === 12) hour = 0;
      } else {
        [hour, minute] = time.split(':').map(Number);
      }

      const apptDate = new Date(date);
      apptDate.setHours(hour, minute, 0, 0);

      const now = new Date();

      return Math.abs(apptDate - now) < 15 * 60 * 1000;
    } catch (error) {
      return false;
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed");
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  const renderHorizontalCard = (appointment, isConfirmed = false) => (
    <div
      key={appointment._id}
      className="bg-white border border-slate-100 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row md:items-center md:justify-between gap-5 relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 w-1.5 h-full ${appointment.status === "confirmed" ? "bg-green-500" : appointment.status === "pending" ? "bg-yellow-400" : "bg-slate-300"}`}></div>
      <div className="flex-1 space-y-3 pl-2">

        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-slate-800 tracking-tight">
              {appointment.doctor?.name || "Doctor"}
            </h3>
            <p className="text-sm text-blue-600 font-medium mt-0.5">
              {appointment.doctor?.specialization || ""}
            </p>
          </div>
          <span
            className={`inline-flex items-center text-xs font-bold px-3 py-1 rounded-full border ${appointment.status === "confirmed"
                ? "bg-green-50 text-green-700 border-green-200 shadow-[0_0_10px_rgba(74,222,128,0.2)]"
                : appointment.status === "pending"
                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
          >
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600 bg-slate-50 w-fit px-4 py-2.5 rounded-xl border border-slate-100">
          <span className="flex items-center gap-2 font-medium">
            <Calendar className="w-4 h-4 text-blue-500" />
            {appointment.date?.slice(0, 10)}
          </span>
          <span className="flex items-center gap-2 font-medium">
            <Clock className="w-4 h-4 text-amber-500" />
            {appointment.time}
          </span>
        </div>
      </div>

      <div className="flex flex-row flex-wrap gap-2 md:pl-4 md:border-l md:border-slate-100 w-full md:w-auto mt-2 md:mt-0">
        <button
          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-red-200 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-colors duration-200"
          onClick={() => handleCancel(appointment._id)}
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </button>

        {isConfirmed && userRole === "doctor" && (
          <button
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/30 transition-all duration-200"
            onClick={() => handleVideoCall(appointment)}
          >
            <Video className="w-4 h-4" />
            Call
          </button>
        )}

        {isConfirmed && (
          <button
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold border border-slate-200 text-slate-700 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 bg-white rounded-xl transition-all duration-200"
            onClick={() =>
              setActiveChat({
                id: appointment._id,
                name: appointment.doctor?.name,
              })
            }
          >
            <MessageCircle className="w-4 h-4" />
            Chat
          </button>
        )}

      </div>
    </div>
  );

  const renderAppointmentCard = (appointment) => (
    <div
      key={appointment._id}
      className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform md:hover:-translate-y-1 relative overflow-hidden"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 opacity-20 bg-gradient-to-br ${appointment.status === "completed" ? "from-blue-200" : "from-red-200"} to-transparent blur-2xl rounded-bl-[100px] pointer-events-none`}></div>

      <div className="flex justify-between items-start mb-5 relative z-10">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">
            {appointment.doctor?.name || "Doctor"}
          </h2>
          <p className="text-sm font-medium text-blue-600 mt-1">
            {appointment.doctor?.specialization || ""}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full border tracking-wide uppercase ${appointment.status === "completed"
              ? "bg-blue-50 text-blue-700 border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.15)]"
              : appointment.status === "cancelled"
                ? "bg-red-50 text-red-700 border-red-200 shadow-[0_0_10px_rgba(239,68,68,0.15)]"
                : "bg-slate-50 text-slate-600 border-slate-200"
            }`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-700 mb-5 relative z-10">
        <div className="flex items-center gap-3 font-medium">
          <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100"><Calendar className="w-4 h-4 text-blue-500" /></div>
          {appointment.date?.slice(0, 10)}
        </div>
        <div className="flex items-center gap-3 font-medium">
          <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100"><Clock className="w-4 h-4 text-amber-500" /></div>
          {appointment.time}
        </div>
        <div className="flex items-start gap-3 mt-1">
          <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-100 mt-0.5"><User className="w-4 h-4 text-emerald-500" /></div>
          <p className="leading-relaxed text-slate-600">{appointment.notes || "No notes provided"}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-5 relative z-10">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Medical Prescription
        </p>

        {appointment.prescription ? (
          <div className="flex items-center gap-3 p-2.5 bg-blue-50/50 rounded-xl border border-blue-100 hover:border-blue-300 hover:bg-blue-50 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50 shrink-0">
              {appointment.prescription.endsWith('.pdf') ? <FileText size={22} className="text-blue-500" /> : <div className="w-full h-full rounded-lg overflow-hidden border border-slate-100"><img src={appointment.prescription} alt="Prescription" className="w-full h-full object-cover" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate tracking-tight pr-2">Prescription Document</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight mt-0.5">Click view to open</p>
            </div>
            <a
              href={appointment.prescription}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all focus:ring-4 focus:ring-blue-100 shrink-0"
              title="View Prescription"
            >
              <FileText size={18} />
            </a>
          </div>
        ) : (
          <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
            <p className="text-sm font-medium">No prescription uploaded</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-6 md:py-8 px-4 sm:px-6">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 md:gap-8">

        
        <div className="w-full md:w-64 bg-white border border-slate-200 rounded-2xl p-4 md:p-5 shadow-sm h-fit shrink-0">

          <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-3 md:mb-5 px-1">
            Appointments
          </h3>

          <div className="flex flex-row md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">

            <button
              onClick={() => setActiveFilter("pending")}
              className={`flex-1 md:flex-none text-center md:text-left whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${activeFilter === "pending"
                ? "bg-blue-600 text-white shadow-blue-500/30 scale-100"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100"
                }`}
            >
              Pending
            </button>

            <button
              onClick={() => setActiveFilter("confirmed")}
              className={`flex-1 md:flex-none text-center md:text-left whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${activeFilter === "confirmed"
                ? "bg-blue-600 text-white shadow-blue-500/30 scale-100"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100"
                }`}
            >
              Confirmed
            </button>

            <button
              onClick={() => setActiveFilter("past")}
              className={`flex-1 md:flex-none text-center md:text-left whitespace-nowrap px-4 py-2.5 md:py-3 rounded-xl text-sm font-semibold transition-all duration-200 shadow-sm ${activeFilter === "past"
                ? "bg-blue-600 text-white shadow-blue-500/30 scale-100"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-100"
                }`}
            >
              Past
            </button>

          </div>
        </div>

        
        <div className="flex-1 min-w-0">

          {activeFilter === "pending" && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
                Pending Appointments
              </h2>

              {pendingAppointments.length === 0 ? (
                <p className="text-gray-500">No pending appointments.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingAppointments.map((a) =>
                    renderHorizontalCard(a, false)
                  )}
                </div>
              )}
            </>
          )}

          {activeFilter === "confirmed" && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-green-700">
                Confirmed Appointments
              </h2>

              {confirmedAppointments.length === 0 ? (
                <p className="text-gray-500">No confirmed appointments.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {confirmedAppointments.map((a) =>
                    renderHorizontalCard(a, true)
                  )}
                </div>
              )}
            </>
          )}

          {activeFilter === "past" && (
            <>
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Past Appointments
              </h2>

              {pastAppointments.length === 0 ? (
                <p className="text-gray-500">No past appointments.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </>
          )}

      </div>
    </div>

    {activeChat && (
      <DoctorChat
        appointmentId={activeChat.id}
        onClose={() => setActiveChat(null)}
        otherUserName={activeChat.name}
      />
    )}
  </div>
  );
};

export default Appointments;