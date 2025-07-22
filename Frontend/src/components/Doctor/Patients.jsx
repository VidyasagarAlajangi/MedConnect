import { useEffect, useState } from "react";
import axios from "axios";
import { Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const ITEMS_PER_PAGE = 10;

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${API_BASE_URL}/api/doctors/my-patients`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              page: currentPage,
              limit: ITEMS_PER_PAGE,
              search: searchTerm
            }
          }
        );
        setPatients(res.data.patients || []);
        setTotalPages(Math.ceil((res.data.total || 0) / ITEMS_PER_PAGE));
      } catch (error) {
        console.error("Error fetching patients:", error);
        setError(error.response?.data?.message || "Failed to fetch patients");
        toast.error(error.response?.data?.message || "Failed to fetch patients");
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchPatients();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [currentPage, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading && patients.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error && patients.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
        {error}
      </div>
    );
  }

  const filteredPatients = patients.filter(patient => 
    patient.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Users /> My Patients
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No patients found.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {filteredPatients.map((p) => (
              <div key={p._id} className="bg-white rounded shadow p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold text-lg">{p.user?.name}</div>
                    <div className="text-sm text-gray-500">{p.user?.email}</div>
                  </div>
                  <button
                    onClick={() => {/* TODO: Implement patient details view */}}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}