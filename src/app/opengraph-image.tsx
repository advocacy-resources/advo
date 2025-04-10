import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Advo";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

export default async function Image() {
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
          width={300}
          height={300}
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
