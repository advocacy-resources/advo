import React from "react";
import Navbar from "#/navbar/Navbar";
import Footer from "#/footbar/Footbar";
import SidebarSectionPage from "@/components/sidebar/SidebarSectionPage";

const ResourcesPage: React.FC = () => {
  return (
    <>
      <Navbar />
      <div className="mx-auto p-8 min-h-screen">
        <SidebarSectionPage />
      </div>
      <Footer />
    </>
  );
};

export default ResourcesPage;
