"use client";

import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";
import Search from "@/components/search/MainSearch";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import CookieNotice from "@/components/utils/CookieNotice";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      <Navbar />
      <CookieNotice />
      <Search />
      <Footbar />
    </main>
  );
}
