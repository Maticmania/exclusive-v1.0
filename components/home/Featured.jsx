import React from "react";
import Image from "next/image";
import ps5 from "@/public/images/ps5.svg";
import woman from "@/public/images/woman.svg";
import speaker from "@/public/images/speaker.svg";
import perfume from "@/public/images/perfume.svg";

const Featured = () => {
  return (
    <section className="py-8 space-y-6 px-[5%]">
      <div className="container mx-auto">
        <div className="flex items-center gap-2">
          <span
            className="h-8 w-3 bg-primary rounded"
            aria-hidden="true"
          ></span>
          <p className="font-poppins font-semibold text-sm sm:text-base  text-primary">
            Featured
          </p>
        </div>
        <h1 className="font-inter font-semibold text-2xl sm:text-3xl md:text-4xl">
          New Arrival
        </h1>
        <div className="grid gap-5 grid-cols-2 sm:grid-cols-2 lg:grid-cols-4  md:min-h-[600px] ">
          {/* Large Item */}
          <div className="col-span-1 min-h-[300px] sm:col-span-2 lg:row-span-2">
            <div className="relative h-full rounded bg-black overflow-hidden">
              <Image
                src={ps5}
                alt=""
                className="absolute right-0 bottom-0"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-4 text-white space-y-2 sm:space-y-4">
                <h2 className="text-xl sm:text-2xl font-semibold font-inter">
                  PlayStation 5
                </h2>
                <p className="text-xs sm:text-sm font-poppins w-2/3">
                  Black and White version of the PS5 coming out on sale.
                </p>
                <a
                  href="#"
                  className="inline-block text-white font-poppins font-medium underline"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>

          {/* Small Item 1 */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 min-h-[200px] ">
            <div className="relative h-full bg-black rounded overflow-hidden">
              <Image
                src={woman}
                alt=""
                className="absolute right-0 bottom-0"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-4 text-white space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold font-inter">
                  Women&apos;s Collections
                </h2>
                <p className="text-xs sm:text-sm font-poppins w-4/5">
                  Featured collections that give you another vibe.
                </p>
                <a
                  href="#"
                  className="inline-block text-white font-poppins font-medium underline"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>

          {/* Small Item 2 */}
          <div className="col-span-1 min-h-[200px]">
            <div className="relative h-full bg-black rounded overflow-hidden">
              <Image
                src={speaker}
                alt=""

                className="absolute right-0 bottom-0"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-4 text-white space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold font-inter">
                  Speakers
                </h2>
                <p className="text-xs sm:text-sm font-poppins">
                  Amazon wireless speakers.
                </p>
                <a
                  href="#"
                  className="inline-block text-white font-poppins font-medium underline"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>

          {/* Small Item 3 */}
          <div className="col-span-1 min-h-[200px]">
            <div className="relative h-full bg-black rounded overflow-hidden">
              <Image
                src={perfume}
                alt=""
                className="absolute right-0 bottom-0"
                aria-hidden="true"
              />
              <div className="absolute bottom-4 left-4 text-white space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold font-inter">
                  Perfume
                </h2>
                <p className="text-xs sm:text-sm font-poppins">
                  GUCCI INTENSE OUD EDP
                </p>
                <a
                  href="#"
                  className="inline-block text-white font-poppins font-medium underline"
                >
                  Shop Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Featured;
