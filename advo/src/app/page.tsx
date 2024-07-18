import Image from "next/image";
import Navbar from "../components/Navbar";
import Search from "../components/MainSearch";

export default function Home() {
  return (
    <main className="">
      <Navbar />
      <Search />
      <h1>Hello World!</h1>
    </main>
  );
}
