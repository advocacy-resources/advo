import Footbar from "@/components/layout/footbar/Footbar";
import Navbar from "@/components/layout/Navbar";
import navImage from "$/AdvoHomeHeroBanner.png";
import Image from "next/image";
import HomeHero from "@/components/marketing/home/nav/HomeHero";
import WhyWereHere from "@/components/marketing/home/section/WhyWereHere";
import OurSolution from "@/components/marketing/home/section/OurSolution";
import HowCanYouHelp from "@/components/marketing/home/section/HowYouCanHelp";
import Updates from "@/components/marketing/home/section/Updates";
import HomeFooter from "@/components/marketing/home/HomeFooter";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      {/* <Navbar />
      {/* Background Image */}
      <div className="absolute inset-0">
        {/* <Image
          alt="nav-bg-image"
          src={navImage}
          quality={100}
          layout="fill"
          objectFit="cover"
        /> */}
        {/* </div> */}
        {/* <Footbar /> */}
        <HomeHero />
        <WhyWereHere />
        <OurSolution />
        <HowCanYouHelp />
        <Updates />
        <HomeFooter />
      </div>
    </main>
  );
}
