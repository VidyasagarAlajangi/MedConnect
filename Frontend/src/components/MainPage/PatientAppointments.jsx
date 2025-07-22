import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Loader2, FileText, Download, Calendar, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to view appointments");
        navigate("/login");
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointment/my-appointments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(data.message || "Failed to fetch appointments");
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to fetch appointments");
      }

      setAppointments(data.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error(error.message || "Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded px-3 py-2"
            />
          </label>
        </div>
      </div>
      <div>
        {appointments.length === 0 ? (
          <div className="text-gray-500">No appointments found.</div>
        ) : (
          appointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold">{appointment.doctor?.name || "Doctor"}</span>
                </div>
                <div className="flex items-center gap-2 mt-2 md:mt-0">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span>{appointment.date}</span>
                  <Clock className="w-5 h-5 text-gray-400 ml-4" />
                  <span>{appointment.time}</span>
                </div>
              </div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="text-gray-600">
                  Status: <span className="font-medium">{appointment.status}</span>
                </div>
                {/* Add more appointment details here if needed */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PatientAppointments; 