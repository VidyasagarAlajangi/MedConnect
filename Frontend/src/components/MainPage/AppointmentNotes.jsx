import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Upload, FileText, X } from "lucide-react";

const AppointmentNotes = ({ appointmentId, onComplete, isPrescriptionOnly = false }) => {
  const [showForm, setShowForm] = useState(false);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const formData = new FormData();
      if (!isPrescriptionOnly) {
        formData.append("notes", notes);
      }
      if (prescription) {
        formData.append("prescription", prescription);
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/appointments/${appointmentId}/complete`,
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

      toast.success(isPrescriptionOnly ? "Prescription uploaded successfully!" : "Appointment completed successfully!");
      onComplete(data.appointment);
      setShowForm(false);
    } catch (error) {
      console.error("Error completing appointment:", error);
      toast.error(error.message || "Failed to complete appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
      >
        {isPrescriptionOnly ? (
          <>
            <Upload className="w-4 h-4" />
            Upload Prescription
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            Add Notes
          </>
        )}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {isPrescriptionOnly ? "Upload Prescription" : "Add Notes & Prescription"}
          </h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPrescriptionOnly && (
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
                required={!isPrescriptionOnly}
              />
            </div>
          )}

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
                  required={isPrescriptionOnly}
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

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isPrescriptionOnly ? "Uploading..." : "Completing..."}
                </>
              ) : (
                isPrescriptionOnly ? "Upload Prescription" : "Complete Appointment"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentNotes; 