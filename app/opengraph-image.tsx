import { ImageResponse } from "next/og";

export const alt = "Verdanta — Premium Discord Perks";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          background: "linear-gradient(135deg, #2f855a 0%, #12b876 55%, #14a5a0 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 6, opacity: 0.85, fontWeight: 700 }}>VERDANTA</div>
        <div style={{ fontSize: 78, fontWeight: 800, marginTop: 18, lineHeight: 1.05, maxWidth: 900 }}>
          A greener place to belong on Discord.
        </div>
        <div style={{ fontSize: 30, marginTop: 28, opacity: 0.92 }}>
          Premium perks · Friendly community · Nature-inspired
        </div>
      </div>
    ),
    { ...size },
  );
}
