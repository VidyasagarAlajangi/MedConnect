import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2, FileText, Upload } from "lucide-react";
import AppointmentNotes from "./AppointmentNotes";

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isPrescriptionOnly, setIsPrescriptionOnly] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments/doctor`,
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Doctor Appointments</h2>
      {loading ? (
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      ) : (
        <div>
          {appointments.length === 0 ? (
            <div className="text-gray-500">No appointments found.</div>
          ) : (
            appointments.map((appointment) => (
              <div key={appointment._id} className="bg-white rounded-lg shadow-md p-6 mb-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{appointment.patient?.name || "Patient"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 md:mt-0">
                    <span>{appointment.date}</span>
                    <span className="ml-4">{appointment.time}</span>
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