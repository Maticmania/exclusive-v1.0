import Image from "next/image";
import AboutImage from '@/public/images/AboutImage.svg';
import Insight from "@/components/about/Insight";
import Team from "@/components/about/Team";
import Offers from "@/components/about/Offers";

const Page = () => {

  return (
    (<div className="w-full px-[5%] grid gap-8 py-10">
      <p className="font-poppins">Home / About</p>
      <div className="Hero flex flex-col lg:flex-row w-full items-center justify-center gap-5 lg:gap-14 2xl:justify-between">
      <div className="w-full lg:w-1/2 xl:max-w-[527px] 2xl:max-w-full space-y-5 xl:space-y-8">
        <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-inter font-semibold">Our Story</h1>
        <p className="font-poppins font-normal text-sm sm:text-base">Launced in 2015, Exclusive is South Asia’s premier online shopping makterplace with an active presense in Bangladesh. Supported by wide range of tailored marketing, data and service solutions, Exclusive has 10,500 sallers and 300 brands and serves 3 millioons customers across the region.</p>
        <p className="font-poppins font-normal text-sm sm:text-base">Exclusive has more than 1 Million products to offer, growing at a very fast. Exclusive offers a diverse assotment in categories ranging from consumer.</p>
      </div>
      <div className="">
        <Image
          src={AboutImage}
          alt="About Exclusive"
          />
      </div>
      </div>
      <Insight/>
      <Team/>
      <Offers/>
    </div>)
  );
};

export default Page;
