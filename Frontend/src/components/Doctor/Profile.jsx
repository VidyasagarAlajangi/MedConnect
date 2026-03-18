import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorData, updateDoctorProfile } from "../../utils/doctorSlice";
import { toast } from "react-hot-toast";
import {
  UserCircle,
  Mail,
  Phone,
  MapPin,
  Pencil,
  Briefcase,
  GraduationCap,
  Loader2,
  ShieldCheck,
  AlertCircle,
  X
} from "lucide-react";

const BRAND = "#4a90e2";
const BRAND_DARK = "#357abd";
const BRAND_LIGHT = "#eaf2fb";

const getInitials = (name) => name.trim().match(/[A-Za-z]/)?.[0]?.toUpperCase() || "?";

export default function Profile() {
  const dispatch = useDispatch();
  const { doctorData, loading, error, isStale } = useSelector((state) => state.doctor);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [btnHover, setBtnHover] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    experience: "",
    address: "",
    qualifications: "",
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please login to view your profile");
      return;
    }
    if (isStale || !doctorData) {
      dispatch(fetchDoctorData());
    }
  }, [dispatch, isStale, doctorData]);

  useEffect(() => {
    if (doctorData) {
      setFormData({
        name: doctorData.name || "",
        specialization: doctorData.specialization || "",
        experience: doctorData.experience || "",
        address: doctorData.address || "",
        qualifications: doctorData.qualifications || "",
      });
    }
  }, [doctorData]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.specialization.trim()) errors.specialization = "Specialization is required";
    if (!formData.experience) errors.experience = "Experience is required";
    if (formData.experience && (isNaN(formData.experience) || formData.experience < 0)) {
      errors.experience = "Experience must be a positive number";
    }
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.qualifications.trim()) errors.qualifications = "Qualifications are required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setIsUpdating(true);
      await dispatch(updateDoctorProfile(formData)).unwrap();
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error(error?.message || "Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.")) {
      setIsEditing(false);
      setFormData({
        name: doctorData.name || "",
        specialization: doctorData.specialization || "",
        experience: doctorData.experience || "",
        address: doctorData.address || "",
        qualifications: doctorData.qualifications || "",
      });
      setFormErrors({});
    }
  };

  if (loading && !doctorData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin" size={32} style={{ color: BRAND }} />
        <p className="mt-4 text-sm text-slate-400">Loading your profile...</p>
      </div>
    );
  }

  if (error || !doctorData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-red-100">
        <AlertCircle size={32} strokeWidth={1.5} className="text-red-400 mb-2" />
        <p className="text-sm text-slate-500">{error || "No profile data found."}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-4" style={{ backgroundColor: BRAND_LIGHT }}>
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

        .card-shadow {
          box-shadow: 0 2px 8px rgba(74,144,226,0.10), 0 8px 32px rgba(74,144,226,0.06);
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        
        <header className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                onMouseEnter={() => setBtnHover(true)}
                onMouseLeave={() => setBtnHover(false)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[.98]"
                style={{ backgroundColor: btnHover ? BRAND_DARK : BRAND }}
              >
                <Pencil size={14} /> Edit Profile
              </button>
            )}
          </div>
        </header>

        <div className="bg-white rounded-2xl overflow-hidden border border-[#dbeafe] card-shadow fade-up">
          <div className="h-1 w-full" style={{ backgroundColor: BRAND }} />

          <div className="p-8">
            
            <div className="flex items-center gap-5 mb-10 pb-10 border-b border-slate-100">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-inner"
                style={{ backgroundColor: BRAND }}
              >
                {getInitials(doctorData.name)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">{doctorData.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border"
                    style={doctorData.isActive
                      ? { backgroundColor: "#f0fdf4", color: "#16a34a", borderColor: "#bbf7d0" }
                      : { backgroundColor: "#fffbeb", color: "#d97706", borderColor: "#fde68a" }
                    }
                  >
                    {doctorData.isActive ? <ShieldCheck size={12} /> : <Loader2 size={12} className="animate-spin" />}
                    {doctorData.isActive ? "Verified Provider" : "Pending Verification"}
                  </span>
                </div>
              </div>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Full Name</label>
                    <div data-field-wrap className={`flex items-center gap-3 border-[1.5px] rounded-lg px-3 transition-all ${formErrors.name ? 'border-red-500' : 'border-slate-200'} bg-slate-50`}>
                      <UserCircle size={15} style={{ color: BRAND }} />
                      <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Dr. Name"
                        className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    {formErrors.name && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {formErrors.name}</p>}
                  </div>

                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Specialization</label>
                    <div data-field-wrap className={`flex items-center gap-3 border-[1.5px] rounded-lg px-3 transition-all ${formErrors.specialization ? 'border-red-500' : 'border-slate-200'} bg-slate-50`}>
                      <Briefcase size={15} style={{ color: BRAND }} />
                      <input
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    {formErrors.specialization && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {formErrors.specialization}</p>}
                  </div>

                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Experience (Years)</label>
                    <div data-field-wrap className={`flex items-center gap-3 border-[1.5px] rounded-lg px-3 transition-all ${formErrors.experience ? 'border-red-500' : 'border-slate-200'} bg-slate-50`}>
                      <ShieldCheck size={15} style={{ color: BRAND }} />
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    {formErrors.experience && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {formErrors.experience}</p>}
                  </div>

                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Clinic Address</label>
                    <div data-field-wrap className={`flex items-center gap-3 border-[1.5px] rounded-lg px-3 transition-all ${formErrors.address ? 'border-red-500' : 'border-slate-200'} bg-slate-50`}>
                      <MapPin size={15} style={{ color: BRAND }} />
                      <input
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300"
                      />
                    </div>
                    {formErrors.address && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {formErrors.address}</p>}
                  </div>

                  
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Qualifications</label>
                    <div data-field-wrap className={`flex items-start gap-3 border-[1.5px] rounded-lg px-3 transition-all ${formErrors.qualifications ? 'border-red-500' : 'border-slate-200'} bg-slate-50`}>
                      <GraduationCap size={15} className="mt-3.5" style={{ color: BRAND }} />
                      <textarea
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        rows="3"
                        className="flex-1 py-3 bg-transparent border-none outline-none text-sm text-slate-800 placeholder:text-slate-300 resize-none"
                      />
                    </div>
                    {formErrors.qualifications && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {formErrors.qualifications}</p>}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-6 py-3 border-[1.5px] border-[#dbeafe] text-slate-600 bg-white hover:bg-slate-50 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="min-w-[140px] px-6 py-3 rounded-lg text-sm font-semibold text-white transition-all active:scale-[.98] disabled:opacity-60 flex items-center justify-center gap-2"
                    style={{ backgroundColor: BRAND }}
                  >
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : "Save Profile"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Full Name</h3>
                  <p className="text-sm text-slate-800 font-medium">{doctorData.name}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Specialization</h3>
                  <p className="text-sm text-slate-800 font-medium">{doctorData.specialization}</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Years of Experience</h3>
                  <p className="text-sm text-slate-800 font-medium">{doctorData.experience} Years Professional Practice</p>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Clinic Location</h3>
                  <p className="text-sm text-slate-800 font-medium">{doctorData.address}</p>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <h3 className="text-xs font-semibold text-slate-500 tracking-wider uppercase">Medical Qualifications</h3>
                  <div className="p-4 rounded-xl border border-[#dbeafe] bg-slate-50/50">
                    <p className="text-sm text-slate-800 leading-relaxed">{doctorData.qualifications}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}