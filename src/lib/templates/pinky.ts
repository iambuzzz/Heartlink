import type { TemplateDefinition } from "./types";

export const pinky: TemplateDefinition = {
  slug: "pinky-promise",
  name: "Pinky Promise",
  occasion: "promise",
  tagline: "Hook pinkies, then read every promise, signed and sealed.",
  forGroups: ["partner", "family", "friends", "group"],
  priceInr: 49,
  steps: [
    {
      id: "promises",
      title: "What do you promise?",
      subtitle: "Small and real beats big and vague. {them} will hook pinkies before reading them.",
      fields: [
        {
          id: "promises",
          kind: "lines",
          label: "Promises",
          min: 3,
          max: 7,
          maxLength: 120,
          suggestions: {
            partner: {
              en: ["I'll always save you the last bite", "No phones at dinner, ever", "I'll listen before I try to fix it", "Every fight ends before we sleep"],
              hinglish: ["Last bite hamesha tumhara", "Dinner pe phone band, promise", "Pehle sununga, phir solution dunga", "Ladai kabhi bhi ho, sone se pehle khatam"],
            },
            family: {
              en: ["I'll call every Sunday, no excuses", "I'll eat properly, I swear", "I'll come home for every festival", "I'll tell you when something's wrong"],
              hinglish: ["Har Sunday call karunga, pakka", "Time pe khaana khaunga, promise", "Har tyohaar pe ghar aaunga", "Kuch galat hua toh aapko bataunga"],
            },
            friends: {
              en: ["I'll pick up at 2 a.m., no questions", "Your secrets die with me", "I'll hype you up in every group chat", "Next trip is happening this year"],
              hinglish: ["Raat ke 2 baje bhi phone uthaunga", "Tere secrets mere saath jaayenge", "Har group mein teri tareef karunga", "Is saal trip pakka hai"],
            },
          },
        },
        { id: "note", kind: "text", label: "One last line (optional)", placeholder: "e.g. Hold me to every single one.", maxLength: 160, required: false },
      ],
    },
  ],
};
