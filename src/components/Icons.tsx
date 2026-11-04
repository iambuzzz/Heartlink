import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

const stroke = (d: string) =>
  function StrokeIcon({ size = 20, ...props }: IconProps) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
        <path d={d} />
      </svg>
    );
  };

export function HeartIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 20.5s-8-4.9-8-10.9A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8 2.8c0 6-8 10.9-8 10.9z" />
    </svg>
  );
}

export function PlayIcon({ size = 14, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z" />
    </svg>
  );
}

export const PlusIcon = stroke("M12 5v14M5 12h14");
export const LockIcon = stroke("M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3");
export const ReplyIcon = stroke("M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11");
export const ArrowRightIcon = stroke("M5 12h14M13 6l6 6-6 6");
export const ArrowLeftIcon = stroke("M19 12H5M11 6l-6 6 6 6");
export const CloseIcon = stroke("M6 6l12 12M18 6 6 18");
export const ChevronLeftIcon = stroke("M15 5l-7 7 7 7");
export const ChevronRightIcon = stroke("M9 5l7 7-7 7");
export const MinusIcon = stroke("M5 12h14");
export const PlaneIcon = stroke("M21.5 2.5 2.5 10.2l7.2 2.8 2.8 7.5z M21.5 2.5 9.7 13");
export const PhotoIcon = stroke("M3.5 5h17v14h-17zM9 10a1.6 1.6 0 1 0 0 .01M20.5 15.5 15.5 11 7 19");
export const SunIcon = stroke("M12 4V2M12 22v-2M4 12H2M22 12h-2M5.6 5.6 4.2 4.2M19.8 19.8l-1.4-1.4M5.6 18.4l-1.4 1.4M19.8 4.2l-1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10z");
export const MoonIcon = stroke("M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z");
export const MicIcon = stroke("M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3");
export const SpeakerIcon = stroke("M4 9.5h3.5L12 5.5v13l-4.5-4H4z M16 9.2a4 4 0 0 1 0 5.6 M18.6 6.6a7.6 7.6 0 0 1 0 10.8");
export const SpeakerOffIcon = stroke("M4 9.5h3.5L12 5.5v13l-4.5-4H4z M16.5 9.5l5 5 M21.5 9.5l-5 5");
export const ReplayIcon = stroke("M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4");
export const GroupIcon = stroke(
  "M9.5 7.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0 M3 9.6a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M17 9.6a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M7 19.5c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2 M2.4 17.8c0-2.1 1.4-3.7 3.4-3.7 M21.6 17.8c0-2.1-1.4-3.7-3.4-3.7",
);

export const RELATION_GROUP_ICONS = {
  partner: stroke("M12 20s-7.5-4.6-7.5-10.2A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.5 2.5C19.5 15.4 12 20 12 20z"),
  family: stroke("M4 11 12 4.5 20 11v8.2a.8.8 0 0 1-.8.8H4.8a.8.8 0 0 1-.8-.8z M12 17.2s-2.8-1.7-2.8-3.6a1.4 1.4 0 0 1 2.8-.5 1.4 1.4 0 0 1 2.8.5c0 1.9-2.8 3.6-2.8 3.6z"),
  siblings: stroke("M5.5 8.5a2.8 2.8 0 1 0 5.6 0a2.8 2.8 0 1 0-5.6 0 M2.8 19.5c0-3.1 2.4-5.4 5.5-5.4s5.5 2.3 5.5 5.4 M14.6 9.3a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0-4.4 0 M15.2 14.4c3-.6 6 1.4 6 4.8"),
  friends: stroke("M3 12a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0 M10.6 12a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0-10.4 0"),
  kids: stroke("M12 3.2c3.1 0 5.4 2.4 5.4 5.6 0 3.6-2.8 6.4-5.4 6.9-2.6-.5-5.4-3.3-5.4-6.9 0-3.2 2.3-5.6 5.4-5.6z M10.9 15.7h2.2L12 17.1z M12 17.1c-1.2 1.6 1.1 2.6 0 4.6"),
  group: GroupIcon,
};
