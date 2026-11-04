import type { TemplateDefinition } from "./types";

export const quiz: TemplateDefinition = {
  slug: "know-me-quiz",
  name: "How Well Do You Know Me",
  occasion: "fun",
  tagline: "A playful quiz about you, with a letter waiting at the end.",
  forGroups: ["partner", "family", "friends"],
  priceInr: 79,
  steps: [
    {
      id: "questions",
      title: "Quiz them on you",
      subtitle: "Three answers each; tap the circle to mark the right one. Wrong answers get a cheeky reply.",
      fields: [
        {
          id: "questions",
          kind: "quiz",
          label: "Questions",
          min: 3,
          max: 8,
          options: 3,
          suggestions: ["What's my comfort food?", "Where did we first meet?", "What's my most-played song?", "What scares me the most?", "My dream holiday?", "What do I order at every café?"],
        },
      ],
    },
    {
      id: "letter",
      title: "The note after the quiz",
      subtitle: "Whatever their score, this is what they read last.",
      fields: [
        {
          id: "letter",
          kind: "letter",
          label: "Letter",
          maxLength: 600,
          suggestions: {
            partner: { en: ["Score aside, {them}, nobody knows me like you do…"], hinglish: ["Score jo bhi ho {them}, mujhe tumse better koi nahi jaanta…"] },
            family: { en: ["However many you got right, {them}, you know the real me…"], hinglish: ["Kitne bhi sahi hue hon {them}, asli mujhe aap hi jaante ho…"] },
            friends: { en: ["Okay {them}, you passed. Obviously. Here's the real thing…"], hinglish: ["Theek hai {them}, pass ho gaya tu. Ab asli baat…"] },
          },
        },
      ],
    },
  ],
};
