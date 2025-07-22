import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartbeat } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../utils/authSlice";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  return (
    <header className="bg-gradient-to-r from-[#6faedc] via-[#85c1e9] to-[#a4d1f2] text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <FontAwesomeIcon
              icon={faHeartbeat}
              className="text-3xl transform transition-transform duration-500 hover:scale-110"
            />
            <span
              className="text-3xl font-poppins font-extrabold tracking-wider transition-all duration-300 hover:text-[#4a90e2] cursor-pointer"
              onClick={() => navigate("/")}
            >
              MedConnect
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <nav className="hidden md:flex space-x-8 font-medium">
              <a
                onClick={() => navigate("/")}
                className="cursor-pointer hover:text-[#4a90e2] transition-all"
              >
                Home
              </a>
              <a
                onClick={() => navigate("/AboutUs")}
                className="cursor-pointer hover:text-[#4a90e2] transition-all"
              >
                About Us
              </a>
              <a
                onClick={() => navigate("/doctorRegistration")}
                className="cursor-pointer hover:text-[#4a90e2] transition-all"
              >
                Join as Doctor
              </a>
              {user?.role === "admin" && (
                <a
                  onClick={() => navigate("/admin")}
                  className="cursor-pointer hover:text-[#4a90e2] transition-all"
                >
                  Admin Panel
                </a>
              )}
            </nav>

            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-3 focus:outline-none">
                  <img
                    alt="profile"
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRz91eUPPyxLMbt7e7JzPdGKP_-rCGhKEGHR--SDRpS_3BTQsgXS_9MIHs&s"
                    className="w-10 h-10 rounded-full "
                  />
                </button>
                <ul className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 z-50">
                  {user.role === "admin" ? (
                    // Only show Logout for admin
                    <li>
                      <a
                        onClick={() => {
                          dispatch(logout());
                          navigate("/");
                        }}
                        className="block px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer rounded-md"
                      >
                        Logout
                      </a>
                    </li>
                  ) : (
                    <>
                      <li>
                        <a
                          onClick={() => navigate("/profile")}
                          className="block px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                        >
                          Profile
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => navigate("/appointments")}
                          className="block px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                        >
                          My Appointments
                        </a>
                      </li>
                      <li>
                        <a
                          onClick={() => {
                            dispatch(logout());
                            navigate("/");
                          }}
                          className="block px-4 py-2 text-red-600 hover:bg-gray-100 cursor-pointer rounded-md"
                        >
                          Logout
                        </a>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-[#4a90e2] px-5 py-2 rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 font-semibold text-lg transform hover:scale-105"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
