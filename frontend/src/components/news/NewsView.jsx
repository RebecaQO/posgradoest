import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  ExternalLink,
  GraduationCap,
  Newspaper,
  RefreshCw,
  Video,
} from 'lucide-react';
import { apiJson } from '../../utils/api';

const formatDate = (value, time = '') => {
  if (!value) return 'Fecha por confirmar';
  const day = String(value).slice(0, 10);
  const parsed = new Date(`${day}T12:00:00`);
  const formatted = Number.isNaN(parsed.getTime())
    ? day
    : new Intl.DateTimeFormat('es-BO', { day: '2-digit', month: 'long', year: 'numeric' }).format(parsed);
  return time ? `${formatted} · ${String(time).slice(0, 5)} (BOT)` : formatted;
};

const normalizarNoticia = (noticia) => ({
  id: `noticia-${noticia.id_noticia}`,
  category: noticia.categoria,
  type: noticia.tipo === 'publicacion' ? 'paper' : noticia.tipo === 'evento' ? 'workshop' : 'news',
  date: formatDate(noticia.fecha),
  sortDate: noticia.fecha,
  title: noticia.titulo,
  description: noticia.descripcion,
  link: noticia.enlace,
  status: noticia.estado || 'Publicado',
  image: noticia.imagen_url,
});

const normalizarDefensa = (defensa) => ({
  id: `defensa-${defensa.id}`,
  category: 'Defensa de Tesis',
  type: 'defense',
  date: formatDate(defensa.fecha_defensa, defensa.hora_defensa),
  sortDate: defensa.fecha_defensa,
  title: defensa.nombre_defensa || `Defensa de ${defensa.autor || 'tesis'}`,
  topic: defensa.titulo_tesis,
  author: defensa.autor,
  tutor: defensa.tutor,
  modality: defensa.modalidad || defensa.edicion?.modalidad,
  program: defensa.edicion?.programa,
  edition: defensa.edicion?.nombre_edicion,
  location: defensa.lugar,
  image: defensa.imagen_url || defensa.imagen || defensa.edicion?.banner,
  status: 'Programada',
});

const getList = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

export const NewsView = () => {
  const [filterType, setFilterType] = useState('todos');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      const [noticias, defensas] = await Promise.all([
        apiJson('/api/noticias'),
        apiJson('/api/defensas-tesis/publicas'),
      ]);
      setItems([
        ...getList(noticias).map(normalizarNoticia),
        ...getList(defensas).map(normalizarDefensa),
      ].sort((a, b) => String(b.sortDate || '').localeCompare(String(a.sortDate || ''))));
      setError('');
    } catch (err) {
      setError(err.message || 'No se pudieron cargar noticias y defensas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const intervalId = window.setInterval(cargar, 60_000);
    window.addEventListener('focus', cargar);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', cargar);
    };
  }, [cargar]);

  const filteredItems = useMemo(() => items.filter((item) => {
    if (filterType === 'defensas' && item.type !== 'defense') return false;
    if (filterType === 'publicaciones' && item.type !== 'paper') return false;
    if (filterType === 'eventos' && item.type !== 'workshop') return false;
    return true;
  }), [filterType, items]);

  return (
    <div className="section-spacing animate-fade-in" style={{ background: '#f8fafc' }}>
      <div className="container">
        <div className="section-header">
          <div className="section-tag"><Newspaper size={14} /><span>ACTIVIDAD INVESTIGATIVA & COMUNICACIÓN CIENTÍFICA</span></div>
          <h1 className="section-title">Noticias, Defensas de Tesis y Publicaciones</h1>
          <p className="section-subtitle">Información publicada por la Carrera de Estadística, consultada desde la base de datos institucional.</p>
        </div>

        <div className="tabs-header" style={{ maxWidth: '640px', margin: '0 auto 2rem' }}>
          <button className={`tab-btn ${filterType === 'todos' ? 'active' : ''}`} onClick={() => setFilterType('todos')} style={{ flex: 1, justifyContent: 'center' }}>
            <span>Todos ({items.length})</span>
          </button>
          <button className={`tab-btn ${filterType === 'defensas' ? 'active' : ''}`} onClick={() => setFilterType('defensas')} style={{ flex: 1, justifyContent: 'center' }}>
            <GraduationCap size={16} /><span>Defensas</span>
          </button>
          <button className={`tab-btn ${filterType === 'publicaciones' ? 'active' : ''}`} onClick={() => setFilterType('publicaciones')} style={{ flex: 1, justifyContent: 'center' }}>
            <BookOpen size={16} /><span>Publicaciones</span>
          </button>
          <button className={`tab-btn ${filterType === 'eventos' ? 'active' : ''}`} onClick={() => setFilterType('eventos')} style={{ flex: 1, justifyContent: 'center' }}>
            <Calendar size={16} /><span>Eventos</span>
          </button>
        </div>

        {error && <div role="alert" style={{ padding: '1rem', marginBottom: '1.5rem', color: '#991b1b', background: '#fef2f2', borderRadius: 8 }}><AlertCircle size={16} style={{ verticalAlign: 'middle', marginRight: 8 }} />{error}<button type="button" onClick={cargar} className="btn btn-secondary btn-sm" style={{ marginLeft: 12 }}><RefreshCw size={14} /> Reintentar</button></div>}

        {loading ? (
          <p role="status" style={{ textAlign: 'center', padding: '3rem' }}>Cargando noticias y defensas desde la base de datos…</p>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <Newspaper size={30} color="#64748b" style={{ marginBottom: 10 }} />
            <p style={{ margin: 0, color: '#475569' }}>No hay elementos publicados para este filtro.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '2rem' }}>
            {filteredItems.map((item) => {
              const isDefense = item.type === 'defense';
              return (
                <article key={item.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, background: '#fff', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-sm)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  {item.image ? (
                    <div style={{ height: 220, overflow: 'hidden' }}><img src={item.image} alt={item.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
                  ) : (
                    <div aria-hidden="true" style={{ height: 110, display: 'grid', placeItems: 'center', color: '#fff', background: isDefense ? 'linear-gradient(135deg,#7c2d12,#c2410c)' : 'linear-gradient(135deg,#123b2a,#25634b)' }}>
                      {isDefense ? <GraduationCap size={34} /> : <Newspaper size={32} />}
                    </div>
                  )}

                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '.5rem', flexWrap: 'wrap' }}>
                      <span className={`badge ${isDefense ? 'badge-orange' : 'badge-blue'}`}>{item.category}</span>
                      <span className="badge badge-green">{item.status}</span>
                    </div>
                    <div style={{ fontSize: '.82rem', color: 'var(--color-accent-orange)', fontWeight: 700 }}><Calendar size={13} style={{ verticalAlign: 'middle', marginRight: 5 }} />{item.date}</div>
                    <h2 style={{ fontSize: '1.15rem', color: 'var(--color-umsa-blue-dark)', margin: 0, lineHeight: 1.4 }}>{item.title}</h2>

                    {isDefense ? (
                      <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1rem', fontSize: '.88rem', display: 'grid', gap: '.45rem', border: '1px solid #e2e8f0' }}>
                        {item.topic && <div><strong>Tema:</strong> {item.topic}</div>}
                        {item.author && <div><strong>Postulante:</strong> {item.author}</div>}
                        {item.tutor && <div><strong>Tutor:</strong> {item.tutor}</div>}
                        {item.modality && <div><strong>Modalidad:</strong> {item.modality}</div>}
                        {(item.program || item.edition) && <div><strong>Programa:</strong> {[item.program, item.edition].filter(Boolean).join(' · ')}</div>}
                        {item.location && <div><strong>Lugar:</strong> {item.location}</div>}
                      </div>
                    ) : (
                      <p style={{ fontSize: '.9rem', color: 'var(--color-text-muted)', lineHeight: 1.6, margin: 0 }}>{item.description}</p>
                    )}

                    {item.link && (
                      <a href={item.link} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem', alignSelf: 'flex-start', marginTop: 'auto' }}>
                        {isDefense ? <Video size={14} /> : <ExternalLink size={13} />}
                        {isDefense ? 'Ver información de defensa' : 'Ver publicación oficial'}
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
