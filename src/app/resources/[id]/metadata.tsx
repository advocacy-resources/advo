import { Metadata } from "next";
import prisma from "@/prisma/client";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    // Fetch the resource data
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    // If no resource is found, return default metadata
    if (!resource) {
      return {
        title: "Resource Not Found | Advo",
        description: "The requested resource could not be found.",
      };
    }

    // Return metadata with Open Graph and Twitter card information
    return {
      title: `${resource.name} | Advo`,
      description: resource.description || "View this resource on Advo",
      openGraph: {
        title: resource.name,
        description: resource.description || "View this resource on Advo",
        url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/resources/${resource.id}`,
        siteName: "Advo",
        images: [
          {
            url: `/resources/${resource.id}/opengraph-image`,
            width: 1200,
            height: 630,
            alt: `${resource.name} - Advo`,
          },
        ],
        locale: "en_US",
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title: resource.name,
        description: resource.description || "View this resource on Advo",
        images: [`/resources/${resource.id}/opengraph-image`],
      },
    };
  } catch (error) {
    // In case of any error, return default metadata
    return {
      title: "Advo Resources",
      description: "Connecting you with resources that matter",
    };
  }
}
