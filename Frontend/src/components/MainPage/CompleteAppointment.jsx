import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-toastify";
import { Loader2, Upload, FileText } from "lucide-react";

const CompleteAppointment = ({ appointmentId, onComplete }) => {
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("notes", notes);
      if (prescription) {
        formData.append("prescription", prescription);
      }

      const res = await fetch(
        `${API_BASE_URL}/api/video/appointment/${appointmentId}/complete`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast.success("Appointment completed successfully!");
      onComplete(data.appointment);
    } catch (error) {
      toast.error(error.message || "Failed to complete appointment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Complete Appointment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Enter consultation notes..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prescription
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600">
              <Upload className="w-5 h-5" />
              <span>Upload Prescription</span>
              <input
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => setPrescription(e.target.files[0])}
              />
            </label>
            {prescription && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <FileText className="w-4 h-4" />
                <span>{prescription.name}</span>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            "Complete Appointment"
          )}
        </button>
      </form>
    </div>
  );
};

export default CompleteAppointment; 