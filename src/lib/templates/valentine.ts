import type { GiftContent, TemplateDefinition } from "./types";

export const VALENTINE_DAYS = [
  { id: "rose", title: "Rose Day" },
  { id: "propose", title: "Propose Day" },
  { id: "chocolate", title: "Chocolate Day" },
  { id: "teddy", title: "Teddy Day" },
  { id: "promise", title: "Promise Day" },
  { id: "hug", title: "Hug Day" },
  { id: "kiss", title: "Kiss Day" },
  { id: "valentine", title: "Valentine's Day" },
];

export const valentine: TemplateDefinition = {
  slug: "valentine-week",
  name: "Valentine's Week",
  occasion: "valentine",
  tagline: "Eight days, eight surprises. A new one opens every midnight.",
  forGroups: ["partner"],
  priceInr: 199,
  steps: [
    {
      id: "start",
      title: "When does the week begin?",
      subtitle: "Rose Day opens at midnight on this date, then one new day every midnight. Usually 7 February.",
      fields: [{ id: "start", kind: "date", label: "Rose Day", required: true, hint: "India time. Days that haven't arrived stay sealed, even if they peek." }],
    },
    {
      id: "days",
      title: "A note for every day",
      subtitle: "Short is perfect. {them} gets one each midnight.",
      fields: [
        {
          id: "days",
          kind: "days",
          label: "Days",
          days: VALENTINE_DAYS,
          maxLength: 300,
          suggestions: {
            rose: ["A rose for every time you made an ordinary day feel like this.", "Roses are red, and I'm still not over you."],
            propose: ["I'd ask you again, every single day. Will you?", "Will you be mine? Asking again, just to hear it."],
            chocolate: ["You're sweeter than this, but here's chocolate anyway.", "Dairy Milk on me today. Your call which one."],
            teddy: ["For the nights I'm not there to hold you.", "Something soft to hug till I'm back."],
            promise: ["I promise to choose you, on the easy days and the hard ones.", "I promise to never stop trying."],
            hug: ["Close your eyes. That's me, holding on a little longer.", "Consider this a long, tight jhappi."],
            kiss: ["One for your forehead, one for every worry.", "Sealed with one. Collect the rest in person."],
            valentine: ["Happy Valentine's Day, {them}. It's always been you.", "Every day is Valentine's with you, but today I get to say it loudly."],
          },
        },
      ],
    },
  ],
};

const DAY_MS = 24 * 60 * 60 * 1000;

/** Midnight India time on the day the week starts. */
export const valentineStart = (start: string) => Date.parse(`${start}T00:00:00+05:30`);

/** Removes the notes of days that haven't arrived yet, so they never reach the browser early. */
export function lockValentineDays(content: GiftContent, now = Date.now()): GiftContent {
  const start = typeof content.values.start === "string" ? valentineStart(content.values.start) : NaN;
  const days = (content.values.days ?? {}) as Record<string, string>;
  const open: Record<string, string> = {};
  VALENTINE_DAYS.forEach((d, i) => {
    if (Number.isFinite(start) && now >= start + i * DAY_MS) open[d.id] = days[d.id] ?? "";
  });
  return { ...content, values: { ...content.values, days: open } };
}
