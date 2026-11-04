import type { GiftContent } from "./templates/types";

// Example gifts for the "see a sample" pages, one per template.
export const SAMPLES: Record<string, GiftContent> = {
  birthday: {
    relation: "sister",
    them: "Didi",
    you: "Aarav",
    lang: "en",
    values: {
      cake: "mango",
      age: 24,
      reasons: ["You still save me the last bite, every single time", "You fought Papa so I could go on that school trip", "Your 2 a.m. advice is better than any therapist", "You made our home loud and happy"],
      photos: [],
      letter:
        "Happy birthday, Didi.\n\nI never say it, so here it is: you're the reason I turned out okay. Thank you for every secret you kept, every fight you took for me, and every time you pretended my jokes were funny.\n\nThis year, let me take care of you for a change.",
    },
  },
  "open-when": {
    relation: "girlfriend",
    them: "Meher",
    you: "Kabir",
    lang: "en",
    values: {
      letters: [
        { title: "you miss me", body: "Look at the moon tonight. I'm looking at it too, from 1,400 km away, and thinking about your laugh.\n\nSix weeks. Then I'm not letting go." },
        { title: "you can't sleep", body: "Put on our playlist, the one with the bad Bollywood remixes. Track 4. Close your eyes. I'm humming along, badly." },
        { title: "you've had a bad day", body: "Whatever happened today doesn't get to keep you. You're the strongest person I know. Order the biryani. I'm paying." },
        { title: "you need a laugh", body: "Remember when I fell into the fountain at your cousin's wedding? Your mom still sends me that video." },
      ],
    },
  },
  "know-me-quiz": {
    relation: "bestie",
    them: "Riya",
    you: "Tanvi",
    lang: "en",
    values: {
      questions: [
        { q: "What do I order at every café?", options: ["Cold coffee", "Masala chai", "Hot chocolate"], answer: 2 },
        { q: "My most-played song this year?", options: ["Kesariya", "Espresso", "Tum Se Hi"], answer: 0 },
        { q: "What scares me the most?", options: ["Lizards", "Exams", "Silence after I send a long text"], answer: 2 },
      ],
      letter: "Okay Riya, whatever your score, you're stuck with me. Eleven years of chai, chaos and terrible decisions, and I'd sign up for all of it again.",
    },
  },
  "chat-replay": {
    relation: "wife",
    them: "Ananya",
    you: "Rohan",
    lang: "en",
    values: {
      title: "12 March 2019, 11:48 pm",
      messages: [
        { from: "you", text: "hey, you left your umbrella at the café" },
        { from: "them", text: "omg thank you!! I'll pick it up tomorrow?" },
        { from: "you", text: "or I could bring it over a coffee" },
        { from: "them", text: "smooth. very smooth." },
        { from: "them", text: "ok fine. 5 pm?" },
        { from: "you", text: "it's a date. for the umbrella." },
      ],
      ps: "Five years later, I still have the umbrella. And you.",
    },
  },
  "pinky-promise": {
    relation: "friend",
    them: "Ishaan",
    you: "Dev",
    lang: "en",
    values: {
      promises: ["I'll pick up at 2 a.m., no questions", "Your secrets die with me", "Goa happens this year, for real this time", "I'll never let you text her when you're sad"],
      note: "Hold me to every single one.",
    },
  },
  "valentine-week": {
    relation: "boyfriend",
    them: "Arjun",
    you: "Sana",
    lang: "en",
    values: {
      start: "2027-02-07",
      days: {
        rose: "A rose for every time you made an ordinary day feel like this.",
        propose: "I'd ask you again, every single day. Will you?",
        chocolate: "You're sweeter than this, but here's chocolate anyway.",
        teddy: "For the nights I'm not there to hold you.",
        promise: "I promise to choose you, on the easy days and the hard ones.",
        hug: "Close your eyes. That's me, holding on a little longer.",
        kiss: "One for your forehead, one for every worry.",
        valentine: "Happy Valentine's Day, Arjun. It's always been you.",
      },
    },
  },
};
