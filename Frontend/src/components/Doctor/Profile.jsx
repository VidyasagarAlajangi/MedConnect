import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchDoctorData, updateDoctorProfile } from "../../utils/doctorSlice";
import { toast } from "react-hot-toast";
import { UserCircle, Mail, Phone, MapPin, Pencil } from "lucide-react";
import Modal from "react-modal";

Modal.setAppElement("#root");

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Profile() {
  const dispatch = useDispatch();
  const { doctorData, loading, error, isStale } = useSelector((state) => state.doctor);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
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
    if (isEditing) {
      const confirmed = window.confirm("Are you sure you want to cancel? Any unsaved changes will be lost.");
      if (confirmed) {
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
    }
  };

  if (loading && !doctorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4">
          {error}
        </div>
      </div>
    );
  }

  if (!doctorData) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-600 rounded-lg p-4">
          No profile data available. Please try refreshing the page.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
          <button
            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            disabled={isUpdating}
          >
            {isEditing ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialization
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.specialization ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.specialization && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.specialization}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experience (years)
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.experience ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.experience && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.experience}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.address && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualifications
                </label>
                <textarea
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    formErrors.qualifications ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                />
                {formErrors.qualifications && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.qualifications}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Name</h3>
              <p className="mt-1 text-lg text-gray-900">{doctorData.name}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Specialization</h3>
              <p className="mt-1 text-lg text-gray-900">{doctorData.specialization}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Experience</h3>
              <p className="mt-1 text-lg text-gray-900">{doctorData.experience} years</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="mt-1 text-lg text-gray-900">{doctorData.address}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Qualifications</h3>
              <p className="mt-1 text-lg text-gray-900">{doctorData.qualifications}</p>
            </div>

            <div className="md:col-span-2">
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="mt-1">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    doctorData.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {doctorData.isActive ? "Active" : "Pending Approval"}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}