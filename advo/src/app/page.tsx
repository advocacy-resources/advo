import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";
import Search from "@/components/search/MainSearch";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      <Navbar />
      <Search />
      <Footbar />
    </main>
  );
}
