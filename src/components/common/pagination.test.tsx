import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Pagination } from '@/components/common/pagination';

describe('Pagination', () => {
  it('summarises the visible range without controls when there is one page', () => {
    render(
      <Pagination
        page={1}
        pageCount={1}
        from={1}
        to={4}
        total={4}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByText('Showing 4 of 4 students')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('marks the current page for assistive technology', () => {
    render(
      <Pagination
        page={2}
        pageCount={3}
        from={9}
        to={16}
        total={20}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).not.toHaveAttribute(
      'aria-current'
    );
  });

  it('disables the edges of the range', () => {
    const { unmount } = render(
      <Pagination
        page={1}
        pageCount={3}
        from={1}
        to={8}
        total={20}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();

    unmount();

    render(
      <Pagination
        page={3}
        pageCount={3}
        from={17}
        to={20}
        total={20}
        onPageChange={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('reports the page the administrator asked for', async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <Pagination
        page={1}
        pageCount={3}
        from={1}
        to={8}
        total={20}
        onPageChange={onPageChange}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenCalledWith(2);

    await user.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
