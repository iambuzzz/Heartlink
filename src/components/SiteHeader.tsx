import Link from "next/link";
import { HeartIcon } from "./Icons";
import { ThemeToggle } from "./ThemeToggle";

export function Wordmark() {
  return (
    <Link href="/" className="flex items-center gap-2 no-underline">
      <span className="anim-beat" style={{ color: "var(--mark)", filter: "drop-shadow(0 0 6px var(--mark-glow))" }}>
        <HeartIcon size={22} />
      </span>
      <span className="font-display text-[21px] font-medium tracking-tight">heartlink</span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-[22px] pt-[18px]">
      <Wordmark />
      <div className="flex items-center gap-2">
        <Link href="/gifts" className="h-11 items-center px-2 text-sm font-extrabold no-underline inline-flex">
          My gifts
        </Link>
        <Link href="/create/birthday" className="btn-sec hidden h-11 items-center rounded-full px-5 text-sm font-extrabold no-underline sm:inline-flex">
          Make a gift
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
