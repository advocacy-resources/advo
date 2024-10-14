import React from "react";
import Link from "next/link";

function HowCanYouHelp() {
  return (
    <section className="bg-[#151516] text-white py-60 bg-[url('/AdvoHelpBanner.png')] bg-cover bg-center">
      <div className="container mx-auto px-4 text-center">
        <div className="text-6xl font-bold mb-8">How CAN YOU HELP?</div>
        <div className="max-w-3xl mx-auto text-xl mb-8">
          Advocacy Resources is a volunteer-led 501(c)(3) nonprofit
          organization. Every donation supports ongoing development of the
          myAdvo web app. You can also help drive our growth by volunteering or
          interning with us.
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="https://forms.monday.com/forms/a9cca72998975e1552c2da04de8fe465?r=use1">
            <button className="parallelogram-btn">
              <span className="inline-block transform skew-x-[18deg]">
                VOLUNTEER
              </span>
            </button>
          </Link>
          <Link href="https://givebutter.com/XyU7hg">
            <button className="parallelogram-btn">
              <span className="inline-block transform skew-x-[18deg]">
                DONATE
              </span>
            </button>
          </Link>
          <Link href="https://forms.monday.com/forms/0a235908c6d7db7cf0935eba463774db?r=use1">
            <button className="parallelogram-btn">
              <span className="inline-block transform skew-x-[18deg]">
                INTERN
              </span>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default HowCanYouHelp;
