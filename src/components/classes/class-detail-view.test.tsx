import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ClassDetailView } from '@/components/classes/class-detail-view';
import { renderWithProviders } from '@/test/render';

/**
 * End-to-end coverage of the class screen against the mock API: server-side
 * search, removal behind a confirmation, and enrolment with duplicate guarding.
 *
 * Note on queries: the roster renders a desktop table and a mobile card list,
 * one of which is display:none in the browser. jsdom applies no CSS, so both
 * are visible to the queries here and lookups are scoped to the table.
 */

vi.mock('next/navigation', () => ({
  usePathname: () => '/classes/CLS-001',
  useSearchParams: () => new URLSearchParams(),
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
}));

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...props
  }: React.ComponentProps<'a'> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const FIND_TIMEOUT = { timeout: 5000 };

function rosterTable() {
  return within(screen.getByRole('table'));
}

/** Scoped to the table: the mobile card list renders the same names. */
async function findInRoster(name: string) {
  const table = await screen.findByRole('table', undefined, FIND_TIMEOUT);

  return within(table).findByText(name, undefined, FIND_TIMEOUT);
}

describe('ClassDetailView', () => {
  it('shows the class identity and its enrolled students', async () => {
    renderWithProviders(<ClassDetailView classId="CLS-001" />);

    expect(
      await screen.findByRole('heading', { name: 'SS1A' }, FIND_TIMEOUT)
    ).toBeInTheDocument();

    expect(await findInRoster('John Doe')).toBeInTheDocument();

    const table = rosterTable();

    expect(table.getByText('STU-001')).toBeInTheDocument();
    // Gender, age and status are part of the required roster columns.
    expect(table.getAllByText('Male').length).toBeGreaterThan(0);
    expect(table.getAllByText('Active').length).toBeGreaterThan(0);
    expect(screen.getByText('4 students enrolled')).toBeInTheDocument();
  });

  it('searches the roster through the API and reports no matches', async () => {
    const { user } = renderWithProviders(<ClassDetailView classId="CLS-001" />);

    await findInRoster('John Doe');

    const search = screen.getByRole('searchbox', {
      name: /search students in this class/i,
    });

    await user.type(search, 'amina');

    await waitFor(
      () => {
        expect(rosterTable().queryByText('John Doe')).not.toBeInTheDocument();
      },
      FIND_TIMEOUT
    );

    expect(rosterTable().getByText('Amina Bello')).toBeInTheDocument();

    await user.clear(search);
    await user.type(search, 'zzzz');

    expect(
      await screen.findByText('No students match your search', undefined, FIND_TIMEOUT)
    ).toBeInTheDocument();

    // The empty state offers a way back to the full roster.
    await user.click(screen.getByRole('button', { name: 'Clear search' }));

    expect(await findInRoster('John Doe')).toBeInTheDocument();
  });

  it('confirms before removing a student, then updates the roster', async () => {
    const { user } = renderWithProviders(<ClassDetailView classId="CLS-001" />);

    await findInRoster('John Doe');

    await user.click(
      rosterTable().getByRole('button', { name: /remove john doe from this class/i })
    );

    const dialog = await screen.findByRole('dialog');

    expect(
      within(dialog).getByText('Remove student from class?')
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remove student' }));

    await waitFor(
      () => {
        expect(rosterTable().queryByText('John Doe')).not.toBeInTheDocument();
      },
      FIND_TIMEOUT
    );

    expect(await screen.findByText('Student removed')).toBeInTheDocument();
    expect(screen.getByText('3 students')).toBeInTheDocument();
  });

  it('keeps the roster unchanged when a removal is cancelled', async () => {
    const { user } = renderWithProviders(<ClassDetailView classId="CLS-001" />);

    await findInRoster('John Doe');

    await user.click(
      rosterTable().getByRole('button', { name: /remove john doe from this class/i })
    );

    const dialog = await screen.findByRole('dialog');

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    expect(rosterTable().getByText('John Doe')).toBeInTheDocument();
  });

  it('enrols a student from the directory and blocks duplicates', async () => {
    const { user } = renderWithProviders(<ClassDetailView classId="CLS-001" />);

    await findInRoster('John Doe');

    await user.click(screen.getByRole('button', { name: /enrol student/i }));

    const dialog = await screen.findByRole('dialog');

    await within(dialog).findByRole('radiogroup', undefined, FIND_TIMEOUT);

    // Already on this roster: listed, labelled and not selectable.
    const enrolledOption = within(dialog).getByRole('radio', { name: /john doe/i });

    expect(enrolledOption).toBeDisabled();
    expect(within(enrolledOption).getByText('Already enrolled')).toBeInTheDocument();

    const candidate = within(dialog).getByRole('radio', { name: /kunle afolayan/i });

    expect(candidate).toBeEnabled();
    await user.click(candidate);

    await user.click(within(dialog).getByRole('button', { name: /^enrol student$/i }));

    expect(
      await screen.findByText('Student enrolled', undefined, FIND_TIMEOUT)
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(rosterTable().getByText('Kunle Afolayan')).toBeInTheDocument();
      },
      FIND_TIMEOUT
    );
  });
});
