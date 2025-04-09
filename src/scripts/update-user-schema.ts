/**
 * This script updates existing users in the MongoDB database to add the role field.
 * Run it with: npx ts-node -r tsconfig-paths/register src/scripts/update-user-schema.ts
 */

import prisma from "@/prisma/client";

async function main() {
  try {
    console.log("Starting user schema update...");
    
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to update.`);
    
    // Update each user to add the role field if it doesn't exist
    let updatedCount = 0;
    for (const user of users) {
      // @ts-ignore - We're checking if the role exists, even though TypeScript thinks it does
      if (!user.role) {
        await prisma.user.update({
          where: { id: user.id },
          data: { role: "user" },
        });
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} users with default role.`);
    console.log("User schema update complete!");
    
    // Now create an admin user
    const adminEmail = "admin@example.com";
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    
    if (existingAdmin) {
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { role: "admin" },
      });
      console.log(`Updated user ${adminEmail} to admin role.`);
    } else {
      console.log(`Admin user ${adminEmail} not found. Please run the create-admin-user script.`);
    }
    
  } catch (error) {
    console.error("Error updating user schema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();