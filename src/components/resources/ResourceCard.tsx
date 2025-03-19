"use client";
import Link from "next/link";
import { Rating } from "@/enums/rating.enum";
import Image from "next/image";

interface ResourceCardProps {
  id: number;
  name: string;
  description: string;
  category: string;
  type: string[];
  rating: Rating;
  favored: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({
  id,
  name,
  description,
}) => {
  const handleButtonClick = (buttonId: number) => {
    console.log(`Button ${buttonId} clicked`);
    // Add your custom logic here
  };

  return (
    <div className="min-w-auto min-w-[500px] max-w-[500px] mx-auto border border-gray-700 bg-black text-white transition-colors duration-200">
      {/* Link wrapping the top part of the card */}
      <Link href={`/resources/${id}`} className="block">
        <div className="p-4 hover:bg-gray-800 cursor-pointer">
          {/* Image and Title Row */}
          <div className="flex items-center gap-4">
            <Image
              src="/images/tulsa-center.png"
              alt="the businesses logo"
              width={100}
              height={100}
            />
            <div className="text-xl font-semibold text-white">{name}</div>
          </div>

          <div className="text-gray-300 mt-2">{description}</div>
          <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full my-4" />
        </div>
      </Link>

      {/* Approval Rating and Buttons */}
      <div className="flex justify-between items-center p-4">
        {/* Approval Rating */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-300">Approval Rating:</span>
          <span className="text-lg font-bold text-green-500">85%</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button
            className="w-10 h-10 bg-gray-700 text-white "
            onClick={() => handleButtonClick(1)}
          >
            1
          </button>
          <button
            className="w-10 h-10 bg-gray-700 text-white "
            onClick={() => handleButtonClick(2)}
          >
            2
          </button>
          <button
            className="w-10 h-10 bg-gray-700 text-white "
            onClick={() => handleButtonClick(3)}
          >
            3
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
