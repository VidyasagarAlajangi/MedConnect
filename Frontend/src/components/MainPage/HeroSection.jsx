import { Stethoscope, Heart, Activity } from "lucide-react";
import "tailwindcss/tailwind.css";
import { useNavigate } from "react-router-dom";
import React from "react";

const HeroSection = () => {
  const navigate = useNavigate();
  const isLoggedIn = false;

  return (
    <section className="relative pb-20 px-4 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Your Health, Our Priority
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
              Connect with trusted healthcare professionals and manage your health journey with ease
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <button
                onClick={() =>
                  !isLoggedIn ? navigate("/find-doctor") : navigate("/register")
                }
                className="px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold text-lg"
              >
                Find a Doctor
              </button>

              <button
                onClick={() =>
                  !isLoggedIn ? navigate("/chatbot") : navigate("/register")
                }
                className="px-6 py-3 sm:px-8 sm:py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-xl hover:bg-blue-50 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 font-semibold text-lg"
              >
                Check Symptoms
              </button>
            </div>
          </div>

          <div className="flex-1 relative mt-12 lg:mt-0 hidden md:block">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-blue-100 rounded-full opacity-50 animate-pulse-scale"></div>

            <div className="relative w-full h-64 sm:h-80 md:h-96">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 transition-transform hover:scale-110 duration-300">
                <Stethoscope className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 text-blue-600" />
              </div>

              <div className="absolute top-24 sm:top-32 md:top-40 left-1/2 transform -translate-x-1/2 text-center animate-bounce-scale">
                <span className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Health+
                </span>
                <div className="mt-2 animate-bounce">
                  <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mx-auto" />
                </div>
              </div>

              <div className="absolute bottom-12 sm:bottom-16 md:bottom-20 left-0 transition-transform hover:scale-110 duration-300">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 text-purple-500" />
              </div>
              <div className="absolute top-12 sm:top-16 md:top-20 right-0 transition-transform hover:scale-110 duration-300">
                <Activity className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 text-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-blue-50 to-transparent opacity-50"></div>

      <style>{`
        @keyframes pulse-scale {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        @keyframes bounce-scale {
          0%,
          100% {
            transform: translateX(-50%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(-50%) translateY(-10px) scale(1.2);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-pulse-scale {
          animation: pulse-scale 3s infinite ease-in-out;
        }

        .animate-bounce-scale {
          animation: bounce-scale 3s infinite ease-in-out;
        }

        .animate-bounce {
          animation: bounce 2s infinite ease-in-out;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
