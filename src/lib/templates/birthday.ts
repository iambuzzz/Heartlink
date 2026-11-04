import type { TemplateDefinition } from "./types";

export const birthday: TemplateDefinition = {
  slug: "birthday",
  name: "Birthday",
  occasion: "birthday",
  tagline: "Candles to blow, fireflies to catch, a letter at 12.",
  forGroups: ["partner", "family", "friends", "group"],
  priceInr: 99,
  steps: [
    {
      id: "cake",
      title: "Pick the cake",
      subtitle: "{them} gets to light it, make a wish and cut it.",
      fields: [
        {
          id: "cake",
          kind: "choice",
          label: "Cake",
          required: true,
          options: [
            { value: "chocolate", label: "Chocolate", note: "Rich and classic" },
            { value: "strawberry", label: "Strawberry", note: "Pink and playful" },
            { value: "mango", label: "Mango", note: "Summer in a slice" },
          ],
        },
        { id: "age", kind: "number", label: "Turning (optional)", placeholder: "e.g. 25", min: 1, max: 120, required: false },
      ],
    },
    {
      id: "fireflies",
      title: "Light up the fireflies",
      subtitle: "Each firefly carries one thing you love about {them}. They'll catch them one by one.",
      fields: [
        {
          id: "reasons",
          kind: "lines",
          label: "Reasons",
          min: 3,
          max: 6,
          maxLength: 120,
          suggestions: {
            partner: {
              en: [
                "You laugh at my worst jokes like they're good",
                "Ordinary Tuesdays feel like plans with you",
                "You remember the small things I forget I said",
                "You're my favourite person to do nothing with",
              ],
              hinglish: [
                "Tumhare saath boring din bhi mast lagte hain",
                "Meri bakwaas jokes pe bhi tum hasti ho",
                "Choti choti baatein yaad rakhna sirf tumhe aata hai",
                "Kuch na karna bhi tumhare saath best lagta hai",
              ],
            },
            family: {
              en: [
                "You never once made me feel alone",
                "Your food still fixes every bad day",
                "You taught me how to be kind without saying it",
                "Home is wherever you are",
              ],
              hinglish: [
                "Aapke haath ka khana har mood theek kar deta hai",
                "Aapne kabhi akela feel nahi hone diya",
                "Bina bole sab samajh jaate ho",
                "Ghar wahi hai jahan aap ho",
              ],
            },
            friends: {
              en: [
                "You show up, every single time",
                "Nobody else gets my 2 a.m. voice notes",
                "You've seen my worst phase and stayed",
                "Every plan is better with you in it",
              ],
              hinglish: [
                "Har baar bina bulaye bhi aa jaata hai tu",
                "2 baje ke voice notes sirf tu sunta hai",
                "Mera worst phase dekha aur phir bhi ruka",
                "Tere bina har plan adhoora hai",
              ],
            },
          },
        },
      ],
    },
    {
      id: "memories",
      title: "Add your memories",
      subtitle: "Up to 6 photos, with a short note under each.",
      fields: [{ id: "photos", kind: "photos", label: "Photos", max: 6, captions: true, addAfterPayment: true }],
    },
    {
      id: "letter",
      title: "End with a letter",
      subtitle: "The part they'll read twice.",
      fields: [
        {
          id: "letter",
          kind: "letter",
          label: "Letter",
          maxLength: 800,
          suggestions: {
            partner: {
              en: ["Happy birthday, {them}. I tried to keep this short, but there's too much I want to say…"],
              hinglish: ["Happy birthday {them}. Socha tha chhota sa likhunga, par itna kuch kehna hai…"],
            },
            family: {
              en: ["Happy birthday, {them}. I don't say it enough, so I'm writing it down this time…"],
              hinglish: ["Happy birthday {them}. Kabhi bol nahi paata, isliye aaj likh raha hoon…"],
            },
            friends: {
              en: ["Happy birthday, {them}. Another year of you putting up with me…"],
              hinglish: ["Happy birthday {them}. Ek aur saal tune mujhe jhela, thank you…"],
            },
          },
        },
        {
          id: "secret",
          kind: "text",
          label: "Secret note (optional)",
          hint: "Tiny fireflies hide on every screen. This only appears if they find them all.",
          placeholder: "e.g. Check under your pillow…",
          maxLength: 140,
          required: false,
        },
      ],
    },
    {
      id: "voice",
      title: "Say it in your voice",
      subtitle: "Optional, and the part most people replay. {them} opens a jar of fireflies and hears you.",
      fields: [{ id: "voice", kind: "voice", label: "Voice note", maxSeconds: 60, hint: "Even ten seconds of \"Happy birthday, {them}\" in your own voice is enough." }],
    },
  ],
};
