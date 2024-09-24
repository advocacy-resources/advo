// src/components/utils/leaflet-setup.ts

import * as L from "leaflet";

const setupLeaflet = () => {
  if (typeof window !== "undefined") {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "/images/marker-icon-2x.png",
      iconUrl: "/images/marker-icon.png",
      shadowUrl: "/images/marker-shadow.png",
    });
  }
};

export default setupLeaflet;
