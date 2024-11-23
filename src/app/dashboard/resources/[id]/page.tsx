import React from "react";
import Link from "next/link";
import prisma from "@/prisma/client";
import { Resource } from "@prisma/client";
import SidebarMap from "@/components/sidebar/SidebarMap";
import geocodeAddress from "@/components/utils/geocode-address";
import "leaflet/dist/leaflet.css";

interface ResourcePageProps {
  params: { id: string };
}

interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface IContact {
  phone: string;
  email: string;
  website: string;
}

const fetchResource = async (id: string): Promise<Resource | null> => {
  const resource = await prisma.resource.findUnique({
    where: { id },
  });
  return resource;
};

const ResourcePage = async ({ params }: ResourcePageProps) => {
  const resource = await fetchResource(params.id);

  if (!resource) {
    return <div>Resource not found</div>;
  }

  const jsonAddress: IAddress = resource?.address as unknown as IAddress;
  const jsonContact: IContact = resource?.contact as unknown as IContact;
  let fullAddress = "";

  if (jsonAddress)
    fullAddress = `${jsonAddress.street}, ${jsonAddress.city}, ${jsonAddress.state} ${jsonAddress.zipCode}, ${jsonAddress.country}`;

  const { latitude, longitude } = await geocodeAddress(fullAddress);

  return (
    <div className="flex flex-col justify-center items-left gap-4 p-8 self-center max-w-2xl">
      <section>
        <div className="text-3xl  font-bold mb-4">{resource.name}</div>
        <div>{resource.description}</div>
      </section>

      {/* Main Content Section */}
      {/* Contact Information */}
      <section>
        <div className="text-2xl  font-semibold mb-2">Contact Information</div>
        <div className="text-lg ">
          <strong>Phone:</strong> {jsonContact.phone}
        </div>
        <div className="text-lg ">
          <strong>Email:</strong> {jsonContact.email}
        </div>
        <div className="text-lg ">
          <strong>Website:</strong>{" "}
          <Link
            href={jsonContact.website}
            className="text-blue-600 hover:underline"
          >
            {jsonContact.website}
          </Link>
        </div>
      </section>

      {/* Address and Map */}
      <section>
        <div className="text-2xl  font-semibold mb-2">Address</div>
        <div className="text-lg  mb-4">
          {jsonAddress.street}, {jsonAddress.city}, {jsonAddress.state}{" "}
          {jsonAddress.zipCode}, {jsonAddress.country}
        </div>
        {latitude !== 0 && longitude !== 0 ? (
          <SidebarMap lat={latitude} lon={longitude} />
        ) : (
          <div className="text-lg text-red-500">
            Unable to display map. Location data unavailable.
          </div>
        )}
      </section>
    </div>
  );
};

export default ResourcePage;
