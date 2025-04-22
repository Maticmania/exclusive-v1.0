"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import laptop from '@/public/images/banners/hero-laptop.png';
import bag from '@/public/images/banners/hero-bag.png';
import moto from '@/public/images/banners/hero-moto.png';
import chair from '@/public/images/banners/hero-chair.png';

// Define banners with proper image imports
const banners = [
  {
    id: 1,
    title: "Huawei MateBook X Pro",
    description: "Power meets portability — perfect for work, gaming, and everything in between.",
    image: laptop,
    backgroundColor: "#1E1E2F",
    textColor: "#FFFFFF",
    buttonText: "Power Up 🔋",
    buttonLink: "/products?category=laptops",
  },
  {
    id: 2,
    title: "Executive Comfort, Reimagined",
    description: "Sit like a boss — elevate your workspace with sleek comfort.",
    image: chair,
    backgroundColor: "#FFF8E7",
    textColor: "#222222",
    buttonText: "Take a Seat 🪑", // Fixed: Moved text here
    buttonLink: "/products?category=furniture", // Fixed: Added proper link
  },
  {
    id: 3,
    title: "Style That Carries You",
    description: "Trendy, sleek, and made to move — your next go-to backpack awaits.",
    image: bag,
    backgroundColor: "#FCE4EC",
    textColor: "#880E4F",
    buttonText: "Snag the Bag 🎒",
    buttonLink: "/products?category=bags",
  },
  {
    id: 4,
    title: "Zip Through the Streets",
    description: "Slick, speedy, and fun — cruise your city in style with this urban scooter.",
    image: moto,
    backgroundColor: "#E0F7FA",
    textColor: "#006064",
    buttonText: "Let’s Ride 🛵",
    buttonLink: "/products?category=motor",
  },
];

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-rotate banners
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const currentBanner = banners[currentSlide];

  return (
    <div
      className="relative overflow-hidden rounded-lg w-full h-[450px] md:h-[350px] transition-all duration-500 ease-in-out"
      style={{ backgroundColor: currentBanner.backgroundColor }}
    >
      {/* Mobile Layout (< md:) */}
      <div className="h-full flex md:hidden flex-col justify-between px-4 py-6">
        {/* Text at Top */}
        <div className="text-center">
          <h1
            className="text-2xl font-bold mb-2 leading-tight"
            style={{ color: currentBanner.textColor }}
          >
            {currentBanner.title}
          </h1>
          <p
            className="text-sm mb-4 max-w-xs mx-auto"
            style={{ color: currentBanner.textColor }}
          >
            {currentBanner.description}
          </p>
        </div>

        {/* Image in Middle */}
        <div className="flex justify-center items-center flex-1">
          <div className="relative h-[180px] w-[180px]">
            <Image
              src={currentBanner.image}
              alt={currentBanner.title}
              fill
              className="object-contain"
              priority
              placeholder="blur"
            />
          </div>
        </div>

        {/* Button at Bottom */}
        <div className="flex justify-center">
          <Link
            href={currentBanner.buttonLink} // Removed optional chaining since all banners now have buttonLink
            className="inline-flex items-center px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-sm"
          >
            {currentBanner.buttonText}
            <ChevronRight className="ml-2 h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Desktop Layout (md: and up) */}
      <div className="hidden md:flex h-full px-6 items-center">
        <div className="w-full max-w-7xl mx-auto flex items-center justify-between gap-8">
          <div className="w-1/2">
            <h1
              className="text-4xl lg:text-5xl font-bold mb-4 transition-all duration-500 leading-tight"
              style={{ color: currentBanner.textColor }}
            >
              {currentBanner.title}
            </h1>
            <p
              className="text-lg mb-6 max-w-md transition-all duration-500"
              style={{ color: currentBanner.textColor }}
            >
              {currentBanner.description}
            </p>
            <Link
              href={currentBanner.buttonLink} // Removed optional chaining since all banners now have buttonLink
              className="inline-flex items-center px-6 py-3 rounded bg-primary text-white hover:bg-primary/90 transition-colors text-base"
            >
              {currentBanner.buttonText}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          <div className="w-1/2 flex justify-end items-center">
            <div className="relative h-[300px] w-[300px]">
              <Image
                src={currentBanner.image}
                alt={currentBanner.title}
                fill
                className="object-contain"
                priority
                placeholder="blur"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1 md:gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-1.5 md:h-2 rounded-full transition-all ${
              index === currentSlide ? "w-6 md:w-8 bg-primary" : "w-1.5 md:w-2 bg-gray-300"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}