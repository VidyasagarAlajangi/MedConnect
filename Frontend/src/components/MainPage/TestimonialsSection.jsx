import React from "react";
import { Star, Quote } from "lucide-react";
const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    text: "MedConnect made it so easy to find the right specialist and book appointments. The video consultations saved me so much time and provided the care I needed from the comfort of my home.",
    rating: 5,
    accentColor: "blue",
    image: "/images/Sarah Johnson.jpg",
  },
  {
    name: "Dr. Michael Chen",
    role: "Cardiologist",
    text: "As a doctor, this platform helps me reach more patients and manage my practice efficiently. The digital health records system is excellent and the scheduling system is intuitive.",
    rating: 5,
    accentColor: "purple",
    image: "/images/Dr. Michael Chen.jpg",
  },
  {
    name: "Emily Rodriguez",
    role: "Patient",
    text: "The symptom checker is incredibly helpful, and the doctors are very professional. I've never had such a seamless healthcare experience. Highly recommended!",
    rating: 4,
    accentColor: "green",
    image: "/images/Emily Rodriguez.jpg",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="py-20 bg-gradient-to-b from-gray-50 to-white"
      id="Testimonials"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what our community has to say about their experience with our
            platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="absolute -top-4 -left-4">
                <div
                  className={`w-8 h-8 rounded-full bg-${testimonial.accentColor}-100 flex items-center justify-center`}
                >
                  <Quote
                    className={`w-4 h-4 text-${testimonial.accentColor}-500`}
                  />
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="relative">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div
                    className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-${testimonial.accentColor}-500 border-2 border-white`}
                  ></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h3>
                  <p className={`text-sm text-${testimonial.accentColor}-600`}>
                    {testimonial.role}
                  </p>
                </div>
              </div>

              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              <p className="text-gray-600 leading-relaxed">
                {testimonial.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
