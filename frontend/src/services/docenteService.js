import { apiJson } from '../utils/api';

const toApiPayload = (payload) => ({
  nombre: payload.nombre,
  apellido: payload.apellido,
  foto_url: payload.foto_url || null,
  titulo_academico: payload.titulo_academico || payload.titulo || null,
  descripcion_profesional: payload.bio || payload.descripcion_profesional || null,
  bibliografia_url: payload.bibliografia_url || null,
  email: payload.email || null,
  telefono: payload.telefono || null,
  especialidad: payload.especialidad || null,
  categoria: payload.categoria || null,
  scholar: payload.scholar || null,
  researchgate: payload.researchgate || null,
  linkedin: payload.linkedin || null,
  orcid: payload.orcid || null,
});

export const docenteService = {
  /**
   * Obtiene la lista pública de docentes activos
   */
  getPublicDocentes: () => apiJson('/api/docentes/publicos'),

  /**
   * Obtiene la lista administrativa de docentes
   */
  getAdminDocentes: () => apiJson('/api/docentes'),

  /**
   * Sube una foto de docente
   */
  uploadFoto: async (file) => {
    const formData = new FormData();
    formData.append('archivo', file);
    return apiJson('/api/docentes/upload-foto', {
      method: 'POST',
      body: formData,
    });
  },

  create: (payload) => apiJson('/api/docentes', {
    method: 'POST',
    body: toApiPayload(payload),
  }),
  update: (id, payload) => apiJson(`/api/docentes/${id}`, {
    method: 'PUT',
    body: toApiPayload(payload),
  }),
  setActive: (id, active) => apiJson(`/api/docentes/${id}/${active ? 'reactivar' : 'desactivar'}`, {
    method: 'PATCH',
  }),
  delete: (id) => apiJson(`/api/docentes/${id}`, { method: 'DELETE' }),
};

export default docenteService;
