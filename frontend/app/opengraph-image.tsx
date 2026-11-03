import { ImageResponse } from "next/og"

export const alt = "Dev Day One: ask a codebase questions and get answers that cite the files"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const STATIONS = ["backend/routers/rag.py", "backend/services/rag.py", "backend/services/retriever.py"]

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#191B1E",
          color: "#ECE9E2",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 6, background: "#F2C230", display: "flex", alignItems: "center", justifyContent: "center", color: "#191B1E", fontSize: 34, fontWeight: 800 }}>
            {"{+"}
          </div>
          <div style={{ fontSize: 34, fontWeight: 800 }}>Dev Day One</div>
        </div>
        <div style={{ display: "flex", gap: 64, alignItems: "flex-end" }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
              Your first day on a codebase, already oriented.
            </div>
            <div style={{ marginTop: 24, fontSize: 30, color: "#9AA0A8" }}>
              Answers that cite the files they came from.
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, borderLeft: "3px solid #33373D", paddingLeft: 26 }}>
            {STATIONS.map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#4FB3A5" }}>
                <div style={{ width: 18, height: 18, borderRadius: 9, border: "3px solid #4FB3A5", marginLeft: -38, background: "#191B1E" }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
