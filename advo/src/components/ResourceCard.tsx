import React from "react";
import { Resource } from "../interfaces/resource";
import Link from "next/link";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Link href={`/resources/${resource.id}`} passHref>
      <h2 className="text-xl font-bold mb-2">{resource.name}</h2>
      <p className="text-gray-700 mb-4">{resource.description}</p>
      <div className="text-sm text-gray-500">
        <p>
          <strong>Type:</strong> {resource.type.join(", ")}
        </p>
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
          {resource.address.zipCode}, {resource.address.country}
        </p>
      </div>
    </Link>
  );
};

export default ResourceCard;
