import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "PRNI — Polski Ruch Narodowo-Integralistyczny";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
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
        {/* Red accent line top */}
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

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://www.prni.org.pl/logo.png"
          alt=""
          width={160}
          height={160}
          style={{ marginBottom: "24px" }}
        />

        {/* PRNI */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 900,
            color: "#ffffff",
            letterSpacing: "8px",
            lineHeight: 1,
          }}
        >
          PRNI
        </div>

        {/* Full name */}
        <div
          style={{
            fontSize: "24px",
            color: "#dc2626",
            marginTop: "16px",
            letterSpacing: "4px",
            textTransform: "uppercase",
          }}
        >
          Polski Ruch Narodowo-Integralistyczny
        </div>

        {/* Motto */}
        <div
          style={{
            fontSize: "18px",
            color: "#888888",
            marginTop: "20px",
            fontStyle: "italic",
          }}
        >
          Naród Ponad Wszystkim
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            fontSize: "16px",
            color: "#555555",
          }}
        >
          www.prni.org.pl
        </div>

        {/* Red accent line bottom */}
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
