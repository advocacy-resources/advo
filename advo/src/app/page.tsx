import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";

import navImage from "$/AdvoHomeHeroBanner.png";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      <Navbar />
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          alt="nav-bg-image"
          src={navImage}
          quality={100}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <Footbar />
    </main>
  );
}
