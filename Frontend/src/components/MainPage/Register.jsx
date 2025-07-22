import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../../utils/authSlice";
import { toast } from "react-hot-toast";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [step, setStep] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      age: "",
      bloodType: "A+",
      medicalIssues: "",
    },
  });

  const onSubmit = async (data) => {
    if (step === "personal") {
      const isValid = await trigger(["name", "email", "phone", "password"]);
      if (isValid) setStep("medical");
    } else {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        const responseData = await response.json();

        if (response.ok) {
          // After successful registration, log the user in
          const loginResult = await dispatch(login({
            email: data.email,
            password: data.password,
            role: "patient"
          })).unwrap();

          // Route based on user role
          if (loginResult.role === "doctor") {
            navigate("/doctor-dashboard", { replace: true });
          } else if (loginResult.role === "admin") {
            navigate("/admin", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } else {
          toast.error(responseData.message || "Registration failed");
        }
      } catch (error) {
        console.error("Registration error:", error);
        toast.error(error.message || "Registration failed. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-5">
        <div className="card bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2"></div>
          <div className="card-body py-6">
            <h2 className="card-title text-2xl font-bold text-gray-800 mb-2">
              Create an Account
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium text-gray-700">
                      Full Name
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 bg-gray-50 border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-5 h-5 text-indigo-500"
                    >
                      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                    </svg>
                    <input
                      type="text"
                      className="grow bg-transparent focus:outline-none text-black"
                      placeholder="John Doe"
                      {...register("name", { required: "Name is required" })}
                    />
                  </label>
                  {errors.name && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </span>
                  )}
                </div>

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
                      Phone
                    </span>
                  </label>
                  <label className="input input-bordered flex items-center gap-2 bg-gray-50 border-gray-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all duration-200 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 16 16"
                      fill="currentColor"
                      className="w-5 h-5 text-indigo-500"
                    >
                      <path d="M8.5 1.696v1.8a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-1.8A1.5 1.5 0 0 0 2 3.19v10.62A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.19V3.19A1.5 1.5 0 0 0 12.5 2h-.8v1.496a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2h-.2A1.5 1.5 0 0 0 5 3.5V7h6a1 1 0 1 1 0 2H5v2a1 1 0 1 1-2 0V3.19A1.5 1.5 0 0 0 4.5 2h4v-.304a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1V2h.5Z" />
                    </svg>
                    <input
                      type="text"
                      className="grow bg-transparent focus:outline-none text-black"
                      placeholder="(123) 456-7890"
                      {...register("phone", {
                        required: "Phone number is required",
                      })}
                    />
                  </label>
                  {errors.phone && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.phone.message}
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
                        required: "Password is required",
                        minLength: {
                          value: 6,
                          message: "Password must be at least 6 characters",
                        },
                      })}
                    />
                  </label>
                  {errors.password && (
                    <span className="text-red-500 text-sm mt-1">
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </>

              <button
                type="submit"
                className={`btn w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${
                  isLoading ? "opacity-80" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
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
                    Registering...
                  </div>
                ) : (
                  "Register"
                )}
              </button>

              <div className="text-center mt-6">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                    onClick={() => navigate("/login")}
                  >
                    Sign in
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-8 text-sm text-gray-500">
          By registering, you agree to our{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-800">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-800">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}