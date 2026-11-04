import "server-only";
import { cache } from "react";
import { backendReady } from "@/lib/server/env";
import { getPaidGift } from "@/lib/server/gifts";

// Metadata, the OG image and the page all need the gift; cache() makes it one query per request.
export const loadGift = cache(async (slug: string) => (backendReady() ? getPaidGift(slug) : null));
