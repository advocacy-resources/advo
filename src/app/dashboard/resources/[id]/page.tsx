import React from "react";
import prisma from "@/prisma/client";
import SidebarMap from "@/components/sidebar/SidebarMap";
import geocodeAddress from "@/components/utils/geocode-address";
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
  const resource = await prisma.resource.findUnique({
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

  return resource;
};

const ResourcePage = async ({ params }: ResourcePageProps) => {
  const resource = await fetchResource(params.id);

  if (!resource) {
    return <div>Resource not found</div>;
  }

  // Parse JSON fields
  const address: Address = resource.address as Address;
  const contact: Contact = resource.contact as Contact;
  const operatingHours: OperatingHours =
    resource.operatingHours as OperatingHours;

  // Geocode the address for map rendering
  const location = address ? await geocodeAddress(address) : null;

  return (
    <div className="flex flex-col justify-center items-left gap-4 p-8 self-center max-w-2xl">
      {/* Resource Name and Description */}
      <section>
        <h1 className="text-3xl font-bold mb-4">{resource.name}</h1>
        <p>{resource.description || "No description available."}</p>
      </section>

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
          <p className="text-lg text-red-500">Operating hours not available.</p>
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

      {/* Other Details */}
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
  );
};

export default ResourcePage;
