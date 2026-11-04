"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useDraft } from "@/lib/draft";
import { GROUP_LABELS, NAME_HINTS, RELATION_LABELS } from "@/lib/relations";
import { checkField, getTemplate } from "@/lib/templates";
import { fill, RELATIONS, type Lang, type RelationGroup } from "@/lib/templates/types";
import { ArrowLeftIcon, ArrowRightIcon, CloseIcon, HeartIcon } from "../Icons";
import { FieldInput, inputCls, Label } from "./fields";

const GROUPS: RelationGroup[] = ["partner", "family", "friends", "group"];

export function Builder({ slug, initialGroup }: { slug: string; initialGroup?: RelationGroup }) {
  const template = getTemplate(slug)!;
  const router = useRouter();
  const { draft, ready, storageFull, update, setValue } = useDraft(slug, initialGroup);

  const total = 2 + template.steps.length;
  const step = Math.min(draft.step, total - 1);
  const ctx = { them: draft.them.trim() || "them", you: draft.you.trim() || "you", relation: draft.relation ?? "friend", lang: draft.lang };
  const templateStep = step >= 2 ? template.steps[step - 2] : null;

  const stepTitle = step === 0 ? "Who it's for" : step === 1 ? "About them" : templateStep!.title;
  const canContinue =
    step === 0
      ? !!draft.relation
      : step === 1
        ? !!draft.them.trim() && !!draft.you.trim()
        : templateStep!.fields.every((f) => checkField(f, draft.values[f.id]) === null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!ready) return <div className="min-h-dvh" />;

  const go = (n: number) => update({ step: n });
  const isLast = step === total - 1;
  const next = () => (isLast ? router.push(`/create/${slug}/preview`) : go(step + 1));

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-32 pt-4">
      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button type="button" onClick={() => go(step - 1)} aria-label="Back" className="glass flex h-11 w-11 items-center justify-center rounded-[15px]">
            <ArrowLeftIcon size={18} />
          </button>
        ) : (
          <Link href="/" aria-label="Leave" className="glass flex h-11 w-11 items-center justify-center rounded-[15px]">
            <CloseIcon size={18} />
          </Link>
        )}
        <p className="text-[13px] font-bold text-muted">
          Step {step + 1} of {total} · {stepTitle}
        </p>
        <span className="w-11" />
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cell" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step + 1}>
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${((step + 1) / total) * 100}%`, background: "var(--cta)" }} />
      </div>

      <div key={step} className="anim-rise mt-7 flex flex-col gap-6">
        {step === 0 && (
          <>
            <Heading title={`Who is this ${template.name.toLowerCase()} gift for?`} subtitle="We'll shape every word around them." />
            <Link href={`/sample/${slug}`} className="-mt-3 text-sm font-bold text-gold underline underline-offset-4">
              See a finished sample first
            </Link>
            <div>
              <Label>They are your</Label>
              <div className="grid grid-cols-2 gap-2.5">
                {GROUPS.filter((g) => template.forGroups.includes(g)).map((g) => (
                  <button
                    key={g}
                    type="button"
                    aria-pressed={draft.group === g}
                    onClick={() => update({ group: g, relation: g === "group" ? "everyone" : RELATIONS[g].includes(draft.relation!) ? draft.relation : undefined })}
                    className={`glass h-14 rounded-2xl font-bold ${draft.group === g ? "ring-2 ring-[var(--gold-text)]" : ""}`}
                  >
                    {GROUP_LABELS[g]}
                  </button>
                ))}
              </div>
            </div>
            {draft.group && draft.group !== "group" && (
              <div className="anim-rise">
                <Label>Who are they to you?</Label>
                <div className="flex flex-wrap gap-2">
                  {RELATIONS[draft.group].map((r) => (
                    <button
                      key={r}
                      type="button"
                      aria-pressed={draft.relation === r}
                      onClick={() => update({ relation: r })}
                      className={`h-11 rounded-full border px-4 text-[15px] font-bold ${draft.relation === r ? "btn-cta border-transparent" : "border-sec-line bg-sec"}`}
                    >
                      {RELATION_LABELS[r]}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {draft.group === "group" && (
              <p className="glass anim-rise rounded-2xl p-4 text-sm leading-relaxed text-muted">
                Soon, everyone will be able to add their own photo and note through a shared link. For now, you can make it from all of you.
              </p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Heading title="What do you call them?" subtitle="The little name only you use works best." />
            <div>
              <Label htmlFor="them">Their name</Label>
              <input id="them" value={draft.them} maxLength={40} placeholder={(draft.relation && NAME_HINTS[draft.relation]) || "Their name"} onChange={(e) => update({ them: e.target.value })} className={inputCls} />
            </div>
            <div>
              <Label htmlFor="you">From</Label>
              <input id="you" value={draft.you} maxLength={60} placeholder={draft.group === "group" ? "e.g. Your whole family" : "Your name"} onChange={(e) => update({ you: e.target.value })} className={inputCls} />
            </div>
            <div>
              <Label>Write suggestions in</Label>
              <div className="flex gap-2">
                {(["en", "hinglish"] as Lang[]).map((l) => (
                  <button key={l} type="button" aria-pressed={draft.lang === l} onClick={() => update({ lang: l })} className={`h-11 rounded-full border px-5 font-bold ${draft.lang === l ? "btn-cta border-transparent" : "border-sec-line bg-sec"}`}>
                    {l === "en" ? "English" : "Hinglish"}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {templateStep && (
          <>
            <Heading title={fill(templateStep.title, ctx)} subtitle={templateStep.subtitle && fill(templateStep.subtitle, ctx)} />
            {templateStep.fields.map((f) => (
              <FieldInput key={f.id} field={f} value={draft.values[f.id]} onChange={(v) => setValue(f.id, v)} ctx={ctx} />
            ))}
            {templateStep.fields.some((f) => f.kind === "photos" && f.addAfterPayment) && (
              <p className="text-center text-sm text-muted">You can also add or change photos after you pay.</p>
            )}
          </>
        )}

        {storageFull && <p className="rounded-2xl bg-cell p-3 text-sm font-bold text-heart">Your browser is out of space for this draft. Remove a photo or two so nothing gets lost.</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 px-5 pb-5 pt-3" style={{ background: "linear-gradient(transparent, var(--bg-solid) 40%)" }}>
        <div className="mx-auto max-w-md">
          <button type="button" disabled={!canContinue} onClick={next} className="btn-cta flex h-14 w-full items-center justify-center gap-2.5 rounded-full text-base font-extrabold disabled:opacity-45">
            {isLast ? (
              <>
                <span className="anim-beat">
                  <HeartIcon size={18} />
                </span>
                Bring it to life
              </>
            ) : (
              <>
                Continue
                <ArrowRightIcon size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function Heading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h1 className="font-display text-[28px] font-light leading-tight tracking-[-0.015em]">{title}</h1>
      {subtitle && <p className="mt-2 text-[15px] leading-relaxed text-muted">{subtitle}</p>}
    </div>
  );
}
