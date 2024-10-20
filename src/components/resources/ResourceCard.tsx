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
        <div className="text-xl font-bold mb-2">{resource.name}</div>
        <div className="text-gray-700 mb-4">{resource.description}</div>
        <div className="text-sm text-gray-500">
          <div>
            <strong>Category:</strong> {resource.category.join(", ")}
          </div>
          <div>
            <strong>Phone:</strong> {resource.contact.phone}
          </div>
          <div>
            <strong>Email:</strong> {resource.contact.email}
          </div>
          <div>
            <strong>Website:</strong>{" "}
            <Link href={resource.contact.website} className="text-blue-500">
              {resource.contact.website}
            </Link>
          </div>
          <div>
            <strong>Address:</strong> {resource.address.street},{" "}
            {resource.address.city}, {resource.address.state},{" "}
          </div>

          {/* Display Operating Hours */}
          <div className="mt-4">
            <div className="font-semibold">Operating Hours:</div>
            {Object.entries(operatingHours).map(([day, hours]) => (
              <div key={day}>
                <strong>{capitalizeFirstLetter(day)}:</strong> {hours.open} -{" "}
                {hours.close}
              </div>
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
