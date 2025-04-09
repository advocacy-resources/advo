import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/authOptions";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated and has admin role
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Admin Dashboard</h1>
        <div className="bg-gray-900 rounded-lg shadow-lg p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
