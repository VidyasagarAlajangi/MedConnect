import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-hot-toast";
import {
  Loader2, FileText, Download, Calendar, Clock, User, Bell
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getSocket } from "../../utils/socket";

const STATUS_COLORS = {
  confirmed: "text-green-600 bg-green-50",
  completed: "text-blue-600 bg-blue-50",
  cancelled: "text-red-600 bg-red-50",
  pending: "text-yellow-600 bg-yellow-50",
};

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("pending");
  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) { navigate("/login"); return; }

      const res = await fetch(`${API_BASE_URL}/api/appointment/my-appointments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) { localStorage.removeItem("token"); navigate("/login"); return; }
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(data.data || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Join appointment socket rooms so call notifications work even when on this page
  useEffect(() => {
    const socket = getSocket();
    if (!socket || appointments.length === 0) return;
    appointments.forEach((apt) => {
      if (apt.status === "confirmed") {
        socket.emit("appointment:join", apt._id.toString());
      }
    });

    // Refresh when prescription is uploaded by doctor
    const handlePrescriptionUploaded = () => {
      fetchAppointments();
      toast.success("Your doctor uploaded a prescription!", { icon: "💊" });
    };
    socket.on("appointment:prescriptionUploaded", handlePrescriptionUploaded);
    return () => socket.off("appointment:prescriptionUploaded", handlePrescriptionUploaded);
  }, [appointments]);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }
  const filteredAppointments = appointments.filter((apt) => {
    if (activeFilter === "pending") return apt.status === "pending";
    if (activeFilter === "confirmed") return apt.status === "confirmed";
    if (activeFilter === "past")
      return apt.status === "completed" || apt.status === "cancelled";
    return true;
  });
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto flex gap-8">

        {/* Sidebar */}
        <div className="w-64 bg-white border border-gray-200 rounded-xl p-4 h-fit shadow-sm">

          <h3 className="text-sm font-semibold text-gray-500 mb-4 uppercase">
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

        {/* Appointment List */}
        <div className="flex-1">

          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)} Appointments
          </h2>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
              <p className="text-gray-400">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-5">

              {filteredAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >

                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-bold text-slate-800 text-lg">
                        Dr. {apt.doctor?.name || "Unknown"}
                      </p>
                      <p className="text-sm text-blue-600 font-semibold">
                        {apt.doctor?.specialization}
                      </p>
                      <div className="flex gap-4 text-xs text-slate-400 font-medium mt-2">
                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(apt.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock size={12} /> {apt.time}</span>
                      </div>

                      {/* Prescription Section */}
                      {apt.prescription && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100 flex items-center justify-between group/presc max-w-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                              {apt.prescription.toLowerCase().endsWith('.pdf') ? <FileText size={20} /> : <div className="w-8 h-8 rounded overflow-hidden"><img src={apt.prescription} alt="" className="w-full h-full object-cover" /></div>}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">Prescription Document</p>
                              <p className="text-[10px] text-blue-500 font-bold uppercase tracking-tight">Ready for download</p>
                            </div>
                          </div>
                          <a
                            href={apt.prescription}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                          >
                            <Download size={16} />
                          </a>
                        </div>
                      )}
                    </div>

                    <span
                      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${STATUS_COLORS[apt.status] || "text-gray-600 bg-gray-50"
                        }`}
                    >
                      {apt.status}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PatientAppointments;