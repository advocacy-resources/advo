import React from "react";

interface PageHeadingProps {
    title: string;
    description: string;
  }
  
  const PageHeading: React.FC<PageHeadingProps> = ({ title, description }) => {
    return (
      <div className="bg-gray-200 p-10 h-50">
        <h1 className="text-4xl font-bold mb-2 text-center">{title}</h1>
        <p className="text-sm text-center px-40">{description}</p>
      </div>
    );
  };
  
  export default PageHeading;