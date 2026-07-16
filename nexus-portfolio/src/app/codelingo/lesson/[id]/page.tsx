import { notFound } from "next/navigation";
import { CODES, getCode } from "@/codelingo/codes";
import LessonPlayer from "@/components/codelingo/LessonPlayer";

export function generateStaticParams() {
  return CODES.map((c) => ({ id: c.id }));
}

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getCode(id)) notFound();
  return <LessonPlayer id={id} />;
}
