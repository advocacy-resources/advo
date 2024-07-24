import Footbar from "@/components/Footbar";
import Navbar from "@/components/Navbar";
import Search from "@/components/MainSearch";


export default function Home() {
  return (
    <main className="">
      <Navbar />
      <Search />
      <Footbar />
    </main >
  );
}
