import React from "react";
import Image from "next/image";

function WhyWereHere() {
  return (
    <section className="bg-[#151516] text-white py-16">
      <div className="container mx-auto px-4">
        <div className="text-6xl font-bold mb-8 text-center">
          WHY WE&apos;RE HERE
        </div>
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="mb-4">
              Marginalized communities — including queer individuals and people
              of color — often face discrimination, financial constraints, and
              transportation issues that hinder in person access to vital
              services.
            </div>
            <div>
              Stigma & discrimination, financial issues, or legal issues can all
              stand between people and the resources they need. When barriers
              prevent access to services, people can put themselves in
              harm&apos;s way trying to find the help they need.
            </div>
          </div>
          <div className="md:w-1/2 md:pl-8">
            <Image
              src="/advoWhyImage.png"
              alt="Why We're Here"
              width={560}
              height={561}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default WhyWereHere;
