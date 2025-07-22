import React, { useState } from "react";
import {
  HeartPulse,
  UserCheck,
  Video,
  ShieldCheck,
  Package,
  Stethoscope,
  Brain,
  MessageSquare,
} from "lucide-react";

export default function AboutUs() {
  const [selectedFeature, setSelectedFeature] = useState(null);

  return (
    <section
      className="py-20 bg-gradient-to-b from-white to-gray-100"
      id="AboutUs"
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-4 transition-all duration-500 hover:scale-105">
          About <span className="text-[#4a90e2]">MedConnect</span>
        </h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-12">
          We are revolutionizing healthcare by bridging the gap between patients
          and top medical professionals. Our secure and user-friendly platform
          ensures you receive the best care anytime, anywhere.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              <div className="flex justify-center items-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 group-hover:text-[#4a90e2] transition-all duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-600 mt-2">{feature.description}</p>
              <button
                className="mt-4 text-[#4a90e2] font-semibold hover:underline"
                onClick={() => setSelectedFeature(feature)}
              >
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>

      {selectedFeature && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {selectedFeature.title}
            </h3>
            <p className="text-gray-600 mb-4">{selectedFeature.details}</p>
            <button
              className="mt-4 bg-[#4a90e2] text-white px-4 py-2 rounded hover:bg-[#357ac9]"
              onClick={() => setSelectedFeature(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

const features = [
  {
    title: "Expert Doctors",
    description:
      "Connect with verified healthcare specialists for personalized care and expert medical advice.",
    details:
      "Our platform connects you with certified doctors specializing in various medical fields, ensuring you receive the best care possible.",
    icon: <Stethoscope className="w-12 h-12 text-[#4a90e2]" />,
  },
  {
    title: "Secure Communication",
    description:
      "End-to-end encrypted messaging system for confidential medical discussions.",
    details:
      "Our secure messaging platform ensures your medical communications remain private and protected, allowing you to discuss your health concerns with confidence.",
    icon: <MessageSquare className="w-12 h-12 text-[#4a90e2]" />,
  },
  {
    title: "Smart Health Check",
    description:
      "Experience AI-powered symptom analysis with smart recommendations tailored to your needs.",
    details:
      "Our AI-driven system analyzes your symptoms and provides recommendations, making healthcare more accessible and efficient.",
    icon: <Brain className="w-12 h-12 text-[#4a90e2]" />,
  },
  {
    title: "Secure & Private",
    description: "Your health data is encrypted and safe with us.",
    details:
      "We prioritize your privacy with end-to-end encryption and secure data storage, ensuring confidentiality.",
    icon: <ShieldCheck className="w-12 h-12 text-[#4a90e2]" />,
  },
  {
    title: "Medicine Delivery",
    description:
      "Get your prescribed medications delivered right to your doorstep with real-time tracking.",
    details:
      "Our network of pharmacies ensures you get your medicine quickly and safely, with real-time order tracking.",
    icon: <Package className="w-12 h-12 text-[#4a90e2]" />,
  },
  {
    title: "24/7 Support",
    description: "We are here to assist you at any time of the day.",
    details:
      "Our customer support is available round the clock to answer any queries and assist with your healthcare needs.",
    icon: <HeartPulse className="w-12 h-12 text-[#4a90e2]" />,
  },
];
