// File: src/app/users/page.tsx
// Purpose: Page for displaying a list of all users in the system.
// Owner: Advo Team

"use client";

import { useEffect, useState } from "react";

/**
 * Interface representing a user in the system
 */
interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Users page component that displays a list of all users.
 * Fetches user data from the API and renders it in a list format.
 * @returns React component with the users list
 */
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Fetches the list of users from the API when the component mounts.
   */
  useEffect(() => {
    /**
     * Async function to fetch users data from the API.
     * Updates state with the fetched users or error message.
     */
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/v1/users");
        if (!response.ok) {
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: Error | unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "An unexpected error occurred";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 mt-[180px] md:mt-0">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <ul className="space-y-4">
        {users.map((user) => (
          <li
            key={user.id}
            className="p-4 border rounded-md shadow hover:shadow-lg transition"
          >
            <h2 className="text-lg font-semibold">{user.name}</h2>
            <p className="text-gray-700">{user.email}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
