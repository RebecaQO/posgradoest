import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, AlertCircle, Filter } from 'lucide-react';
import { apiJson } from '../../../utils/api';

export default function DefensasPanel() {
  const [defensas, setDefensas] = useState([]);
  const [ediciones, setEdiciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [subiendoBanner, setSubiendoBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const [filtroResultado, setFiltroResultado] = useState('all');
  const [filtroEdicion, setFiltroEdicion] = useState('all');

  const [form, setForm] = useState({
    id_edicion: '',
    titulo_tesis: '',
    nombre_defensa: '',
    imagen_url: '',
    autor: '',
    tutor: '',
    modalidad: '',
    fecha_defensa: '',
    hora_defensa: '',
    lugar: '',
    resultado: 'pendiente',
    observaciones: '',
    publicado: true,
  });

  const cargar = async () => {
    try {
      setLoading(true);
      setError(null);
      const [resDefensas, resEdiciones] = await Promise.all([
        apiJson('/api/defensas-tesis'),
        apiJson('/api/ediciones').catch(() => []),
      ]);

      setDefensas(Array.isArray(resDefensas) ? resDefensas : (resDefensas?.data || []));
      setEdiciones(Array.isArray(resEdiciones) ? resEdiciones : (resEdiciones?.data || []));
    } catch (err) {
      if (err.status === 403) {
        setError('Sin permisos para ver defensas de tesis.');
      } else {
        setError(err.message || 'Error al cargar defensas de tesis.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const abrirCrear = () => {
    setEditing(null);
    setForm({
      id_edicion: ediciones[0]?.id_edicion || ediciones[0]?.id || '',
      titulo_tesis: '',
      nombre_defensa: '',
      imagen_url: '',
      autor: '',
      tutor: '',
      modalidad: '',
      fecha_defensa: new Date().toISOString().split('T')[0],
      hora_defensa: '10:00',
      lugar: 'Auditorio de Postgrado - Carrera de Estadística',
      resultado: 'pendiente',
      observaciones: '',
      publicado: true,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const abrirEditar = (def) => {
    setEditing(def);
    setForm({
      id_edicion: def.id_edicion || def.edicion?.id || '',
      titulo_tesis: def.titulo_tesis || '',
      nombre_defensa: def.nombre_defensa || `Defensa de ${def.autor || 'tesis'}`,
      imagen_url: def.imagen_url || '',
      autor: def.autor || '',
      tutor: def.tutor || '',
      modalidad: def.modalidad || '',
      fecha_defensa: def.fecha_defensa || '',
      hora_defensa: def.hora_defensa || '',
      lugar: def.lugar || '',
      resultado: def.resultado || 'pendiente',
      observaciones: def.observaciones || '',
      publicado: def.publicado !== false,
    });
    setFieldErrors({});
    setModalOpen(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setError(null);

    try {
      const payload = {
        ...form,
        id_edicion: Number(form.id_edicion),
      };

      if (editing) {
        const updated = await apiJson(`/api/defensas-tesis/${editing.id}`, {
          method: 'PUT',
          body: payload,
        });
        const defData = updated.data || updated;
        setDefensas((prev) =>
          prev.map((d) => (d.id === editing.id ? defData : d))
        );
      } else {
        const created = await apiJson('/api/defensas-tesis', {
          method: 'POST',
          body: payload,
        });
        const defData = created.data || created;
        setDefensas((prev) => [defData, ...prev]);
      }

      setModalOpen(false);
    } catch (err) {
      if (err.status === 422 && err.errors) {
        setFieldErrors(err.errors);
      } else if (err.status === 403) {
        setError('Sin permisos de administrador para realizar esta operación.');
      } else {
        setError(err.message || 'Error al guardar la defensa de tesis.');
      }
    }
  };

  const subirBanner = async (archivo) => {
    if (!archivo) return;
    if (archivo.size > 5 * 1024 * 1024) {
      setError('El banner debe pesar máximo 5 MB.');
      return;
    }
    const body = new FormData();
    body.append('archivo', archivo);
    setError(null);
    setSubiendoBanner(true);
    try {
      const resultado = await apiJson('/api/defensas/upload-banner', { method: 'POST', body });
      setForm((actual) => ({ ...actual, imagen_url: resultado.url }));
    } catch (err) {
      setError(`No se pudo subir el banner: ${err.message}`);
    } finally {
      setSubiendoBanner(false);
    }
  };

  const eliminar = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta defensa de tesis?')) return;
    try {
      setError(null);
      await apiJson(`/api/defensas-tesis/${id}`, { method: 'DELETE' });
      setDefensas((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      if (err.status === 403) {
        setError('Sin permisos para eliminar defensas de tesis.');
      } else {
        setError(err.message || 'Error al eliminar la defensa.');
      }
    }
  };

  const defensasFiltradas = defensas.filter((def) => {
    if (filtroResultado !== 'all' && def.resultado !== filtroResultado) return false;
    if (filtroEdicion !== 'all' && String(def.id_edicion) !== String(filtroEdicion)) return false;
    return true;
  });

  const getBadgeResultado = (resultado) => {
    const res = (resultado || 'pendiente').toLowerCase();
    if (res === 'aprobado') return <span className="badge badge-green">✓ Aprobado</span>;
    if (res === 'reprobado') return <span className="badge badge-red">✕ Reprobado</span>;
    return <span className="badge badge-yellow">⏳ Pendiente</span>;
  };

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--color-text-main)', fontWeight: 800, margin: 0 }}>
            Defensas de Tesis & Grado ({defensasFiltradas.length})
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Programación, modalidades de titulación y actas de sustentación académica.
          </p>
        </div>

        <button
          onClick={abrirCrear}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>Programar Nueva Defensa</span>
        </button>
      </div>

      {/* Barra de Filtros */}
      <div style={{
        display: 'flex', gap: '1rem', marginBottom: '1.25rem', padding: '0.85rem 1rem',
        background: 'var(--color-bg-card, #f8fafc)', borderRadius: '6px', border: '1px solid var(--color-border)',
        alignItems: 'center', flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filtros:</span>
        </div>

        <select
          value={filtroResultado}
          onChange={(e) => setFiltroResultado(e.target.value)}
          className="input-text"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
        >
          <option value="all">Todos los resultados</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobado">Aprobado</option>
          <option value="reprobado">Reprobado</option>
        </select>

        <select
          value={filtroEdicion}
          onChange={(e) => setFiltroEdicion(e.target.value)}
          className="input-text"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.85rem' }}
        >
          <option value="all">Todas las ediciones</option>
          {ediciones.map((ed) => (
            <option key={ed.id || ed.id_edicion} value={ed.id || ed.id_edicion}>
              {ed.nombre_edicion || `Edición #${ed.id || ed.id_edicion}`}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div style={{
          padding: '0.85rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Cargando defensas de tesis...
        </div>
      ) : (
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Título de Tesis</th>
                <th>Tesista / Postgraduante</th>
                <th>Edición / Programa</th>
                <th>Fecha y Hora</th>
                <th>Resultado</th>
                <th>Portal público</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {defensasFiltradas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No se encontraron defensas de tesis registradas con los filtros actuales.
                  </td>
                </tr>
              ) : (
                defensasFiltradas.map((def) => (
                  <tr key={def.id}>
                    <td>
                      <strong>{def.nombre_defensa || `Defensa de ${def.autor || 'tesis'}`}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>Tema: {def.titulo_tesis}</div>
                      {def.lugar && (
                        <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                          <MapPin size={12} /> {def.lugar}
                        </div>
                      )}
                      {def.modalidad && <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Modalidad: {def.modalidad}</div>}
                    </td>
                    <td>
                      <div><strong>{def.autor}</strong></div>
                      {def.tutor && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          Tutor: {def.tutor}
                        </div>
                      )}
                    </td>
                    <td>
                      {def.edicion?.nombre_edicion || `Edición #${def.id_edicion}`}
                      {def.edicion?.programa?.nombre_programa && (
                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-subtle)' }}>
                          {def.edicion.programa.nombre_programa}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={13} style={{ color: 'var(--color-text-muted)' }} />
                        <span>{def.fecha_defensa}</span>
                      </div>
                      {def.hora_defensa && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          <Clock size={12} />
                          <span>{def.hora_defensa}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      {getBadgeResultado(def.resultado)}
                    </td>
                    <td>{def.publicado ? 'Visible' : 'Oculta'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => abrirEditar(def)}
                          className="btn btn-secondary btn-sm"
                          title="Editar defensa"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => eliminar(def.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--color-status-danger)' }}
                          title="Eliminar defensa"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="modal-backdrop" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--color-bg-card, #ffffff)', padding: '2rem', borderRadius: '8px',
            width: '100%', maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)'
          }}>
            <h4 style={{ margin: '0 0 1.25rem 0', color: 'var(--color-text-main)' }}>
              {editing ? 'Editar Defensa de Tesis' : 'Programar Nueva Defensa de Tesis'}
            </h4>

            <form onSubmit={guardar}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Edición de Programa *
                </label>
                <select
                  className="input-text"
                  style={{ width: '100%' }}
                  value={form.id_edicion}
                  onChange={(e) => setForm({ ...form, id_edicion: e.target.value })}
                  required
                >
                  <option value="">Selecciona una edición...</option>
                  {ediciones.map((ed) => (
                    <option key={ed.id || ed.id_edicion} value={ed.id || ed.id_edicion}>
                      {ed.nombre_edicion || `Edición #${ed.id || ed.id_edicion}`} ({ed.programa?.nombre_programa || 'Programa'})
                    </option>
                  ))}
                </select>
                {fieldErrors.id_edicion && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                    {fieldErrors.id_edicion[0]}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Banner o foto de la defensa
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="input-text"
                  style={{ width: '100%' }}
                  onChange={(e) => subirBanner(e.target.files?.[0])}
                />
                <small>JPG, PNG o WebP; máximo 5 MB.</small>
                {form.imagen_url && <img src={form.imagen_url} alt="Vista previa del banner de la defensa" style={{ display: 'block', width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 8, marginTop: 8 }} />}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Nombre de la defensa *
                </label>
                <input
                  type="text"
                  className="input-text"
                  style={{ width: '100%' }}
                  value={form.nombre_defensa}
                  onChange={(e) => setForm({ ...form, nombre_defensa: e.target.value })}
                  placeholder="Ej.: Defensa pública de tesis de maestría"
                  required
                />
                {fieldErrors.nombre_defensa && <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>{fieldErrors.nombre_defensa[0]}</p>}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Tema del Trabajo / Tesis *
                </label>
                <input
                  type="text"
                  className="input-text"
                  style={{ width: '100%' }}
                  value={form.titulo_tesis}
                  onChange={(e) => setForm({ ...form, titulo_tesis: e.target.value })}
                  placeholder="Ej: Modelado Bayesiano aplicado al análisis de supervivencia"
                  required
                />
                {fieldErrors.titulo_tesis && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                    {fieldErrors.titulo_tesis[0]}
                  </p>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Tesista / Postgraduante *
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.autor}
                    onChange={(e) => setForm({ ...form, autor: e.target.value })}
                    required
                  />
                  {fieldErrors.autor && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                      {fieldErrors.autor[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Tutor
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.tutor}
                    onChange={(e) => setForm({ ...form, tutor: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Fecha de Defensa *
                  </label>
                  <input
                    type="date"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.fecha_defensa}
                    onChange={(e) => setForm({ ...form, fecha_defensa: e.target.value })}
                    required
                  />
                  {fieldErrors.fecha_defensa && (
                    <p style={{ color: '#ef4444', fontSize: '0.8rem', margin: '0.25rem 0 0' }}>
                      {fieldErrors.fecha_defensa[0]}
                    </p>
                  )}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Hora
                  </label>
                  <input
                    type="time"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.hora_defensa}
                    onChange={(e) => setForm({ ...form, hora_defensa: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Lugar
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.lugar}
                    onChange={(e) => setForm({ ...form, lugar: e.target.value })}
                    placeholder="Auditorio / enlace de videoconferencia"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Modalidad de defensa
                  </label>
                  <input
                    type="text"
                    className="input-text"
                    style={{ width: '100%' }}
                    value={form.modalidad}
                    onChange={(e) => setForm({ ...form, modalidad: e.target.value })}
                    placeholder="Presencial / Virtual síncrona / Híbrida"
                  />
                </div>

              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>Resultado / Estado *</label>
                <select className="input-text" style={{ width: '100%' }} value={form.resultado} onChange={(e) => setForm({ ...form, resultado: e.target.value })}>
                  <option value="pendiente">Pendiente</option>
                  <option value="aprobado">Aprobado</option>
                  <option value="reprobado">Reprobado</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Observaciones / Notas del Tribunal
                </label>
                <textarea
                  className="input-text"
                  style={{ width: '100%', minHeight: '60px' }}
                  value={form.observaciones}
                  onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1rem' }}>
                <input type="checkbox" checked={Boolean(form.publicado)} onChange={(e) => setForm({ ...form, publicado: e.target.checked })} />
                Mostrar esta defensa en Noticias y Tesis del portal público
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={subiendoBanner}>
                  {subiendoBanner ? 'Subiendo banner…' : editing ? 'Actualizar' : 'Guardar Defensa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

