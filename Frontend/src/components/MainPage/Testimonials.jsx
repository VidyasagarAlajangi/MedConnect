import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Quote } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      icon: <Quote className="testimonial-icon" />,
      name: "John Smith",
      text: "MedConnect has revolutionized how I manage my healthcare. The online consultation feature is incredibly convenient.",
      accentColor: "blue"
    },
    {
      icon: <Quote className="testimonial-icon" />,
      name: "Sarah Johnson",
      text: "The appointment booking system is so easy to use. I can schedule my visits without any hassle.",
      accentColor: "purple"
    },
    {
      icon: <Quote className="testimonial-icon" />,
      name: "Michael Brown",
      text: "Having access to my health records online has made it much easier to keep track of my medical history.",
      accentColor: "green"
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white" id="Testimonials">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our Users Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hear from our satisfied patients about their experience with MedConnect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="relative p-8 rounded-2xl bg-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="absolute -top-4 -left-4">
                <div className={`w-8 h-8 rounded-full bg-${testimonial.accentColor}-100 flex items-center justify-center`}>
                  <Quote className={`w-4 h-4 text-${testimonial.accentColor}-500`} />
                </div>
              </div>

              <div className="flex items-center mb-6">
                <div className="relative">
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-${testimonial.accentColor}-500 border-2 border-white`}></div>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-gray-900">
                    {testimonial.name}
                  </h3>
                </div>
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
};

export default Testimonials; 