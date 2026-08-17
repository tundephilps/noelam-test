'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function enableMocking() {
      const { worker } = await import('@/mocks/browser');

      await worker.start({
        onUnhandledRequest: 'bypass',
      });

      setReady(true);
    }

    enableMocking();
  }, []);

  if (!ready) {
    return null;
  }

  return <>{children}</>;
}