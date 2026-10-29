import { ImageResponse } from "next/og"

export const alt = "Crazy Fans"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          background: "#110e0c",
          color: "#f4efe6",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 28, letterSpacing: 6, color: "#e2b15a" }}>CRAZY FANS</div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05, marginTop: 24, maxWidth: 900 }}>
          Your fandom. Your rules. Your wars.
        </div>
      </div>
    ),
    size,
  )
}
