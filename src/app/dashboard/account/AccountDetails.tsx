"use client";

import { redirect } from "next/dist/server/api-utils";
import { User } from "../../types/User";
import { signOut } from "next-auth/react";

type AccountDetailsProps = {
  user: User;
};

export default function AccountDetails({ user }: AccountDetailsProps) {
  return (
    <div>
      <h1>Account Page</h1>
      <p>User ID: {user.id}</p>
      <p>Welcome, {user.name || "User"}!</p>
      <p>Email: {user.email || "No email provided"}</p>
      {user.image && <img src={user.image} alt="Profile" />}
      {/* Add more account-related content here */}
      <button onClick={() => signOut({ callbackUrl: "/" })}>Sign Out</button>
    </div>
  );
}
