import Image from "next/image";
import HomeNavbar from "@/components/marketing/home/nav/HomeNavbar";
import MissionStatement from "@/components/marketing/home/nav/MissionStatement";

function HomeHero(): React.ReactElement {
  return (
    <div className="relative bg-[#151516] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900 to-purple-700 opacity-75"></div>
      <div className="absolute inset-0">
        <Image
          src="/AdvoHomeHeroBanner.png"
          alt="Background"
          className="mix-blend-overlay"
          priority
        />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-6">
        <HomeNavbar />
        <MissionStatement />
      </div>
    </div>
  );
}

export default HomeHero;
