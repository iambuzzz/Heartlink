import "server-only";
import { headers } from "next/headers";

/** The public origin for share links: NEXT_PUBLIC_SITE_URL if set, else the request's own host. */
export async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}
