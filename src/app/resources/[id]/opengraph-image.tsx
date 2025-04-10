import { ImageResponse } from "next/og";
import prisma from "@/prisma/client";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const alt = "Advo Resource";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image({ params }: { params: { id: string } }) {
  try {
    // Fetch the resource data
    const resource = await prisma.resource.findUnique({
      where: { id: params.id },
    });

    // If no resource is found, return a default OG image
    if (!resource) {
      return new ImageResponse(
        (
          <div
            style={{
              display: "flex",
              fontSize: 60,
              color: "white",
              background: "black",
              width: "100%",
              height: "100%",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: 50,
            }}
          >
            <img
              src={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/images/advo-logo-color.png`}
              alt="Advo Logo"
              width={200}
              height={200}
              style={{ marginBottom: 40 }}
            />
            <div style={{ fontWeight: "bold" }}>Resource Not Found</div>
          </div>
        ),
        { ...size },
      );
    }

    // Create a dynamic OG image based on the resource data
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "white",
            background: "black",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/images/advo-logo-color.png`}
            alt="Advo Logo"
            width={200}
            height={200}
            style={{ marginBottom: 40 }}
          />
          <div style={{ fontWeight: "bold" }}>{resource.name}</div>
          {resource.description && (
            <div style={{ fontSize: 30, marginTop: 20, textAlign: "center" }}>
              {resource.description.length > 100
                ? resource.description.substring(0, 100) + "..."
                : resource.description}
            </div>
          )}
        </div>
      ),
      { ...size },
    );
  } catch (error) {
    // In case of any error, return a default OG image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            fontSize: 60,
            color: "white",
            background: "black",
            width: "100%",
            height: "100%",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: 50,
          }}
        >
          <img
            src={`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/images/advo-logo-color.png`}
            alt="Advo Logo"
            width={200}
            height={200}
            style={{ marginBottom: 40 }}
          />
          <div style={{ fontWeight: "bold" }}>Advo</div>
          <div style={{ fontSize: 30, marginTop: 20 }}>
            Connecting you with resources that matter
          </div>
        </div>
      ),
      { ...size },
    );
  }
}
