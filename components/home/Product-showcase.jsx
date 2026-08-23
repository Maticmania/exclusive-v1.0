"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import jbl from "@/public/images/jbl.svg";

export default function ProductShowcase() {
  const TARGET_DATE = new Date("2025-6-1").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    function calculateTimeLeft() {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      return {
        days:
          difference > 0 ? Math.floor(difference / (1000 * 60 * 60 * 24)) : 0,
        hours:
          difference > 0 ? Math.floor((difference / (1000 * 60 * 60)) % 24) : 0,
        minutes: difference > 0 ? Math.floor((difference / 1000 / 60) % 60) : 0,
        seconds: difference > 0 ? Math.floor((difference / 1000) % 60) : 0,
      };
    }

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (Object.values(newTimeLeft).every((value) => value === 0)) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup on unmount
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-900 to-black text-white px-[5%]">
      <div className="flex items-center justify-between flex-col md:flex-row py-5 lg:py-10 container mx-auto">
        <div className="space-y-4">
          <p className="text-primary font-semibold font-poppins">Categories</p>
          <h1 className="text-4xl lg:text-5xl font-semibold font-inter leading-10">
            Enhance Your <br className="hidden lg:block" /> Music Experience
          </h1>
          <div className="flex space-x-4" aria-label="Countdown timer">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="flex flex-col items-center">
                <div className="bg-white rounded-full text-black flex flex-col justify-center items-center w-[40px] lg:w-[62px] lg:h-[62px] font-poppins">
                  <p className="text-base font-semibold">
                    {String(value).padStart(2, "0")}
                  </p>
                  <p className="text-[9px] md:text-[11px] capitalize">{unit}</p>
                </div>
              </div>
            ))}
          </div>
          <Button className="bg-primary font-poppins text-white hover:bg-button1 font-medium py-4 px-8 rounded">
            Buy Now!
          </Button>
        </div>

        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <Image
            src={jbl}
            alt="JBL Boombox Speaker"
            width={600}
            height={400}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
