'use client';

import { SearchIcon, XIcon } from 'lucide-react';
import { useId } from 'react';

import { Spinner } from '@/components/common/spinner';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  /** Shows a spinner inside the field while a request is in flight. */
  busy?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  label,
  placeholder,
  busy = false,
  className,
}: SearchInputProps) {
  const inputId = useId();

  return (
    <div className={cn('relative', className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      <SearchIcon
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
      />

      <input
        id={inputId}
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-input bg-card pr-20 pl-9 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 [&::-webkit-search-cancel-button]:hidden"
      />

      <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
        {busy ? <Spinner className="size-4 text-muted-foreground" /> : null}

        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <XIcon aria-hidden="true" className="size-4" />
            {/* Distinct from the "Clear search" button offered by the
                no-results panel, so the two never read the same. */}
            <span className="sr-only">Clear search field</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
