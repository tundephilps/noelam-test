import type { Metadata } from 'next';

import { StudentDetailView } from '@/components/students/student-detail-view';

interface StudentPageProps {
  params: Promise<{ studentId: string }>;
}

export async function generateMetadata({
  params,
}: StudentPageProps): Promise<Metadata> {
  const { studentId } = await params;

  return { title: `Student ${studentId}` };
}

/**
 * Own URL per student (`/students/STU-004`). The record is fetched by id on the
 * client, so the page works when opened or reloaded directly.
 */
export default async function StudentDetailPage({ params }: StudentPageProps) {
  const { studentId } = await params;

  return <StudentDetailView studentId={studentId} />;
}
