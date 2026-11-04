// A template is data: the builder wizard and the validator are generated from it,
// and one renderer component per template draws the recipient experience.

export type RelationGroup = "partner" | "family" | "friends" | "group";

export type Relation =
  | "girlfriend"
  | "boyfriend"
  | "wife"
  | "husband"
  | "mother"
  | "father"
  | "sister"
  | "brother"
  | "son"
  | "daughter"
  | "friend"
  | "bestie"
  | "everyone";

export const RELATIONS: Record<RelationGroup, Relation[]> = {
  partner: ["girlfriend", "boyfriend", "wife", "husband"],
  family: ["mother", "father", "sister", "brother", "son", "daughter"],
  friends: ["bestie", "friend"],
  group: ["everyone"],
};

export function groupOf(relation: Relation): RelationGroup {
  const entry = Object.entries(RELATIONS).find(([, list]) => list.includes(relation));
  return (entry?.[0] ?? "friends") as RelationGroup;
}

export type Lang = "en" | "hinglish";

// Copy may contain {them} and {you}; fill() swaps in the names.
export type Suggestions = Partial<Record<RelationGroup, Partial<Record<Lang, string[]>>>>;

type FieldBase = { id: string; label: string; hint?: string };

export type Field =
  | (FieldBase & { kind: "text"; placeholder?: string; maxLength: number; required: boolean })
  | (FieldBase & { kind: "number"; placeholder?: string; min: number; max: number; required: boolean })
  | (FieldBase & { kind: "choice"; options: { value: string; label: string; note?: string }[]; required: boolean })
  | (FieldBase & { kind: "lines"; min: number; max: number; maxLength: number; suggestions: Suggestions })
  | (FieldBase & { kind: "letter"; maxLength: number; suggestions: Suggestions })
  | (FieldBase & { kind: "photos"; max: number; captions: boolean; addAfterPayment: boolean })
  | (FieldBase & { kind: "voice"; maxSeconds: number })
  // Titled notes, e.g. "Open when… you miss me" + the letter inside.
  | (FieldBase & { kind: "pairs"; min: number; max: number; prefix: string; titleMax: number; bodyMax: number; titles: string[] })
  // Multiple-choice questions about the sender, each with one right answer.
  | (FieldBase & { kind: "quiz"; min: number; max: number; options: number; suggestions: string[] })
  // A remembered conversation, replayed bubble by bubble.
  | (FieldBase & { kind: "chat"; min: number; max: number; maxLength: number })
  // One short note per fixed day (Valentine's week).
  | (FieldBase & { kind: "days"; days: { id: string; title: string }[]; maxLength: number; suggestions: Record<string, string[]> })
  | (FieldBase & { kind: "date"; required: boolean });

export type Pair = { title: string; body: string };
export type QuizQuestion = { q: string; options: string[]; answer: number };
export type ChatLine = { from: "you" | "them"; text: string };

export type Step = {
  id: string;
  title: string;
  subtitle?: string;
  fields: Field[];
};

export type TemplateDefinition = {
  slug: string;
  name: string;
  occasion: "birthday" | "anniversary" | "apology" | "proposal" | "missYou" | "thankYou" | "festival" | "promise" | "valentine" | "fun";
  // One line for the template picker.
  tagline: string;
  forGroups: RelationGroup[];
  priceInr: number;
  // Step 1 (who it's for) and step 2 (names) are shared by every template and added by the builder.
  steps: Step[];
};

export type GiftContent = {
  relation: Relation;
  them: string;
  you: string;
  lang: Lang;
  values: Record<string, unknown>;
};

export function fill(copy: string, content: Pick<GiftContent, "them" | "you">): string {
  return copy.replaceAll("{them}", content.them).replaceAll("{you}", content.you);
}

export function suggestionsFor(s: Suggestions, relation: Relation, lang: Lang): string[] {
  const byGroup = s[groupOf(relation)] ?? s.friends ?? {};
  return byGroup[lang] ?? byGroup.en ?? [];
}
