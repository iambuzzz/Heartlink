import type { Relation, RelationGroup } from "./templates/types";

export const GROUP_LABELS: Record<RelationGroup, string> = {
  partner: "Partner",
  family: "Family",
  friends: "Friends",
  group: "From all of us",
};

export const RELATION_LABELS: Record<Relation, string> = {
  girlfriend: "Girlfriend",
  boyfriend: "Boyfriend",
  wife: "Wife",
  husband: "Husband",
  mother: "Maa",
  father: "Papa",
  sister: "Sister",
  brother: "Brother",
  son: "Son",
  daughter: "Daughter",
  bestie: "Best friend",
  friend: "Friend",
  everyone: "Everyone",
};

// Name suggestions for the "what do you call them" field.
export const NAME_HINTS: Partial<Record<Relation, string>> = {
  girlfriend: "e.g. Jaan, Babe, her name…",
  boyfriend: "e.g. Babu, his name…",
  wife: "e.g. Jaan, her name…",
  husband: "e.g. Ji, his name…",
  mother: "e.g. Maa, Mummy, Amma…",
  father: "e.g. Papa, Pappa, Baba…",
  sister: "e.g. Didi, Chhoti, her name…",
  brother: "e.g. Bhaiya, Bhai, his name…",
  bestie: "e.g. their name or nickname",
};

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
