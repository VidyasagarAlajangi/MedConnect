import { useEffect, useState } from "react";
import axios from "axios";
import { Clock } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Availability() {
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchSlots = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `${API_BASE_URL}/api/doctors/get-doctor-profile`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSlots(res.data.doctor.availableSlots || []);
    };
    fetchSlots();
  }, []);

  const handleAddSlot = async () => {
    if (!date || !time) return;
    const newSlots = [...slots];
    const idx = newSlots.findIndex((s) => s.date === date);
    if (idx > -1) {
      newSlots[idx].slots.push(time);
    } else {
      newSlots.push({ date, slots: [time] });
    }
    setSlots(newSlots);

    const token = localStorage.getItem("token");
    await axios.put(
      `${API_BASE_URL}/api/doctors/update-availability`,
      { availability: newSlots },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setDate("");
    setTime("");
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Clock /> My Availability
      </h2>
      <div className="mb-4 flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded"
          onClick={handleAddSlot}
        >
          Add Slot
        </button>
      </div>
      <div>
        {slots.map((s, i) => (
          <div key={i} className="mb-2">
            <span className="font-semibold">{s.date}:</span> {s.slots.join(", ")}
          </div>
        ))}
      </div>
    </div>
  );
}