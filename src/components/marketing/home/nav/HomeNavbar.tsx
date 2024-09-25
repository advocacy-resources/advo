import Image from "next/image";
import Link from "next/link";

export default function HomeNavbar() {
  return (
    <nav className="flex justify-between items-center text-white p-4">
      <div className="flex items-center">
        <Link href="/" passHref>
          <Image
            src="/advo-color-white.svg"
            alt="ADVO Logo"
            width={40}
            height={40}
            className="mr-2 cursor-pointer hover:scale-105 transition-transform duration-300"
          />
        </Link>
      </div>
      <div className="flex space-x-4">
        {["INTERNSHIP", "VOLUNTEER", "DONATE"].map((item) => (
          <Link
            key={item}
            href={`#${item.toLowerCase()}`}
            className="px-3 py-2 transition duration-300 ease-in-out hover:text-[#FDF952] hover:text-glow"
          >
            {item}
          </Link>
        ))}
      </div>
    </nav>
  );
}
