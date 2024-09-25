import React from "react";
import Footer from "#/layout/footbar/Footbar";

import SidebarSectionPage from "@/components/sidebar/SidebarSectionPage";
import SecondaryNav from "@/components/layout/SecondaryNav";

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
