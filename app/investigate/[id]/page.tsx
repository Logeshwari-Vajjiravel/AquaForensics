import InvestigationViewer from "@/components/InvestigationViewer";
import { getWaterBodyById } from "@/lib/data";
import { notFound } from "next/navigation";

export default async function InvestigatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const waterBody = getWaterBodyById(id);

  if (!waterBody) {
    notFound();
  }

  return <InvestigationViewer waterBody={waterBody} />;
}
