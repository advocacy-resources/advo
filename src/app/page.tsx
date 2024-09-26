import Footbar from "@/components/layout/footbar/Footbar";
import Navbar from "@/components/layout/Navbar";
import MainSearch from "@/components/search/MainSearch";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="w-full">
        <Navbar />
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center px-4 py-8 md:py-16">
        <div className="w-full max-w-lg">
          <h1 className="text-center text-3xl md:text-4xl font-bold mb-6 text-slate-800">
            Find Resources Around You
          </h1>
          <p className="text-center text-lg text-gray-600 mb-8">
            Search for social, mental, and physical health resources in your
            area.
          </p>
          <MainSearch />
        </div>
      </div>

      {/* Footbar */}
      <footer className="w-full">
        <Footbar />
      </footer>
    </main>
  );
}
