"use client";

import { useCallback, useEffect, useState } from "react";
import type { GiftContent, Lang, Relation, RelationGroup } from "./templates/types";

export type Photo = { src: string; caption: string };
export type VoiceNote = { src: string; seconds: number };

// A gift being built. Lives in the browser until the buyer pays; nothing is uploaded yet.
export type Draft = {
  group?: RelationGroup;
  relation?: Relation;
  them: string;
  you: string;
  lang: Lang;
  values: Record<string, unknown>;
  step: number;
  // Set once checkout has saved it on the server, so retries update the same gift.
  giftId?: string;
};

export const emptyDraft = (group?: RelationGroup): Draft => ({
  group,
  relation: group === "group" ? "everyone" : undefined,
  them: "",
  you: "",
  lang: "en",
  values: {},
  step: 0,
});

const key = (slug: string) => `heartlink:draft:${slug}`;

export function loadDraft(slug: string): Draft | null {
  try {
    const raw = localStorage.getItem(key(slug));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch {
    return null;
  }
}

/** Returns false when the browser refused to store it (usually too many large photos). */
export function saveDraft(slug: string, draft: Draft): boolean {
  try {
    localStorage.setItem(key(slug), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function toContent(draft: Draft): GiftContent | null {
  if (!draft.relation) return null;
  return { relation: draft.relation, them: draft.them.trim(), you: draft.you.trim(), lang: draft.lang, values: draft.values };
}

/** Draft state synced to localStorage. `ready` is false until the stored copy has been read. */
export function useDraft(slug: string, initialGroup?: RelationGroup) {
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(initialGroup));
  const [ready, setReady] = useState(false);
  const [storageFull, setStorageFull] = useState(false);

  useEffect(() => {
    const stored = loadDraft(slug);
    if (stored && !(initialGroup && stored.group !== initialGroup && stored.step === 0)) setDraft(stored);
    setReady(true);
  }, [slug, initialGroup]);

  useEffect(() => {
    if (ready) setStorageFull(!saveDraft(slug, draft));
  }, [slug, draft, ready]);

  const update = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const setValue = useCallback((id: string, value: unknown) => setDraft((d) => ({ ...d, values: { ...d.values, [id]: value } })), []);

  return { draft, ready, storageFull, update, setValue };
}
