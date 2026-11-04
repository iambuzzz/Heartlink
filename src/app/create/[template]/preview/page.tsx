import { notFound } from "next/navigation";
import { getTemplate } from "@/lib/templates";
import { PreviewClient } from "./PreviewClient";

export default async function PreviewPage({ params }: { params: Promise<{ template: string }> }) {
  const { template } = await params;
  if (!getTemplate(template)) notFound();
  return <PreviewClient slug={template} />;
}
