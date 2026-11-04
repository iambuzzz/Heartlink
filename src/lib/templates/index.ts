import { birthday } from "./birthday";
import { chat } from "./chat";
import { openWhen } from "./openWhen";
import { pinky } from "./pinky";
import { quiz } from "./quiz";
import type { Field, GiftContent, TemplateDefinition } from "./types";
import { valentine } from "./valentine";

export const templates: TemplateDefinition[] = [birthday, openWhen, quiz, chat, pinky, valentine];

export function getTemplate(slug: string): TemplateDefinition | undefined {
  return templates.find((t) => t.slug === slug);
}

// Returns one message per problem; an empty list means the draft can be published.
// Photos marked addAfterPayment are not required before payment.
export function validateGift(template: TemplateDefinition, content: GiftContent): string[] {
  const errors: string[] = [];
  if (!content.them.trim()) errors.push("Add their name");
  if (!content.you.trim()) errors.push("Add your name");
  for (const field of template.steps.flatMap((s) => s.fields)) {
    const problem = checkField(field, content.values[field.id]);
    if (problem) errors.push(`${field.label}: ${problem}`);
  }
  return errors;
}

export function checkField(field: Field, value: unknown): string | null {
  switch (field.kind) {
    case "text":
      if (field.required && (typeof value !== "string" || !value.trim())) return "required";
      if (typeof value === "string" && value.length > field.maxLength) return `max ${field.maxLength} characters`;
      return null;
    case "number":
      if (value === undefined || value === "") return field.required ? "required" : null;
      if (typeof value !== "number" || value < field.min || value > field.max) return `between ${field.min} and ${field.max}`;
      return null;
    case "choice":
      if (value === undefined) return field.required ? "required" : null;
      return field.options.some((o) => o.value === value) ? null : "pick one of the options";
    case "lines": {
      const lines = Array.isArray(value) ? value.filter((l) => typeof l === "string" && l.trim()) : [];
      if (lines.length < field.min) return `add at least ${field.min}`;
      if (lines.length > field.max) return `at most ${field.max}`;
      if (lines.some((l) => l.length > field.maxLength)) return `each line max ${field.maxLength} characters`;
      return null;
    }
    case "letter":
      if (typeof value !== "string" || !value.trim()) return "write a few lines";
      return value.length > field.maxLength ? `max ${field.maxLength} characters` : null;
    case "photos":
      if (Array.isArray(value) && value.length > field.max) return `at most ${field.max} photos`;
      return null;
    case "pairs": {
      const items = Array.isArray(value) ? (value as { title?: unknown; body?: unknown }[]) : [];
      const filled = items.filter((p) => typeof p?.title === "string" && p.title.trim() && typeof p.body === "string" && p.body.trim());
      if (filled.length !== items.length) return "give every note a title and a few words";
      if (filled.length < field.min) return `add at least ${field.min}`;
      if (filled.length > field.max) return `at most ${field.max}`;
      if (filled.some((p) => (p.title as string).length > field.titleMax || (p.body as string).length > field.bodyMax)) return "one of the notes is too long";
      return null;
    }
    case "quiz": {
      const items = Array.isArray(value) ? (value as { q?: unknown; options?: unknown; answer?: unknown }[]) : [];
      if (items.length < field.min) return `add at least ${field.min} questions`;
      if (items.length > field.max) return `at most ${field.max} questions`;
      for (const q of items) {
        const opts = Array.isArray(q.options) ? q.options : [];
        if (typeof q.q !== "string" || !q.q.trim()) return "every question needs words";
        if (opts.length !== field.options || opts.some((o) => typeof o !== "string" || !o.trim())) return `fill all ${field.options} answers`;
        if (typeof q.answer !== "number" || q.answer < 0 || q.answer >= opts.length) return "mark the right answer";
        if (q.q.length > 120 || opts.some((o) => (o as string).length > 60)) return "keep questions and answers short";
      }
      return null;
    }
    case "chat": {
      const lines = Array.isArray(value) ? (value as { from?: unknown; text?: unknown }[]).filter((l) => typeof l.text === "string" && l.text.trim()) : [];
      if (lines.length < field.min) return `add at least ${field.min} messages`;
      if (lines.length > field.max) return `at most ${field.max} messages`;
      if (lines.some((l) => (l.from !== "you" && l.from !== "them") || (l.text as string).length > field.maxLength)) return "one of the messages is too long";
      return null;
    }
    case "days": {
      const map = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
      const missing = field.days.filter((d) => typeof map[d.id] !== "string" || !(map[d.id] as string).trim());
      if (missing.length) return `write something for ${missing[0].title}`;
      if (field.days.some((d) => (map[d.id] as string).length > field.maxLength)) return `each day max ${field.maxLength} characters`;
      return null;
    }
    case "date":
      if (value === undefined || value === "") return field.required ? "pick a date" : null;
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? null : "pick a date";
    case "voice": {
      if (value === undefined || value === null) return null;
      const v = value as { src?: unknown; seconds?: unknown };
      if (typeof v.src !== "string" || typeof v.seconds !== "number") return "record it again";
      return v.seconds > field.maxSeconds + 1 ? `at most ${field.maxSeconds} seconds` : null;
    }
  }
}
