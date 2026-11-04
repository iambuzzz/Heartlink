import Link from "next/link";
import { notFound } from "next/navigation";
import { GiftExperience } from "@/components/experience/GiftExperience";
import { SAMPLES } from "@/lib/samples";
import { getTemplate } from "@/lib/templates";

export async function generateMetadata({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  return { title: `${getTemplate(template)?.name ?? "Sample"} sample — heartlink` };
}

export default async function TemplateSamplePage({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  const sample = SAMPLES[template];
  if (!sample || !getTemplate(template)) notFound();
  // Start the sample Valentine's week a week ago, so every day is open to look at.
  const content = template === "valentine-week" ? { ...sample, values: { ...sample.values, start: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10) } } : sample;
  return (
    <>
      <div className="relative z-10 mx-auto flex max-w-md items-center justify-between gap-3 px-6 pt-4 text-sm">
        <span className="font-bold text-muted">This is a sample gift</span>
        <Link href={`/create/${template}`} className="btn-sec inline-flex h-10 items-center rounded-full px-4 font-bold no-underline">
          Make your own
        </Link>
      </div>
      {/* No slug: jhappis and replies play their animation but send nothing. */}
      <GiftExperience template={template} content={content} />
    </>
  );
}
