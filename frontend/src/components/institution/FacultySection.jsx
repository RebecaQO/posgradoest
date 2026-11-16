import React, { useState, useMemo, useEffect } from 'react';
import {
  AlertTriangle,
  ExternalLink,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
} from 'lucide-react';
import { DataStatus, getInitials } from './InstitutionUI';
import './FacultySection.css';

const normalize = (p, i) => {
  const name = (p.nombre_completo || p.name || `${p.nombre_doc || p.nombre || ''} ${p.apellido_doc || p.apellido || ''}`).trim();
  return {
    key: p.id_docente ?? p.id ?? `docente-${i}`,
    name: name || 'Docente Investigador',
    degree: p.titulo_academico || p.titulo || p.degree || '',
    specialty: p.especialidad || p.specialty || '',
    bio: p.descripcion_profesional || p.bio || '',
    institution: p.universidad || p.institution || 'Universidad Mayor de San Andrés',
    photo: p.foto_url || p.avatar || '',
    email: p.email || '',
    phone: p.telefono || '',
    office: p.oficina || '',
    bibliographyUrl: p.bibliografia_url || null,
  };
};

const portraitTones = [
  { tone: '#1d5fd0', wash: '#e8f0fd' },
  { tone: '#0f7b4b', wash: '#e7f4ec' },
  { tone: '#0e8a8a', wash: '#e5f4f3' },
  { tone: '#8a5a9e', wash: '#f2eaf5' },
  { tone: '#a66a16', wash: '#f8f0e3' },
];

function FacultyAvatar({ nombre, photo, tone }) {
  const [ok, setOk] = useState(Boolean(photo));
  useEffect(() => { setOk(Boolean(photo)); }, [photo]);

  return (
    <figure className="faculty-row__photo" style={{ '--teacher-photo-tone': tone.tone, '--teacher-photo-wash': tone.wash }}>
      {ok ? (
        <img
          src={photo}
          alt=""
          loading="lazy"
          onError={() => setOk(false)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(nombre) || '?'}</span>
      )}
      <figcaption className="sr-only">Fotografía de {nombre}</figcaption>
    </figure>
  );
}

function FacultyCard({ person, index }) {
  return (
    <article className="faculty-card faculty-directory-card">
      <div className="directory-row__identity">
        <FacultyAvatar nombre={person.name} photo={person.photo} tone={portraitTones[index % portraitTones.length]} />
        <div>
          <h3 className="faculty-card__name">{person.name}</h3>
          {person.specialty && <p className="directory-row__role">{person.specialty}</p>}
          {person.degree && <p className="directory-row__degree">{person.degree}</p>}
        </div>
      </div>
      <address className="directory-row__contact" aria-label={`Contacto de ${person.name}`}>
        {person.email && <a href={`mailto:${person.email}`}><Mail size={16} aria-label="Correo electrónico" /><span>{person.email}</span></a>}
        {person.phone && <a href={`tel:${String(person.phone).replace(/[^\d+]/g, '')}`}><Phone size={16} aria-label="Teléfono" /><span>{person.phone}</span></a>}
        {person.office && <span className="directory-row__plain"><MapPin size={16} aria-label="Oficina" />{person.office}</span>}
        {!person.email && !person.phone && !person.office && <span className="directory-row__muted">Datos de contacto no registrados</span>}
      </address>
      <div className="directory-row__location">
        <span className="directory-row__label">Institución</span>
        <span>{person.institution}</span>
      </div>
      {person.bibliographyUrl && (
        <a href={person.bibliographyUrl} target="_blank" rel="noreferrer" className="directory-row__publication" title={`Ver producción científica de ${person.name}`}>
          Publicaciones <ExternalLink size={14} aria-hidden="true" />
        </a>
      )}
    </article>
  );
}

export default function FacultySection({
  faculty = [],
  status = 'loading',
  error = '',
  onRetry
}) {
  const people = useMemo(() => faculty.map(normalize), [faculty]);

  const loading = status === 'loading' && people.length === 0;
  const failed = status === 'error' && people.length === 0;
  const empty = status === 'ready' && people.length === 0;

  return (
    <section className="faculty-section" aria-labelledby="faculty-heading">
      <div className="faculty-section__inner">
        {/* Encabezado */}
        <header className="faculty-header">
          <div>
            <h2 id="faculty-heading">Docentes e Investigadores de Posgrado</h2>
            <p>
              Catedráticos de alto nivel que imparten las asignaturas de maestría y especialidad, guían defensas de tesis y lideran líneas de investigación.
            </p>
          </div>
          {status !== 'ready' && <DataStatus
            status={status}
            count={people.length}
            noun={people.length === 1 ? 'docente' : 'docentes'}
            error={error}
            onRetry={onRetry}
          />}
        </header>

        {/* Estados de Carga, Error y Vacío */}
        {loading && (
          <div className="faculty-cards-grid" aria-hidden="true">
            {[1, 2, 3].map((n) => (
              <div key={n} className="directory-skeleton-row">
                <div style={{ height: '60px', background: 'var(--color-border-subtle)', borderRadius: '8px' }} />
                <div className="staff-skeleton-line" style={{ width: '70%', height: '18px' }} />
                <div className="staff-skeleton-line" style={{ width: '50%' }} />
                <div className="staff-skeleton-line" style={{ width: '90%' }} />
                <div className="staff-skeleton-line" style={{ width: '80%' }} />
              </div>
            ))}
          </div>
        )}

        {failed && (
          <div className="faculty-error" role="alert">
            <div className="faculty-error__icon"><AlertTriangle size={25} aria-hidden="true" /></div>
            <div className="faculty-error__copy">
              <span className="faculty-error__eyebrow">Directorio temporalmente no disponible</span>
              <h3>No pudimos conectar con la planta docente</h3>
              <p>Estamos intentando recuperar la información. Puedes volver a consultar en un momento.</p>
              {error && <code>{error}</code>}
            </div>
            {onRetry && (
              <button type="button" onClick={onRetry} className="faculty-error__retry">
                <RefreshCw size={16} aria-hidden="true" />
                <span>Volver a intentar</span>
              </button>
            )}
          </div>
        )}

        {empty && (
          <div className="inst-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', background: '#ffffff', borderRadius: '14px', border: '1px dashed var(--color-border)' }}>
            <GraduationCap size={32} style={{ color: 'var(--color-text-subtle)', marginBottom: '0.75rem' }} />
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text-main)' }}>Sin docentes registrados</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>No se encontraron registros de docentes activos en la base de datos.</p>
          </div>
        )}

        {/* Grid de Tarjetas de Docentes */}
        {people.length > 0 && (
          <div className="faculty-cards-grid">
            {people.map((person, index) => (
              <FacultyCard key={person.key} person={person} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
