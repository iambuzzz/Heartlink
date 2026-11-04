"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminLogin, isAdmin } from "@/lib/server/admin";
import { reviewOrder } from "@/lib/server/gifts";

export async function login(formData: FormData) {
  const ok = await adminLogin(String(formData.get("password") ?? ""));
  redirect(ok ? "/admin" : "/admin?error=1");
}

export async function review(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const decision = formData.get("decision") === "verified" ? "verified" : "rejected";
  await reviewOrder(String(formData.get("orderId") ?? ""), decision);
  revalidatePath("/admin");
}
