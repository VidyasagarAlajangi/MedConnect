import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Users, UserCheck, CalendarCheck, ThumbsUp } from 'lucide-react';

const Stats = () => {
  const stats = [
    {
      icon: <Users className="stat-icon" />,
      number: '500+',
      label: 'Doctors'
    },
    {
      icon: <UserCheck className="stat-icon" />,
      number: '10,000+',
      label: 'Patients'
    },
    {
      icon: <CalendarCheck className="stat-icon" />,
      number: '50,000+',
      label: 'Appointments'
    },
    {
      icon: <ThumbsUp className="stat-icon" />,
      number: '98%',
      label: 'Satisfaction'
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Our Impact</h2>
          <p className="text-lg opacity-90">Making healthcare accessible to everyone</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="transform hover:scale-105 transition-transform duration-300"
            >
              <div className="text-3xl font-bold mb-2">{stat.number}</div>
              <div className="text-sm opacity-90">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats; 