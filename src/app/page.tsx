"use client";

import Image from "next/image";

import MainSearch from "@/components/search/MainSearch";

export default function Home() {
  return (
    <div className="relative flex grow items-center justify-center h-full p-2 md:py-16">
      {/* Logo */}
      {/* <div className="absolute md:relative h-[122%] w-full z-1 md:w-1/2 -z-10">
        <Image
          src="/AdvoHomeHeroBanner.png"
          alt="Sign In Image"
          layout="fill"
          objectFit="cover"
        />
      </div> */}
      <div className="flex flex-col grow gap-4 w-full max-w-lg bg-white rounded-xl shadow-md px-4 py-8">
        <h1 className="text-center text-3xl md:text-4xl font-bold text-slate-800">
          Find Resources Around You
        </h1>
        <MainSearch />
      </div>
    </div>
  );
}
