import React from "react";

interface PageHeadingProps {
  title: string;
  description: string;
}

const PageHeading: React.FC<PageHeadingProps> = ({ title, description }) => {
  return (
    <div className="bg-gray-200 p-10 h-50">
      <div className="text-4xl font-bold mb-2 text-center">{title}</div>
      <div className="text-sm text-center px-40">{description}</div>
    </div>
  );
};

export default PageHeading;
