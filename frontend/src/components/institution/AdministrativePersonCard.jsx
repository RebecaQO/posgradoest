import React, { useEffect, useState } from 'react';
import { Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { ExpandableText, getInitials } from './InstitutionUI';

export default function AdministrativePersonCard({ person, featured = false, tone = 'green' }) {
  const nombre = person.nombre?.trim() || 'Nombre no registrado';
  const [showPhoto, setShowPhoto] = useState(Boolean(person.foto_url));
  const [copied, setCopied] = useState(false);

  useEffect(() => { setShowPhoto(Boolean(person.foto_url)); }, [person.foto_url]);
  useEffect(() => {
    if (!copied) return undefined;
    const t = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(t);
  }, [copied]);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(person.email);
      setCopied(true);
    } catch {
      window.prompt('Copia el correo:', person.email);
    }
  };

  return (
    <article className={`institution-person-card tone-${tone}${featured ? ' institution-person-card--featured' : ''}`}>
      <div className="institution-person-card__avatar">
        {showPhoto ? (
          <img src={person.foto_url} alt={`Fotografía de ${nombre}`} loading="lazy" onError={() => setShowPhoto(false)} />
        ) : <span aria-hidden="true">{getInitials(nombre) || '?'}</span>}
      </div>

      <div className="institution-person-card__content">
        <span className="institution-person-card__role">{person.cargo || 'Personal administrativo'}</span>
        <h4>{nombre}</h4>
        {person.grado && <p className="institution-person-card__degree">{person.grado}</p>}
        <ExpandableText text={person.biografia} className="institution-person-card__bio" />
      </div>

      {(person.email || person.telefono || person.oficina) && (
        <div className="institution-person-card__actions">
          {person.email && (
            <span className="institution-action-group">
              <a className="institution-action" href={`mailto:${person.email}`} aria-label={`Enviar correo a ${nombre}: ${person.email}`}>
                <Mail size={15} aria-hidden="true" /><span>{person.email}</span>
              </a>
              <button type="button" className="institution-action institution-action--icon" onClick={copyEmail} aria-label={copied ? 'Correo copiado' : `Copiar correo de ${nombre}`}>
                {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
              </button>
            </span>
          )}
          {person.telefono && (
            <a className="institution-action" href={`tel:${String(person.telefono).replace(/[^\d+]/g, '')}`} aria-label={`Llamar a ${nombre}: ${person.telefono}`}>
              <Phone size={15} aria-hidden="true" /><span>{person.telefono}</span>
            </a>
          )}
          {person.oficina && (
            <span className="institution-person-card__location"><MapPin size={15} aria-hidden="true" /><span>{person.oficina}</span></span>
          )}
        </div>
      )}
      <span className="institution-sr-only" role="status">{copied ? 'Correo copiado al portapapeles' : ''}</span>
    </article>
  );
}
