import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, UserCircle2, Users } from "lucide-react";

export default function ViewAppointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/view-appointments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data.appointments);
    };
    fetchAppointments();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-bold text-purple-700 mb-6 flex items-center gap-2">
        <CalendarDays className="w-7 h-7" /> Appointments
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((appt, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-purple-50 to-white border border-purple-100 rounded-xl shadow p-6 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-2 mb-2">
              <UserCircle2 className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-700">Doctor:</span>
              <span className="text-gray-800">
                {appt.doctor?.user?.name || appt.doctor?.name || "N/A"}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                ({appt.doctor?.specialization})
              </span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-orange-600" />
              <span className="font-semibold text-orange-700">Patient:</span>
              <span className="text-gray-800">
                {appt.patient?.user?.name || appt.patient?.name || "N/A"}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-purple-800">Date:</span>{" "}
              <span className="text-gray-700">{appt.date}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-purple-800">Time:</span>{" "}
              <span className="text-gray-700">{appt.time}</span>
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                ${appt.status === "confirmed"
                  ? "bg-green-100 text-green-700"
                  : appt.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : appt.status === "completed"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"}
              `}>
                {appt.status.charAt(0).toUpperCase() + appt.status.slice(1)}
              </span>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  );
}
