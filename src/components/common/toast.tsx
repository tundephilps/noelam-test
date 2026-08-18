'use client';

import { CheckCircle2Icon, InfoIcon, XIcon, TriangleAlertIcon } from 'lucide-react';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. Errors stay longer by default. */
  durationMs?: number;
}

interface ToastRecord extends Required<Omit<ToastOptions, 'description'>> {
  id: number;
  description?: string;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-card text-foreground',
  error: 'border-destructive/40 bg-card text-foreground',
  info: 'border-border bg-card text-foreground',
};

const VARIANT_ICON = {
  success: CheckCircle2Icon,
  error: TriangleAlertIcon,
  info: InfoIcon,
} as const;

const VARIANT_ICON_STYLES: Record<ToastVariant, string> = {
  success: 'text-success',
  error: 'text-destructive',
  info: 'text-muted-foreground',
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);

    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }

    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'info', durationMs }: ToastOptions) => {
      const id = nextId.current++;
      const timeout = durationMs ?? (variant === 'error' ? 7000 : 4500);

      setToasts((current) => [
        ...current,
        { id, title, description, variant, durationMs: timeout },
      ]);

      timers.current.set(
        id,
        setTimeout(() => dismiss(id), timeout)
      );
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {/* Announced to screen readers; visually anchored bottom-right on
          desktop and full width on small screens. */}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:inset-x-auto sm:right-0 sm:items-end"
      >
        {toasts.map((item) => {
          const Icon = VARIANT_ICON[item.variant];

          return (
            <div
              key={item.id}
              role={item.variant === 'error' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-3 shadow-lg shadow-foreground/5 transition-all',
                VARIANT_STYLES[item.variant]
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn('mt-0.5 size-4 shrink-0', VARIANT_ICON_STYLES[item.variant])}
              />

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 text-sm break-words text-muted-foreground">
                    {item.description}
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => dismiss(item.id)}
                className="-m-1 rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <XIcon aria-hidden="true" className="size-4" />
                <span className="sr-only">Dismiss notification</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used inside <ToastProvider>');
  }

  return context;
}
