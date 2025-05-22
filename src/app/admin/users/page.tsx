// File: src/app/admin/users/page.tsx
// Purpose: Admin interface for managing users with role assignment and profile management.
// Owner: Advo Team

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IUser } from "@/interfaces/user";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import UserCreateModal from "@/components/users/UserCreateModal";

/**
 * Admin page for managing users with role assignment and profile management.
 * Provides a tabular view of all users with options to edit roles, assign resources to business reps,
 * and view detailed user information.
 * @returns React component with the users management UI
 */
export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [editedUsers, setEditedUsers] = useState<
    Record<string, { role: string; managedResourceId?: string }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [savingUsers, setSavingUsers] = useState<Record<string, boolean>>({});
  const [resources, setResources] = useState<any[]>([]);
  const [loadingResources, setLoadingResources] = useState(false);
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchResources();
  }, [page]);

  /**
   * Fetches paginated users from the API.
   * Updates state with users data and pagination information.
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/v1/admin/users?page=${page}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data);
      setTotalPages(data.pagination.totalPages);
      setTotalItems(data.pagination.total);
      setError(null);
    } catch (err) {
      setError("Error loading users. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches all resources from the API.
   * Used for assigning resources to business representatives.
   */
  const fetchResources = async () => {
    try {
      setLoadingResources(true);
      const response = await fetch("/api/v1/resources");
      if (!response.ok) {
        throw new Error("Failed to fetch resources");
      }
      const data = await response.json();
      setResources(data);
    } catch (err) {
      console.error("Error fetching resources:", err);
    } finally {
      setLoadingResources(false);
    }
  };

  /**
   * Handles changing a user's role in the UI.
   * For business_rep role, also manages the associated resource.
   * @param userId - ID of the user being modified
   * @param newRole - New role to assign to the user
   * @param managedResourceId - Optional resource ID for business representatives
   */
  const handleRoleChange = (
    userId: string,
    newRole: string,
    managedResourceId?: string,
  ) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {
        role: newRole,
        managedResourceId:
          newRole === "business_rep" ? managedResourceId || "" : undefined,
      },
    }));

    // If changing to business_rep and resources haven't been loaded yet, fetch them
    if (newRole === "business_rep" && resources.length === 0) {
      fetchResources();
    }
  };

  /**
   * Updates the managed resource for a business representative user.
   * @param userId - ID of the business rep user
   * @param resourceId - ID of the resource to assign
   */
  const handleManagedResourceChange = (userId: string, resourceId: string) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        managedResourceId: resourceId,
      },
    }));
  };

  /**
   * Saves the updated role and managed resource to the API.
   * Updates the local state upon successful API response.
   * @param userId - ID of the user being updated
   */
  const handleSaveRole = async (userId: string) => {
    try {
      setSavingUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));

      const { role, managedResourceId } = editedUsers[userId];
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role,
          managedResourceId:
            role === "business_rep" ? managedResourceId : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update the local users list
      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                role,
                managedResourceId:
                  role === "business_rep" ? managedResourceId : undefined,
              }
            : user,
        ),
      );

      // Clear the edited state for this user
      const newEditedUsers = { ...editedUsers };
      delete newEditedUsers[userId];
      setEditedUsers(newEditedUsers);
    } catch (err) {
      setError("Error updating user role. Please try again.");
      console.error(err);
    } finally {
      setSavingUsers((prev) => ({
        ...prev,
        [userId]: false,
      }));
    }
  };

  /**
   * Cancels the current edit operation for a user.
   * Reverts the UI back to the original values.
   * @param userId - ID of the user being edited
   */
  const handleCancelEdit = (userId: string) => {
    const newEditedUsers = { ...editedUsers };
    delete newEditedUsers[userId];
    setEditedUsers(newEditedUsers);
  };

  /**
   * Fetches detailed user information and opens the details modal.
   * Falls back to basic user data if the detailed fetch fails.
   * @param user - Basic user object to view details for
   */
  const handleViewDetails = async (user: IUser) => {
    try {
      // Fetch complete user data including demographic information
      const response = await fetch(`/api/v1/admin/users/${user.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user details");
      }

      const userData = await response.json();
      setSelectedUser(userData);
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Fallback to using the basic user data if the fetch fails
      setSelectedUser(user);
      setIsModalOpen(true);
    }
  };

  /**
   * Updates a user in the local state after modification.
   * @param updatedUser - The updated user object
   */
  const handleUserUpdate = (updatedUser: IUser) => {
    // Update the user in the local state without requiring a full refetch
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  /**
   * Handles the creation of a new user.
   * Refreshes the user list to include the newly created account.
   * @param createdUser - The newly created user object
   */
  const handleUserCreated = (createdUser: IUser) => {
    // Refresh the entire list to ensure correct pagination and sorting
    fetchUsers();
  };

  return (
    <div>
      <div className="md:flex md:justify-between md:items-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-4 md:mb-0">
          Users Management
        </h2>
        <Button
          className="bg-neutral-800 text-white rounded-full px-4 py-2 btn-gradient-hover"
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add New User
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
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Managed Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
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
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {user.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <select
                          className="text-sm bg-gray-700 text-white border border-gray-600 rounded p-1"
                          value={
                            editedUsers[user.id] !== undefined
                              ? editedUsers[user.id].role
                              : user.role || "user"
                          }
                          onChange={(e) =>
                            handleRoleChange(
                              user.id,
                              e.target.value,
                              user.managedResourceId,
                            )
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="business_rep">
                            Business Representative
                          </option>
                        </select>

                        {/* Show resource selection for business_rep role */}
                        {(editedUsers[user.id]?.role === "business_rep" ||
                          (!editedUsers[user.id] &&
                            user.role === "business_rep")) && (
                          <select
                            className="mt-2 text-sm bg-gray-700 text-white border border-gray-600 rounded p-1"
                            value={
                              editedUsers[user.id]?.managedResourceId !==
                              undefined
                                ? editedUsers[user.id].managedResourceId
                                : user.managedResourceId || ""
                            }
                            onChange={(e) =>
                              handleManagedResourceChange(
                                user.id,
                                e.target.value,
                              )
                            }
                            disabled={loadingResources}
                          >
                            <option value="">Select a resource</option>
                            {resources.map((resource) => (
                              <option key={resource.id} value={resource.id}>
                                {resource.name}
                              </option>
                            ))}
                          </select>
                        )}

                        {editedUsers[user.id] !== undefined && (
                          <div className="flex space-x-1">
                            <Button
                              variant="outline"
                              className="text-xs px-3 py-1.5 bg-green-700 hover:bg-green-800 text-white border-0"
                              onClick={() => handleSaveRole(user.id)}
                              disabled={savingUsers[user.id]}
                            >
                              {savingUsers[user.id] ? "..." : "Save"}
                            </Button>
                            <Button
                              variant="outline"
                              className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0"
                              onClick={() => handleCancelEdit(user.id)}
                              disabled={savingUsers[user.id]}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.role === "business_rep" ? (
                        <div className="text-sm text-gray-300">
                          {user.managedResourceId ? (
                            <span className="text-green-400">Assigned</span>
                          ) : (
                            <span className="text-yellow-400">
                              Not Assigned
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">N/A</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                        ></span>
                        <span className="text-sm text-gray-300">
                          {user.isActive ? "Active" : "Frozen"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white border-0"
                        onClick={() => handleViewDetails(user)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-300">
          Showing {users.length} of {totalItems} users
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0"
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>
          <span className="px-3 py-1.5 bg-gray-700 text-white rounded">
            {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0"
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
          onUserUpdate={handleUserUpdate}
        />
      )}

      {/* Create User Modal */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
