import { Checkout } from '@/components/site/Checkout';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  return <Checkout courseId={courseId} />;
}
