import Image from "next/image";

import MainSearch from "@/components/search/MainSearch";

export default function Home() {
  return (
    <div className="relative flex grow items-center justify-center h-full p-2 md:py-16">
      <div className="flex flex-col grow gap-4 w-full max-w-lg bg-white rounded-xl shadow-md px-4 py-8">
        <div className="text-center text-3xl md:text-4xl font-bold text-slate-800">
          Find Resources Around You
        </div>
        <MainSearch />
      </div>
    </div>
  );
}
