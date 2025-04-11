"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Resource } from "@/interfaces/resource";
import ResourceDetailsModal from "@/components/resources/ResourceDetailsModal";
import ResourceCreateModal from "@/components/resources/ResourceCreateModal";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/admin/resources?page=${page}&limit=${limit}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }

      const data = await response.json();
      setResources(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
      setError(null);
    } catch (err) {
      setError("Error loading resources. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [page, limit]);

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!resourceToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(
        `/api/v1/admin/resources/${resourceToDelete}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete resource");
      }

      // Refresh the resources list
      fetchResources();
      setResourceToDelete(null);
    } catch (err) {
      setError("Error deleting resource. Please try again.");
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleViewDetails = (resource: Resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleResourceUpdate = (updatedResource: Resource) => {
    // Update the resource in the local state
    setResources(
      resources.map((r) => (r.id === updatedResource.id ? updatedResource : r)),
    );
  };

  const handleResourceCreated = (createdResource: Resource) => {
    // Add the newly created resource to the list and refresh
    fetchResources();
  };

  const handleCancelDelete = () => {
    setResourceToDelete(null);
  };

  return (
    <div>
      {resourceToDelete && (
        <div className="bg-gray-900 border border-red-500 p-4 mb-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-2">
            Confirm Deletion
          </h3>
          <p className="text-gray-300 mb-4">
            Are you sure you want to delete this resource? This action cannot be
            undone.
          </p>
          <div className="flex space-x-3">
            <Button
              variant="destructive"
              className="bg-red-700 hover:bg-red-800 px-4 py-2 rounded-full"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Resource"}
            </Button>
            <Button
              variant="outline"
              className="bg-neutral-800 hover:bg-neutral-700 text-white border-0 px-4 py-2 rounded-full"
              onClick={handleCancelDelete}
              disabled={isDeleting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="md:flex md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
          Resources Management
        </h2>
        <Button
          className="bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add New Resource
        </Button>
      </div>

      {error && (
        <div className="bg-red-900 p-4 mb-4 text-white rounded">{error}</div>
      )}

      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    Loading...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    No resources found
                  </td>
                </tr>
              ) : (
                resources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {resource.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {resource.category.join(", ")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {new Date(resource.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0 whitespace-nowrap overflow-hidden"
                          onClick={() => handleViewDetails(resource)}
                        >
                          View Details
                        </Button>
                        <Link href={`/admin/resources/${resource.id}`}>
                          <Button
                            variant="outline"
                            className="text-xs px-3 py-1.5 bg-transparent border-gray-500 text-gray-300 hover:bg-gray-700"
                          >
                            Edit
                          </Button>
                        </Link>
                        <Button
                          variant="destructive"
                          className="text-xs px-3 py-1.5 bg-red-700 hover:bg-red-800"
                          onClick={() => handleDeleteClick(resource.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Showing <span className="font-medium">{resources.length}</span> of{" "}
            <span className="font-medium">{totalItems}</span> resources
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Resource Details Modal */}
      <ResourceDetailsModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        resource={selectedResource}
        onResourceUpdate={handleResourceUpdate}
      />
      {/* Resource Create Modal */}
      <ResourceCreateModal
        isOpen={isCreateModalOpen}
        onClose={setIsCreateModalOpen}
        onResourceCreated={handleResourceCreated}
      />
    </div>
  );
}
