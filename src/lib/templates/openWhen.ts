import type { TemplateDefinition } from "./types";

export const openWhen: TemplateDefinition = {
  slug: "open-when",
  name: "Open When",
  occasion: "missYou",
  tagline: "Sealed letters for the moments you can't be there.",
  forGroups: ["partner", "family", "friends"],
  priceInr: 99,
  steps: [
    {
      id: "letters",
      title: "Write the letters",
      subtitle: "Each one waits sealed until {them} needs it. Long distance, exams, a new city: they'll keep coming back.",
      fields: [
        {
          id: "letters",
          kind: "pairs",
          label: "Letters",
          min: 3,
          max: 8,
          prefix: "Open when",
          titleMax: 40,
          bodyMax: 600,
          titles: ["you miss me", "you can't sleep", "you've had a bad day", "you need a laugh", "we've had a fight", "you're proud of yourself", "it's raining", "you doubt yourself"],
        },
      ],
    },
  ],
};
