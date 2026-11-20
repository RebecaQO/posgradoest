import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Send,
  Check,
  MessageCircle
} from 'lucide-react';
import logoPosgrado from '../../assets/images/logo/logo_posgrado.jpg';
import { institucionService } from '../../services/institucionService';

export const Footer = ({ onNavigate }) => {
  const [emailSub, setEmailSub] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [info, setInfo] = useState({
    direccion: 'Campus Universitario Cota Cota Calle 27, Edif. Estadística (2do Piso)',
    telefono: '+591 (2) 279-2999',
    whatsapp: '',
    email_principal: 'estapost@fcpn.edu.bo',
    campus_virtual_url: ''
  });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await institucionService.getInfo();
        const data = response?.data || response;
        if (data && typeof data === 'object') setInfo(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Error cargando info institucional en Footer:', err);
      }
    };
    fetchInfo();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (emailSub) {
      setSubscribed(true);
      setTimeout(() => setSubscribed(false), 4000);
      setEmailSub('');
    }
  };

  const linkStyle = {
    color: '#d6e8df',
    textDecoration: 'none',
    fontSize: '0.85rem',
    transition: 'color 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    lineHeight: 1.6
  };

  const headingStyle = {
    color: '#ffffff',
    fontSize: '0.82rem',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    marginBottom: '1.1rem',
    paddingBottom: '0.6rem',
    borderBottom: '1px solid rgba(255,255,255,0.12)'
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #0c2a1a 0%, #122d1f 30%, #0f2d3d 70%, #0e243a 100%)',
      color: 'rgba(255,255,255,0.85)',
      position: 'relative'
    }}>
      {/* ══════ MAIN FOOTER CONTENT ══════ */}
      <div className="container" style={{ padding: '3.5rem 1.5rem 2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem'
        }}>

          {/* ── Col 1: Institución / Logo ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.2rem' }}>
              <img
                src={logoPosgrado}
                alt="Posgrado Estadística UMSA"
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.2)'
                }}
              />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.25 }}>
                  UMSA
                </div>
                <div style={{ fontSize: '0.72rem', color: '#c4d6cd', fontWeight: 500 }}>
                  Postgrado · Estadística
                </div>
              </div>
            </div>
            <p style={{
              fontSize: '0.82rem',
              lineHeight: 1.65,
              color: '#c4d6cd',
              margin: '0 0 1.25rem 0'
            }}>
              Unidad de Postgrado de Estadística — Carrera de Estadística, FCPN.
              Formación de cuarto nivel acreditada por el CEUB.
            </p>

            {/* Redes Sociales */}
            <div style={{ display: 'flex', gap: '0.55rem' }}>
              {[
                { href: info.facebook_url, label: 'Facebook', path: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z', hoverBg: '#1877f2' },
                { href: info.instagram_url, label: 'Instagram', path: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z', hoverBg: '#c13584' },
              ].filter((social) => social.href).map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = social.hoverBg;
                    e.currentTarget.style.borderColor = social.hoverBg;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* ── Col 2: La Institución (Enlaces) ── */}
          <div>
            <h4 style={headingStyle}>La Institución</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
              {[
                { label: 'Carrera de Estadística', href: info.estadistica_url },
                { label: 'Revista Varianza (IETA)', href: info.revista_varianza_url },
                { label: 'Sociedad de Estadística', href: info.sociest_url },
                { label: 'Programas de Postgrado', action: () => onNavigate('programas') },
                { label: 'Campus Virtual', href: info.campus_virtual_url },
              ].filter((item) => item.href || item.action).map((item) => (
                <li key={item.label}>
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      style={linkStyle}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#d6e8df'}
                    >
                      <ExternalLink size={12} style={{ opacity: 0.5 }} />
                      <span>{item.label}</span>
                    </a>
                  ) : (
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); item.action(); }}
                      style={linkStyle}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'}
                      onMouseLeave={(e) => e.currentTarget.style.color = '#d6e8df'}
                    >
                      <span>{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* ── Col 3: ¿Dónde estamos? (Contacto) ── */}
          <div>
            <h4 style={headingStyle}>¿Dónde Estamos?</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.84rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', color: '#d6e8df' }}>
                <MapPin size={15} style={{ color: '#4ade80', flexShrink: 0, marginTop: '2px' }} />
                <span>{info.direccion}</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', color: '#d6e8df' }}>
                <MapPin size={15} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>Av. Villazón Nº 1995, Plaza del Bicentenario · Monoblock Central</span>
              </div>

              <a href={`mailto:${info.email_principal}`}
                style={{ ...linkStyle, color: '#4ade80', fontWeight: 600 }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                <Mail size={14} />
                <span>{info.email_principal}</span>
              </a>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#d6e8df' }}>
                <Phone size={14} style={{ color: '#c4d6cd' }} />
                <span>{info.telefono}</span>
              </div>
            </div>
          </div>

          {/* ── Col 4: Escríbenos / Boletín ── */}
          <div>
            <h4 style={headingStyle}>Escríbenos</h4>

            {/* WhatsApp */}
            {String(info.whatsapp || '').replace(/\D/g, '').length >= 8 && <a
              href={`https://wa.me/${String(info.whatsapp).replace(/\D/g, '')}?text=${encodeURIComponent('Hola, me interesa información sobre los programas de Postgrado en Estadística UMSA.')}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#176b45',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                fontSize: '0.82rem',
                fontWeight: 700,
                textDecoration: 'none',
                marginBottom: '1.25rem',
                transition: 'all 0.2s ease',
                boxShadow: '0 3px 12px rgba(37, 211, 102, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#125236';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#176b45';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <MessageCircle size={15} />
              <span>WhatsApp: {info.whatsapp}</span>
            </a>}

            {/* Boletín */}
            <div style={{
              fontSize: '0.78rem',
              color: '#c4d6cd',
              marginBottom: '0.65rem',
              fontWeight: 500
            }}>
              Recibe convocatorias y novedades:
            </div>

            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '0' }}>
              <input
                type="email"
                required
                placeholder="tu.correo@ejemplo.com"
                value={emailSub}
                onChange={(e) => setEmailSub(e.target.value)}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRight: 'none',
                  borderRadius: '6px 0 0 6px',
                  padding: '0.55rem 0.75rem',
                  fontSize: '0.8rem',
                  color: '#ffffff',
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                style={{
                  background: '#1e5f35',
                  border: '1px solid #1e5f35',
                  borderRadius: '0 6px 6px 0',
                  padding: '0.55rem 0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#267342'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1e5f35'}
              >
                {subscribed ? <Check size={15} /> : <Send size={15} />}
              </button>
            </form>

            {subscribed && (
              <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem' }}>
                ✓ ¡Suscripción confirmada!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════ BOTTOM BAR ══════ */}
      <div style={{
        borderTop: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(0,0,0,0.15)'
      }}>
        <div className="container" style={{
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          fontSize: '0.75rem',
              color: '#c4d6cd'
        }}>
          <span>
            © 2026 Unidad de Postgrado · Carrera de Estadística, FCPN – UMSA
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a
              href="http://www.ceub.edu.bo"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#d6e8df', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#d6e8df'}
            >
              Normativa CEUB
            </a>
            <a
              href="https://repositorio.umsa.bo"
              target="_blank"
              rel="noreferrer"
              style={{ color: '#d6e8df', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#d6e8df'}
            >
              Repositorio UMSA
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); onNavigate('normativa'); }}
              style={{ color: '#d6e8df', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#86efac'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#d6e8df'}
            >
              Transparencia
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
