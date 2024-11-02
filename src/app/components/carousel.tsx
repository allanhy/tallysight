"use client";
import React, { useState, useEffect } from "react";

interface Slide {
  title: string;
  description: string;
  entry: string;
  prizes: string;
  entries: string;
  timeLeft: string;
  bg: string;
  image: string;
}

interface CarouselProps {
  slides: Slide[];
}

const Carousel: React.FC<CarouselProps> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(3); // Default to 3 slides

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setSlidesToShow(1); // Show 1 slide on small screens
      } else if (window.innerWidth < 768) {
        setSlidesToShow(2); // Show 2 slides on medium screens
      } else {
        setSlidesToShow(3); // Show 3 slides on larger screens
      }
    };

    handleResize(); // Set initial value
    window.addEventListener("resize", handleResize); // Update on resize

    return () => window.removeEventListener("resize", handleResize); // Cleanup
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div
        className="flex transition-transform duration-500"
        style={{
          transform: `translateX(-${(100 / slidesToShow) * currentSlide}%)`,
          width: `${100 * (3 / slidesToShow)}%`,
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`flex-shrink-0 w-${100 / slidesToShow}% p-4`}
            style={{ width: `${100 / slidesToShow}%` }}
          >
            <div className={`p-6 rounded-lg shadow ${slide.bg}`}>
              <img src={slide.image} alt={slide.title} className="w-full h-auto mb-4" />
              <h2 className="text-xl font-bold text-black mb-2">{slide.title}</h2>
              <h2 className="text-md text-black mb-2">by TallySight</h2>
              <div className="flex justify-between text-black mb-4">
                <div>
                  <p>{slide.entries}</p>
                  <span>Entries</span>
                </div>
                <div>
                  <p>{slide.entry}</p>
                  <span>Entry</span>
                </div>
                <div>
                  <p>{slide.prizes}</p>
                  <span>Prizes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Controls */}
      <div className="absolute inset-y-0 flex justify-between items-center w-full px-2"> {/* Flexbox with centering */}
      <button 
          onClick={() => setCurrentSlide((prev) => (prev > 0 ? prev - 1 : 0))} // Prevent going below 0
          disabled={currentSlide === 0} // Disable button if at the first slide
        >
        <svg width="24" height="24" viewBox="0 5 10 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
        <button 
          onClick={() => setCurrentSlide((prev) => (prev < slides.length - slidesToShow ? prev + 1 : prev))} // Prevent going beyond last slide
          disabled={currentSlide >= slides.length - slidesToShow} // Disable button if at the last slide
        >
        <svg width="24" height="24" viewBox="5 5 24 24" fill="none">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" />
          </svg>
        </button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center mt-4 space-x-2">
        {Array.from({ length: Math.ceil(slides.length / slidesToShow) }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${currentSlide === index ? 'bg-blue-600' : 'bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
