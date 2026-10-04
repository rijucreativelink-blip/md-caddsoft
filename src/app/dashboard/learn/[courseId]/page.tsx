import { LearnPlayer } from '@/components/dashboard/LearnPlayer';

export default async function LearnPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <LearnPlayer courseId={courseId} />;
}
