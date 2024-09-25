import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card"; // Ensure this path is correct
import { Separator } from "@/components/ui/separator";
import ResourceCard from "@/components/resources/ResourceCard";

const SidebarContent: React.FC = () => {
  const [resources, setResources] = useState([]);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  return (
    <div className="col-span-6 bg-white max-h-screen overflow-y-auto py-2 scrollbar-hide">
      <h1 className="text-2xl font-bold mb-4 px-4">Resources</h1>
      <div className="space-y-4">
        {resources.map((resource) => (
          <Card key={resource.id} className="w-full mb-2">
            <CardContent className="p-4">
              <ResourceCard resource={resource} />
            </CardContent>
            <Separator />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SidebarContent;
