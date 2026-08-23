import { offers } from "@/lib/db";
import Image from "next/legacy/image";

const Offers = () => {
  return (
    (<div className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 ">
        {offers.map((offer, i) => (
          <div 
            className="flex flex-col gap-5 justify-center items-center text-center"
            key={i}
          >
            <div className="relative w-16 h-16 sm:w-20 sm:h-20">
              <Image
                src={offer.icon}
                alt={offer.title}
                // fill
                />
            </div>
            <span className="grid gap-2">
              <p className="font-poppins text-lg sm:text-xl font-semibold">
                {offer.title}
              </p>
              <p className="text-xs sm:text-sm font-poppins max-w-xs mx-auto">
                {offer.text}
              </p>
            </span>
          </div>
        ))}
      </div>
    </div>)
  );
};

export default Offers;