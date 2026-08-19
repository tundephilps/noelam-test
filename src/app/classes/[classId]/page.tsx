import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ClassDetailView } from '@/components/classes/class-detail-view';
import { LoadingPanel } from '@/components/common/state-panels';

interface ClassPageProps {
  params: Promise<{ classId: string }>;
}

export async function generateMetadata({
  params,
}: ClassPageProps): Promise<Metadata> {
  const { classId } = await params;

  return { title: `Class ${classId}` };
}

/**
 * Route params are resolved here so the view stays a plain client component
 * that takes a `classId` string. The Suspense boundary is required because the
 * view reads search params (`?q=`, `?page=`) for its URL-synced state.
 */
export default async function ClassDetailPage({ params }: ClassPageProps) {
  const { classId } = await params;

  return (
    <Suspense fallback={<LoadingPanel label="Loading class…" />}>
      <ClassDetailView classId={classId} />
    </Suspense>
  );
}
