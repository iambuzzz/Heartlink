"use client";

import { useEffect, useState } from "react";

export function ShareActions({ url, them, templateSlug }: { url: string; them: string; templateSlug: string }) {
  const [copied, setCopied] = useState(false);

  // The gift is now stored server-side; the local draft has done its job.
  useEffect(() => {
    try {
      localStorage.removeItem(`heartlink:draft:${templateSlug}`);
    } catch {}
  }, [templateSlug]);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const message = `${them}, I made something for you. Open it when you have a quiet minute: ${url}`;

  return (
    <div className="mt-6 flex w-full flex-col gap-2.5">
      <div className="glass flex items-center gap-2 rounded-2xl p-2 pl-4">
        <span className="min-w-0 flex-1 truncate text-left text-sm font-bold">{url}</span>
        <button type="button" onClick={copy} className="btn-sec h-11 shrink-0 rounded-xl px-4 text-sm font-extrabold">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" className="btn-cta flex h-14 items-center justify-center rounded-full font-extrabold no-underline">
        Send on WhatsApp
      </a>
    </div>
  );
}
