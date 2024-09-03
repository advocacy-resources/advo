import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import AccountDetails from "@/app/dashboard/account/AccountDetails";
import { User } from "@/app/types/User";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/api/auth/signin");
  }

  return (<AccountDetails user={session.user} />) as User;
}
