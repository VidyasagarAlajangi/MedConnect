import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import Features from "./Features";
import Testimonials from "./Testimonials";
import Stats from "./Stats";


export default function MainPage() {
  return (
    <div className="animate-fade-in">
      <main className="container mx-auto px-4 py-12">
        <HeroSection />
        <Features />
        <Testimonials />
        <Stats />
        
      </main>
    </div>
  );
}
