import Footbar from "@/components/layout/footbar/Footbar";
import Navbar from "@/components/layout/Navbar";

import MainSearch from "@/components/search/MainSearch";

import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      <Navbar />
      {/* Background Image */}
      <div className="absolute inset-0 -z-100">
        <Image
          alt="nav-bg-image"
          src="/AdvoHomeHeroBanner.png"
          quality={100}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="absolute inset-0">
        <MainSearch />
      </div>
      <Footbar />
    </main>
  );
}
