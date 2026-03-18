import { useState } from "react";
import axios from "axios";
import { Briefcase, Award, MapPin, Clock, Image, User, Mail, Lock } from "lucide-react";
import { useDispatch } from "react-redux";
import { registerDoctor } from "../../utils/authSlice";

const DoctorRegistrationForm = () => {
  const dispatch = useDispatch();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    qualifications: "",
    address: "",
    phone: "",
    licenseNumber: "", 
    photo: null, 
    certificate: null, 
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleCertificateChange = (e) => {
    setForm({ ...form, certificate: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      for (const key in form) {
        if ((key === 'photo' || key === 'certificate') && form[key]) {
          formData.append(key, form[key]);
        } else if (key !== 'photo' && key !== 'certificate') {
          formData.append(key, form[key]);
        }
      }

      const result = await dispatch(registerDoctor(formData)).unwrap();

      setMessage(result.message || "Registration submitted successfully! Awaiting admin verification.");
      setForm({
        name: "",
        email: "",
        password: "",
        phone: "", 
        specialization: "",
        experience: "",
        qualifications: "",
        address: "",
        licenseNumber: "",
        photo: null,
        certificate: null,
      });
    } catch (error) {
      setMessage(error || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">

          
          <div className="bg-[#4a90e2] px-10 py-12 text-center relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/5 rounded-full -ml-24 -mb-24" />

            <div className="relative z-10">
              <h2 className="text-4xl font-black text-white tracking-tight mb-3">
                Join Our Medical Network
              </h2>
              <p className="text-blue-100 text-lg font-medium max-w-xl mx-auto leading-relaxed">
                Connect with thousands of patients and grow your practice with MedConnect.
              </p>
            </div>
          </div>

          
          {message && (
            <div className={`mx-10 mt-8 p-4 rounded-2xl border ${message.toLowerCase().includes("failed")
              ? "bg-red-50 border-red-100 text-red-700"
              : "bg-green-50 border-green-100 text-green-700"
              } flex items-center gap-3 animate-in fade-in slide-in-from-top-4`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.toLowerCase().includes("failed") ? "bg-red-100" : "bg-green-100"
                }`}>
                {message.toLowerCase().includes("failed") ? "!" : "✓"}
              </div>
              <p className="text-sm font-bold">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-10 py-10 space-y-10">

            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Login Credentials</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="email"
                      type="email"
                      placeholder="doctor@example.com"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Secure Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Professional Profile</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Full Name (including Dr.)</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="name"
                      type="text"
                      placeholder="Dr. John Doe"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.name}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Medical Specialization</label>
                  <div className="relative group">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="specialization"
                      type="text"
                      placeholder="e.g. Cardiologist"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.specialization}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Years of Experience</label>
                  <div className="relative group">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="experience"
                      type="number"
                      placeholder="e.g. 10"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.experience}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Medical License Number</label>
                  <div className="relative group">
                    <Award className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="licenseNumber"
                      type="text"
                      placeholder="REG-00123456"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.licenseNumber}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Phone Number</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="e.g. +1 234 567 890"
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                      value={form.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="h-6 w-1 bg-blue-600 rounded-full" />
                <h3 className="text-lg font-bold text-gray-900">Additional Details</h3>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Qualifications & Degrees</label>
                  <input
                    name="qualifications"
                    type="text"
                    placeholder="e.g. MBBS, MD"
                    required
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                    value={form.qualifications}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Clinic/Practice Address</label>
                  <textarea
                    name="address"
                    placeholder="Full street address..."
                    required
                    rows="3"
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400 resize-none"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Professional Photo</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <Image className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <p className="text-xs text-gray-500 font-medium truncate w-full">
                            {form.photo ? form.photo.name : "Upload Photo"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter font-bold">Image only</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[13px] font-bold text-gray-700 uppercase tracking-wider ml-1">Medical Certificate / Degree</label>
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all group overflow-hidden">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                          <Award className="w-8 h-8 text-gray-400 group-hover:text-blue-500 transition-colors mb-2" />
                          <p className="text-xs text-gray-500 font-medium truncate w-full">
                            {form.certificate ? form.certificate.name : "Upload Certificate"}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter font-bold">PDF or Image</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleCertificateChange} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center py-4 px-6 border border-transparent rounded-2xl shadow-xl shadow-blue-200 text-base font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Create Professional Profile"
                )}
              </button>
              <p className="text-center text-gray-400 text-xs mt-4 leading-relaxed px-10">
                By submitting this form, you agree to our <span className="text-blue-600 cursor-pointer font-bold">Terms of Service</span> and <span className="text-blue-600 cursor-pointer font-bold">Privacy Policy</span>. Your profile will be verified by our medical board within 24-48 hours.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>

  );
};

export default DoctorRegistrationForm;
