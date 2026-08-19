import Link from 'next/link';
import { CompassIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CompassIcon aria-hidden="true" className="size-5" />
      </span>

      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>

      <Button size="lg" nativeButton={false} render={<Link href="/" />}>
        Go to dashboard
      </Button>
    </div>
  );
}
