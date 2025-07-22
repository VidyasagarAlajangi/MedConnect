import { useEffect, useState } from "react";
import { Calendar, Clock, User, XCircle } from "lucide-react";
import { useSelector, useDispatch } from 'react-redux';
import { fetchPatientData, fetchPatientAppointments, updateAppointment } from "../../utils/patientSlice";
import { fetchDoctorData, fetchDoctorAppointments } from "../../utils/doctorSlice";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const userRole = localStorage.getItem("role");

  // Get appointments from Redux store based on user role
  const appointments = useSelector((state) => 
    userRole === "doctor" ? state.doctor.appointments : state.patient.appointments
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (userRole === "doctor") {
          await dispatch(fetchDoctorData());
          await dispatch(fetchDoctorAppointments());
        } else {
          await dispatch(fetchPatientData());
          await dispatch(fetchPatientAppointments());
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load appointments");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, userRole]);

  // Cancel appointment logic
  const handleCancel = async (appointmentId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointment/cancel/${appointmentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      
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

  // Filter appointments
  const pendingAppointments = appointments.filter((a) => a.status === "pending");
  const confirmedAppointments = appointments.filter((a) => a.status === "confirmed");
  const completedAppointments = appointments.filter((a) => a.status === "completed");

  // Horizontal card for pending/confirmed
  const renderHorizontalCard = (appointment, isConfirmed = false) => (
    <div
      key={appointment._id}
      className="bg-white shadow rounded-lg flex flex-row items-center justify-between mb-4 w-full max-w-2xl mx-auto px-6 py-4"
    >
      <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
        <div>
          <div className="font-semibold text-lg text-teal-700">
            {appointment.doctor?.name || "Doctor"}
          </div>
          <div className="text-sm text-gray-500">
            {appointment.doctor?.specialization || ""}
          </div>
        </div>
        <div className="flex items-center text-gray-700 text-sm gap-4">
          <span className="flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            {appointment.date?.slice(0, 10)}
          </span>
          <span className="flex items-center">
            <Clock className="w-4 h-4 mr-1" />
            {appointment.time || ""}
          </span>
        </div>
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold
          ${appointment.status === "confirmed" ? "bg-green-100 text-green-700" :
            appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
            "bg-gray-100 text-gray-700"}
        `}>
          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
        </span>
      </div>
      <div className="flex flex-col gap-2 ml-4">
        <button
          className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          onClick={() => handleCancel(appointment._id)}
        >
          <XCircle className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );

  // Full card for completed/cancelled
  const renderAppointmentCard = (appointment) => (
    <div
      key={appointment._id}
      className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      {/* Doctor Info */}
      <div className="p-6 border-b bg-gradient-to-r from-teal-500 to-blue-600 text-white">
        <h2 className="text-xl font-semibold">
          {appointment.doctor?.name || "Doctor"}
        </h2>
        <p className="text-sm">{appointment.doctor?.specialization || ""}</p>
      </div>

      {/* Appointment Details */}
      <div className="p-6 space-y-4">
        <div className="flex items-center space-x-3 text-gray-700">
          <Calendar className="w-5 h-5 text-teal-500" />
          <span>{appointment.date?.slice(0, 10)}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <Clock className="w-5 h-5 text-teal-500" />
          <span>{appointment.time || ""}</span>
        </div>
        <div className="flex items-center space-x-3 text-gray-700">
          <User className="w-5 h-5 text-teal-500" />
          <span>Patient Notes:</span>
        </div>
        <p className="text-gray-600">{appointment.notes || ""}</p>
        <div className="mt-2">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
            ${appointment.status === "confirmed" ? "bg-green-100 text-green-700" :
              appointment.status === "pending" ? "bg-yellow-100 text-yellow-700" :
              appointment.status === "completed" ? "bg-blue-100 text-blue-700" :
              appointment.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}
          `}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Prescription Photo */}
      <div className="p-6 border-t">
        <h3 className="text-lg font-medium text-gray-800 mb-3">
          Prescription
        </h3>
        {appointment.prescriptionPhoto ? (
          <img
            src={appointment.prescriptionPhoto}
            alt="Prescription"
            className="w-full h-40 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="text-gray-400">No prescription uploaded.</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800">Your Appointments</h1>
          <p className="text-gray-600 mt-2">
            Review your upcoming and past appointments below.
          </p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading appointments...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <>
            {/* Pending Appointments */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-yellow-700 mb-4">Pending Appointments</h2>
              {pendingAppointments.length === 0 ? (
                <div className="text-gray-500">No pending appointments.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {pendingAppointments.map((a) => renderHorizontalCard(a, false))}
                </div>
              )}
            </div>

            {/* Confirmed Appointments */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-green-700 mb-4">Confirmed Appointments</h2>
              {confirmedAppointments.length === 0 ? (
                <div className="text-gray-500">No confirmed appointments.</div>
              ) : (
                <div className="flex flex-col gap-4">
                  {confirmedAppointments.map((a) => renderHorizontalCard(a, true))}
                </div>
              )}
            </div>

            {/* Completed Appointments */}
            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-blue-700 mb-4">Completed Appointments</h2>
              {completedAppointments.length === 0 ? (
                <div className="text-gray-500">No completed appointments.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {completedAppointments.map(renderAppointmentCard)}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Appointments;