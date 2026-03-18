import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, PhoneOff, Video } from "lucide-react";

/**
 * Global incoming video call overlay.
 * Props:
 *  - call: { appointmentId, doctorName } | null
 *  - onDecline: () => void
 */
const IncomingCallOverlay = ({ call, onDecline }) => {
  const navigate = useNavigate();
  const [ringing, setRinging] = useState(false);

  // Pulse-ring animation via state toggling
  useEffect(() => {
    if (!call) return;
    setRinging(true);
    const t = setInterval(() => setRinging((p) => !p), 700);
    return () => clearInterval(t);
  }, [call]);

  if (!call) return null;

  const handleAccept = () => {
    onDecline(); // clear overlay state
    navigate(`/video-call/${call.appointmentId}`);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto" />

      {/* Card */}
      <div className="relative pointer-events-auto w-full max-w-sm">
        {/* Outer ring pulses */}
        <div
          className={`absolute inset-0 rounded-3xl bg-indigo-500 transition-all duration-700 ${
            ringing ? "opacity-30 scale-110" : "opacity-0 scale-100"
          }`}
        />

        <div className="relative bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
          {/* Top strip */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-center">
            <span className="text-indigo-100 text-xs font-semibold uppercase tracking-widest">
              Incoming Video Call
            </span>
          </div>

          {/* Body */}
          <div className="px-8 py-8 flex flex-col items-center gap-5">
            {/* Avatar / Icon */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center shadow-xl">
                <Video className="w-10 h-10 text-white" />
              </div>
              {/* small green pulse dot */}
              <span className="absolute bottom-1 right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-800 animate-pulse" />
            </div>

            <div className="text-center">
              <p className="text-white text-2xl font-bold">Dr. {call.doctorName}</p>
              <p className="text-slate-400 text-sm mt-1">is calling you…</p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-6 mt-2">
              {/* Decline */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={onDecline}
                  className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-lg flex items-center justify-center"
                  aria-label="Decline call"
                >
                  <PhoneOff className="w-7 h-7 text-white" />
                </button>
                <span className="text-slate-400 text-xs">Decline</span>
              </div>

              {/* Accept */}
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={handleAccept}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 transition-all shadow-lg flex items-center justify-center animate-bounce"
                  aria-label="Accept call"
                >
                  <Phone className="w-7 h-7 text-white" />
                </button>
                <span className="text-slate-400 text-xs">Accept</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallOverlay;
