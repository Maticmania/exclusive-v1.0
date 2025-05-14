"use client";
import { useSpring, animated } from "react-spring";
import { useState, useEffect } from "react";
import { insight } from "@/lib/db";

const Insight = () => {
  const Number = ({ n }) => {
    const [isClient, setIsClient] = useState(false);

    // To avoid hydration errors, set a flag after the component mounts
    useEffect(() => {
      setIsClient(true);
    }, []);

    const { number } = useSpring({
      from: { number: 1000 },
      number: isClient ? n : 0, // Ensure animation runs only on the client
      delay: 100,
      config: {
        mass: 1,
        tension: 15,
        friction: 20,
      },
    });

    // Format the number to show in "k" format (e.g., 20500 => 20.5k, 33000 => 33k)
    return (
      <animated.span>
        {number.to((n) =>
          n >= 1000
            ? (n / 1000) % 1 === 0 // If the decimal part is zero
              ? (n / 1000).toFixed(0) + "k" // No decimal, show as "33k"
              : (n / 1000).toFixed(1) + "k" // Keep one decimal, e.g. "20.5k"
            : n // If less than 1000, show the number as is
        )}
      </animated.span>
    );
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 w-full gap-8 lg:gap-4 xl:gap-8 2xl:gap-20 py-10">
      {insight.map((insight, i) => (
        <div
          className="group lg:max-w-[300px] 2xl:max-w-full h-[230px] border border-black/30 rounded flex flex-col justify-center items-center gap-2 group-hover:bg-bgsecondary transition-all duration-300 ease-in-out cursor-pointer hover:bg-hover"
          key={i}
        >
          <span className="w-[80px] h-[80px] bg-black group-hover:bg-white rounded-full ring-8 p-2 ring-[#2F2E30]/30 group-hover:ring-[#FFFFFF]/30 group-hover:text-black flex justify-center items-center">
            {insight.svg}
          </span>
          <div className="font-bold text-[32px] font-inter text-black group-hover:text-white transition-all duration-300 ease-in-out">
            <Number n={insight.number} />
          </div>
          <p className="font-poppins text-black group-hover:text-white transition-all duration-300 ease-in-out text-center">
            {insight.detail}
          </p>
        </div>
      ))}
    </div>
  );
};

export default Insight;
