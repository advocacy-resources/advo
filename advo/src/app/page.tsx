import Footbar from "@/components/Footbar";
import Navbar from "@/components/Navbar";
import Search from "@/components/MainSearch";
import Modal from "@/components/Modal";


export default function Home() {
  return (
    <main className="mt-8">
      <Navbar />
      <Search />
      <Footbar />
      <Modal />

    </main >
  );
}
