import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Clock, Plus, Calendar as CalendarIcon, Loader2 } from "lucide-react";
import ReactCalendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { fetchDoctorData, updateDoctorAvailability } from "../../utils/doctorSlice";
import { toast } from "react-hot-toast";

// --- DESIGN TOKENS ---
const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

// --- HELPERS ---
const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (time24) => {
  if (!time24) return "";
  const [hours, minutes] = time24.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

export default function Availability() {
  const dispatch = useDispatch();
  const doctorData = useSelector((state) => state.doctor.doctorData);
  const slots = doctorData?.availableSlots || [];

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    if (!doctorData) {
      dispatch(fetchDoctorData());
    }
  }, [dispatch, doctorData]);

  if (!doctorData && !slots.length) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: BRAND_LIGHT }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin" style={{ color: BRAND }} />
          <p className="text-sm font-medium text-slate-400">Loading availability settings…</p>
        </div>
      </div>
    );
  }

  const handleAddSlot = async () => {
    if (!date || !time) {
      toast.error("Please select a date and time");
      return;
    }

    const newSlots = JSON.parse(JSON.stringify(slots));
    const idx = newSlots.findIndex((s) => s.date === date);

    if (idx > -1) {
      if (!newSlots[idx].slots.includes(time)) {
        newSlots[idx].slots.push(time);
        newSlots[idx].slots.sort();
      } else {
        toast.error("Slot already exists");
        return;
      }
    } else {
      newSlots.push({ date, slots: [time] });
      newSlots.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    try {
      setIsUpdating(true);
      await dispatch(updateDoctorAvailability(newSlots)).unwrap();
      toast.success("Availability updated");
      setDate("");
      setTime("");
    } catch (err) {
      toast.error(err || "Error updating availability");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10" style={{ backgroundColor: BRAND_LIGHT }}>
      <div className="max-w-3xl mx-auto">

        {/* Add Slot Card */}
        <div className="bg-white rounded-2xl border border-[#dbeafe] mb-10 overflow-visible">
          <div className="h-1.5 w-full rounded-t-2xl" style={{ backgroundColor: BRAND }} />
          <div className="p-6 md:p-8">

            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: BRAND_LIGHT, color: BRAND }}>
                <Plus size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Add Available Slot</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* DATE */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Select Date
                </label>

                <div
                  onClick={() => setShowCalendar(true)}
                  className="flex items-center gap-3 border rounded-xl px-4 py-3 cursor-pointer bg-slate-50"
                >
                  <CalendarIcon size={18} style={{ color: BRAND }} />
                  <span className="text-sm">
                    {date ? formatDate(date) : "Click to select a date"}
                  </span>
                </div>

                {showCalendar && (
                  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl">
                      <ReactCalendar
                        onChange={(d) => {
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, "0");
                          const day = String(d.getDate()).padStart(2, "0");
                          setDate(`${year}-${month}-${day}`);
                          setShowCalendar(false);
                        }}
                        value={date ? new Date(date) : new Date()}
                        minDate={new Date()}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TIME */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Start Time
                </label>

                <div className="flex items-center gap-3 border rounded-xl px-4 bg-slate-50">
                  <Clock size={18} style={{ color: BRAND }} />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1 py-3 bg-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-8">
              <button
                onClick={handleAddSlot}
                disabled={isUpdating || !date || !time}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                className="w-full py-4 text-white rounded-xl font-bold"
                style={{
                  backgroundColor: btnHover ? BRAND_DARK : BRAND,
                }}
              >
                {isUpdating ? "Saving..." : "Confirm and Add"}
              </button>
            </div>
          </div>
        </div>

        {/* SLOTS */}
        <div className="space-y-4">
          {slots.map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-5 border">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <CalendarIcon size={18} style={{ color: BRAND }} />
                  <span className="font-bold">{formatDate(s.date)}</span>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {s.slots.map((slot, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-xs">
                      {formatTime(slot)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}