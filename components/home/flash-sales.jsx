"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "@/components/products/product-card";

export default function FlashSales({ products = [] }) {
  const [countdown, setCountdown] = useState({ days: 3, hours: 23, minutes: 59, seconds: 59 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  // Update countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        }
        return { days: 3, hours: 23, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      if (carouselRef.current) {
        const itemWidth = carouselRef.current.children[0]?.offsetWidth || 0;
        carouselRef.current.scrollBy({ left: -itemWidth * 2, behavior: "smooth" });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < products.length - 1) {
      setCurrentIndex(currentIndex + 1);
      if (carouselRef.current) {
        const itemWidth = carouselRef.current.children[0]?.offsetWidth || 0;
        carouselRef.current.scrollBy({ left: itemWidth * 2, behavior: "smooth" });
      }
    }
  };

  // Calculate visible items for desktop grid
  const getVisibleItems = () => {
    if (typeof window !== "undefined") {
      if (window.innerWidth >= 1280) return 6; // xl
      if (window.innerWidth >= 1024) return 4; // lg
      if (window.innerWidth >= 768) return 3; // md
      return 2; // sm and below (not used for mobile scroll)
    }
    return 4; // Default for SSR
  };

  const visibleItems = getVisibleItems();
  const maxStartIndex = Math.max(0, products.length - visibleItems);
  const startIndex = Math.min(currentIndex, maxStartIndex);
  const visibleProducts = products.slice(startIndex, startIndex + visibleItems);

  return (
    <section className="py-8 px-[5%]">
      <div className="container mx-auto md:pb-12  border-b border-gray-300 ">
      <div className="flex items-center gap-2 text-primary">
      <span className="h-8 w-4 bg-primary rounded" aria-hidden="true"></span>
      <p className="font-poppins font-semibold text-sm sm:text-base  text-bgsecondary">Today's</p>
      </div>
              <div className="flex items-left justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">Flash Sales</h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Desktop Countdown */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Days</span>
                <span className="bg-gray-900 text-white px-2 py-1 rounded min-w-[40px] text-center">
                  {countdown.days.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Hours</span>
                <span className="bg-gray-900 text-white px-2 py-1 rounded min-w-[40px] text-center">
                  {countdown.hours.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Minutes</span>
                <span className="bg-gray-900 text-white px-2 py-1 rounded min-w-[40px] text-center">
                  {countdown.minutes.toString().padStart(2, "0")}
                </span>
              </div>
              <span className="text-xl font-bold">:</span>
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500">Seconds</span>
                <span className="bg-gray-900 text-white px-2 py-1 rounded min-w-[40px] text-center">
                  {countdown.seconds.toString().padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* Mobile Countdown */}
            <div className="flex md:hidden items-center gap-2 text-sm">
              <span className="bg-gray-900 text-white px-1.5 py-1 rounded">
                {countdown.days.toString().padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-gray-900 text-white px-1.5 py-1 rounded">
                {countdown.hours.toString().padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-gray-900 text-white px-1.5 py-1 rounded">
                {countdown.minutes.toString().padStart(2, "0")}
              </span>
              <span>:</span>
              <span className="bg-gray-900 text-white px-1.5 py-1 rounded">
                {countdown.seconds.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Navigation Buttons (Visible on all sizes) */}
            <div className="md:flex items-center gap-2 hidden">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                aria-label="Previous products"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNext}
                disabled={currentIndex >= maxStartIndex}
                className="p-2 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-white"
                aria-label="Next products"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Scrollable Carousel (< md:) */}
        <div
          ref={carouselRef}
          className="md:hidden flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-4 pb-4"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 w-[45%] sm:w-[30%] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Desktop Grid Layout (md: and up) */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mt-8">
          {visibleProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="/products"
            className="px-6 py-2 border border-gray-300 rounded-md bg-primary text-white transition-colors text-sm font-medium "
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}