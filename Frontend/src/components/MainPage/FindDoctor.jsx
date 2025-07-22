import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import DoctorCard from "./DoctorCard";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [sortBy, setSortBy] = useState("rating-high");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/doctors`, {
          params: {
            specialization,
            name: searchTerm,
            sortBy,
          },
        });

        if (response.data && response.data.success) {
          setDoctors(response.data.data);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialization, searchTerm, sortBy]);

  // Handle highlighted doctor from URL parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const highlightType = params.get('highlight');
    const doctorId = params.get('doctorId');

    if (highlightType && doctorId) {
      // Find the doctor card element and highlight it
      const doctorCard = document.getElementById(`doctor-${doctorId}`);
      if (doctorCard) {
        doctorCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        doctorCard.classList.add('highlight-detail', `highlight-${highlightType}`);
        
        // Remove highlight after animation
        setTimeout(() => {
          doctorCard.classList.remove('highlight-detail', `highlight-${highlightType}`);
        }, 2000);
      }
    }
  }, [location.search, doctors]);

  useEffect(() => {
    const loadGoogleMapsScript = () => {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      
      if (!apiKey) {
        console.warn('Google Maps API key is not configured. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file');
        return;
      }

      // Check if script is already loaded
      if (window.google?.maps) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`;
      script.async = true;
      script.defer = true;
      
      script.onerror = () => {
        console.error('Failed to load Google Maps script. Please check your API key and internet connection.');
      };

      // Add loading callback
      window.initMap = () => {
        console.log('Google Maps script loaded successfully');
      };

      document.head.appendChild(script);
    };

    loadGoogleMapsScript();

    // Cleanup
    return () => {
      delete window.initMap;
    };
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>;
  
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <input
                type="text"
                placeholder="Search doctors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">All Specializations</option>
                <option value="General Physician">General Physician</option>
                <option value="Cardiologist">Cardiologist</option>
                <option value="Neurologist">Neurologist</option>
                <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                <option value="Pulmonologist">Pulmonologist</option>
                <option value="Gastroenterologist">Gastroenterologist</option>
                <option value="Endocrinologist">Endocrinologist</option>
                <option value="Nephrologist">Nephrologist</option>
                <option value="Oncologist">Oncologist</option>
                <option value="Dermatologist">Dermatologist</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
                <option value="Otolaryngologist">Otolaryngologist (ENT)</option>
                <option value="Rheumatologist">Rheumatologist</option>
                <option value="Hematologist">Hematologist</option>
                <option value="Urologist">Urologist</option>
                <option value="Psychiatrist">Psychiatrist</option>
                <option value="Pediatrician">Pediatrician</option>
                <option value="Gynecologist">Gynecologist</option>
                <option value="Immunologist">Immunologist</option>
                <option value="Infectious Disease Specialist">Infectious Disease Specialist</option>
              </select>
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="rating-high">Rating: High to Low</option>
                <option value="rating-low">Rating: Low to High</option>
                <option value="experience-high">Experience: High to Low</option>
                <option value="experience-low">Experience: Low to High</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <div 
              key={doctor._id} 
              id={`doctor-${doctor._id}`}
              className="transition-all duration-300"
            >
              <DoctorCard doctor={doctor} />
            </div>
          ))}
        </div>

        {doctors.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No doctors found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>
        {`
          .highlight-detail {
            animation: highlight 2s ease-in-out;
          }

          .highlight-profile {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.5);
          }

          .highlight-name {
            box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.5);
          }

          .highlight-specialization {
            box-shadow: 0 0 0 4px rgba(67, 56, 202, 0.5);
          }

          .highlight-rating {
            box-shadow: 0 0 0 4px rgba(55, 48, 163, 0.5);
          }

          .highlight-address {
            box-shadow: 0 0 0 4px rgba(49, 46, 129, 0.5);
          }

          .highlight-status {
            box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.5);
          }

          .highlight-appointment {
            box-shadow: 0 0 0 4px rgba(29, 78, 216, 0.5);
          }

          @keyframes highlight {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.02);
            }
            100% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default FindDoctor;
