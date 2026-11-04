import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { GroupIcon, HeartIcon, LockIcon, PhotoIcon, PlayIcon, PlusIcon, RELATION_GROUP_ICONS, ReplyIcon } from "@/components/Icons";
import { FireflyHeart, Meadow, MemoryJar, vars } from "@/components/scenery";
import { SiteHeader } from "@/components/SiteHeader";

const WHO = [
  { label: "Partner", icon: RELATION_GROUP_ICONS.partner, for: "partner" },
  { label: "Maa & Papa", icon: RELATION_GROUP_ICONS.family, for: "family" },
  { label: "Siblings", icon: RELATION_GROUP_ICONS.siblings, for: "family" },
  { label: "Best friend", icon: RELATION_GROUP_ICONS.friends, for: "friends" },
  { label: "Kids", icon: RELATION_GROUP_ICONS.kids, for: "family" },
  { label: "Everyone together", icon: RELATION_GROUP_ICONS.group, for: "group" },
];

const MOMENTS = [
  { title: "Birthday", tag: "Midnight wish", line: "Candles, wishes, a letter at 12.", href: "/create/birthday" },
  { title: "Open When", tag: "Far apart", line: "Sealed letters for the moments you can't be there.", href: "/create/open-when" },
  { title: "Valentine's Week", tag: "7–14 Feb", line: "A new surprise every midnight, Rose Day to the 14th.", href: "/create/valentine-week" },
  { title: "Chat Replay", tag: "Anniversary", line: "Your first conversation, bubble by bubble.", href: "/create/chat-replay" },
  { title: "Know-me Quiz", tag: "Just for fun", line: "How well do they really know you?", href: "/create/know-me-quiz" },
  { title: "Pinky Promise", tag: "Promises", line: "Hook pinkies, then read every promise.", href: "/create/pinky-promise" },
  { title: "I'm sorry", tag: "Soft words", line: "Say it gently. Mean every word." },
  { title: "Proposal", tag: "The big ask", line: "One question, lit up for a yes." },
];

const AVATARS = [
  { i: "R", tint: "rgba(240,170,110,0.35)" },
  { i: "K", tint: "rgba(150,200,140,0.35)" },
  { i: "M", tint: "rgba(240,200,110,0.4)" },
  { i: "A", tint: "rgba(200,160,220,0.3)" },
  { i: "+3", tint: "transparent" },
];

const eyebrow = "text-[11.5px] font-extrabold uppercase leading-4 tracking-[0.14em] text-gold";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] mx-auto w-full max-w-5xl">
        <section className="flex flex-col items-center px-[26px] pt-1 text-center">
          <FireflyHeart />
          <h1 className="max-w-[640px] font-display text-[33px] font-light leading-[1.14] tracking-[-0.015em] md:text-5xl">
            Catch every <span className="text-shine font-medium">little light</span> they ever gave you.
          </h1>
          <p className="mt-3 max-w-[460px] text-[15.5px] leading-[1.55] text-muted md:text-lg">
            Photos, little notes and voice messages, gathered into a glowing garden they open from one private link.
          </p>
          <Link href="/create/birthday" className="btn-cta mt-[22px] inline-flex h-14 min-w-[248px] items-center justify-center gap-2.5 rounded-full px-7 text-base font-extrabold no-underline">
            <span className="anim-beat">
              <HeartIcon size={18} />
            </span>
            Make their gift
          </Link>
          <Link href="/sample" className="btn-sec mt-2.5 inline-flex h-12 items-center gap-2.5 rounded-full py-0 pl-2 pr-5 text-[15px] font-bold no-underline">
            <span className="icon-bubble flex h-8 w-8 items-center justify-center rounded-full">
              <PlayIcon />
            </span>
            See a sample gift
          </Link>
        </section>

        <Meadow className="-mt-0.5" />

        <section className="px-[22px] pt-4">
          <p className={eyebrow}>For your people</p>
          <h2 className="mt-1 font-display text-[22px] font-normal tracking-[-0.01em] md:text-[28px]">Who are you lighting up?</h2>
          <div className="mt-3.5 grid grid-cols-3 gap-2.5 md:grid-cols-6">
            {WHO.map((w, i) => (
              <Link
                key={w.label}
                href={`/create/birthday?for=${w.for}`}
                className="glass shine flex h-[88px] flex-col items-center justify-center gap-1.5 rounded-[20px] px-1.5 py-2 no-underline"
                style={vars({ "--sd": `${i * 0.6}s` })}
              >
                <span className="icon-bubble flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
                  <w.icon size={20} strokeWidth={1.6} />
                </span>
                <span className="text-center text-[12.5px] font-bold leading-tight">{w.label}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="pt-[26px]">
          <div className="px-[22px]">
            <p className={eyebrow}>For every feeling</p>
            <h2 className="mt-1 font-display text-[22px] font-normal tracking-[-0.01em] md:text-[28px]">Moments worth a glow</h2>
          </div>
          <div className="no-scrollbar -mb-4 mt-2 flex snap-x scroll-px-[22px] gap-3 overflow-x-auto px-[22px] pb-4 pt-1.5 md:grid md:grid-cols-4 md:overflow-visible">
            {MOMENTS.map((m, i) => {
              const card = (
                <>
                  <span className="photo-fill relative flex h-24 items-end overflow-hidden rounded-[14px] px-[9px] py-2">
                    <span className="absolute left-2 top-2 rounded-full bg-tag-bg px-[9px] py-[3px] text-[10.5px] font-extrabold text-tag-ink">{m.tag}</span>
                    <span className="firefly anim-blink absolute right-3.5 top-3.5 h-[5px] w-[5px]" style={{ animationDuration: `${2.6 + i * 0.3}s` }} />
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold">
                      <PhotoIcon size={13} />
                      Photo
                    </span>
                  </span>
                  <span className="mx-1 mt-2.5 flex items-center justify-between font-display text-base font-medium leading-5">
                    {m.title}
                    {!m.href && <span className="font-sans text-[10.5px] font-extrabold uppercase tracking-wider text-gold">Soon</span>}
                  </span>
                  <span className="mx-1 mb-1.5 mt-1 text-[12.5px] leading-[18px] text-muted">{m.line}</span>
                </>
              );
              const cls = "glass shine flex w-[156px] shrink-0 snap-start flex-col rounded-[20px] p-2 no-underline md:w-auto";
              return m.href ? (
                <Link key={m.title} href={m.href} className={cls} style={vars({ "--sd": `${0.4 + i * 0.7}s` })}>
                  {card}
                </Link>
              ) : (
                <div key={m.title} className={cls} style={vars({ "--sd": `${0.4 + i * 0.7}s` })}>
                  {card}
                </div>
              );
            })}
          </div>
        </section>

        <div className="grid gap-3.5 px-[22px] pt-[26px] md:grid-cols-2">
          <section className="glass shine rounded-[26px] p-5" style={vars({ "--sd": "2s" })}>
            <div className="flex items-center gap-3.5">
              <MemoryJar />
              <div className="min-w-0">
                <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                  <GroupIcon size={15} />
                  Group gift
                </p>
                <h2 className="mt-1.5 font-display text-xl font-normal leading-tight">Everyone drops a light in the jar</h2>
                <p className="mt-1.5 text-[13.5px] leading-normal text-muted">Each person adds a photo, a line or a voice note. It all opens together.</p>
              </div>
            </div>
            <div className="mt-3.5 flex items-center justify-between gap-2.5">
              <div className="flex items-center pl-0.5" aria-label="7 people have added to this gift">
                {AVATARS.map((a) => (
                  <span
                    key={a.i}
                    aria-hidden="true"
                    className="-mr-2 flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 text-[12.5px] font-extrabold"
                    style={{ borderColor: "var(--av-ring)", background: `linear-gradient(${a.tint}, ${a.tint}), var(--av-bg)` }}
                  >
                    {a.i}
                  </span>
                ))}
              </div>
              <span className="btn-sec inline-flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-extrabold">
                <PlusIcon size={16} strokeWidth={2} />
                Invite family
              </span>
            </div>
          </section>

          <section className="glass shine rounded-[26px] p-5" style={vars({ "--sd": "4.5s" })}>
            <div className="flex items-center justify-between">
              <p className={`flex items-center gap-1.5 ${eyebrow}`}>
                <LockIcon size={15} />
                Timed unlock
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-glass-line bg-cell px-2.5 py-1 text-[11.5px] font-extrabold text-gold">
                <span className="firefly anim-blink h-1.5 w-1.5" style={{ animationDuration: "2.4s" }} />
                Sealed
              </span>
            </div>
            <h2 className="mt-2 font-display text-[19px] font-normal leading-tight">Opens at midnight, on the day</h2>
            <div className="mt-3.5">
              <Countdown />
            </div>
            <div className="my-4 h-px bg-divider" />
            <p className={`flex items-center gap-1.5 ${eyebrow}`}>
              <ReplyIcon size={15} />
              They can reply back
            </p>
            <div className="mt-2.5 flex items-end gap-2.5">
              <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border-2 text-[12.5px] font-extrabold" style={{ borderColor: "var(--av-ring)", background: "linear-gradient(rgba(240,170,110,0.35), rgba(240,170,110,0.35)), var(--av-bg)" }}>
                D
              </span>
              <div className="relative flex-1 rounded-[18px_18px_18px_6px] border border-glass-line bg-bubble px-3.5 pb-[11px] pt-2.5">
                <p className="font-hand text-[19px] leading-tight">Pagal, I cried at the mango tree photo. Love you too, Bhaiya.</p>
                <span className="anim-beat absolute -bottom-2 -right-1.5 h-6 w-6 items-center justify-center rounded-full border border-glass-line bg-cell text-heart">
                  <HeartIcon size={13} />
                </span>
              </div>
            </div>
          </section>
        </div>

        <footer className="flex items-center justify-center gap-2 px-[22px] pb-6 pt-8 text-[13.5px] font-semibold text-muted">
          <span className="anim-beat text-heart">
            <HeartIcon size={14} />
          </span>
          <span>
            Free to make · pay from <strong className="font-extrabold text-ink">₹99</strong> when you send
          </span>
        </footer>
      </main>
    </>
  );
}
