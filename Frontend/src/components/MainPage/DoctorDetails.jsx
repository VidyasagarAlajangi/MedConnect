import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const DoctorDetailsPage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchDoctorById = async (id) => {
      try {
        console.log('Fetching doctor with ID:', id);
        const response = await axios.get(`${API_BASE_URL}/api/doctors/${id}`, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        console.log('Doctor API Response:', response.data);

        if (response.data && response.data.success && response.data.data) {
          setDoctor(response.data.data);
        } else {
          setError("Doctor not found");
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError(err.message || "Failed to fetch doctor details");
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorById(doctorId);
    }
  }, [doctorId]);

  // Handle highlight from URL parameters
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

  // Helper function to convert 12-hour time to 24-hour format
  const convertTo24Hour = (time12h) => {
    const [time, modifier] = time12h.split(" ");
    let [hours, minutes] = time.split(":");

    if (modifier === "PM" && hours !== "12") {
      hours = String(parseInt(hours, 10) + 12);
    }
    if (modifier === "AM" && hours === "12") {
      hours = "00";
    }

    return `${hours.padStart(2, '0')}:${minutes}`;
  };

  // Helper function to convert 24-hour time to 12-hour format
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
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to book an appointment");
        navigate("/login", { state: { from: location } });
        return;
      }

      // Format the date to YYYY-MM-DD
      try {
        // Check if the date is already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
          formattedDate = selectedDate;
        } else {
          // Try to parse the date from MM/DD/YYYY format
          const dateParts = selectedDate.split('/');
          if (dateParts.length !== 3) {
            throw new Error('Invalid date format');
          }
          const [month, day, year] = dateParts;
          formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }

        // Validate the date is not in the past
        const appointmentDate = new Date(formattedDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (appointmentDate < today) {
          toast.error("Cannot book appointments for past dates");
          return;
        }
      } catch (dateError) {
        console.error('Date formatting error:', dateError);
        toast.error("Invalid date format. Please try again.");
        return;
      }

      // Convert time from 12-hour format to 24-hour format for the appointment
      try {
        formattedTime = convertTo24Hour(selectedSlot);
        console.log('Time conversion:', {
          original: selectedSlot,
          converted: formattedTime
        });
      } catch (timeError) {
        console.error('Time formatting error:', timeError);
        toast.error("Invalid time format. Please try again.");
        return;
      }
      
      // Prepare the payload
      const payload = {
        doctorId: doctor._id,
        date: formattedDate,
        time: formattedTime,
        notes: ""
      };

      console.log('Booking request:', payload);

      const response = await axios.post(
        `${API_BASE_URL}/api/appointment/book`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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
      console.error('Booking error:', err);
      
      // Log the request details for debugging
      console.error('Request details:', {
        url: `${API_BASE_URL}/api/appointment/book`,
        payload: {
          doctorId: doctor?._id,
          date: formattedDate,
          time: formattedTime,
          notes: ""
        },
        selectedDate,
        selectedSlot
      });

      // Log the error response if available
      if (err.response) {
        console.error('Error response:', {
          status: err.response.status,
          data: err.response.data
        });
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
            className={`h-5 w-5 ${
              i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Card */}
        <div className="card bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100 mb-6">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row">
              <div className="flex-shrink-0 flex items-start justify-center md:justify-start mb-4 md:mb-0">
                <div className="relative">
                  <img
                    src={doctor.img_url}
                    alt={doctor.name}
                    id="highlight-profile"
                    className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                  <div
                    className={`absolute -bottom-2 -right-2 ${
                      doctor.isActive ? "bg-teal-500" : "bg-gray-500"
                    } text-white text-xs font-bold rounded-full h-8 w-8 flex items-center justify-center`}
                  >
                    <span>{doctor.isActive ? "✓" : "×"}</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 md:ml-6 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 
                      id="highlight-name"
                      className="text-2xl md:text-3xl font-bold text-gray-800"
                    >
                      {doctor.name}
                    </h1>
                    <p 
                      id="highlight-specialization"
                      className="text-indigo-600 font-medium mt-1"
                    >
                      {doctor.specialization} • {doctor.experience} Years Experience
                    </p>
                    <div 
                      id="highlight-rating"
                      className="mt-2 flex items-center"
                    >
                      {renderStars(doctor.Rating)}
                      <span className="text-gray-600 ml-2">
                        {doctor.Rating}
                      </span>
                    </div>
                    <p 
                      id="highlight-address"
                      className="text-gray-600 mt-1"
                    >
                      {doctor.address}
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0">
                      
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="tabs flex bg-gray-200 p-1 rounded-lg shadow-md w-full mb-6">
          <button
            className={`tab flex-1 text-center rounded-lg font-medium transition-all duration-200 px-4 py-2 ${
              activeTab === "overview"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={`tab flex-1 text-center rounded-lg font-medium transition-all duration-200 px-4 py-2 ${
              activeTab === "schedule"
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-700 hover:text-indigo-600 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("schedule")}
          >
            Schedule
          </button>
        </div>

        {/* Tab Content */}
        <div className="card bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
          <div className="p-6 md:p-8">
            {activeTab === "overview" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  About {doctor.name}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-800 mb-3">
                      Details
                    </h3>
                    <div className="space-y-2">
                      <div 
                        id="highlight-specialization"
                        className="flex items-center p-2 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Specialization: {doctor.specialization}
                        </span>
                      </div>
                      <div 
                        id="highlight-experience"
                        className="flex items-center p-2 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Experience: {doctor.experience} years
                        </span>
                      </div>
                      <div 
                        id="highlight-address"
                        className="flex items-center p-2 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Address: {doctor.address}
                        </span>
                      </div>
                      <div 
                        id="highlight-status"
                        className="flex items-center p-2 rounded-lg"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-indigo-500 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Status: {doctor.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "schedule" && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-6">
                  Available Appointments
                </h2>
                {doctor.availableSlots && doctor.availableSlots.length > 0 ? (
                  <div className="space-y-6">
                    {doctor.availableSlots.map((daySlot, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-medium text-gray-800 mb-3">
                          Date: {daySlot.date}
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                          {daySlot.slots.map((time, timeIdx) => (
                            <button
                              key={timeIdx}
                              className={`${
                                selectedDate === daySlot.date && selectedSlot === time
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : doctor.isActive
                                  ? "bg-white border border-gray-200 hover:border-indigo-500 text-gray-800"
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              } font-medium py-2 rounded-md transition-colors duration-200`}
                              disabled={!doctor.isActive}
                              onClick={() => handleSlotSelection(daySlot.date, time)}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                    {selectedDate && selectedSlot && (
                      <div className="mt-6">
                        <button
                          onClick={handleBooking}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                        >
                          Book Appointment for {selectedSlot} on {selectedDate}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p>No available slots found</p>
                )}
                {!doctor.isActive && (
                  <div className="mt-4 p-4 bg-yellow-50 border border-yellow-100 rounded-lg">
                    <div className="flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-yellow-500 mr-3 mt-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <div>
                        <h3 className="font-medium text-yellow-800 mb-1">
                          Doctor Currently Unavailable
                        </h3>
                        <p className="text-gray-600">
                          This doctor is not currently accepting appointments.
                          Please check back later or select another doctor.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>
        {`
          .highlight-section {
            animation: highlight 2s ease-in-out;
          }

          @keyframes highlight {
            0% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.5);
            }
            50% {
              transform: scale(1.02);
              box-shadow: 0 0 0 10px rgba(99, 102, 241, 0);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default DoctorDetailsPage;
