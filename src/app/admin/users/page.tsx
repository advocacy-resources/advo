"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IUser } from "@/interfaces/user";
import UserDetailsModal from "@/components/users/UserDetailsModal";
import UserCreateModal from "@/components/users/UserCreateModal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [editedUsers, setEditedUsers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [savingUsers, setSavingUsers] = useState<Record<string, boolean>>({});
  const [limit] = useState(10);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page]);

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

  const handleRoleChange = (userId: string, newRole: string) => {
    setEditedUsers((prev) => ({
      ...prev,
      [userId]: newRole,
    }));
  };

  const handleSaveRole = async (userId: string) => {
    try {
      setSavingUsers((prev) => ({
        ...prev,
        [userId]: true,
      }));

      const newRole = editedUsers[userId];
      const response = await fetch(`/api/v1/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user role");
      }

      // Update the local users list
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
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

  const handleCancelEdit = (userId: string) => {
    const newEditedUsers = { ...editedUsers };
    delete newEditedUsers[userId];
    setEditedUsers(newEditedUsers);
  };
  const handleViewDetails = (user: IUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleUserUpdate = (updatedUser: IUser) => {
    // Update the user in the local state
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleUserCreated = (createdUser: IUser) => {
    // Add the newly created user to the list and refresh
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
                    colSpan={5}
                    className="px-6 py-4 text-center text-gray-300"
                  >
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
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
                              ? editedUsers[user.id]
                              : user.role || "user"
                          }
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>

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
                      <div className="flex items-center">
                        <span
                          className={`inline-block w-3 h-3 rounded-full mr-2 ${user.isActive ? "bg-green-500" : "bg-red-500"}`}
                        ></span>
                        <span className="text-sm text-gray-300">
                          {user.isActive ? "Active" : "Frozen"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="outline"
                        className="text-xs px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white border-0 whitespace-nowrap overflow-hidden"
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

        {/* Pagination */}
        <div className="px-6 py-4 bg-gray-700 border-t border-gray-600 flex items-center justify-between">
          <div className="text-sm text-gray-300">
            Showing <span className="font-medium">{users.length}</span> of{" "}
            <span className="font-medium">{totalItems}</span> users
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
      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={isModalOpen}
        onClose={setIsModalOpen}
        user={selectedUser}
        onUserUpdate={handleUserUpdate}
      />

      {/* User Create Modal */}
      <UserCreateModal
        isOpen={isCreateModalOpen}
        onClose={setIsCreateModalOpen}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}
