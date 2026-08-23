"use client";

import React, { useState, useEffect, useCallback } from "react";
import { teamData } from "@/lib/db";
import TeamCard from "./TeamCard";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

const TeamCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (isMobile) {
      setVisibleCount(1);
    } else if (window.innerWidth < 1024) {
      setVisibleCount(2);
    } else {
      setVisibleCount(3);
    }
    
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMobile]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prevIndex) => 
      prevIndex === teamData.length - visibleCount ? 0 : prevIndex + 1
    );
  }, [visibleCount]);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? teamData.length - visibleCount : prevIndex - 1
    );
  };

  const goToSlide = (index) => {
    if (index > teamData.length - visibleCount) {
      setCurrentIndex(teamData.length - visibleCount);
    } else {
      setCurrentIndex(index);
    }
  };
  
  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [nextSlide]);

  const getVisibleMembers = () => {
    const visibleMembers = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % teamData.length;
      visibleMembers.push(teamData[index]);
    }
    return visibleMembers;
  };

  return (
    <div >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold">Our Team</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={prevSlide}
            className="rounded-full"
            aria-label="Previous slide"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={nextSlide}
            className="rounded-full"
            aria-label="Next slide"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out gap-6"
          style={{ 
            transform: `translateX(0)`,
            width: `100%`
          }}
        >
          {getVisibleMembers().map((member) => (
            <div key={member.id} className="flex-shrink-0" style={{ width: `calc(${100 / visibleCount}% - ${(visibleCount - 1) * 1.5}rem / ${visibleCount})` }}>
              <TeamCard
                name={member.name}
                title={member.title}
                image={member.image}
                twitter={member.twitter}
                instagram={member.instagram}
                linkedin={member.linkedin}
                isActive={true}
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center mt-8 gap-2">
        {Array.from({ length: Math.min(teamData.length - visibleCount + 1, teamData.length) }, (_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`w-2.5 h-2.5 rounded-full transition-colors ${
              i === currentIndex ? "bg-primary" : "bg-gray-300"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default TeamCarousel;
