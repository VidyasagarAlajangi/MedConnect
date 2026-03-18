import { Stethoscope, Heart, Activity, ArrowRight, Shield, Clock, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import DoctorDetailsPage from "./DoctorDetails";


const Particle = ({ style }) => (
  <div
    className="absolute rounded-full bg-blue-400 opacity-20 pointer-events-none"
    style={style}
  />
);


const Counter = ({ target, suffix = "" }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};


const HeroSection = () => {
  const navigate = useNavigate();
  const isLoggedIn = false;
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, []);

  
  const px = (mousePos.x / window.innerWidth - 0.5) * 18;
  const py = (mousePos.y / window.innerHeight - 0.5) * 12;

  const particles = [
    { width: 8, height: 8, top: "12%", left: "8%", animationDelay: "0s", animationDuration: "7s" },
    { width: 5, height: 5, top: "28%", left: "92%", animationDelay: "1.2s", animationDuration: "9s" },
    { width: 10, height: 10, top: "72%", left: "5%", animationDelay: "0.5s", animationDuration: "8s" },
    { width: 6, height: 6, top: "85%", left: "88%", animationDelay: "2s", animationDuration: "6s" },
    { width: 4, height: 4, top: "45%", left: "96%", animationDelay: "3s", animationDuration: "10s" },
    { width: 7, height: 7, top: "60%", left: "2%", animationDelay: "1.8s", animationDuration: "7.5s" },
  ];

  return (
    <section className="relative pt-10 pb-16 lg:pt-16 flex overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">

      
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
        }}
      />

      
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)", transform: "translate(20%, -20%)" }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.06) 0%, transparent 70%)", transform: "translate(-20%, 20%)" }} />

      
      {particles.map((p, i) => (
        <Particle key={i} style={{ ...p, animation: `floatDot ${p.animationDuration} ${p.animationDelay} ease-in-out infinite` }} />
      ))}

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-2 items-center">

          
          <div className="space-y-8" style={{ animation: "fadeSlideUp 0.8s ease both" }}>

            
            <div className="inline-flex items-center gap-2.5 bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm"
              style={{ animation: "fadeSlideUp 0.6s 0.1s ease both" }}>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
              <span className="text-sm font-medium text-blue-700">500+ verified doctors online now</span>
            </div>

            
            <div style={{ animation: "fadeSlideUp 0.7s 0.2s ease both", opacity: 0, animationFillMode: "forwards" }}>
              <h1 className="font-bold text-gray-900 leading-[1.05] tracking-tight">
                <span className="block text-5xl sm:text-6xl lg:text-7xl">Your Health,</span>
                <span className="block text-5xl sm:text-6xl lg:text-7xl relative">
                  <span className="relative inline-block">
                    Our&nbsp;
                    <span className="relative">
                      Priority
                      
                      <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 200 8" fill="none" preserveAspectRatio="none">
                        <path d="M0 6 Q50 1 100 5 Q150 9 200 4" stroke="#2563EB" strokeWidth="3" strokeLinecap="round" fill="none"
                          style={{ strokeDasharray: 220, strokeDashoffset: 220, animation: "drawLine 0.9s 0.9s ease forwards" }} />
                      </svg>
                    </span>
                  </span>
                </span>
              </h1>
            </div>

            <p className="text-lg text-gray-500 leading-relaxed max-w-md font-light"
              style={{ animation: "fadeSlideUp 0.7s 0.35s ease both", opacity: 0, animationFillMode: "forwards" }}>
              Connect with trusted healthcare professionals and manage your
              health journey — from first consultation to full recovery.
            </p>

            
            <div className="flex flex-wrap gap-4"
              style={{ animation: "fadeSlideUp 0.7s 0.5s ease both", opacity: 0, animationFillMode: "forwards" }}>
              <button
                onClick={() => navigate("/find-doctor")}
                className="group relative inline-flex items-center gap-2.5 px-8 py-4 bg-[#4a90e2] text-white rounded-2xl font-semibold text-base overflow-hidden transition-all duration-300 hover:shadow-[0_8px_30px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 active:scale-95"
              >
                <span className="relative z-10">Find a Doctor</span>
                <ArrowRight className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                
                <span className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              </button>

              <button
                onClick={() => navigate("/chatbot")}
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-2xl font-semibold text-base transition-all duration-300 hover:border-violet-300 hover:shadow-[0_4px_20px_rgba(124,58,237,0.15)] hover:-translate-y-0.5 active:scale-95"
              >
                
                <span className="w-7 h-7 rounded-lg bg-blue-400 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
                    <circle cx="9" cy="13" r="1" fill="white" stroke="none" />
                    <circle cx="15" cy="13" r="1" fill="white" stroke="none" />
                  </svg>
                </span>
                <span>AI Health Chat</span>
              </button>
            </div>


            
            <div className="flex flex-wrap items-center gap-6 pt-2"
              style={{ animation: "fadeSlideUp 0.7s 0.65s ease both", opacity: 0, animationFillMode: "forwards" }}>

              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2.5">
                  {["#2563EB", "#7C3AED", "#16A34A", "#DC2626"].map((bg, i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-semibold"
                      style={{ background: bg }}>
                      {["J", "S", "M", "A"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5 mb-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium">10,000+ happy patients</p>
                </div>
              </div>

              <div className="w-px h-10 bg-gray-200 hidden sm:block" />

              
              <div className="flex gap-4">
                {[
                  { icon: Shield, label: "HIPAA Secure" },
                  { icon: Clock, label: "24/7 Support" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-1.5 text-gray-500">
                    <Icon className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          
          <div className="relative hidden md:flex items-center justify-center h-[520px]"
            style={{ animation: "fadeIn 1s 0.4s ease both", opacity: 0, animationFillMode: "forwards" }}>

            
            <div
              className="absolute w-[380px] h-[380px] rounded-full bg-blue-100 transition-transform duration-75 ease-out pointer-events-none"
              style={{ transform: `translate(${px}px, ${py}px)`, opacity: 0.55 }}
            />
            <div
              className="absolute w-[280px] h-[280px] rounded-full bg-blue-200 transition-transform duration-100 ease-out pointer-events-none"
              style={{ transform: `translate(${px * 0.6}px, ${py * 0.6}px)`, opacity: 0.35 }}
            />

            
            <div className="relative z-10 flex flex-col items-center"
              style={{ animation: "floatCenter 5s ease-in-out infinite" }}>
              <div className="w-28 h-28 bg-white rounded-3xl shadow-[0_20px_60px_rgba(37,99,235,0.18)] flex items-center justify-center border border-blue-100">
                <Stethoscope className="w-14 h-14 text-blue-600" />
              </div>
              
              <div className="mt-4 bg-white border border-blue-100 rounded-2xl px-5 py-2.5 shadow-md text-center">
                <span className="text-xl font-bold bg-blue-600  bg-clip-text text-transparent tracking-tight">
                  Health+
                </span>
                <div className="flex justify-center mt-1">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" style={{ animation: "heartbeat 1.4s ease-in-out infinite" }} />
                </div>
              </div>
            </div>

            
            <div className="absolute z-10 pointer-events-none"
              style={{ animation: "orbitLeft 10s linear infinite" }}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-purple-100 flex items-center justify-center"
                style={{ animation: "counterSpin 10s linear infinite" }}>
                <Heart className="w-8 h-8 text-purple-500 fill-purple-100" />
              </div>
            </div>

            
            <div className="absolute z-10 pointer-events-none"
              style={{ animation: "orbitRight 12s linear infinite" }}>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-blue-100 flex items-center justify-center"
                style={{ animation: "counterSpinRight 12s linear infinite" }}>
                <Activity className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            
            <div className="absolute top-8 right-0 z-20 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-gray-100 p-4 w-52"
              style={{ animation: "floatCard1 7s 0.5s ease-in-out infinite" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  <span className="text-base">📅</span>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Next Appointment</p>
                  <p className="text-sm font-semibold text-gray-800">Today, 3:00 PM</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 rounded-xl px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <span className="text-xs font-medium text-blue-700">Dr. Patel · Cardiology</span>
              </div>
            </div>

            
            <div className="absolute bottom-10 left-0 z-20 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.10)] border border-gray-100 p-4 w-48"
              style={{ animation: "floatCard2 8s 1s ease-in-out infinite" }}>
              <p className="text-xs text-gray-400 font-medium mb-2">Health Score</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-gray-900 leading-none">92</span>
                <span className="text-sm text-green-500 font-semibold mb-0.5">↑ 4%</span>
              </div>
              
              <div className="flex items-end gap-1 mt-3 h-8">
                {[60, 75, 55, 85, 70, 90, 92].map((h, i) => (
                  <div key={i} className="flex-1 rounded-sm"
                    style={{
                      height: `${h}%`,
                      background: i === 6 ? "#2563EB" : "#DBEAFE",
                      transition: "height 0.3s"
                    }} />
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Last 7 days</p>
            </div>

            
            <div className="absolute top-1/2 -right-4 z-20 transform -translate-y-1/2 bg-white rounded-2xl shadow-lg border border-gray-100 px-3 py-2.5 flex items-center gap-2"
              style={{ animation: "floatCard1 6s 2s ease-in-out infinite" }}>
              <Shield className="w-4 h-4 text-green-500" />
              <span className="text-xs font-semibold text-gray-700">Verified & Secure</span>
            </div>
          </div>
        </div>

        

      </div>

      
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes floatDot {
          0%, 100% { transform: translateY(0px) scale(1);    opacity: 0.18; }
          50%       { transform: translateY(-20px) scale(1.3); opacity: 0.28; }
        }
        @keyframes floatCenter {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-14px); }
        }
        @keyframes floatCard1 {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-10px) rotate(0deg); }
        }
        @keyframes floatCard2 {
          0%, 100% { transform: translateY(0px) rotate(1deg); }
          50%       { transform: translateY(-12px) rotate(0deg); }
        }
        @keyframes heartbeat {
          0%, 100% { transform: scale(1);    }
          14%       { transform: scale(1.25); }
          28%       { transform: scale(1);    }
          42%       { transform: scale(1.18); }
          56%       { transform: scale(1);    }
        }
        @keyframes drawLine {
          to { stroke-dashoffset: 0; }
        }
        @keyframes orbitLeft {
          0%   { transform: rotate(0deg)   translateX(170px) rotate(0deg);   }
          100% { transform: rotate(360deg) translateX(170px) rotate(-360deg); }
        }
        @keyframes orbitRight {
          0%   { transform: rotate(180deg) translateX(160px) rotate(-180deg); }
          100% { transform: rotate(540deg) translateX(160px) rotate(-540deg); }
        }
        @keyframes counterSpin {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(-360deg); }
        }
        @keyframes counterSpinRight {
          from { transform: rotate(0deg);    }
          to   { transform: rotate(-360deg); }
        }
      `}</style>
    </section>
  );
};

export default HeroSection;