import React from 'react';
import { Flag, Landmark } from 'lucide-react';
import { useScrollReveal } from '../../utils/reveal';

export const KpiSection = () => {
  useScrollReveal();

  const metrics = [
    { count: 2, prefix: '', suffix: '', label: 'Versiones' },
    { count: 71, prefix: '', suffix: '%', label: 'Conclusión' },
    { count: 22, prefix: '+', suffix: '', label: 'Profesionales' },
    { text: 'Dic 2026', label: 'II versión' },
  ];

  return (
    <section
      aria-label="Indicadores del posgrado"
      style={{
        background: '#0B192C',
        padding: 'clamp(3rem, 6vw, 4.5rem) 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="container">
        {/* Cifras grandes */}
        <div
          data-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 'clamp(1.5rem, 3vw, 2.5rem)',
            textAlign: 'center',
          }}
        >
          {metrics.map((m) => (
            <div key={m.label}>
              {m.text ? (
                <strong style={numStyle}>{m.text}</strong>
              ) : (
                <strong
                  data-count={m.count}
                  data-prefix={m.prefix}
                  data-suffix={m.suffix}
                  style={numStyle}
                >
                  0
                </strong>
              )}
              <span
                style={{
                  display: 'block',
                  marginTop: '0.4rem',
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {m.label}
              </span>
            </div>
          ))}
        </div>

        {/* Franja: terminal y autosostenible */}
        <div
          data-reveal
          style={{
            marginTop: 'clamp(2rem, 4vw, 3rem)',
            paddingTop: 'clamp(1.25rem, 3vw, 1.75rem)',
            borderTop: '1px solid rgba(104,211,145,0.3)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.75rem 1rem',
          }}
        >
          <Chip icon={Flag} text="Maestría terminal" />
          <Chip icon={Landmark} text="Autosostenible" />
        </div>
      </div>
    </section>
  );
};

const numStyle = {
  display: 'block',
  color: '#68d391',
  fontSize: 'clamp(2.6rem, 6vw, 4rem)',
  fontWeight: 900,
  lineHeight: 1,
  letterSpacing: '-0.03em',
};

const Chip = ({ icon: Icon, text }) => (
  <span
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.6rem 1.2rem',
      borderRadius: '999px',
      background: 'rgba(104,211,145,0.12)',
      border: '1px solid rgba(104,211,145,0.4)',
      color: '#ffffff',
      fontSize: '1.05rem',
      fontWeight: 700,
    }}
  >
    <Icon size={18} color="#68d391" aria-hidden="true" />
    {text}
  </span>
);
