'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { ToastProvider } from '@/components/common/toast';
import { createQueryClient } from '@/lib/query-client';

/**
 * One QueryClient per browser session. Created in state (not at module scope)
 * so a fast refresh in development does not hand two trees the same client.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>{children}</ToastProvider>
    </QueryClientProvider>
  );
}
