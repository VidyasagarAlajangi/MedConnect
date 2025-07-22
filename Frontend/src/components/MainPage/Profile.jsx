import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../utils/authSlice";
import { UserCircle, Pencil, Mail, Phone, MapPin } from "lucide-react";
import Modal from "react-modal";
import axios from "axios";
import { toast } from "react-hot-toast";

// Set the app element for React Modal
// This should be called once in your app, usually at the highest level component
Modal.setAppElement("#root"); // Adjust this selector to match your root element's ID

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

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
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to update your profile");
        return;
      }

      const response = await axios.put(
        `${API_BASE_URL}/api/user/profile`,
        {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          medicalDetails: formData.medicalDetails,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        // Update the Redux state with the new user data
        dispatch({
          type: "auth/updateUser",
          payload: {
            ...user,
            name: formData.name,
            phone: formData.phone,
            address: formData.address,
            medicalDetails: formData.medicalDetails,
          },
        });

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 flex justify-center items-center p-6">
      <div className="w-full max-w-4xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 p-8 text-white">
          <div className="flex items-center space-x-6">
            <UserCircle className="w-24 h-24 text-white bg-gray-200 rounded-full p-2" />
            <div>
              <h1 className="text-3xl font-bold">{formData.name}</h1>
              <p className="text-lg">{formData.email}</p>
            </div>
            <button
              className="ml-auto bg-white text-teal-600 hover:text-teal-700 px-4 py-2 rounded-lg flex items-center space-x-2 shadow-md transition-all"
              onClick={() => setModalIsOpen(true)}
            >
              <Pencil className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-8">
          {/* Contact Info */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Contact Information
            </h2>
            <div className="space-y-3">
              <p className="flex items-center space-x-3 text-gray-700">
                <Mail className="w-5 h-5 text-teal-500" />
                <span>{formData.email}</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-700">
                <Phone className="w-5 h-5 text-teal-500" />
                <span>{formData.phone}</span>
              </p>
              <p className="flex items-center space-x-3 text-gray-700">
                <MapPin className="w-5 h-5 text-teal-500" />
                <span>{formData.address || "No address provided"}</span>
              </p>
            </div>
          </div>

          {/* Medical Details */}
          <div className="bg-gray-50 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Medical Details
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {formData.medicalDetails || "No medical details provided."}
            </p>
          </div>

          {/* Logout Button */}
          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg shadow-md transition-all"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="bg-white rounded-lg p-6 max-w-lg mx-auto shadow-lg"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Profile</h2>
        <form onSubmit={handleSave}>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Medical Details
              </label>
              <textarea
                name="medicalDetails"
                value={formData.medicalDetails}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                rows="4"
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg mr-3"
              onClick={() => setModalIsOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}