"use client";

export function PrintButton() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-cta h-12 rounded-full px-7 font-extrabold">
      Print the tag
    </button>
  );
}
