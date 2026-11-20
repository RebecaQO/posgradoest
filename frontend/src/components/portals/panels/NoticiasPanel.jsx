import React, { useCallback, useEffect, useState } from 'react';
import { Newspaper, Plus, Save, Trash2, X } from 'lucide-react';
import { apiJson } from '../../../utils/api';
import { useDialogAccessibility } from '../../../hooks/useDialogAccessibility';

const NUEVA_NOTICIA = {
  titulo: '',
  categoria: 'Noticia',
  tipo: 'noticia',
  fecha: '',
  descripcion: '',
  enlace: '',
  estado: 'Publicado',
  imagen_url: '',
  publicada: true,
};

const fechaLocal = () => {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
};

export default function NoticiasPanel() {
  const [noticias, setNoticias] = useState([]);
  const [form, setForm] = useState(NUEVA_NOTICIA);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const dialogRef = useDialogAccessibility(modalOpen, () => { if (!saving) setModalOpen(false); });

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiJson('/api/admin/noticias');
      setNoticias(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar las noticias.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const abrirNueva = () => {
    setEditingId(null);
    setForm({ ...NUEVA_NOTICIA, fecha: fechaLocal() });
    setError('');
    setModalOpen(true);
  };

  const abrirEdicion = (noticia) => {
    setEditingId(noticia.id_noticia);
    setForm({ ...NUEVA_NOTICIA, ...noticia, fecha: String(noticia.fecha || '').slice(0, 10) });
    setError('');
    setModalOpen(true);
  };

  const guardar = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await apiJson(editingId ? `/api/admin/noticias/${editingId}` : '/api/admin/noticias', {
        method: editingId ? 'PUT' : 'POST',
        body: form,
      });
      setModalOpen(false);
      setNotice(editingId ? 'Noticia actualizada.' : 'Noticia publicada en la base de datos.');
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo guardar la noticia.');
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (noticia) => {
    if (!window.confirm(`¿Eliminar “${noticia.titulo}”?`)) return;
    try {
      await apiJson(`/api/admin/noticias/${noticia.id_noticia}`, { method: 'DELETE' });
      setNotice('Noticia eliminada.');
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar la noticia.');
    }
  };

  return (
    <section className="animate-fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', color: 'var(--color-text-main)', fontWeight: 800, margin: 0 }}>Noticias y publicaciones</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: '0.35rem 0 0' }}>El contenido se guarda en la base de datos y se publica en el portal.</p>
        </div>
        <button type="button" onClick={abrirNueva} className="btn btn-primary"><Plus size={16} /> Nueva noticia</button>
      </header>

      {notice && <p role="status" className="em-alert em-alert-success">{notice}</p>}
      {error && !modalOpen && <p role="alert" className="em-alert em-alert-error">{error}</p>}

      <div className="data-table-container">
        <table className="data-table">
          <thead><tr><th>Fecha</th><th>Título</th><th>Tipo</th><th>Publicación</th><th>Acciones</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={5}>Cargando noticias…</td></tr> : noticias.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay noticias guardadas todavía.</td></tr>
            ) : noticias.map((noticia) => (
              <tr key={noticia.id_noticia}>
                <td>{noticia.fecha}</td>
                <td><strong>{noticia.titulo}</strong><div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>{noticia.categoria}</div></td>
                <td>{noticia.tipo}</td>
                <td>{noticia.publicada ? 'Publicado' : 'Borrador'}</td>
                <td style={{ display: 'flex', gap: '.5rem' }}>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => abrirEdicion(noticia)}>Editar</button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => eliminar(noticia)} aria-label={`Eliminar ${noticia.titulo}`}><Trash2 size={15} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => !saving && setModalOpen(false)}>
          <form ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="news-dialog-title" tabIndex={-1} className="modal-content" onSubmit={guardar} onClick={(event) => event.stopPropagation()} style={{ maxWidth: 760, padding: '1.5rem', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 id="news-dialog-title" style={{ margin: 0 }}>{editingId ? 'Editar noticia' : 'Nueva noticia'}</h3>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setModalOpen(false)} disabled={saving} aria-label="Cerrar"><X size={16} /></button>
            </div>
            {error && <p role="alert" className="em-alert em-alert-error">{error}</p>}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <label className="form-group">Título<input className="form-input" required maxLength={255} value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} /></label>
              <label className="form-group">Categoría<input className="form-input" required maxLength={120} value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} /></label>
              <label className="form-group">Tipo<select className="form-input" value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}><option value="noticia">Noticia</option><option value="publicacion">Publicación científica</option><option value="evento">Evento</option></select></label>
              <label className="form-group">Fecha<input className="form-input" type="date" required value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} /></label>
              <label className="form-group">Estado<input className="form-input" maxLength={100} value={form.estado || ''} onChange={(e) => setForm({ ...form, estado: e.target.value })} /></label>
              <label className="form-group">Enlace oficial<input className="form-input" type="url" value={form.enlace || ''} onChange={(e) => setForm({ ...form, enlace: e.target.value })} placeholder="https://…" /></label>
              <label className="form-group" style={{ gridColumn: '1 / -1' }}>Descripción<textarea className="form-input" required rows={4} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} /></label>
              <label className="form-group" style={{ gridColumn: '1 / -1' }}>URL de imagen<input className="form-input" type="url" value={form.imagen_url || ''} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} placeholder="Opcional: enlace público a una imagen" /></label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}><input type="checkbox" checked={Boolean(form.publicada)} onChange={(e) => setForm({ ...form, publicada: e.target.checked })} /> Publicar en el portal</label>
            </div>
            <footer style={{ display: 'flex', justifyContent: 'flex-end', gap: '.75rem', marginTop: '1.25rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? <Newspaper size={16} /> : <Save size={16} />} {saving ? 'Guardando…' : 'Guardar noticia'}</button>
            </footer>
          </form>
        </div>
      )}
    </section>
  );
}
