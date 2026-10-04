import { CourseEditor } from '@/components/dashboard/CourseEditor';

export default async function AdminCourseEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CourseEditor courseId={id} />;
}
