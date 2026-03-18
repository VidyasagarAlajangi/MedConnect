import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import CompleteAppointment from "./CompleteAppointment";


const CompleteAppointmentPage = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const handleComplete = () => {
    navigate("/appointments", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 mb-4">
            <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Call Ended</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Please complete the appointment by adding notes and uploading a prescription.
          </p>
        </div>

        
        <CompleteAppointment
          appointmentId={appointmentId}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
};

export default CompleteAppointmentPage;
