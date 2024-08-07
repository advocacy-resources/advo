import React from "react";
import ResourcesGrid from "#/resource/ResourceGrid";
import Navbar from "#/navbar/Navbar";
import Footer from "#/footbar/Footbar";

const ResourcesPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="max-w-6xl mx-auto p-8 min-h-screen">
        <ResourcesGrid />
      </div>
      <Footer />
    </>
  );
};

export default ResourcesPage;
