import { ImageResponse } from "next/og";
import { heartDots } from "@/lib/scene";
import { loadGift } from "./data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A glowing firefly heart with a gift for you";

const DOTS = heartDots();

// The card WhatsApp shows when the link is shared: a firefly heart and who it's for.
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = await loadGift(slug).catch(() => null);
  const them = found?.content.them ?? "you";

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", background: "linear-gradient(160deg, #08161D 0%, #0D2629 55%, #0C2324 100%)", color: "#ECF5E8", padding: "0 90px" }}>
        <div style={{ position: "relative", width: 520, height: 380, display: "flex" }}>
          <div style={{ position: "absolute", left: 40, top: 0, width: 440, height: 392, borderRadius: 9999, background: "radial-gradient(circle, rgba(232,240,140,0.28) 0%, rgba(0,0,0,0) 70%)" }} />
          {DOTS.map((d, i) => (
            <div key={i} style={{ position: "absolute", left: d.x * 2, top: d.y * 2, width: d.s * 2, height: d.s * 2, borderRadius: 9999, background: "#FBEFA0", boxShadow: "0 0 14px 5px rgba(246,230,120,0.75)" }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0, marginLeft: 40 }}>
          <div style={{ fontSize: 26, letterSpacing: 5, lineHeight: 1.4, color: "#EBCB6A", textTransform: "uppercase" }}>Someone made you something</div>
          <div style={{ fontSize: them.length > 10 ? 64 : 96, marginTop: 18, lineHeight: 1.05 }}>{`For ${them}`}</div>
          <div style={{ fontSize: 30, marginTop: 24, color: "#A8C2B4" }}>Tap to open · heartlink</div>
        </div>
      </div>
    ),
    size,
  );
}
