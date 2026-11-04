import Link from "next/link";
import { FireflyHeart } from "@/components/scenery";

export const metadata = { title: "Nothing here — heartlink", robots: { index: false, follow: false } };

// Also shown for gifts that are paused, so it never blames the person opening the link.
export default function NotFound() {
  return (
    <main className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-6 text-center">
      <div className="w-56 opacity-80">
        <FireflyHeart label="A few fireflies, resting" />
      </div>
      <h1 className="font-display mt-6 text-3xl font-normal">This gift is resting</h1>
      <p className="mt-3 text-muted">The link may be mistyped, or the gift isn&apos;t open right now. Ask the person who sent it to check their link.</p>
      <Link href="/" className="btn-cta mt-8 inline-flex h-12 items-center rounded-full px-6 font-extrabold no-underline">
        Make a gift of your own
      </Link>
    </main>
  );
}
