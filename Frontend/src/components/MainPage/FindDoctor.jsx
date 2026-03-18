import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import DoctorCard from "./DoctorCard";
import { Search } from "lucide-react";

const FindDoctor = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [sortBy, setSortBy] = useState("rating-high");

  const location = useLocation();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axiosInstance.get("/api/doctors", {
          params: {
            specialization,
            name: searchTerm,
            sortBy,
          },
        });

        if (res.data?.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [specialization, searchTerm, sortBy]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="h-10 w-10 border-4 border-gray-200 border-t-gray-700 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-500 py-10">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100">

      {/* Page container */}
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Find Doctors
          </h1>
          <p className="text-gray-500 mt-1">
            Browse trusted specialists and book appointments easily
          </p>
        </div>

        {/* Search + Filters */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-8 sticky top-4 z-10">

          <div className="flex flex-col lg:flex-row lg:items-center gap-4">

            {/* Search */}
            <div className="flex items-center flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50">
              <Search size={18} className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search doctor name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full text-sm"
              />
            </div>

            {/* Specialization */}
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="">All Specializations</option>
              <option value="General Physician">General Physician</option>
              <option value="Cardiologist">Cardiologist</option>
              <option value="Neurologist">Neurologist</option>
              <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
              <option value="Dermatologist">Dermatologist</option>
              <option value="Pediatrician">Pediatrician</option>
              <option value="Gynecologist">Gynecologist</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="rating-high">Top Rated</option>
              <option value="rating-low">Lowest Rated</option>
              <option value="experience-high">Most Experienced</option>
              <option value="experience-low">Least Experienced</option>
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>

          </div>
        </div>

        {/* Doctor Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">

          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              id={`doctor-${doctor._id}`}
              className="transition duration-200 hover:-translate-y-1 hover:shadow-lg"
            >
              <DoctorCard doctor={doctor} />
            </div>
          ))}

        </div>

        {doctors.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            No doctors found.
          </div>
        )}

      </div>
    </div>
  );
};

export default FindDoctor;