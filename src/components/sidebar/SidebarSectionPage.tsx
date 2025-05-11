import dynamic from "next/dynamic";
import SidebarFilters from "../sidebar/SidebarFilters";
import SidebarContent from "../sidebar/SidebarContent";
import "leaflet/dist/leaflet.css";

const SidebarMap = dynamic(() => import("../sidebar/SidebarMap"), {
  ssr: false,
});

export default function SidebarSectionPage() {
  return (
    <div className="grid grid-cols-12 gap-4 min-h-screen">
      {/* Sidebar Section */}
      <div className="col-span-2 bg-gray-200">
        <div className="sidebar">
          <SidebarFilters />
        </div>
      </div>

      {/* Main Content Section */}
      <div className="col-span-4 bg-white scrollbar-hide">
        <div className="content">
          <SidebarContent />
        </div>
      </div>

      {/* Map Section */}
      <div className="col-span-6 bg-gray-200">
        <div className="map">
          <SidebarMap />
        </div>
      </div>
    </div>
  );
}
