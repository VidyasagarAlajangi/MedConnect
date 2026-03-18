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

  // Listen for real-time status updates and refresh
  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (data) => {
      // Data format: { appointmentId, status, timestamp }
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

  // Cancel appointment logic
  const handleCancel = async (appointmentId) => {
    try {
      const res = await axiosInstance.put(`/api/appointment/cancel/${appointmentId}`);
      const data = res.data;

      if (!res.ok) {
        throw new Error(data.message || "Failed to cancel appointment");
      }

      // Update the appointment in Redux store
      dispatch(updateAppointment({
        _id: appointmentId,
        status: "cancelled"
      }));

      toast.success("Appointment cancelled successfully");
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      toast.error(err.message || "Failed to cancel appointment");
    }
  };

  // Handle video call connection
  const handleVideoCall = (appointment) => {
    navigate(`/video-call/${appointment._id}`);
  };

  // Handle ending video call
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

  // Helper to check if appointment is "now"
  const isNow = (date, time) => {
    if (!date || !time) return false;

    try {
      // Parse the time string - handle both HH:MM and HH:MM AM/PM formats
      let hour, minute;
      if (time.includes('AM') || time.includes('PM')) {
        // Handle 12-hour format (HH:MM AM/PM)
        const [timeStr, meridian] = time.split(' ');
        [hour, minute] = timeStr.split(':').map(Number);
        if (meridian === 'PM' && hour !== 12) hour += 12;
        if (meridian === 'AM' && hour === 12) hour = 0;
      } else {
        // Handle 24-hour format (HH:MM)
        [hour, minute] = time.split(':').map(Number);
      }

      // Create appointment date
      const apptDate = new Date(date);
      apptDate.setHours(hour, minute, 0, 0);

      // Get current date
      const now = new Date();

      // Allow "now" if within +/- 15 minutes
      return Math.abs(apptDate - now) < 15 * 60 * 1000;
    } catch (error) {
      console.error('Error parsing appointment time:', error);
      return false;
    }
  };

  // Filter appointments
  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed");
  const pastAppointments = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled"
  );

  // Horizontal card for pending/confirmed
  const renderHorizontalCard = (appointment, isConfirmed = false) => (
    <div
      key={appointment._id}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      {/* Left Info */}
      <div className="flex-1 space-y-2">

        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {appointment.doctor?.name || "Doctor"}
          </h3>
          <p className="text-sm text-gray-500">
            {appointment.doctor?.specialization || ""}
          </p>
        </div>

        <div className="flex items-center gap-5 text-sm text-gray-600">

          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-gray-400" />
            {appointment.date?.slice(0, 10)}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-400" />
            {appointment.time}
          </span>

        </div>

        <span
          className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${appointment.status === "confirmed"
              ? "bg-green-100 text-green-700"
              : appointment.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-gray-100 text-gray-600"
            }`}
        >
          {appointment.status.charAt(0).toUpperCase() +
            appointment.status.slice(1)}
        </span>

      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">

        <button
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition"
          onClick={() => handleCancel(appointment._id)}
        >
          <XCircle className="w-4 h-4" />
          Cancel
        </button>

        {isConfirmed && userRole === "doctor" && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#4A90E2] text-white rounded-md hover:bg-[#357ABD] transition"
            onClick={() => handleVideoCall(appointment)}
          >
            <Video className="w-4 h-4" />
            Start Call
          </button>
        )}

        {isConfirmed && (
          <button
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-md hover:border-[#4A90E2] hover:text-[#4A90E2] transition"
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

  // Full card for completed/cancelled
  const renderAppointmentCard = (appointment) => (
    <div
      key={appointment._id}
      className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
    >

      {/* Doctor Info */}
      <div className="mb-4">

        <h2 className="text-lg font-semibold text-gray-900">
          {appointment.doctor?.name || "Doctor"}
        </h2>

        <p className="text-sm text-gray-500">
          {appointment.doctor?.specialization || ""}
        </p>

      </div>

      {/* Appointment Info */}
      <div className="space-y-3 text-sm text-gray-600 mb-4">

        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          {appointment.date?.slice(0, 10)}
        </div>

        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          {appointment.time}
        </div>

        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5" />
          <p>{appointment.notes || "No notes provided"}</p>
        </div>

      </div>

      {/* Status */}
      <span
        className={`inline-block text-xs font-medium px-3 py-1 rounded-full mb-4 ${appointment.status === "completed"
            ? "bg-blue-100 text-blue-700"
            : appointment.status === "cancelled"
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          }`}
      >
        {appointment.status.charAt(0).toUpperCase() +
          appointment.status.slice(1)}
      </span>

      {/* Prescription */}
      <div className="mt-4 border-t pt-4">
        <p className="text-sm font-medium text-gray-700 mb-2 whitespace-nowrap">
          Medical Prescription
        </p>

        {appointment.prescription ? (
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100 group/presc">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm">
              {appointment.prescription.endsWith('.pdf') ? <FileText size={20} /> : <div className="w-8 h-8 rounded overflow-hidden"><img src={appointment.prescription} alt="" className="w-full h-full object-cover" /></div>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-800 truncate">Prescription Document</p>
              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">Available for view</p>
            </div>
            <a
              href={appointment.prescription}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
              title="View Prescription"
            >
              <FileText size={16} />
            </a>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">
            No prescription uploaded yet.
          </p>
        )}
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto flex gap-8">

        {/* Sidebar */}
        <div className="w-64 bg-white border border-gray-200 rounded-xl p-4 shadow-sm h-fit">

          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">
            Appointments
          </h3>

          <div className="space-y-2">

            <button
              onClick={() => setActiveFilter("pending")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "pending"
                ? "bg-[#4A90E2] text-white"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              Pending
            </button>

            <button
              onClick={() => setActiveFilter("confirmed")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "confirmed"
                ? "bg-[#4A90E2] text-white"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              Confirmed
            </button>

            <button
              onClick={() => setActiveFilter("past")}
              className={`w-full text-left px-3 py-2 rounded-md text-sm ${activeFilter === "past"
                ? "bg-[#4A90E2] text-white"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              Past
            </button>

          </div>
        </div>

        {/* Content */}
        <div className="flex-1">

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