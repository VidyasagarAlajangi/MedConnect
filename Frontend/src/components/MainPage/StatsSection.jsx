export default function StatsSection() {
  const stats = [
    { number: "1000+", label: "Patients Served" },
    { number: "500+", label: "Expert Doctors" },
    { number: "24/7", label: "Support Available" },
    { number: "98%", label: "Satisfaction Rate" },
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-[#4a90e2] to-[#357abd] text-white">
      <div className="container mx-auto px-4">
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
}
