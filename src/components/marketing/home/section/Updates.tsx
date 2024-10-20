import React from "react";
import Image from "next/image";

function Updates() {
  return (
    <section className="bg-[#151516] py-16 text-white">
      <div className="container mx-auto px-4">
        <div className="text-6xl font-bold mb-12 text-center">Updates</div>
        <div className="flex flex-wrap justify-center gap-8">
          <div className="w-full md:w-1/3 max-w-sm">
            <Image
              src="/internPromo.png"
              alt="Intern Hire Update"
              width={1081}
              height={1920}
              className="w-full h-auto"
            />
          </div>
          <div className="w-full md:w-1/3 max-w-sm">
            <Image
              src="/gisellePromo.png"
              alt="Giselle Promo Update"
              width={1081}
              height={1921}
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default Updates;
