// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const { apiJson } = vi.hoisted(() => ({ apiJson: vi.fn() }));
vi.mock('../../../utils/api', () => ({ apiJson }));

import MallasCurricularesPanel from './MallascurricularesPanel';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('MallasCurricularesPanel', () => {
  it('creates a new master mesh, module and subject and displays their persisted relationships', async () => {
    const user = userEvent.setup();
    let meshCreated = false;
    let moduleCreated = false;
    let subjectCreated = false;

    apiJson.mockImplementation(async (url, options = {}) => {
      if (url === '/api/mallas' && options.method === 'POST') {
        meshCreated = true;
        return { success: true, data: { id_malla: 51, nombre_malla: 'Plan 2027', id_programa: 5, activo: true } };
      }
      if (url === '/api/modulos' && options.method === 'POST') {
        moduleCreated = true;
        return { success: true, data: { id_mod: 61, id_malla: 51, nombre_mod: 'Fundamentos', activo: true } };
      }
      if (url === '/api/materias' && options.method === 'POST') {
        subjectCreated = true;
        return { success: true, data: { id_mat: 71, nombre_mat: 'Probabilidad', activo: true } };
      }
      if (url === '/api/modulos/61/materias' && options.method === 'POST') {
        return { success: true };
      }
      if (url === '/api/mallas') {
        return { success: true, data: meshCreated ? [{ id_malla: 51, nombre_malla: 'Plan 2027', id_programa: 5, activo: true }] : [] };
      }
      if (url === '/api/materias') {
        return { success: true, data: subjectCreated ? [{ id_mat: 71, nombre_mat: 'Probabilidad', activo: true, materia_maestria: { id_mat: 71 } }] : [] };
      }
      if (url === '/api/mallas/51') {
        return { success: true, data: {
          id_malla: 51, nombre_malla: 'Plan 2027', id_programa: 5, activo: true,
          programa: { id_programa: 5, nombre_programa: 'Maestría en Estadística', tipo_programa: 'Maestria', activo: true },
          modulos: moduleCreated ? [{
            id_mod: 61, id_malla: 51, nombre_mod: 'Fundamentos', activo: true,
            materias: subjectCreated ? [{ id_mat: 71, materia: { id_mat: 71, nombre_mat: 'Probabilidad', activo: true }, pivot: { creditos: 8, carga_horaria: 128 } }] : [],
          }] : [],
          materias_diplomado: [],
        } };
      }
      throw new Error(`Unexpected API request: ${options.method || 'GET'} ${url}`);
    });

    render(<MallasCurricularesPanel programas={[{ id_programa: 5, nombre_programa: 'Maestría en Estadística', tipo_programa: 'Maestria', activo: true }]} />);
    await user.click(await screen.findByRole('button', { name: /nueva malla/i }));
    await user.type(within(screen.getByRole('dialog')).getByRole('textbox'), 'Plan 2027');
    await user.selectOptions(within(screen.getByRole('dialog')).getByRole('combobox'), '5');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar malla/i }));

    await user.click(await screen.findByRole('button', { name: /crear módulo/i }));
    await user.type(within(screen.getByRole('dialog')).getByRole('textbox'), 'Fundamentos');
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /guardar módulo/i }));
    expect(await screen.findByText('Fundamentos')).toBeTruthy();

    const moduleCard = screen.getByText('Fundamentos').closest('.glass-card');
    await user.click(within(moduleCard).getByRole('button', { name: /nueva materia/i }));
    const subjectDialog = within(screen.getByRole('dialog'));
    await user.type(subjectDialog.getAllByRole('textbox')[0], 'Probabilidad');
    await user.click(subjectDialog.getByRole('button', { name: /^guardar$/i }));

    expect(await screen.findByText('Probabilidad')).toBeTruthy();
    await waitFor(() => expect(apiJson).toHaveBeenCalledWith('/api/modulos/61/materias', expect.objectContaining({ method: 'POST' })));
  });
});
