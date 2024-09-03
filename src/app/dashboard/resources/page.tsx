import React from "react";
import ResourcesGrid from "@/components/resources/ResourceGrid";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/footbar/Footbar";

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
