import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";
import Search from "@/components/search/MainSearch";
import CookieNotice from "@/components/utils/CookieNotice";

import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

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
