import  { useState, useEffect } from "react";
import axios from "axios";
import { UserPlus, Check, X } from "lucide-react";

export default function VerifyDoctor() {
  const [pendingDoctors, setPendingDoctors] = useState([]);

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/admin/pending-doctors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPendingDoctors(res.data.doctors);
    } catch (err) {
      console.error("Error fetching pending doctors:", err);
    }
  };

  const handleVerification = async (doctorId, action) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `/api/admin/verify-doctor/${doctorId}`,
        { action },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPendingDoctors(); // Refresh the list
    } catch (err) {
      alert(err.response?.data?.message || "Error verifying doctor");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 flex items-center gap-2">
        <UserPlus className="w-7 h-7" /> Verify Doctor Applications
      </h2>
      <div className="space-y-4">
        {pendingDoctors.map((doctor) => (
          <div
            key={doctor._id}
            className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">
                  {doctor.user?.name || doctor.name}
                </h3>
                <p className="text-gray-600">{doctor.specialization}</p>
                <p className="text-sm text-gray-500">{doctor.user?.email}</p>
                <div className="mt-2 space-y-1">
                  <p>
                    <span className="font-medium">Experience:</span>{" "}
                    {doctor.experience} years
                  </p>
                  <p>
                    <span className="font-medium">Qualifications:</span>{" "}
                    {doctor.qualifications}
                  </p>
                  <p>
                    <span className="font-medium">Address:</span> {doctor.address}
                  </p>
                  <p>
                    <span className="font-medium">License Number:</span>{" "}
                    {doctor.licenseNumber}
                  </p>
                  {doctor.photo && (
                    <img
                      src={`http://localhost:5000/${
                        doctor.photo.startsWith("uploads")
                          ? doctor.photo
                          : "uploads/" + doctor.photo
                      }`}
                      alt="Doctor's Photo"
                      className="mt-2 w-32 h-32 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerification(doctor._id, "approve")}
                  className="flex items-center gap-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => handleVerification(doctor._id, "reject")}
                  className="flex items-center gap-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </div>
          </div>
        ))}
        {pendingDoctors.length === 0 && (
          <p className="text-center text-gray-500">
            No pending doctor applications
          </p>
        )}
      </div>
    </div>
  );
}