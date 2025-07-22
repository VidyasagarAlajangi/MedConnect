import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Calendar, FileText, Bot, MessageSquare } from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <MessageSquare className="w-8 h-8" />,
      title: "Secure Messaging",
      description: "Communicate with doctors through our secure messaging system for medical consultations.",
      color: "blue"
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Appointment Booking",
      description: "Schedule and manage your medical appointments with ease.",
      color: "purple"
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Health Records",
      description: "Access and manage your medical history and prescriptions digitally.",
      color: "green"
    },
    {
      icon: <Bot className="w-8 h-8" />,
      title: "AI Chatbot",
      description: "Get instant answers to your health-related questions through our AI assistant.",
      color: "indigo"
    }
  ];

  const getGradient = (color) => {
    const gradients = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
      indigo: "from-indigo-500 to-indigo-600"
    };
    return gradients[color];
  };

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4 mb-16" id="Features">
      {features.map((feature, index) => (
        <div
          key={index}
          className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
        >
          <div
            className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${getGradient(
              feature.color
            )} opacity-20 rounded-tr-2xl rounded-bl-full transition-all duration-500 group-hover:opacity-40`}
          ></div>

          <div
            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(
              feature.color
            )} flex items-center justify-center mb-6 transform transition-transform duration-500 group-hover:rotate-6`}
          >
            <div className="text-white">
              {feature.icon}
            </div>
          </div>

          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            {feature.title}
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </section>
  );
};

export default Features; 