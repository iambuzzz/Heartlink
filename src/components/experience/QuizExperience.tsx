"use client";

import { useState } from "react";
import { sound } from "@/lib/sound";
import type { GiftContent, QuizQuestion } from "@/lib/templates/types";
import { FireflyHeart } from "../scenery";
import { Letter } from "./Letter";
import { Story } from "./Story";

const WRONG = {
  en: ["Wrong! We'll pretend that didn't happen.", "Hmm. Are we even friends?", "Nope. Try paying more attention to me.", "Close… but not even a little.", "I'm telling everyone you got this wrong."],
  hinglish: ["Galat! Chalo, maaf kiya.", "Sach mein? Itna bhi nahi pata?", "Nahi yaar. Dhyaan kahan rehta hai?", "Arre! Ye toh basic tha.", "Ye sabko bataunga main."],
};
const RIGHT = {
  en: ["Obviously.", "Of course you knew.", "Nailed it.", "That's my person.", "Too easy for you."],
  hinglish: ["Bilkul sahi!", "Mujhe pata tha tumhe pata hoga.", "Ekdum perfect.", "Yahi toh baat hai.", "Bahut aasaan tha tumhare liye."],
};

export function QuizExperience({ content, preview = false, slug }: { content: GiftContent; preview?: boolean; slug?: string }) {
  const questions = Array.isArray(content.values.questions) ? (content.values.questions as QuizQuestion[]) : [];
  const letter = typeof content.values.letter === "string" ? content.values.letter : "";
  const [score, setScore] = useState(0);
  return (
    <Story
      content={content}
      preview={preview}
      slug={slug}
      scenes={["quiz", "score", "letter"]}
      renderScene={(scene, next, seen) => (
        <>
          {scene === "quiz" && (
            <Quiz
              questions={questions}
              lang={content.lang}
              you={content.you}
              onDone={(s) => {
                setScore(s);
                next();
              }}
            />
          )}
          {scene === "score" && <Score score={score} total={questions.length} you={content.you} them={content.them} onDone={next} />}
          {scene === "letter" && <Letter text={letter} them={content.them} you={content.you} done={seen} onDone={next} />}
        </>
      )}
    />
  );
}

function Quiz({ questions, lang, you, onDone }: { questions: QuizQuestion[]; lang: "en" | "hinglish"; you: string; onDone: (score: number) => void }) {
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const q = questions[i];
  const right = picked !== null && picked === q.answer;
  const lines = picked === null ? null : right ? RIGHT[lang] : WRONG[lang];

  const pick = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) {
      setScore((s) => s + 1);
      sound.chime("catch", score);
    } else {
      sound.chime("found");
      navigator.vibrate?.([30, 40, 30]);
    }
  };
  const advance = () => {
    if (i === questions.length - 1) onDone(score);
    else {
      setI(i + 1);
      setPicked(null);
    }
  };

  return (
    <>
      <p className="text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">
        How well do you know {you}? · {i + 1} of {questions.length}
      </p>
      <h1 key={i} className="anim-rise mt-3 font-display text-[27px] font-light leading-tight">
        {q.q}
      </h1>
      <div key={`o${i}`} className={`mt-6 flex w-full flex-col gap-2.5 ${picked !== null && !right ? "quiz-shake" : ""}`}>
        {q.options.map((o, k) => {
          const isAnswer = picked !== null && k === q.answer;
          const isWrongPick = picked === k && !right;
          return (
            <button
              key={k}
              type="button"
              onClick={() => pick(k)}
              disabled={picked !== null}
              className={`anim-rise flex min-h-14 items-center gap-3 rounded-2xl px-4 py-3 text-left font-bold transition-[transform,background] duration-300 ${isAnswer ? "btn-cta scale-[1.02]" : isWrongPick ? "bg-[var(--heart)] text-white" : "glass"}`}
              style={{ animationDelay: `${k * 0.08}s` }}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current text-xs opacity-70">{String.fromCharCode(65 + k)}</span>
              {o}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex min-h-[96px] flex-col items-center gap-3">
        {lines && (
          <>
            <p className="anim-rise font-hand text-[26px] leading-tight">{lines[(i + score) % lines.length]}</p>
            <button type="button" onClick={advance} className="btn-cta anim-rise h-12 rounded-full px-7 font-extrabold">
              {i === questions.length - 1 ? "See my score" : "Next question"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

function Score({ score, total, you, them, onDone }: { score: number; total: number; you: string; them: string; onDone: () => void }) {
  const ratio = total ? score / total : 0;
  const verdict = ratio === 1 ? `Perfect. Nobody knows ${you} like you do.` : ratio >= 0.6 ? `Pretty good, ${them}. ${you} is impressed.` : ratio > 0 ? `Hmm. ${you} expects a revision session.` : `Zero! ${you} is never letting you forget this.`;
  return (
    <>
      <FireflyHeart label="Your score in fireflies" />
      <p className="mt-2 text-[11.5px] font-extrabold uppercase tracking-[0.14em] text-gold">Your score</p>
      <p className="font-display text-[64px] font-light leading-none tabular-nums">
        {score}
        <span className="text-[32px] text-muted">/{total}</span>
      </p>
      <p className="mt-3 font-hand text-[26px] leading-tight">{verdict}</p>
      <button type="button" onClick={onDone} className="btn-cta mt-8 h-14 rounded-full px-8 font-extrabold">
        Now read this
      </button>
    </>
  );
}
