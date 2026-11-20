// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

const { getPrograms, getInstitution } = vi.hoisted(() => ({
  getPrograms: vi.fn(),
  getInstitution: vi.fn(),
}));

vi.mock('../../services/programaService', () => ({ programaService: { getActivos: getPrograms } }));
vi.mock('../../services/institucionService', () => ({ institucionService: { getInfo: getInstitution } }));

import { AdmissionView } from './AdmissionView';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Academic promotion page', () => {
  it('promotes a program and routes information requests to the institutional WhatsApp', async () => {
    getPrograms.mockResolvedValue([{
      id: 12,
      title: 'Diplomado de prueba',
      type: 'Diplomado',
      description: 'Información promocional del programa académico.',
      modality: 'Virtual',
      duration: '6 meses',
      enlace_pdf_programa: 'https://example.edu/programa.pdf',
    }]);
    getInstitution.mockResolvedValue({ whatsapp: '+591 75855943' });

    render(<AdmissionView />);

    expect(await screen.findByRole('heading', { name: 'Diplomado de prueba' })).toBeTruthy();
    expect(screen.getByText('Virtual · 6 meses')).toBeTruthy();
    expect(screen.getByRole('link', { name: /consultar información/i }).getAttribute('href')).toContain('wa.me/59175855943');
    expect(screen.getByRole('link', { name: /información del programa/i }).getAttribute('href')).toBe('https://example.edu/programa.pdf');
    expect(document.querySelector('form')).toBeNull();
    expect(screen.queryByLabelText(/cédula|correo|documentos|consentimiento/i)).toBeNull();
  });

  it('shows a clear empty state when there are no published programs', async () => {
    getPrograms.mockResolvedValue([]);
    getInstitution.mockResolvedValue({ whatsapp: '' });

    render(<AdmissionView />);

    expect(await screen.findByText(/no hay programas publicados/i)).toBeTruthy();
    expect(document.querySelector('form')).toBeNull();
  });
});
