import { hash } from "bcryptjs";
import prisma from "@/prisma/client"; // Adjust the import path as needed

async function updateUserPassword(email: string, newPassword: string) {
  const hashedPassword = await hash(newPassword, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });
  console.log(`Updated password for user: ${email}`);
  console.log(`New hashed password: ${hashedPassword}`);
}

updateUserPassword("kmje405@gmail.com", "testing1234")
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
