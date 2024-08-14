import Footbar from "@/components/footbar/Footbar";
import Navbar from "@/components/navbar/Navbar";

export default function Home() {
  return (
    <main className="flex flex-col justify-between h-screen">
      <Navbar />
      <Footbar />
    </main>
  );
}
