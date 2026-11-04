import "server-only";
import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { db } from "./supabase";

const COOKIE = "hl_device";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

// Buyers don't sign up: a long-lived random cookie identifies the device that owns its gifts.
export async function readDeviceId(): Promise<string | null> {
  const value = (await cookies()).get(COOKIE)?.value;
  return value && UUID.test(value) ? value : null;
}

/** Route handlers only (server components can't set cookies). */
export async function deviceUserId(): Promise<string> {
  let deviceId = await readDeviceId();
  if (!deviceId) {
    deviceId = randomUUID();
    (await cookies()).set(COOKIE, deviceId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 400 });
  }
  const { data, error } = await db().from("users").upsert({ device_id: deviceId }, { onConflict: "device_id" }).select("id").single();
  if (error) throw error;
  return data.id as string;
}

export async function existingDeviceUserId(): Promise<string | null> {
  const deviceId = await readDeviceId();
  if (!deviceId) return null;
  const { data } = await db().from("users").select("id").eq("device_id", deviceId).maybeSingle();
  return (data?.id as string | undefined) ?? null;
}
