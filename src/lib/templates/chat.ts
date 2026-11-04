import type { TemplateDefinition } from "./types";

export const chat: TemplateDefinition = {
  slug: "chat-replay",
  name: "Chat Replay",
  occasion: "anniversary",
  tagline: "Your first conversation, replayed bubble by bubble.",
  forGroups: ["partner", "friends"],
  priceInr: 99,
  steps: [
    {
      id: "chat",
      title: "Bring back the chat",
      subtitle: "Your first conversation, the night everything changed, or the silliest one. Copy it from your phone, line by line.",
      fields: [
        { id: "title", kind: "text", label: "When was this? (optional)", placeholder: "e.g. 12 March 2021, 11:48 pm", maxLength: 40, required: false },
        { id: "messages", kind: "chat", label: "Messages", min: 3, max: 40, maxLength: 300 },
      ],
    },
    {
      id: "ps",
      title: "And now?",
      subtitle: "One last message, from you today.",
      fields: [{ id: "ps", kind: "text", label: "Today's message", placeholder: "e.g. Still the best text I ever got.", maxLength: 200, required: true }],
    },
  ],
};
