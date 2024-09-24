import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";

import SidebarPage from "@/components/sidebar/SidebarSectionPage";
import SecondaryNav from "@/components/navbar/SecondaryNav";

import navImage from "$/AdvoHomeHeroBanner.png";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      {/* <Navbar />
      <Search /> */}

      <SecondaryNav />
      <SidebarPage />
      <Footbar />
    </main>
  );
}
