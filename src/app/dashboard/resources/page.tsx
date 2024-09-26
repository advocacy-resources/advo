import React from "react";
import dynamic from "next/dynamic";

const SecondaryNav = dynamic(() => import("@/components/layout/SecondaryNav"), {
  ssr: false,
});
const SidebarSectionPage = dynamic(
  () => import("@/components/sidebar/SidebarSectionPage"),
  { ssr: false },
);
const Footer = dynamic(() => import("#/layout/footbar/Footbar"), {
  ssr: false,
});

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
