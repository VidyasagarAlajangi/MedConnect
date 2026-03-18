import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";

import TestimonialsSection from "./TestimonialsSection";

import FeaturesGrid from "./FeaturesGrid";


export default function MainPage() {
  return (
    <div className="relative animate-fade-in">
      
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 120% 120% at 50% 40%, black 20%, transparent 100%)",
        }}
      />

      <main className="relative z-10 pb-8">

        <HeroSection />
        <div className="container mx-auto px-4 mt-16">

          <FeaturesGrid />
          <TestimonialsSection />
        </div>
      </main>
    </div>
  );
}
