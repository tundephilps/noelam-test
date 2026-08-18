import type { Metadata } from 'next';
import './globals.css';

import { MSWProvider } from '@/components/MSWProvider';
import { Providers } from '@/components/providers';
import { AppShell } from '@/components/layout/app-shell';
import { THEME_BOOT_SCRIPT } from '@/components/layout/theme-toggle';

export const metadata: Metadata = {
  title: {
    default: 'Northgate Admin — Student Management',
    template: '%s · Northgate Admin',
  },
  description:
    'School administration dashboard for managing classes, rosters and student records.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The theme script sets a class on <html> before paint, which React would
    // otherwise flag as a hydration mismatch.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      </head>
      <body>
        <Providers>
          <MSWProvider>
            <AppShell>{children}</AppShell>
          </MSWProvider>
        </Providers>
      </body>
    </html>
  );
}
