import type { Metadata } from 'next';
import './globals.css';
import { MSWProvider } from '@/components/MSWProvider';

export const metadata: Metadata = {
  title: 'Student Management Dashboard',
  description: 'Frontend Developer Assessment',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <MSWProvider>{children}</MSWProvider>
      </body>
    </html>
  );
}