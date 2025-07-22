import { UserCog, Brain, Pill, CheckCircle, ArrowRight } from "lucide-react";

export default function FeaturesGrid() {
  const features = [
    {
      title: "Expert Doctors",
      icon: UserCog,
      description:
        "Connect with verified healthcare specialists for personalized care and expert medical advice.",
      features: [
        "HD video consultations",
        "Secure messaging system",
        "Digital prescriptions",
      ],
      color: "blue",
    },
    {
      title: "Smart Health Check",
      icon: Brain,
      description:
        "Experience AI-powered symptom analysis with smart recommendations tailored to your needs.",
      features: [
        "Instant health assessment",
        "Personalized health insights",
        "Smart follow-up care",
      ],
      color: "purple",
    },
    {
      title: "Medicine Delivery",
      icon: Pill,
      description:
        "Get your prescribed medications delivered right to your doorstep with real-time tracking.",
      features: [
        "Contactless delivery",
        "Live order tracking",
        "Same-day delivery",
      ],
      color: "green",
    },
  ];

  const getGradient = (color) => {
    const gradients = {
      blue: "from-blue-500 to-blue-600",
      purple: "from-purple-500 to-purple-600",
      green: "from-green-500 to-green-600",
    };
    return gradients[color];
  };

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4 mb-16"
      id="Features"
    >
      {features.map((feature, index) => (
        <div
          key={index}
          className="group relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer"
          //onClick={() => handleFeatureClick(feature.title.toLowerCase())}
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
            <feature.icon className="w-8 h-8 text-white" />
          </div>

          <h3 className="text-2xl font-bold mb-4 text-gray-900">
            {feature.title}
          </h3>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {feature.description}
          </p>

          <ul className="space-y-4 mb-8">
            {feature.features.map((item, idx) => (
              <li key={idx} className="flex items-center text-gray-700 gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Learn More Link */}
          <div className="flex items-center text-blue-600 font-semibold group/link">
            Learn More
            <ArrowRight className="w-4 h-4 ml-2 transform transition-transform group-hover/link:translate-x-1" />
          </div>
        </div>
      ))}
    </section>
  );
}
