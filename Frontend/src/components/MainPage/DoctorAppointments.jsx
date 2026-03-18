import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-hot-toast";
import { Video, Loader2, FileText, Upload } from "lucide-react";
import AppointmentNotes from "./AppointmentNotes";
import { useNavigate } from "react-router-dom";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPrescriptionOnly, setIsPrescriptionOnly] = useState(false);
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/appointments/doctor`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStartCall = (appointmentId) => {
    // Navigate within the app so auth context is preserved
    navigate(`/video-call/${appointmentId}`);
  };

  const handleAppointmentComplete = (updatedAppointment) => {
    setAppointments(appointments.map(apt =>
      apt._id === updatedAppointment._id ? updatedAppointment : apt
    ));
    setSelectedAppointment(null);
    setIsPrescriptionOnly(false);
  };

  const handleUploadPrescription = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    setIsPrescriptionOnly(true);
  };

  const handleAddNotes = (appointmentId) => {
    setSelectedAppointment(appointmentId);
    setIsPrescriptionOnly(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Your Appointments</h2>
      {appointments.length === 0 ? (
        <p className="text-gray-500">No appointments found.</p>
      ) : (
        <div className="grid gap-4">
          {appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">
                    Patient: {appointment.patient?.name || "Unknown"}
                  </h3>
                  <p className="text-gray-600">
                    Date: {new Date(appointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">Time: {appointment.time}</p>
                  <p className="text-gray-600">
                    Status:{" "}
                    <span
                      className={`font-medium ${
                        appointment.status === "confirmed"
                          ? "text-green-600"
                          : appointment.status === "completed"
                          ? "text-blue-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap justify-end">
                  {appointment.status === "confirmed" && (
                    <>
                      <button
                        onClick={() => handleStartCall(appointment._id)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Start Call
                      </button>
                      <button
                        onClick={() => handleAddNotes(appointment._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Add Notes
                      </button>
                      <button
                        onClick={() => handleUploadPrescription(appointment._id)}
                        className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Prescription
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentNotes
          appointmentId={selectedAppointment}
          onComplete={handleAppointmentComplete}
          isPrescriptionOnly={isPrescriptionOnly}
        />
      )}
    </div>
  );
};

export default DoctorAppointments;