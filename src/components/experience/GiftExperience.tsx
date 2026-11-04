"use client";

import type { GiftContent } from "@/lib/templates/types";
import { BirthdayExperience } from "./BirthdayExperience";
import { ChatExperience } from "./ChatExperience";
import { OpenWhenExperience } from "./OpenWhenExperience";
import { PinkyExperience } from "./PinkyExperience";
import { QuizExperience } from "./QuizExperience";
import { ValentineExperience } from "./ValentineExperience";

type Props = { content: GiftContent; preview?: boolean; slug?: string };

const EXPERIENCES: Record<string, (p: Props) => React.ReactNode> = {
  birthday: BirthdayExperience,
  "open-when": OpenWhenExperience,
  "know-me-quiz": QuizExperience,
  "chat-replay": ChatExperience,
  "pinky-promise": PinkyExperience,
  "valentine-week": ValentineExperience,
};

/** Picks the recipient experience for a template. */
export function GiftExperience({ template, ...props }: Props & { template: string }) {
  const Experience = EXPERIENCES[template] ?? BirthdayExperience;
  return <Experience {...props} />;
}
