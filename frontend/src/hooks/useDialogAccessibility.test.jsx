// @vitest-environment jsdom
import React, { useState } from 'react';
import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useDialogAccessibility } from './useDialogAccessibility';

function DialogExample() {
  const [open, setOpen] = useState(false);
  const dialogRef = useDialogAccessibility(open, () => setOpen(false));

  return <>
    <button type="button" onClick={() => setOpen(true)}>Abrir</button>
    {open && <section ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
      <button type="button">Primero</button>
      <button type="button">Último</button>
    </section>}
  </>;
}

afterEach(cleanup);

it('focuses the dialog, traps Tab at both ends, closes with Escape and restores focus', async () => {
  render(<DialogExample />);
  const opener = screen.getByRole('button', { name: 'Abrir' });
  opener.focus();
  fireEvent.click(opener);

  const dialog = screen.getByRole('dialog');
  const first = screen.getByRole('button', { name: 'Primero' });
  const last = screen.getByRole('button', { name: 'Último' });
  await waitFor(() => expect(document.activeElement).toBe(first));

  fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
  expect(document.activeElement).toBe(last);
  fireEvent.keyDown(document, { key: 'Tab' });
  expect(document.activeElement).toBe(first);

  fireEvent.keyDown(document, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  expect(document.activeElement).toBe(opener);
  expect(dialog.isConnected).toBe(false);
});
