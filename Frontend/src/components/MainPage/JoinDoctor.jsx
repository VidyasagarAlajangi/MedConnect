import { useState } from "react";
import axios from "axios";
import { User, Mail, Lock, Briefcase, Award, MapPin, Clock, Image } from "lucide-react";

const DoctorRegistrationForm = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    specialization: "",
    experience: "",
    qualifications: "",
    address: "",
    licenseNumber: "", // New field
    photo: null, // New field for photo
  });
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    setForm({ ...form, photo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    try {
      const formData = new FormData();
      for (const key in form) {
        formData.append(key, form[key]);
      }

      await axios.post("/api/auth/register-doctor", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setMessage("Registration submitted successfully! Awaiting admin verification.");
      setForm({
        name: "",
        email: "",
        password: "",
        specialization: "",
        experience: "",
        qualifications: "",
        address: "",
        licenseNumber: "",
        photo: null,
      }); // Clear the form
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-10 text-white">
            <h2 className="text-3xl font-extrabold text-center">
              Join Our Medical Team
            </h2>
            <p className="mt-2 text-center text-blue-100">
              Begin your journey with MedConnect - Where Care Meets Excellence
            </p>
          </div>

          {message && (
            <div className="mx-8 mt-6 p-4 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-medium text-green-800">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label htmlFor="name" className="text-sm font-medium text-black flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-blue-500" />
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="specialization" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-500" />
                  Specialization
                </label>
                <input
                  id="specialization"
                  name="specialization"
                  type="text"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white "
                  value={form.specialization}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="experience" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Years of Experience
                </label>
                <input
                  id="experience"
                  name="experience"
                  type="number"
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
                  value={form.experience}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="qualifications" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  Qualifications
                </label>
                <input
                  id="qualifications"
                  name="qualifications"
                  type="text"
                  required
                  className="mt-1 text-white block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.qualifications}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="licenseNumber" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Award className="w-4 h-4 text-blue-500" />
                  License Number
                </label>
                <input
                  id="licenseNumber"
                  name="licenseNumber"
                  type="text"
                  required
                  className="mt-1 block w-full text-white px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.licenseNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label htmlFor="address" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-500" />
                  Practice Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  required
                  rows="2"
                  className="mt-1 block w-full px-3 text-white py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={form.address}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label htmlFor="photo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Image className="w-4 h-4 text-blue-500" />
                  Upload Photo
                </label>
                <input
                  id="photo"
                  name="photo"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  "Submit Registration"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorRegistrationForm;
