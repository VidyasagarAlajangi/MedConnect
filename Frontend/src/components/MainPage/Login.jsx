import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../utils/authSlice";
import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [userType, setUserType] = useState("patient");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  // Watch the email field
  const email = watch("email");

  // Update userType when email changes
  useEffect(() => {
    if (email === "admin@gmail.com") {
      setUserType("admin");
    }
  }, [email]);

  const onSubmit = async (data) => {
    try {
      // If email is admin@gmail.com, force role to be admin
      const role = data.email === "admin@gmail.com" ? "admin" : userType;
      
      const result = await dispatch(login({ ...data, role })).unwrap();
      
      // Navigate based on role
      if (result.user.role === "doctor") {
        navigate("/doctor-dashboard", { replace: true });
      } else if (result.user.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-5">
        <div className="card bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
          <div className="card-body py-6">
            <h2 className="card-title text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            {email === "admin@gmail.com" ? (
              <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-lg mb-4">
                Logging in as Administrator
              </div>
            ) : (
              <div className="flex gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setUserType("patient")}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                    userType === "patient"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Patient
                </button>
                <button
                  type="button"
                  onClick={() => setUserType("doctor")}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all duration-200 ${
                    userType === "doctor"
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Doctor
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    Email Address
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-gray-50 border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-5 h-5 text-indigo-500"
                  >
                    <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v.793c.026.009.051.02.076.032L7.674 8.51c.206.1.446.1.652 0l6.598-3.185A.755.755 0 0 1 15 5.293V4.5A1.5 1.5 0 0 0 13.5 3h-11Z" />
                    <path d="M15 6.954 8.978 9.86a2.25 2.25 0 0 1-1.956 0L1 6.954V11.5A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5V6.954Z" />
                  </svg>
                  <input
                    type="email"
                    className="grow bg-transparent focus:outline-none text-black"
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                  />
                </label>
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium text-gray-700">
                    Password
                  </span>
                </label>
                <label className="input input-bordered flex items-center gap-2 bg-gray-50 border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 16 16"
                    fill="currentColor"
                    className="w-5 h-5 text-indigo-500"
                  >
                    <path
                      fillRule="evenodd"
                      d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <input
                    type="password"
                    className="grow bg-transparent focus:outline-none text-black"
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required"
                    })}
                  />
                </label>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`btn w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                  loading ? "opacity-80" : ""
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => navigate("/register")}
                  >
                    Register
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
