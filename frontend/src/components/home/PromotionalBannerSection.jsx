import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, CalendarDays, MessageCircle, Users } from 'lucide-react';
import { programaService } from '../../services/programaService';
import cienciaBanner from '../../assets/images/banner/banner_maestria_datos.png';

const meaningful = (value) => {
  if (typeof value !== 'string') return '';
  const text = value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 8 || !/[aeiouáéíóú]/i.test(text)) return '';
  if (/^(.)\1{5,}$/i.test(text) || /^[a-z]{7,}$/i.test(text) && !/[aeiouáéíóú].*[aeiouáéíóú]/i.test(text)) return '';
  return text;
};

const getSubjects = (edition) => {
  const fromModules = (edition?.malla?.modulos || [])
    .flatMap((module) => module.materias || [])
    .map((item) => meaningful(item.materia?.nombre_mat || item.nombre_mat))
    .filter(Boolean);
  const fromDiploma = (edition?.malla?.materias_diplomado || [])
    .map((item) => meaningful(item.materia?.nombre_mat || item.nombre_mat))
    .filter(Boolean);
  return [...new Set([...fromModules, ...fromDiploma])];
};

const getTeachers = (edition) => {
  const teachers = (edition?.docentes || []).map((teacher) =>
    meaningful(teacher.nombre_completo || `${teacher.nombre_doc || ''} ${teacher.apellido_doc || ''}`)
  ).filter(Boolean);
  return [...new Set(teachers)];
};

const titleCaseProgram = (name = '') => name
  .toLocaleLowerCase('es')
  .replace(/\b(maestria)\b/i, 'Maestría')
  .replace(/\b(ciencia|datos|analisis|estadistica|aplicada|gestion|finanzas|economia|educacion)\b/gi, (word) => {
    const accents = { analisis: 'Análisis', estadistica: 'Estadística', economia: 'Economía', educacion: 'Educación', gestion: 'Gestión' };
    return accents[word] || word.charAt(0).toLocaleUpperCase('es') + word.slice(1);
  });

const editionStatus = (edition) => meaningful(edition?.estado) || '';

const scoreProgram = (program) => {
  const editions = program.ediciones || [];
  const edition = editions.find((item) => ['abierta', 'en curso', 'en proceso'].includes((item.estado || '').toLowerCase())) || editions[0];
  const subjects = getSubjects(edition);
  const teachers = getTeachers(edition);
  return [
    meaningful(program.nombre_programa), meaningful(program.descripcion), meaningful(program.area_conocimiento),
    meaningful(program.perfil_aspirante), meaningful(program.perfil_egreso), meaningful(program.informacion_documentada?.mision),
    meaningful(edition?.nombre_edicion), meaningful(edition?.descripcion), meaningful(edition?.requisitos),
    edition?.banner, edition?.folleto, subjects.length, teachers.length,
  ].filter(Boolean).length;
};

export const PromotionalBannerSection = ({ onSelectProgram }) => {
  const [bannerUrl, setBannerUrl] = useState(cienciaBanner);
  const [targetProgram, setTargetProgram] = useState(null);
  const [activeEdition, setActiveEdition] = useState(null);

  useEffect(() => {
    let isMounted = true;
    programaService.getActivos().then((data) => {
      const list = Array.isArray(data) ? data : [];
      const promoted = list.find((program) => program.promocionado);
      const candidates = list.filter((program) => (program.type || program.tipo_programa || '').toLowerCase().includes('maestr'));
      const featured = promoted || [...(candidates.length ? candidates : list)].sort((a, b) => scoreProgram(b) - scoreProgram(a))[0];
      if (!featured) return;
      if (isMounted) {
        setTargetProgram(featured);
        const edicionActiva = featured.ediciones?.find((edicion) => ['Abierta', 'En Curso', 'En Proceso'].includes(edicion.estado))
          ?? featured.ediciones?.[0];
        setActiveEdition(edicionActiva || null);
        const banner = featured.banner || edicionActiva?.banner;
        if (banner) setBannerUrl(banner);
      }
    }).catch((error) => {
      console.error('Error cargando banner promocional desde la base de datos:', error);
    });
    return () => { isMounted = false; };
  }, []);

  const academicDetails = useMemo(() => {
    const subjects = getSubjects(activeEdition);
    const teachers = getTeachers(activeEdition);
    const documented = targetProgram?.informacion_documentada || {};
    const values = [];
    const area = meaningful(targetProgram?.area_conocimiento || targetProgram?.area);
    const summary = meaningful(targetProgram?.descripcion || targetProgram?.description);
    const editionName = meaningful(activeEdition?.nombre_edicion);
    const status = editionStatus(activeEdition);
    const programMode = meaningful(targetProgram?.maestria?.tipo);
    const requirements = meaningful(activeEdition?.requisitos);
    const duration = meaningful(activeEdition?.duracion);
    const schedule = meaningful(activeEdition?.horario);
    if (area) values.push({ label: 'Área académica', value: area, icon: BookOpen });
    if (editionName || status) values.push({ label: 'Edición', value: [editionName, status].filter(Boolean).join(' · '), icon: CalendarDays });
    if (programMode) values.push({ label: 'Modalidad del programa', value: programMode, icon: BookOpen });
    if (duration) values.push({ label: 'Duración', value: duration, icon: CalendarDays });
    if (schedule) values.push({ label: 'Horario', value: schedule, icon: CalendarDays });
    if (requirements) values.push({ label: 'Requisitos', value: requirements, icon: BookOpen });
    if (subjects.length) values.push({ label: 'Asignaturas registradas', value: subjects.join(' · '), icon: BookOpen });
    if (teachers.length) values.push({ label: 'Equipo docente', value: teachers.join(' · '), icon: Users });
    const description = summary || (subjects.length
      ? `La malla curricular registrada incluye ${subjects.join(', ')}.`
      : teachers.length
        ? `La edición cuenta con ${teachers.length} docentes registrados en la base académica.`
        : 'Consulta la información académica disponible para esta maestría.');
    return { description, values, mission: meaningful(documented.mision) };
  }, [activeEdition, targetProgram]);

  const handleRedirect = () => {
    const pid = targetProgram?.id_programa ?? targetProgram?.id;
    if (!pid) return;
    if (onSelectProgram) {
      onSelectProgram(pid);
    } else {
      window.location.hash = `programa/${pid}`;
    }
  };

  const programTitle = titleCaseProgram(meaningful(targetProgram?.nombre_programa || targetProgram?.title) || 'Oferta de Maestría');
  const programType = (targetProgram?.tipo_programa || targetProgram?.type || '').toLowerCase().includes('maestr') ? 'Maestría' : 'Diplomado';
  const whatsappMessage = encodeURIComponent(`Hola, deseo información sobre ${programTitle}${activeEdition?.nombre_edicion ? `, ${activeEdition.nombre_edicion}` : ''}.`);

  return (
    <section
      style={{
        background: '#0B192C',
        width: '100%',
        position: 'relative',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 0.95fr) minmax(0, 1.15fr)',
          width: '100%',
          background: '#0B192C',
          alignItems: 'center',
        }}
        className="promo-banner-grid"
      >
        {/* ── Imagen completa a un lado ── */}
        <div
          onClick={handleRedirect}
          title="Haz clic para ver más información de la maestría"
          style={{
            position: 'relative',
            background: '#060e18',
            cursor: 'pointer',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.75rem 1rem',
            height: '100%',
          }}
          className="promo-image-box"
        >
          <img
            src={bannerUrl}
            alt={`Banner de ${programTitle} - UMSA`}
            style={{
              maxWidth: '100%',
              maxHeight: '340px',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain',
              display: 'block',
              borderRadius: '6px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
              transition: 'transform 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* ── Panel en tono azul elegante ── */}
        <div
          style={{
            background: 'linear-gradient(145deg, #0B192C 0%, #1E3E62 100%)',
            padding: 'clamp(1.5rem, 2.5vw, 2.2rem) clamp(1.5rem, 4vw, 3.5rem)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: '0.75rem',
            color: '#ffffff',
          }}
        >
          {/* Encabezado */}
          <div>
            <p
              style={{
                fontSize: '0.78rem',
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#93c5fd',
                margin: '0 0 0.35rem 0',
              }}
            >
              {programType} · UMSA · Facultad de Ciencias Puras y Naturales · Carrera de Estadística
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 2.5vw, 2.2rem)',
                fontWeight: 900,
                color: '#ffffff',
                margin: 0,
                lineHeight: 1.15,
                letterSpacing: '-0.025em',
              }}
            >
              {programTitle}
            </h2>
            <p
              style={{
                fontSize: '0.92rem',
                color: '#93c5fd',
                margin: '0.25rem 0 0 0',
                fontWeight: 700,
              }}
            >
              {activeEdition ? [meaningful(activeEdition.nombre_edicion), editionStatus(activeEdition)].filter(Boolean).join(' — ') || 'Edición académica vigente' : 'Oferta académica de posgrado'}
            </p>
          </div>

          {/* Párrafo descriptivo alineado al nuevo afiche */}
          <p
            style={{
              fontSize: '0.92rem',
              color: '#e2e8f0',
              lineHeight: 1.6,
              margin: 0,
              maxWidth: '68ch',
            }}
          >
            {academicDetails.description}
          </p>

          {academicDetails.values.length > 0 && (
            <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.8rem 1.5rem', margin: '0.15rem 0 0' }}>
              {academicDetails.values.map(({ label, value, icon: Icon }) => (
                <div key={label} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.18rem' }}>
                  <dt style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', margin: 0, color: '#93c5fd', fontSize: '0.7rem', fontWeight: 750, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    <Icon size={14} aria-hidden="true" />{label}
                  </dt>
                  <dd style={{ margin: 0, color: '#e2e8f0', fontSize: '0.82rem', lineHeight: 1.5 }}>{value}</dd>
                </div>
              ))}
            </dl>
          )}

          {/* Acciones principales */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              flexWrap: 'wrap',
              marginTop: '0.25rem',
            }}
          >
            <button
              onClick={handleRedirect}
              disabled={!targetProgram}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '4px',
                padding: '0.65rem 1.4rem',
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                transition: 'all 0.2s ease',
                opacity: targetProgram ? 1 : 0.65,
                cursor: targetProgram ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Ver más información del {programType.toLocaleLowerCase('es')}</span>
              <ArrowRight size={15} />
            </button>

            <a
              href={`https://wa.me/59176543210?text=${whatsappMessage}`}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                borderRadius: '4px',
                padding: '0.65rem 1.2rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                textDecoration: 'none',
                backdropFilter: 'blur(6px)',
                transition: 'background 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
              <MessageCircle size={15} />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .promo-banner-grid {
            grid-template-columns: 1fr !important;
          }
          .promo-image-box {
            max-height: 240px !important;
            min-height: 200px !important;
          }
        }
      `}</style>
    </section>
  );
};
