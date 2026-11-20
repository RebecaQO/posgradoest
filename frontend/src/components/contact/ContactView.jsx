import React, { useState, useEffect } from 'react';
import { Building, Compass } from 'lucide-react';

import monoblockImg from '../../assets/images/sedes/monoblock.jpg';
import cotacotaImg from '../../assets/images/sedes/cotacota.jpg';
import { institucionService } from '../../services/institucionService';
import './ContactView.css';

export const ContactView = () => {
  const [info, setInfo] = useState({
    direccion: 'Calle 27 de Cota Cota s/n, Campus Universitario UMSA, Edif. Estadística (2do Piso)',
    telefono: '+591 (2) 279-2999',
    whatsapp: '',
    email_principal: 'estapost@fcpn.edu.bo',
    horario_atencion: 'Lunes a Viernes 08:30 a 16:30 (Continuo)',
    director_nombre: 'Dirección de la Carrera de Estadística y Posgrado',
    contacto_etiqueta: 'SEDES DE LA CARRERA',
    contacto_titulo: 'Ubicación de Sedes',
    contacto_descripcion: 'Encuentra las sedes de la Carrera de Estadística en la ciudad de La Paz.'
  });

  // Estado para alternar entre Foto y Mapa en cada tarjeta de sede
  const [sedeViews, setSedeViews] = useState({
    cotacota: 'photo', // 'photo' | 'map'
    monoblock: 'photo'
  });

  const toggleSedeView = (key) => {
    setSedeViews((prev) => ({
      ...prev,
      [key]: prev[key] === 'photo' ? 'map' : 'photo'
    }));
  };

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await institucionService.getInfo();
        const data = response?.data || response;
        if (data && typeof data === 'object') setInfo((prev) => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Error cargando info institucional en ContactView:', err);
      }
    };
    fetchInfo();
  }, []);

  const sedes = [
    {
      key: 'cotacota',
      title: 'Campus Universitario Cota Cota',
      facultad: 'Facultad de Ciencias Puras y Naturales · UMSA',
      img: cotacotaImg,
      imgAlt: 'Campus Universitario Cota Cota - UMSA',
      mapSrc: 'https://maps.google.com/maps?q=Campus+Universitario+Cota+Cota+UMSA+La+Paz&t=&z=16&ie=UTF8&iwloc=&output=embed',
      mapLink: 'https://maps.google.com/?q=Campus+Universitario+Cota+Cota+UMSA+La+Paz',
      direccion: 'Calle 27 de Cota Cota s/n, Zona Sur, La Paz',
      edificio: 'Edificio de la Carrera de Estadística (2do Piso) y Edificio de Ciencias Puras',
      transporte: 'Pumakatari (Ruta Chasquipampa), Minibuses 231, 284, 801, Trurifrutas por Calle 27',
      servicios: 'Aulas de maestría, dirección y defensas de tesis'
    },
    {
      key: 'monoblock',
      title: 'Monoblock Central UMSA',
      facultad: 'Ventanilla de Posgrado FCPN · Plaza del Bicentenario',
      img: monoblockImg,
      imgAlt: 'Monoblock Central UMSA - Edificio Histórico',
      mapSrc: 'https://maps.google.com/maps?q=Monoblock+Central+UMSA+La+Paz&t=&z=16&ie=UTF8&iwloc=&output=embed',
      mapLink: 'https://maps.google.com/?q=Monoblock+Central+UMSA+La+Paz',
      direccion: 'Av. Villazón Nº 1995, Plaza del Bicentenario, Zona Central, La Paz',
      edificio: 'Edificio Viejo Monoblock Central, Planta Baja (Ventanilla FCPN)',
      transporte: 'A 3 minutos de Estación Cancha Zapata (Teleférico Celeste), Av. 16 de Julio y Av. Arce',
      servicios: 'Recepción de expedientes físicos, legalizaciones, sellado de formularios y trámites'
    }
  ];

  return (
    <div className="cv-container animate-fade-in">
      <div className="cv-inner">

        {/* Encabezado */}
        <header className="cv-header">
          <div className="cv-header__kicker">
            <Compass size={15} aria-hidden="true" />
            <span>{info.contacto_etiqueta}</span>
          </div>
          <h1>{info.contacto_titulo}</h1>
          <p>{info.contacto_descripcion}</p>
        </header>

        {/* Directorio editorial de sedes */}
        <div className="cv-sedes-grid">
          {sedes.map((s) => {
            const isMap = sedeViews[s.key] === 'map';
            return (
              <article key={s.key} className="cv-sede-card">
                <div className="cv-media-wrapper">
                  {isMap ? (
                    <iframe
                      title={`Mapa de ${s.title}`}
                      src={s.mapSrc}
                      className="cv-media-iframe"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    <img
                      src={s.img}
                      alt={s.imgAlt}
                      className="cv-media-img"
                      loading="lazy"
                    />
                  )}
                  <button
                    type="button"
                    className="cv-toggle-view-btn"
                    onClick={() => toggleSedeView(s.key)}
                    aria-label={`Alternar entre fotografía y mapa para ${s.title}`}
                  >
                    {isMap ? 'Ver fotografía' : 'Ver mapa'}
                  </button>
                </div>

                <div className="cv-sede-card__body">
                  <div>
                    <h2 className="cv-sede-card__title">{s.title}</h2>
                    <p className="cv-sede-card__facultad">{s.facultad}</p>
                  </div>

                  <dl className="cv-facts-list">
                    <div className="cv-fact-item"><dt>Dirección</dt><dd>{s.direccion}</dd></div>
                    <div className="cv-fact-item"><dt>Edificio</dt><dd>{s.edificio}</dd></div>
                    <div className="cv-fact-item"><dt>Transporte</dt><dd>{s.transporte}</dd></div>
                    <div className="cv-fact-item"><dt>Servicios</dt><dd>{s.servicios}</dd></div>
                  </dl>
                </div>

                <div className="cv-sede-card__footer">
                  <p className="cv-hours-badge">Lunes a Viernes · 08:30 – 16:30</p>

                  <a
                    href={s.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cv-btn-maps"
                    title={`Abrir ${s.title} en Google Maps`}
                  >
                    <span>Abrir en Google Maps ↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Tarjetas de Unidades Adscritas */}
        <section aria-labelledby="units-heading">
          <div className="cv-section-title-bar">
            <div>
              <h2 id="units-heading" className="cv-section-title">Información Institucional</h2>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                Dirección y coordinación académica de los programas de posgrado.
              </p>
            </div>
          </div>

          <div className="cv-units-grid">
            <div className="cv-unit-card">
              <div className="cv-unit-icon" style={{ background: 'var(--color-green-inst-subtle)', color: 'var(--color-green-inst)' }}>
                <Building size={22} aria-hidden="true" />
              </div>
              <div>
                <h4>{info.director_nombre}</h4>
                <p>Dirección y coordinación académica de programas de maestría, especialidades y diplomados.</p>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};
