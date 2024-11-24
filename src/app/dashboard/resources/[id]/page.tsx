import React from "react";
import prisma from "@/prisma/client";
import SidebarMap from "@/components/sidebar/SidebarMap";
import geocodeAddress from "@/components/utils/geocode-address";
import Image from "next/image";
import "leaflet/dist/leaflet.css";

interface ResourcePageProps {
  params: { id: string };
}

interface Address {
  street: string;
  city: string;
  state: string;
}

interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}

interface OperatingHours {
  [key: string]: { open: string; close: string };
}

const fetchResource = async (id: string) => {
  return await prisma.resource.findUnique({
    where: { id },
    select: {
      name: true,
      description: true,
      category: true,
      contact: true,
      address: true,
      operatingHours: true,
      favoriteCount: true,
      upvoteCount: true,
      createdAt: true,
      updatedAt: true,
    },
  });
};

const VerifiedCircle = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 100 100"
    width="50"
    height="50"
  >
    <defs>
      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: "pink", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "yellow", stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#gradient)" />
    <text
      x="50"
      y="55"
      fontSize="24"
      fill="white"
      textAnchor="middle"
      dominantBaseline="middle"
      fontFamily="Arial, sans-serif"
    >
      ✔
    </text>
  </svg>
);

const ResourcePage = async ({ params }: ResourcePageProps) => {
  const resource = await fetchResource(params.id);

  if (!resource) return <div>Resource not found</div>;

  const address = resource.address as Address;
  const contact = resource.contact as Contact;
  const operatingHours = resource.operatingHours as OperatingHours;
  const location = address ? await geocodeAddress(address) : null;
  const banner = "/resourcebannerimage.png";

  return (
    <>
      {/* Banner Section */}
      <div className="relative w-full h-48">
        <Image
          src={banner}
          alt="Resource Banner"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>

      {/* Main Content Section */}
      <div className="flex flex-col gap-8 p-8 self-center max-w-2xl bg-black text-white">
        {/* Logo and Name */}
        <section className="mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16">
              <Image
                src={resource.logo || "/images/advo-logo-color.png"}
                alt={`${resource.name} logo`}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
            </div>
            <h1 className="text-3xl font-bold">{resource.name}</h1>
          </div>

          {/* Icons and Stats */}
          <div className="flex items-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <Image
                src="/thumbs-up.svg"
                alt="Thumbs Up"
                width={20}
                height={20}
                className="object-contain"
              />
              <span className="text-lg">
                {resource.averageRating || "No rating yet"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <VerifiedCircle />
              <span className="text-lg">Verified Listing</span>
            </div>
          </div>

          {/* Description */}
          <p className="mt-4 text-lg">
            {resource.description || "No description available."}
          </p>
        </section>

        <hr className="h-1 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 border-0 rounded-full" />

        {/* Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Contact Information</h2>
          {contact.phone && <p className="text-lg">Phone: {contact.phone}</p>}
          {contact.email && <p className="text-lg">Email: {contact.email}</p>}
          {contact.website && (
            <p className="text-lg">
              Website:{" "}
              <a
                href={`https://${contact.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                {contact.website}
              </a>
            </p>
          )}
          {!contact.phone && !contact.email && !contact.website && (
            <p className="text-lg text-red-500">
              Contact information not available.
            </p>
          )}
        </section>

        {/* Operating Hours */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Operating Hours</h2>
          {operatingHours ? (
            <ul>
              {Object.entries(operatingHours).map(([day, hours]) => (
                <li key={day} className="text-lg">
                  <strong>{day.charAt(0).toUpperCase() + day.slice(1)}:</strong>{" "}
                  {hours.open && hours.close
                    ? `${hours.open} - ${hours.close}`
                    : "Closed"}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-lg text-red-500">
              Operating hours not available.
            </p>
          )}
        </section>

        {/* Address and Map */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Address</h2>
          {address ? (
            <p className="text-lg mb-4">
              {address.street}, {address.city}, {address.state}
            </p>
          ) : (
            <p className="text-lg text-red-500">Address not available.</p>
          )}
          {location ? (
            <SidebarMap location={location} />
          ) : (
            <p className="text-lg text-red-500">
              Unable to display map. Location data unavailable.
            </p>
          )}
        </section>

        {/* Additional Details */}
        <section>
          <h2 className="text-2xl font-semibold mb-2">Additional Details</h2>
          <p className="text-lg">
            <strong>Category:</strong> {resource.category.join(", ")}
          </p>
          <p className="text-lg">
            <strong>Favorites:</strong> {resource.favoriteCount}
          </p>
          <p className="text-lg">
            <strong>Upvotes:</strong> {resource.upvoteCount ?? 0}
          </p>
        </section>
      </div>
    </>
  );
};

export default ResourcePage;
