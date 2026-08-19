import type { Metadata } from 'next';
import { Suspense } from 'react';

import { LoadingPanel } from '@/components/common/state-panels';
import { StudentsDirectoryView } from '@/components/students/students-directory-view';

export const metadata: Metadata = {
  title: 'Students',
};

export default function StudentsPage() {
  return (
    <Suspense fallback={<LoadingPanel label="Loading students…" />}>
      <StudentsDirectoryView />
    </Suspense>
  );
}
