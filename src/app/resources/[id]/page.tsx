import React from "react";
import Image from "next/image";
import prisma from "@/prisma/client";
import { Resource } from "@prisma/client";
import SecondaryNavbar from "#/navbar/SecondaryNav";
import Footbar from "#/footbar/Footbar";
import SidebarMap from "@/components/sidebar/SidebarMap";
import geocodeAddress from "@/components/utils/geocode-address";
import "leaflet/dist/leaflet.css";

interface ResourcePageProps {
  params: { id: string };
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

  const fullAddress = `${resource.address.street}, ${resource.address.city}, ${resource.address.state} ${resource.address.zipCode}, ${resource.address.country}`;
  const { latitude, longitude } = await geocodeAddress(fullAddress);

  return (
    <div>
      <SecondaryNavbar />
      {/* Hero Section */}
      <div className="relative h-[40vh] w-full">
        <Image
          src="/images/advo-help-banner.png"
          alt="Resource Background Image"
          layout="fill"
          objectFit="cover"
          className="objectCover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <h1 className="text-white text-5xl font-bold">{resource.name}</h1>
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
              <strong>Phone:</strong> {resource.contact.phone}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Email:</strong> {resource.contact.email}
            </p>
            <p className="text-lg text-gray-700">
              <strong>Website:</strong>{" "}
              <a
                href={resource.contact.website}
                className="text-blue-600 hover:underline"
              >
                {resource.contact.website}
              </a>
            </p>
          </section>

          {/* Address and Map */}
          <section>
            <h2 className="text-2xl font-semibold mb-2">Address</h2>
            <p className="text-lg text-gray-700 mb-4">
              {resource.address.street}, {resource.address.city},{" "}
              {resource.address.state} {resource.address.zipCode},{" "}
              {resource.address.country}
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
          <section>
            <h2 className="text-2xl font-semibold mb-2">Operating Hours</h2>
            <ul className="list-disc list-inside text-lg text-gray-700">
              {Object.entries(resource.operatingHours).map(([day, hours]) => (
                <li key={day}>
                  <strong>{day}:</strong> {hours}
                </li>
              ))}
            </ul>
          </section>

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
          {resource.additionalInfo && (
            <section>
              <h2 className="text-2xl font-semibold mb-2">
                Additional Information
              </h2>
              <p className="text-lg text-gray-700">{resource.additionalInfo}</p>
            </section>
          )}
        </div>
      </div>
      <Footbar />
    </div>
  );
};

export default ResourcePage;
