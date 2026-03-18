import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout, updateUser } from "../../utils/authSlice";
import { UserCircle, Pencil, Mail, Phone, MapPin } from "lucide-react";
import Modal from "react-modal";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "react-hot-toast";

// Set the app element for React Modal
// This should be called once in your app, usually at the highest level component
Modal.setAppElement("#root"); // Adjust this selector to match your root element's ID


export default function Profile() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
    medicalDetails: user?.medicalDetails || "",
  });

  // Update form data when user state changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || formData.name,
        email: user.email || formData.email,
        phone: user.phone || formData.phone,
        address: user.address || formData.address,
        medicalDetails: user.medicalDetails || formData.medicalDetails,
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosInstance.put("/api/user/profile", {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        medicalDetails: formData.medicalDetails,
      });

      if (response.data.success) {
        // Update the Redux state with the new user data using the action creator
        dispatch(updateUser({
          ...user,
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          medicalDetails: formData.medicalDetails,
        }));

        // Close the modal and show a success message
        setModalIsOpen(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Profile Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Top Accent */}
          <div className="h-2 bg-[#4A90E2]" />

          <div className="p-8">

            {/* Header */}
            <div className="flex items-center gap-6 mb-8">

              <div className="bg-gray-100 rounded-full p-3">
                <UserCircle className="w-16 h-16 text-gray-500" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-semibold text-gray-900">
                  {formData.name}
                </h1>
                <p className="text-gray-500 text-sm">
                  {formData.email}
                </p>
              </div>

              <button
                onClick={() => setModalIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 border border-[#4A90E2] rounded-md text-[#4A90E2] hover:border-[#4A90E2] hover:text-[#4A90E2] transition"
              >
                <Pencil size={16} />
                Edit
              </button>

            </div>

            {/* Grid Info */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* Contact Info */}
              <div className="border border-gray-200 rounded-lg p-5">

                <h2 className="font-semibold text-gray-800 mb-4">
                  Contact Information
                </h2>

                <div className="space-y-3 text-sm">

                  <div className="flex items-center gap-3 text-gray-700">
                    <Mail size={18} className="text-[#4A90E2]" />
                    {formData.email}
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <Phone size={18} className="text-[#4A90E2]" />
                    {formData.phone}
                  </div>

                  <div className="flex items-center gap-3 text-gray-700">
                    <MapPin size={18} className="text-[#4A90E2]" />
                    {formData.address || "No address provided"}
                  </div>

                </div>

              </div>

              {/* Medical Details */}
              <div className="border border-gray-200 rounded-lg p-5">

                <h2 className="font-semibold text-gray-800 mb-4">
                  Medical Details
                </h2>

                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {formData.medicalDetails || "No medical details provided."}
                </p>

              </div>

            </div>

            {/* Logout */}
            <div className="mt-8">
              <button
                onClick={handleLogout}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-md transition"
              >
                Logout
              </button>
            </div>

          </div>

        </div>

        {/* Modal */}
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={() => setModalIsOpen(false)}
          className="bg-white rounded-xl max-w-xl w-full mx-auto shadow-2xl outline-none"
          overlayClassName="fixed inset-0 bg-black/40 flex justify-center items-center p-4"
        >
          {/* Header */}
          <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              Edit Profile
            </h2>

            <button
              onClick={() => setModalIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="px-6 py-6 space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm 
hover:border-gray-300 
focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 
outline-none transition-all duration-200"              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm 
hover:border-gray-300 
focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 
outline-none transition-all duration-200"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm 
hover:border-gray-300 
focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 
outline-none transition-all duration-200"              />
            </div>

            {/* Medical Details */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Medical Details
              </label>
              <textarea
                name="medicalDetails"
                value={formData.medicalDetails}
                onChange={handleChange}
                rows="4"
                className="w-full text-gray-800 bg-white border border-gray-200 rounded-lg px-3 py-2.5 shadow-sm 
hover:border-gray-300 
focus:border-[#4A90E2] focus:ring-2 focus:ring-[#4A90E2]/20 
outline-none transition-all duration-200"              />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">

              <button
                type="button"
                onClick={() => setModalIsOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-[#4A90E2] hover:bg-[#357ABD] text-white rounded-md"
              >
                Save Changes
              </button>

            </div>

          </form>
        </Modal>

      </div>
    </div >
  );
}