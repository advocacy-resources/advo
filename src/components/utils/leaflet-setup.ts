// src/components/utils/leaflet-setup.ts

const setupLeaflet = () => {
  if (typeof window !== "undefined") {
    const L = require("leaflet");
    delete L.Icon.Default.prototype._getIconUrl;

    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    });
  }
};

export default setupLeaflet;
