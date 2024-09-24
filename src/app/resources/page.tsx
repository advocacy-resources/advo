import React from "react";
import Footer from "#/footbar/Footbar";

import SidebarSectionPage from "@/components/sidebar/SidebarSectionPage";
import SecondaryNav from "@/components/navbar/SecondaryNav";

const ResourcesPage: React.FC = () => {
  return (
    <>
      <SecondaryNav />
      <SidebarSectionPage />
      <Footer />
    </>
  );
};

export default ResourcesPage;
