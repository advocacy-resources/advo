import React from "react";
import Image from "next/image";

interface AboutUsRow {
  imageSrc: string;
  title: string;
  description: string;
  reverse?: boolean;
}

const AboutUsRow: React.FC<AboutUsRow> = ({
  imageSrc,
  title,
  description,
  reverse = false,
}) => {
  return (
    <div
      className={`flex flex-col md:flex-row ${reverse ? "md:flex-row-reverse" : ""} items-center my-8 mx-10`}
    >
      <div className="md:w-1/3 w-full">
        <Image
          src={imageSrc}
          alt={title}
          width={800} // Adjust based on your actual image width
          height={600} // Adjust based on your actual image height
          className="w-full h-auto rounded-md"
        />
      </div>
      <div className="md:w-2/3 w-full p-4">
        <div className="text-xl font-bold mb-2">{title}</div>
        <div>{description}</div>
      </div>
    </div>
  );
};

export default AboutUsRow;
