import { notFound } from "next/navigation";
import { Builder } from "@/components/builder/Builder";
import { getTemplate } from "@/lib/templates";
import type { RelationGroup } from "@/lib/templates/types";

const GROUPS: RelationGroup[] = ["partner", "family", "friends", "group"];

export default async function CreatePage({ params, searchParams }: { params: Promise<{ template: string }>; searchParams: Promise<{ for?: string }> }) {
  const { template } = await params;
  const { for: forGroup } = await searchParams;
  if (!getTemplate(template)) notFound();
  const initialGroup = GROUPS.find((g) => g === forGroup);
  return <Builder slug={template} initialGroup={initialGroup} />;
}
