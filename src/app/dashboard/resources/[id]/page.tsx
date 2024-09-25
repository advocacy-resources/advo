import React from "react";
import prisma from "@/prisma/client";
import { Resource } from "@prisma/client";
import Navbar from "#/layout/Navbar";
import Footbar from "#/layout/footbar/Footbar";
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
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto p-8 ">
        <div className="container min-h-screen">
          <h1 className="text-3xl font-bold mb-4">{resource.name}</h1>
          <p>{resource.description}</p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className="mx-auto p-8">
        <div className="container min-h-screen space-y-8">
          {/* Description */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Description</h2>
            <p className="text-lg text-gray-700">{resource.description}</p>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
            <p className="text-lg text-gray-700">
              <strong>Phone:</strong> {jsonContact.phone}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> {jsonContact.email}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Website:</strong>{" "}
              <a
                href={jsonContact.website}
                className="text-blue-600 hover:underline"
              >
                {jsonContact.website}
              </a>
            </p>
          </section>

          {/* Address and Map */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Address</h2>
            <p className="text-lg text-gray-700 mb-4">
              {jsonAddress.street}, {jsonAddress.city}, {jsonAddress.state}{" "}
              {jsonAddress.zipCode}, {jsonAddress.country}
            </p>
            {latitude !== 0 && longitude !== 0 ? (
              <SidebarMap lat={latitude} lon={longitude} />
            ) : (
              <p className="text-lg text-red-500">
                Unable to display map. Location data unavailable.
              </p>
            )}
          </section>

          {/* Operating Hours */}
          {/* <section>
            <h2 className="text-2xl font-semibold mb-2">Operating Hours</h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              {Object.entries(resource.operatingHours).map(([day, hours]) => (
                <li key={day}>
                  <strong>{day}:</strong> {hours}
                </li>
              ))}
            </ul>
          </section> */}

          {/* Services Provided */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Services Provided</h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              {resource.servicesProvided.map((service, index) => (
                <li key={index}>{service}</li>
              ))}
            </ul>
          </section>

          {/* Additional Information */}
          {/* {resource.additionalInfo && (
            <section>
              <h2 className="text-2xl font-semibold mb-2">
                Additional Information
              </h2>
              <p className="text-lg text-gray-700">{resource.additionalInfo}</p>
            </section>
          )} */}
        </div>
      </div>
      <Footbar />
    </div>
  );
};

export default ResourcePage;
