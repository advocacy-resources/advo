import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateRecommendationSchema() {
  try {
    console.log("Starting schema update...");

    // Get all existing recommendations
    const recommendations = await prisma.resourceRecommendation.findMany();
    console.log(`Found ${recommendations.length} existing recommendations`);

    // Update each recommendation to add the new fields with default values
    for (const recommendation of recommendations) {
      await prisma.resourceRecommendation.update({
        where: { id: recommendation.id },
        data: {
          description: "",
          category: [],
          contact: { phone: "", email: "", website: "" },
          address: { street: "", city: "", state: "", zip: "" },
        },
      });
    }

    console.log(
      "Successfully updated all recommendations with new schema fields",
    );
  } catch (error) {
    console.error("Error updating recommendation schema:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateRecommendationSchema()
  .then(() => console.log("Schema update completed"))
  .catch((error) => console.error("Schema update failed:", error));
