"use client";

import { useForm } from "react-hook-form";
import Image from "next/image";
import phoneIcon from "@/public/icons/icons-phone.svg";
import mailIcon from "@/public/icons/icons-mail.svg";

const Page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const contact = [
    {
      phone: "+2349037725837",
      email: "info@exclusive.com",
      support: "support@exclusive.com",
      address: "123 Main St, Anytown, USA",
    },
  ];

  return (
    <div className="w-full px-[5%] grid gap-8 ">
      <div className="container mx-auto ">
        <p className="font-poppins pt-10">Home / Contact</p>
        <div className="flex flex-col md:flex-row w-full gap-5 h-full md:max-h-[457px] mb-28 py-5">
          {contact.map((contact, i) => (
            <div
              className="w-full lg:w-[30%] md:w-[40%] rounded shadow-custom-light flex flex-col gap-4 md:gap-8"
              key={i}
            >
              <div className="font-poppins grid gap-4 text-center md:text-left">
                <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                  <Image src={phoneIcon} alt="phone" />
                  <span className="font-medium font-poppins">Call To us</span>
                </div>
                <p className="text-[12px] sm:text-sm">
                  We are available 24/7, 7 days a week
                </p>
                <p className="text-[12px] sm:text-sm">Phone {contact.phone}</p>
              </div>
              <span className="bg-gray-400 w-full h-[1px]"></span>
              <div className="grid gap-4 text-center md:text-left font-poppins">
                <div className="flex items-center gap-3 w-full justify-center md:justify-start">
                  <Image src={mailIcon} alt="mail" />
                  <span className="font-medium font-poppins">Write To Us</span>
                </div>
                <p className="text-sm">
                  Fill out our form and we will contact you within 24 hours.
                </p>
                <p className="text-[12px] sm:text-sm">Email: {contact.email}</p>
                <p className="text-[12px] sm:text-sm">
                  Email: {contact.support}
                </p>
              </div>
            </div>
          ))}

          <div className="w-full md:w-[70%] shadow-custom-light p-[3%] rounded">
            <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8">
              <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
                <div className="col-span-1">
                  <input
                    type="text"
                    className="rounded bg-input font-poppins p-2 text-black text-sm outline-none w-full"
                    placeholder="Your Name *"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    className="rounded bg-input font-poppins p-2 text-black text-sm outline-none w-full"
                    placeholder="Your Email *"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                <div className="col-span-2 lg:col-span-1">
                  <input
                    type="tel"
                    className="rounded bg-input font-poppins p-2 text-black text-sm outline-none w-full"
                    placeholder="Your Phone *"
                    {...register("phone", {
                      required: "Phone number is required",
                    })}
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-xs">
                      {errors.phone.message}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <textarea
                  className="rounded w-full bg-input font-poppins p-2 text-black text-sm outline-none min-h-[207px] max-h-[207px]"
                  placeholder="Your Message *"
                  {...register("message", { required: "Message is required" })}
                />
                {errors.message && (
                  <span className="text-red-500 text-xs">
                    {errors.message.message}
                  </span>
                )}
              </div>

              <div className="flex justify-end w-full">
                <button
                  type="submit"
                  className="w-full lg:max-w-[30%] bg-textsecondary1 hover:bg-hover transition-colors duration-300 ease-in-out text-white font-medium font-poppins p-2 rounded"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
