import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import {
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Mail,
  ChevronRight as ArrowRight,
  X
} from "lucide-react";
import { toast } from "react-hot-toast";
import Modal from "react-modal";

Modal.setAppElement("#root");

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const ITEMS_PER_PAGE = 10;

const getInitials = (name = "") => name.trim().match(/[A-Za-z]/)?.[0]?.toUpperCase() || "?";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axiosInstance.get("/api/doctors/my-patients", {
          params: {
            page: currentPage,
            limit: ITEMS_PER_PAGE,
            search: searchTerm
          }
        });
        setPatients(res.data.patients || []);
        setTotalPages(Math.ceil((res.data.total || 0) / ITEMS_PER_PAGE));
      } catch (error) {
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
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const filteredPatients = patients.filter(patient =>
    patient.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 md:p-4" style={{ backgroundColor: BRAND_LIGHT }}>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
        
        .card-shadow {
          box-shadow: 0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.06);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card-shadow:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(74,144,226,0.15), 0 12px 48px rgba(74,144,226,0.10);
        }

        [data-field-wrap]:focus-within { 
          border-color: #4a90e2 !important; 
          box-shadow: 0 0 0 3px #4a90e226; 
          background: white !important; 
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8">

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mt-1">


            
            <div className="w-full sm:w-80">
              <div
                data-field-wrap
                className="flex items-center gap-3 border-[1.5px] border-slate-200 bg-slate-50 rounded-lg px-3 transition-all"
              >
                <Search size={15} style={{ color: BRAND }} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300"
                />
              </div>
            </div>
          </div>
        </header>

        {loading && patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin" style={{ color: BRAND }} />
            <p className="mt-4 text-sm text-slate-400">Loading patient directory...</p>
          </div>
        ) : error && patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 bg-white rounded-2xl border border-red-100 card-shadow">
            <Search className="text-red-300 mb-2" size={32} />
            <p className="text-sm text-red-500">{error}</p>
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-[#dbeafe] card-shadow">
            <Users size={32} strokeWidth={1.5} className="text-slate-300 mb-2" />
            <p className="text-sm text-slate-400">No patients found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-4 fade-up">
            {filteredPatients.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-2xl overflow-hidden border border-[#dbeafe] card-shadow"
              >
                <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />
                <div className="p-5 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4 w-full sm:w-auto">
                    
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-inner"
                      style={{ backgroundColor: BRAND_DARK }}
                    >
                      {getInitials(p.user?.name)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{p.user?.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        <span className="text-xs text-slate-400 font-medium">{p.user?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => setSelectedPatient(p)}
                      className="flex items-center gap-2 px-4 py-2 border-[1.5px] border-[#dbeafe] text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-xs font-semibold transition-colors group"
                    >
                      View Medical Record
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border-[1.5px] border-[#dbeafe] bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>

                <div className="px-4 py-2 rounded-lg bg-white border border-[#dbeafe] text-xs font-bold text-slate-700">
                  PAGE <span style={{ color: BRAND }}>{currentPage}</span> OF {totalPages}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border-[1.5px] border-[#dbeafe] bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        <Modal
          isOpen={!!selectedPatient}
          onRequestClose={() => setSelectedPatient(null)}
          className="bg-white rounded-2xl max-w-2xl w-full mx-auto shadow-2xl outline-none overflow-hidden"
          overlayClassName="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4 z-50"
        >
          {selectedPatient && (
            <div className="flex flex-col max-h-[85vh]">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-xl font-bold text-slate-800 tracking-tight">Medical Record</h2>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">{selectedPatient.user?.name}</p>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="px-6 py-6 overflow-y-auto space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Contact Details</h3>
                  <div className="flex flex-col gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm text-slate-700"><span className="font-semibold w-20 inline-block">Email:</span> {selectedPatient.user?.email}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold w-20 inline-block">Phone:</span> {selectedPatient.user?.phone || 'Not provided'}</p>
                    <p className="text-sm text-slate-700"><span className="font-semibold w-20 inline-block">Address:</span> {selectedPatient.address || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Medical History & Notes</h3>
                  <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-100 min-h-[120px]">
                    {selectedPatient.medicalDetails ? (
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedPatient.medicalDetails}</p>
                    ) : (
                      <p className="text-sm text-slate-400 italic">No medical history provided by the patient.</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-colors"
                >
                  Close Record
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </div>
  );
}