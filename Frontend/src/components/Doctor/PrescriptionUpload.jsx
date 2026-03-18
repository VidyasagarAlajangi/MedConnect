import React, { useState } from "react";
import { API_BASE_URL } from "../../config/api";
import { toast } from "react-hot-toast";
import { Upload, Loader2, FileText, X } from "lucide-react";

// --- DESIGN TOKENS ---
const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const PrescriptionUpload = ({ appointmentId, onComplete }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState("");
  const [btnHover, setBtnHover] = useState(false);

  // --- LOGIC (UNCHANGED) ---
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast.error("Please upload a PDF file");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please select a prescription file");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("prescription", file);
      formData.append("notes", notes);

      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/appointment/${appointmentId}/prescription`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Failed to upload");

      toast.success("Prescription uploaded successfully");
      onComplete();
    } catch (error) {
      console.error("Error uploading prescription:", error);
      toast.error(error.message || "Failed to upload prescription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto fade-up">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .2s ease both; }
        
        [data-field-wrap]:focus-within { 
          border-color: #4a90e2 !important; 
          box-shadow: 0 0 0 3px #4a90e226; 
          background: white !important; 
        }
      `}</style>

      {/* Main Card */}
      <div
        className="bg-white rounded-2xl overflow-hidden border border-[#dbeafe]"
        style={{ boxShadow: "0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.06)" }}
      >
        <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: BRAND }}>
              Patient Portal
            </p>
            <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">Upload Prescription</h2>
            <p className="text-sm text-slate-400 mt-1">Please provide the digital medical order in PDF format.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Zone */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Prescription Document
              </label>

              <div
                className={`relative group border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-8 ${file ? 'border-[#4a90e2] bg-[#eaf2fb]/30' : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                  }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleFileChange}
                />

                <div className="text-center space-y-3">
                  <div
                    className="w-12 h-12 rounded-full mx-auto flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: file ? BRAND : BRAND_LIGHT, color: file ? 'white' : BRAND }}
                  >
                    {file ? <FileText size={24} /> : <Upload size={24} />}
                  </div>

                  {file ? (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800">{file.name}</p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-xs font-semibold text-red-500 hover:underline relative z-20"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 tracking-tight">
                        Click to upload <span className="text-slate-400 font-normal">or drag and drop</span>
                      </p>
                      <p className="text-xs text-slate-400">PDF documents only (Max 10MB)</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Field */}
            <div className="space-y-1.5">
              <label htmlFor="notes" className="text-xs font-semibold text-slate-500 tracking-wider uppercase">
                Additional Instructions
              </label>
              <div
                data-field-wrap
                className="border-[1.5px] border-slate-200 bg-slate-50 rounded-lg px-3 transition-all"
              >
                <textarea
                  id="notes"
                  rows={4}
                  className="w-full py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300 resize-none"
                  placeholder="e.g. Dosage notes or pharmacy instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={onComplete}
                className="px-6 py-3 border-[1.5px] border-[#dbeafe] text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors order-2 sm:order-1"
              >
                Skip for now
              </button>

              <button
                type="submit"
                disabled={loading || !file}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                className="flex-1 sm:flex-none inline-flex justify-center items-center px-8 py-3 rounded-lg text-sm font-semibold text-white transition-all active:scale-[.98] disabled:opacity-60 order-1 sm:order-2"
                style={{ backgroundColor: btnHover ? BRAND_DARK : BRAND }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2" size={16} />
                    Finalize Prescription
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionUpload;