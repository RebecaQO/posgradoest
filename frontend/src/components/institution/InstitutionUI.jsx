import React, { useId, useState } from 'react';
import { CheckCircle2, Loader2, RefreshCw, WifiOff } from 'lucide-react';
import './InstitutionTheme.css';

export const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map((p) => p[0] || '').join('').toUpperCase();

/** Indicador del estado real de la conexión con la API / base de datos. */
export function DataStatus({ status, count = 0, noun = 'registros', error, onRetry }) {
  if (status === 'loading') {
    return (
      <div className="data-status data-status--loading" role="status">
        <Loader2 size={15} className="data-status__spin" aria-hidden="true" />
        <span>Sincronizando datos…</span>
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="data-status data-status--error" role="alert" title={error || undefined}>
        <WifiOff size={15} aria-hidden="true" />
        <span>Sin conexión con el servidor</span>
        {onRetry && <button type="button" onClick={onRetry}><RefreshCw size={13} aria-hidden="true" /> Reintentar</button>}
      </div>
    );
  }
  return (
    <div className="data-status data-status--ready" role="status">
      <CheckCircle2 size={15} aria-hidden="true" />
      <span>{count} {noun}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} aria-label="Actualizar datos"><RefreshCw size={13} aria-hidden="true" /></button>
      )}
    </div>
  );
}

/** Párrafo recortado a 3 líneas con botón para leer más. */
export function ExpandableText({ text, className, limit = 150 }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  if (!text) return null;
  return (
    <div className={className}>
      <p id={id} className={`inst-clamp${open ? ' is-open' : ''}`}>{text}</p>
      {text.length > limit && (
        <button type="button" className="inst-link-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          {open ? 'Mostrar menos' : 'Leer más'}
        </button>
      )}
    </div>
  );
}
