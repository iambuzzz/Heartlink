import "server-only";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "./env";

const COOKIE = "hl_admin";

const sessionToken = () => createHmac("sha256", env.adminPassword).update("heartlink-admin-session").digest("hex");
const same = (a: string, b: string) => {
  const x = createHash("sha256").update(a).digest();
  const y = createHash("sha256").update(b).digest();
  return timingSafeEqual(x, y);
};

export async function isAdmin(): Promise<boolean> {
  if (!env.adminPassword) return false;
  const value = (await cookies()).get(COOKIE)?.value ?? "";
  return same(value, sessionToken());
}

export async function adminLogin(password: string): Promise<boolean> {
  if (!env.adminPassword || !same(password, env.adminPassword)) return false;
  (await cookies()).set(COOKIE, sessionToken(), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/admin", maxAge: 60 * 60 * 24 * 7 });
  return true;
}
