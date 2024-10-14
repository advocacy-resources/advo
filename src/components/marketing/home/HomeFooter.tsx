import React from "react";
import Link from "next/link";

function HomeFooter() {
  return (
    <footer className="bg-[#151516] text-white py-16 font-anonymous-pro">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-2xl font-bold mb-4 font-univers">
              Subscribe
            </div>
            <div className="mb-4">
              Sign up with your email address to receive news and updates.
            </div>
            <form className="flex flex-col space-y-4">
              <input
                type="email"
                placeholder="Email Address"
                className="p-2 text-black font-anonymous-pro"
              />
              <button className="parallelogram-btn">
                <span className="inline-block transform skew-x-[18deg]">
                  Sign Up
                </span>
              </button>
            </form>
          </div>
          <div>
            <div className="text-2xl font-bold mb-4 font-univers">About Us</div>
            <div className="">
              Advocacy Resources Inc. is a 501(c)(3) nonprofit organization
            </div>
            <div>designed by eastland jones creative in new mexico</div>
            <div>©ADVOCACY RESOURCES, INC. 2024</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-4 font-univers">Connect</div>
            <div className="space-y-2">
              <div>
                <Link
                  href="https://www.instagram.com/advocacyresources/"
                  className="hover:text-advo-pink transition-colors"
                >
                  Instagram
                </Link>
              </div>
              <div>
                <Link
                  href="https://www.linkedin.com/company/advocacy-resources/posts/?feedView=all"
                  className="hover:text-advo-pink transition-colors"
                >
                  LinkedIn
                </Link>
              </div>
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-4 font-univers">
              Get Involved
            </div>
            <div className="space-y-2">
              <div>
                <Link
                  href="https://forms.monday.com/forms/0a235908c6d7db7cf0935eba463774db?r=use1"
                  className="hover:text-advo-pink transition-colors"
                >
                  Internships
                </Link>
              </div>
              <div>
                <Link
                  href="https://forms.monday.com/forms/a9cca72998975e1552c2da04de8fe465?r=use1"
                  className="hover:text-advo-pink transition-colors"
                >
                  Volunteer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default HomeFooter;
