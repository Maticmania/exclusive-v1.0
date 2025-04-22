"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  Gamepad,
  Headphones,
  Camera,
  Laptop,
  Watch,
  Monitor,
  Bike,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: 1,
    name: "Phones",
    icon: Smartphone,
    link: "/products?category=smartphones",
  },
  {
    id: 2,
    name: "Tablets",
    icon: Monitor,
    link: "/products?category=tablets",
  },
  {
    id: 3,
    name: "Watches",
    icon: Watch,
    link: "/search?search=watches",
  },
  { id: 4, name: "Camera", icon: Camera, link: "/products?category=camera" },
  {
    id: 5,
    name: "Headphones",
    icon: Headphones,
    link: "/products?category=headphones",
  },
  {
    id: 8,
    name: "Bike",
    icon: Bike,
    link: "/search?search=bike",
  },
  { id: 6, name: "Gaming", icon: Gamepad, link: "/products?category=mobile-accessories" },
  { id: 7, name: "Laptop", icon: Laptop, link: "/products?category=laptops" },
];

export default function BrowseByCategory() {
  const scrollContainerRef = useRef(null);

  // Scroll left/right by a fixed amount (e.g., 200px)
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <section className="py-8 px-4 sm:px-[5%] md:py-12 bg-gray-50">
      <div className="container mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span
              className="h-8 w-3 bg-primary rounded"
              aria-hidden="true"
            ></span>
            <h2 className="text-2xl font-bold text-gray-800">
              Browse By Category
            </h2>
          </div>
          {categories.length > 4 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={scrollLeft}
                className="rounded-full shadow-sm hover:bg-gray-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={scrollRight}
                className="rounded-full shadow-sm hover:bg-gray-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>

        {/* Scrollable Categories */}
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 "
          style={{ scrollSnapType: "x mandatory" }}
        >
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.link}
              className="flex-shrink-0 w-[140px] md:w-[200px] md:h-[150px] snap-start mx-2 flex flex-col items-center justify-center p-4 border rounded-lg bg-white shadow-sm hover:bg-red-500 group transition-colors duration-200"
            >
              <category.icon className="h-8 w-8 mb-2 text-gray-600 transition-colors group-hover:text-white" />
              <span className="text-sm font-medium text-gray-800 transition-colors group-hover:text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
