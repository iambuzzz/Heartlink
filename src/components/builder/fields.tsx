"use client";

import { useEffect, useRef, useState } from "react";
import type { Photo, VoiceNote } from "@/lib/draft";
import { compressImage } from "@/lib/photos";
import { fill, suggestionsFor, type ChatLine, type Field, type GiftContent, type Pair, type QuizQuestion } from "@/lib/templates/types";
import { CloseIcon, PhotoIcon, PlusIcon } from "../Icons";
import { VoiceRecorder } from "../VoiceRecorder";

type Ctx = Pick<GiftContent, "them" | "you" | "relation" | "lang">;
type FieldProps<K extends Field["kind"]> = {
  field: Extract<Field, { kind: K }>;
  value: unknown;
  onChange: (v: unknown) => void;
  ctx: Ctx;
};

export const inputCls =
  "w-full rounded-2xl border border-glass-line bg-field px-4 py-3 text-base text-ink placeholder:text-muted/70 shadow-[var(--glow)] outline-none focus:border-[var(--gold-text)]";

export function Label({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">
      {children}
    </label>
  );
}

export function ChoiceField({ field, value, onChange }: FieldProps<"choice">) {
  return (
    <fieldset>
      <legend className="sr-only">{field.label}</legend>
      <div className="grid gap-2.5">
        {field.options.map((o) => {
          const selected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(o.value)}
              className={`glass flex items-center gap-3.5 rounded-[20px] p-3.5 text-left transition ${selected ? "ring-2 ring-[var(--gold-text)]" : ""}`}
            >
              <span className={`cake-swatch cake-${o.value} h-12 w-12 shrink-0 rounded-2xl`} aria-hidden="true" />
              <span className="flex flex-col">
                <span className="font-display text-lg">{o.label}</span>
                {o.note && <span className="text-sm text-muted">{o.note}</span>}
              </span>
              {selected && <span className="firefly anim-blink ml-auto h-2.5 w-2.5" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function NumberField({ field, value, onChange }: FieldProps<"number">) {
  const id = `f-${field.id}`;
  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        min={field.min}
        max={field.max}
        placeholder={field.placeholder}
        value={typeof value === "number" ? value : ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className={`${inputCls} max-w-[160px]`}
      />
    </div>
  );
}

export function TextField({ field, value, onChange }: FieldProps<"text">) {
  const id = `f-${field.id}`;
  return (
    <div>
      <Label htmlFor={id}>{field.label}</Label>
      <input id={id} type="text" maxLength={field.maxLength} placeholder={field.placeholder} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} aria-describedby={field.hint ? `${id}-hint` : undefined} className={inputCls} />
      {field.hint && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {field.hint}
        </p>
      )}
    </div>
  );
}

export function LinesField({ field, value, onChange, ctx }: FieldProps<"lines">) {
  const suggestions = suggestionsFor(field.suggestions, ctx.relation, ctx.lang).map((s) => fill(s, ctx));
  const lines = Array.isArray(value) ? (value as string[]) : [];

  // First visit: start with a few suggestions filled in, so nobody faces an empty box.
  const seeded = useRef(false);
  useEffect(() => {
    if (!seeded.current && value === undefined) onChange(suggestions.slice(0, field.min));
    seeded.current = true;
  }, [value, onChange, suggestions, field.min]);

  const set = (i: number, text: string) => onChange(lines.map((l, j) => (j === i ? text : l)));
  const remove = (i: number) => onChange(lines.filter((_, j) => j !== i));
  const add = (text = "") => lines.length < field.max && onChange([...lines, text]);
  const unused = suggestions.filter((s) => !lines.includes(s));

  return (
    <div className="flex flex-col gap-2.5">
      {lines.map((line, i) => (
        <div key={i} className="relative">
          <label htmlFor={`${field.id}-${i}`} className="sr-only">
            Firefly {i + 1}
          </label>
          <span className="firefly anim-blink absolute left-4 top-[22px] h-2 w-2" style={{ animationDelay: `${i * 0.4}s` }} aria-hidden="true" />
          <textarea
            id={`${field.id}-${i}`}
            rows={2}
            maxLength={field.maxLength}
            value={line}
            onChange={(e) => set(i, e.target.value)}
            className={`${inputCls} resize-none pl-9 pr-12`}
          />
          <button type="button" onClick={() => remove(i)} aria-label={`Remove firefly ${i + 1}`} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full text-muted">
            <CloseIcon size={16} />
          </button>
        </div>
      ))}
      {lines.length < field.max && (
        <button type="button" onClick={() => add()} className="btn-sec inline-flex h-12 items-center justify-center gap-2 rounded-2xl text-[15px] font-bold">
          <PlusIcon size={16} />
          Write your own
        </button>
      )}
      <p className="text-xs text-muted">
        {lines.filter((l) => l.trim()).length} of {field.min}–{field.max}
      </p>
      {unused.length > 0 && lines.length < field.max && (
        <div>
          <p className="mb-2 text-sm font-bold text-muted">Need an idea? Tap to add</p>
          <div className="flex flex-col gap-2">
            {unused.map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="rounded-2xl border border-dashed border-sec-line px-4 py-2.5 text-left text-sm text-ink">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function LetterField({ field, value, onChange, ctx }: FieldProps<"letter">) {
  const id = `f-${field.id}`;
  const text = typeof value === "string" ? value : "";
  const suggestions = suggestionsFor(field.suggestions, ctx.relation, ctx.lang).map((s) => fill(s, ctx));
  return (
    <div>
      <Label htmlFor={id}>Your letter</Label>
      <textarea id={id} rows={9} maxLength={field.maxLength} value={text} onChange={(e) => onChange(e.target.value)} placeholder={`Dear ${ctx.them || "…"},`} className={`${inputCls} resize-y font-hand text-[21px] leading-snug`} />
      <p className="mt-1.5 text-right text-xs text-muted">
        {text.length} / {field.maxLength}
      </p>
      {suggestions.length > 0 && (
        <div className="mt-2">
          <p className="mb-2 text-sm font-bold text-muted">Stuck? Start with</p>
          {suggestions.map((s) => (
            <button key={s} type="button" onClick={() => onChange(s)} className="w-full rounded-2xl border border-dashed border-sec-line px-4 py-2.5 text-left text-sm">
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function PhotosField({ field, value, onChange }: FieldProps<"photos">) {
  const photos = Array.isArray(value) ? (value as Photo[]) : [];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const room = field.max - photos.length;
      const added = await Promise.all(Array.from(files).slice(0, room).map(async (f) => ({ src: await compressImage(f), caption: "" })));
      onChange([...photos, ...added]);
      if (files.length > room) setError(`Only ${field.max} photos fit — we kept the first ${room}.`);
    } catch {
      setError("That photo couldn't be opened. Try a JPG or PNG.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const setCaption = (i: number, caption: string) => onChange(photos.map((p, j) => (j === i ? { ...p, caption } : p)));
  const remove = (i: number) => onChange(photos.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-2.5">
        {photos.map((p, i) => (
          <div key={i} className="glass flex flex-col gap-2 rounded-[18px] p-2">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element -- local data URL preview */}
              <img src={p.src} alt={p.caption || `Photo ${i + 1}`} className="aspect-square w-full rounded-xl object-cover" />
              <button type="button" onClick={() => remove(i)} aria-label={`Remove photo ${i + 1}`} className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white">
                <CloseIcon size={16} />
              </button>
            </div>
            <label htmlFor={`cap-${i}`} className="sr-only">
              Note for photo {i + 1}
            </label>
            <input id={`cap-${i}`} value={p.caption} maxLength={60} placeholder="A tiny note…" onChange={(e) => setCaption(i, e.target.value)} className="w-full rounded-xl border border-glass-line bg-field px-2.5 py-2 font-hand text-lg outline-none" />
          </div>
        ))}
      </div>
      {photos.length < field.max && (
        <>
          <input ref={inputRef} id={`f-${field.id}`} type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" onChange={(e) => pick(e.target.files)} />
          <label htmlFor={`f-${field.id}`} className="glass flex h-28 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[20px] border-dashed text-center">
            <PhotoIcon size={22} />
            <span className="font-bold">{busy ? "Adding…" : photos.length ? "Add more photos" : "Add photos"}</span>
            <span className="text-xs text-muted">
              Up to {field.max} · {photos.length} added
            </span>
          </label>
        </>
      )}
      {error && <p className="text-sm font-bold text-heart">{error}</p>}
    </div>
  );
}

export function VoiceField({ field, value, onChange, ctx }: FieldProps<"voice">) {
  const note = value && typeof value === "object" && typeof (value as VoiceNote).src === "string" ? (value as VoiceNote) : null;
  return (
    <div className="flex flex-col gap-3">
      <VoiceRecorder maxSeconds={field.maxSeconds} value={note} onChange={(v) => onChange(v ?? undefined)} keptNote={fill("{them} will hear this from a jar of fireflies", ctx)} />
      {!note && field.hint && <p className="text-center text-sm text-muted">{fill(field.hint, ctx)}</p>}
    </div>
  );
}

const chip = "h-9 shrink-0 rounded-full border border-sec-line bg-sec px-3 text-[13px] font-bold";

export function PairsField({ field, value, onChange }: FieldProps<"pairs">) {
  const items = Array.isArray(value) ? (value as Pair[]) : [];
  const set = (i: number, patch: Partial<Pair>) => onChange(items.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  const unused = field.titles.filter((t) => !items.some((p) => p.title === t));
  return (
    <div className="flex flex-col gap-3">
      {items.map((p, i) => (
        <div key={i} className="glass anim-rise flex flex-col gap-2 rounded-[20px] p-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 font-hand text-xl text-gold">{field.prefix}</span>
            <input aria-label={`Note ${i + 1} title`} value={p.title} maxLength={field.titleMax} placeholder="you miss me" onChange={(e) => set(i, { title: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-glass-line bg-field px-3 py-2 font-hand text-xl outline-none" />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove note ${i + 1}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted">
              <CloseIcon size={16} />
            </button>
          </div>
          <textarea aria-label={`Note ${i + 1}`} rows={4} value={p.body} maxLength={field.bodyMax} placeholder="What you'd want them to read in that moment…" onChange={(e) => set(i, { body: e.target.value })} className="w-full resize-none rounded-xl border border-glass-line bg-field px-3 py-2.5 font-hand text-[20px] outline-none" />
        </div>
      ))}
      {items.length < field.max && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-muted">Add a note · {items.length} of {field.max}</p>
          <div className="flex flex-wrap gap-2">
            {unused.slice(0, 6).map((t) => (
              <button key={t} type="button" onClick={() => onChange([...items, { title: t, body: "" }])} className={chip}>
                + {t}
              </button>
            ))}
            <button type="button" onClick={() => onChange([...items, { title: "", body: "" }])} className={chip}>
              + Your own
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function QuizField({ field, value, onChange }: FieldProps<"quiz">) {
  const items = Array.isArray(value) ? (value as QuizQuestion[]) : [];
  const blank = (q = ""): QuizQuestion => ({ q, options: Array.from({ length: field.options }, () => ""), answer: 0 });
  const set = (i: number, patch: Partial<QuizQuestion>) => onChange(items.map((q, j) => (j === i ? { ...q, ...patch } : q)));
  const unused = field.suggestions.filter((t) => !items.some((q) => q.q === t));
  return (
    <div className="flex flex-col gap-3">
      {items.map((q, i) => (
        <div key={i} className="glass anim-rise flex flex-col gap-2 rounded-[20px] p-3">
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-extrabold text-gold">Q{i + 1}</span>
            <input aria-label={`Question ${i + 1}`} value={q.q} maxLength={120} placeholder="Ask something only they'd know" onChange={(e) => set(i, { q: e.target.value })} className="min-w-0 flex-1 rounded-xl border border-glass-line bg-field px-3 py-2 outline-none" />
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} aria-label={`Remove question ${i + 1}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted">
              <CloseIcon size={16} />
            </button>
          </div>
          {q.options.map((o, k) => (
            <div key={k} className="flex items-center gap-2 pl-7">
              <button type="button" onClick={() => set(i, { answer: k })} aria-label={`Mark answer ${k + 1} as right`} aria-pressed={q.answer === k} className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-xs font-extrabold ${q.answer === k ? "btn-cta border-transparent" : "border-sec-line bg-sec text-muted"}`}>
                {q.answer === k ? "✓" : String.fromCharCode(65 + k)}
              </button>
              <input aria-label={`Answer ${k + 1} for question ${i + 1}`} value={o} maxLength={60} placeholder={q.answer === k ? "The right answer" : "A wrong answer"} onChange={(e) => set(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} className="min-w-0 flex-1 rounded-xl border border-glass-line bg-field px-3 py-2 text-[15px] outline-none" />
            </div>
          ))}
        </div>
      ))}
      {items.length < field.max && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-bold text-muted">Add a question · {items.length} of {field.max} · tap the circle to mark the right answer</p>
          <div className="flex flex-wrap gap-2">
            {unused.slice(0, 5).map((t) => (
              <button key={t} type="button" onClick={() => onChange([...items, blank(t)])} className={chip}>
                + {t}
              </button>
            ))}
            <button type="button" onClick={() => onChange([...items, blank()])} className={chip}>
              + Your own
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatField({ field, value, onChange, ctx }: FieldProps<"chat">) {
  const lines = Array.isArray(value) ? (value as ChatLine[]) : [];
  const [from, setFrom] = useState<ChatLine["from"]>("you");
  const [text, setText] = useState("");
  const add = () => {
    if (!text.trim() || lines.length >= field.max) return;
    onChange([...lines, { from, text: text.trim() }]);
    setText("");
    setFrom(from === "you" ? "them" : "you");
  };
  return (
    <div className="flex flex-col gap-3">
      <div className="glass flex min-h-40 flex-col gap-1.5 rounded-[22px] p-3">
        {lines.length === 0 && <p className="m-auto text-center text-sm text-muted">Your conversation shows up here, the way they&apos;ll see it.</p>}
        {lines.map((l, i) => (
          <div key={i} className={`group flex items-center gap-1.5 ${l.from === "them" ? "flex-row-reverse" : ""}`}>
            <p className={`max-w-[78%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-[15px] ${l.from === "them" ? "rounded-br-md bg-[var(--cta)] text-[var(--on-cta)]" : "rounded-bl-md bg-cell"}`}>{l.text}</p>
            <button type="button" onClick={() => onChange(lines.filter((_, j) => j !== i))} aria-label={`Remove message ${i + 1}`} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted">
              <CloseIcon size={13} />
            </button>
          </div>
        ))}
      </div>
      {lines.length < field.max && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {(["you", "them"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={from === f} onClick={() => setFrom(f)} className={`h-10 flex-1 rounded-full border text-sm font-bold ${from === f ? "btn-cta border-transparent" : "border-sec-line bg-sec"}`}>
                {f === "you" ? `${ctx.you} said` : `${ctx.them} said`}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input aria-label="Message" value={text} maxLength={field.maxLength} placeholder="Type a message…" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} className={inputCls} />
            <button type="button" onClick={add} disabled={!text.trim()} aria-label="Add message" className="btn-cta flex h-[50px] w-[50px] shrink-0 items-center justify-center rounded-2xl disabled:opacity-45">
              <PlusIcon size={20} />
            </button>
          </div>
          <p className="text-xs text-muted">
            {lines.length} of {field.max} · they&apos;ll see their own messages on the right, like on their phone
          </p>
        </div>
      )}
    </div>
  );
}

export function DaysField({ field, value, onChange, ctx }: FieldProps<"days">) {
  const map = value && typeof value === "object" ? (value as Record<string, string>) : {};
  return (
    <div className="flex flex-col gap-3">
      {field.days.map((d) => {
        const ideas = field.suggestions[d.id] ?? [];
        return (
          <div key={d.id} className="glass flex flex-col gap-2 rounded-[20px] p-3">
            <label htmlFor={`day-${d.id}`} className="font-hand text-2xl text-gold">
              {d.title}
            </label>
            <textarea id={`day-${d.id}`} rows={3} value={map[d.id] ?? ""} maxLength={field.maxLength} placeholder="A few words for this day…" onChange={(e) => onChange({ ...map, [d.id]: e.target.value })} className="w-full resize-none rounded-xl border border-glass-line bg-field px-3 py-2.5 font-hand text-[20px] outline-none" />
            {!map[d.id] && ideas.length > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {ideas.map((t) => (
                  <button key={t} type="button" onClick={() => onChange({ ...map, [d.id]: fill(t, ctx) })} className={`${chip} max-w-[260px] truncate`}>
                    {fill(t, ctx)}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function DateField({ field, value, onChange }: FieldProps<"date">) {
  return (
    <div>
      <Label htmlFor={`f-${field.id}`}>{field.label}</Label>
      <input id={`f-${field.id}`} type="date" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value)} className={inputCls} />
      {field.hint && <p className="mt-2 text-sm text-muted">{field.hint}</p>}
    </div>
  );
}

export function FieldInput(props: { field: Field; value: unknown; onChange: (v: unknown) => void; ctx: Ctx }) {
  const { field } = props;
  switch (field.kind) {
    case "choice":
      return <ChoiceField {...props} field={field} />;
    case "number":
      return <NumberField {...props} field={field} />;
    case "text":
      return <TextField {...props} field={field} />;
    case "lines":
      return <LinesField {...props} field={field} />;
    case "letter":
      return <LetterField {...props} field={field} />;
    case "photos":
      return <PhotosField {...props} field={field} />;
    case "voice":
      return <VoiceField {...props} field={field} />;
    case "pairs":
      return <PairsField {...props} field={field} />;
    case "quiz":
      return <QuizField {...props} field={field} />;
    case "chat":
      return <ChatField {...props} field={field} />;
    case "days":
      return <DaysField {...props} field={field} />;
    case "date":
      return <DateField {...props} field={field} />;
  }
}
