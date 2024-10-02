import React from "react";
import { Resource } from "@/interfaces/resource"; // Adjust the import path accordingly
import Link from "next/link";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  // Destructure operatingHours for easier access
  const { operatingHours } = resource;

  return (
    <Link href={`/resources/${resource.id}`} passHref>
      <div className="cursor-pointer">
        <h2 className="text-xl font-bold mb-2">{resource.name}</h2>
        <p className="text-gray-700 mb-4">{resource.description}</p>
        <div className="text-sm text-gray-500">
          <p>
            <strong>Category:</strong> {resource.category.join(", ")}
          </p>
          <p>
            <strong>Phone:</strong> {resource.contact.phone}
          </p>
          <p>
            <strong>Email:</strong> {resource.contact.email}
          </p>
          <p>
            <strong>Website:</strong>{" "}
            <a href={resource.contact.website} className="text-blue-500">
              {resource.contact.website}
            </a>
          </p>
          <p>
            <strong>Address:</strong> {resource.address.street},{" "}
            {resource.address.city}, {resource.address.state},{" "}
          </p>

          {/* Display Operating Hours */}
          <div className="mt-4">
            <h3 className="font-semibold">Operating Hours:</h3>
            {Object.entries(operatingHours).map(([day, hours]) => (
              <p key={day}>
                <strong>{capitalizeFirstLetter(day)}:</strong> {hours.open} -{" "}
                {hours.close}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
};

// Helper function to capitalize the first letter of the day
function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export default ResourceCard;
