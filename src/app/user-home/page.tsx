"use client";
import React, { useState, useEffect } from "react";
import Carousel from "../components/carousel";

export default function Home() {
  // State for the current slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // Array of images or content for carousel slides
  const slides = [
    {
        title: "Splash $10K Survivor Revival",
        description: "Join our $10K contest!",
        entry: "$50",
        prizes: "$10,035",
        entries: "51/223",
        timeLeft: "3d 10h",
        bg: "bg-blue-600",
        image: "https://your-image-url.com/image1.png",
      },
      {
        title: "Splash $5K Survivor Revival",
        description: "Join our $5K contest!",
        entry: "$20",
        prizes: "$5,004",
        entries: "62/278",
        timeLeft: "3d 10h",
        bg: "bg-green-600",
        image: "https://your-image-url.com/image2.png",
      },
      {
      title: "Splash $10K Survivor Revival",
      description: "Join our $10K contest!",
      entry: "$50",
      prizes: "$10,035",
      entries: "51/223",
      timeLeft: "3d 10h",
      bg: "bg-blue-600",
      image: "https://your-image-url.com/image1.png",
    },

    {
      title: "Splash $10K Survivor Revival",
      description: "Join our $10K contest!",
      entry: "$50",
      prizes: "$10,035",
      entries: "51/223",
      timeLeft: "3d 10h",
      bg: "bg-blue-600",
      image: "https://your-image-url.com/image1.png",
    },
    
    
  ];

  // Auto-slide logic with useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 11000); // Change slide every 11 seconds

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [slides.length]);

  return (
    <main className="bg-gray-100">
      {/* Carousel Section */}
      <section className="relative h-64 overflow-hidden">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            } ${slide.bg}`}
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              {slide.title}
            </h2>
            <p className="text-lg text-white mb-6">{slide.description}</p>
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg shadow-md">
              Learn More
            </button>
          </div>
        ))}
        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                currentSlide === index ? "bg-white" : "bg-gray-400"
              }`}
            ></button>
          ))}
        </div>
      </section>

      {/* Rest of the Page */}
      <section id="features" className="p-10 bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">Your Top Games</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h4 className="font-bold text-xl text-black mb-2">Fantasy Leagues</h4>
            <p className="text-black">Participate in a wide range of fantasy leagues and competitions.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h4 className="font-bold text-xl text-black mb-2">Real-Time Scores</h4>
            <p className="text-black">Get up-to-date scores and stay ahead of the game.</p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow">
            <h4 className="font-bold text-xl text-black mb-2">Community</h4>
            <p className="text-black">Connect with sports fans from around the world.</p>
          </div>
        </div>
      </section>

        {/* Features Section Carousel */}
      <section id="features" className="p-10 bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">NFL Picks</h3>
        <Carousel slides={slides} />
      </section>
      <section id="features" className="p-10 bg-white">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">NBA Picks</h3>
        <Carousel slides={slides} />
      </section>
    </main>
  );
}
