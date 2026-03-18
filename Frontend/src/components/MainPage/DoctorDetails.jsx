import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../config/api";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const DoctorDetailsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDoctorById = async (id) => {
      try {
        const response = await axiosInstance.get(`/api/doctors/${id}`);


        if (response.data && response.data.success && response.data.data) {
          setDoctor(response.data.data);
        } else {
          setError("Doctor not found");
        }
      } catch (err) {
        setError(err.message || "Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorById(doctorId);
    }
  }, [doctorId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightType = params.get('highlight');

    if (highlightType && doctor) {
      const element = document.getElementById(`highlight-${highlightType}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-section');
        setTimeout(() => {
          element.classList.remove('highlight-section');
        }, 2000);
      }
    }
  }, [location.search, doctor]);

  const handleSlotSelection = (date, time) => {
    setSelectedDate(date);
    setSelectedSlot(time);
    toast.success(`Selected ${time} on ${date}`);
  };

  const convertTo24Hour = (time12h) => {
    if (!time12h.includes('AM') && !time12h.includes('PM')) {
      return time12h;
    }
    const [time, modifier] = time12h.trim().split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  const convertTo12Hour = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${period}`;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) {
      toast.error("Please select a date and time slot first");
      return;
    }

    let formattedDate;
    let formattedTime;

    try {
      try {
        if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
          formattedDate = selectedDate;
        } else {
          const dateParts = selectedDate.split('/');
          if (dateParts.length !== 3) {
            throw new Error('Invalid date format');
          }
          const [month, day, year] = dateParts;
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        const appointmentDate = new Date(formattedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
          toast.error("Cannot book appointments for past dates");
          return;
        }
      } catch (dateError) {
        toast.error("Invalid date format. Please try again.");
        return;
      }

      try {
        formattedTime = convertTo24Hour(selectedSlot);
      } catch (timeError) {
        toast.error("Invalid time format. Please try again.");
        return;
      }

      const payload = {
        doctorId: doctor._id,
        date: formattedDate,
        time: formattedTime, 
        notes: ""
      };


      const response = await axiosInstance.post("/api/appointment/book", payload);

      if (response.data.success) {
        toast.success("Appointment booked successfully!");
        setBookingSuccess(true);
        setTimeout(() => {
          setBookingSuccess(false);
          setSelectedDate(null);
          setSelectedSlot(null);
          navigate("/appointments");
        }, 2000);
      }
    } catch (err) {


      if (err.response) {
      }

      const errorMessage = err.response?.data?.message || "Failed to book appointment";
      toast.error(errorMessage);
    }
  };

  const handleDetailClick = (type) => {
    navigate(`/find-doctor?highlight=${type}&doctorId=${doctorId}`);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  if (error) return (
    <div className="text-center text-red-500 p-4">
      <p>Error: {error}</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Go Back
      </button>
    </div>
  );

  if (!doctor) return (
    <div className="text-center p-4">
      <p>No doctor data found</p>
      <button
        onClick={() => navigate(-1)}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Go Back
      </button>
    </div>
  );

  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
              }`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <style>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: inherit;
          background: transparent;
        }
        .react-calendar__tile--active {
          background: #4A90E2 !important;
          color: white !important;
          border-radius: 8px;
        }
        .react-calendar__month-view__weekdays__weekday {
          color: #4A90E2;
          font-weight: 700;
          text-decoration: none;
        }
        .highlight-date {
          background: #eaf2fb !important;
          color: #4A90E2 !important;
          font-weight: bold;
          border-radius: 8px;
        }
        .calendar-popup {
          position: absolute;
          top: 100%;
          right: 0;
          z-index: 50;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          margin-top: 8px;
          padding: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          width: 300px;
        }
      `}</style>
      <div className="max-w-7xl mx-auto">

        
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6">

            
            <img
              src={doctor.img_url}
              alt={doctor.name}
              className="w-28 h-28 rounded-full object-cover border"
            />

            
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                {doctor.name}
              </h1>

              <p className="text-[#4A90E2] font-medium mt-1">
                {doctor.specialization}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {doctor.experience} years experience
              </p>

              <div className="flex items-center mt-3">
                {renderStars(doctor.Rating)}
                <span className="ml-2 text-gray-600">{doctor.Rating}</span>
              </div>

              <p className="text-sm text-gray-500 mt-2">
                {doctor.address}
              </p>
            </div>

            
            <div>
              <span
                className={`px-3 py-1 text-sm rounded-full ${doctor.isActive
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-200 text-gray-600"
                  }`}
              >
                {doctor.isActive ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          
          <div className="lg:col-span-2 space-y-6">

            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg text-[#4A90E2] font-semibold mb-3">
                About Doctor
              </h2>

              <p className="text-gray-600 text-sm leading-relaxed">
                {doctor.name} is a highly experienced {doctor.specialization}
                with over {doctor.experience} years of clinical practice.
                Patients trust their expertise for accurate diagnosis and
                compassionate medical care.
              </p>
            </div>

            
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h2 className="text-lg text-[#4A90E2] font-semibold mb-4">
                Professional Details
              </h2>

              <div className="grid grid-cols-2 gap-4 text-sm">

                <div>
                  <p className="text-gray-500">Specialization</p>
                  <p className="font-medium">{doctor.specialization}</p>
                </div>

                <div>
                  <p className="text-gray-500">Experience</p>
                  <p className="font-medium">{doctor.experience} years</p>
                </div>

                <div>
                  <p className="text-gray-500">Rating</p>
                  <p className="font-medium">{doctor.Rating}</p>
                </div>

                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium">
                    {doctor.isActive ? "Active" : "Inactive"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-gray-500">Clinic Address</p>
                  <p className="font-medium">{doctor.address}</p>
                </div>

              </div>
            </div>

          </div>

          
          <div className="lg:sticky lg:top-8 h-fit">

            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">

              <h2 className="text-lg text-[#4A90E2] font-semibold mb-4">
                Book Appointment
              </h2>

              <div className="mb-6 relative">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">
                  Select Date
                </label>
                <div 
                  onClick={() => setShowCalendar(!showCalendar)}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all ${showCalendar ? 'border-[#4A90E2] ring-2 ring-[#4A90E2] ring-opacity-10' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}
                >
                  <span className={`text-sm ${selectedDate ? 'text-gray-800 font-medium' : 'text-gray-400'}`}>
                    {selectedDate ? selectedDate : "Choose a date"}
                  </span>
                  <svg className={`w-5 h-5 transition-transform ${showCalendar ? 'rotate-180 text-[#4A90E2]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {showCalendar && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowCalendar(false)} />
                    <div className="calendar-popup fade-up">
                      <Calendar
                        onChange={(d) => {
                          const year = d.getFullYear();
                          const month = String(d.getMonth() + 1).padStart(2, '0');
                          const day = String(d.getDate()).padStart(2, '0');
                          const dateStr = `${year}-${month}-${day}`;
                          setSelectedDate(dateStr);
                          setSelectedSlot(null);
                          setShowCalendar(false);
                        }}
                        value={selectedDate ? new Date(selectedDate) : new Date()}
                        minDate={new Date()}
                        tileClassName={({ date, view }) => {
                          if (view === 'month') {
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            if (doctor.availableSlots?.some(s => s.date === dateStr)) {
                              return 'highlight-date';
                            }
                          }
                        }}
                      />
                    </div>
                  </>
                )}
              </div>

              {selectedDate ? (
                <div className="space-y-4">
                  <p className="text-sm font-bold text-gray-700">
                    Slots for {selectedDate}
                  </p>
                  
                  {(() => {
                    const dayData = doctor.availableSlots?.find(s => s.date === selectedDate);
                    if (dayData && dayData.slots.length > 0) {
                      return (
                        <div className="grid grid-cols-2 gap-2">
                          {dayData.slots.map((time, timeIdx) => (
                            <button
                              key={timeIdx}
                              disabled={!doctor.isActive}
                              onClick={() => setSelectedSlot(time)}
                              className={`text-sm py-2 rounded border transition ${
                                selectedSlot === time
                                  ? "bg-[#4A90E2] text-white border-[#4A90E2]"
                                  : "border-gray-300 hover:border-[#4A90E2] text-gray-600"
                              }`}
                            >
                              {convertTo12Hour(time)}
                            </button>
                          ))}
                        </div>
                      );
                    } else {
                      return <p className="text-sm text-red-400 italic">No slots available for this date.</p>;
                    }
                  })()}

                  {selectedSlot && (
                    <button
                      onClick={handleBooking}
                      className="w-full mt-4 bg-[#4A90E2] hover:bg-[#357ABD] text-white py-3 rounded-lg font-bold shadow-md transition-all active:scale-95"
                    >
                      Book {convertTo12Hour(selectedSlot)}
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-dashed border-gray-200 text-center">
                  <p className="text-sm text-gray-400">Select a date from the calendar to view available time slots.</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDetailsPage;
