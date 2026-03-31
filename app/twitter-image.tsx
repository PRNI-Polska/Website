import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PRNI — Polski Ruch Narodowo-Integralistyczny";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #090909 0%, #1a1a1a 50%, #090909 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#dc2626",
          }}
        />

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.prni.org.pl/logo.png"
          alt=""
          width={140}
          height={140}
          style={{ marginBottom: "20px" }}
        />

        <div
          style={{
            fontSize: "72px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "8px",
            lineHeight: 1,
          }}
        >
          PRNI
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "#dc2626",
            marginTop: "14px",
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          Polski Ruch Narodowo-Integralistyczny
        </div>

        <div
          style={{
            fontSize: "16px",
            color: "#888888",
            marginTop: "16px",
            fontStyle: "italic",
          }}
        >
          Naród Ponad Wszystkim
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "20px",
            fontSize: "15px",
            color: "#555555",
          }}
        >
          www.prni.org.pl
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "#dc2626",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
