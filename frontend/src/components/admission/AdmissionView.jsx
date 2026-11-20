import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, GraduationCap, MessageCircle } from 'lucide-react';
import { programaService } from '../../services/programaService';
import { useInstitutionWhatsApp } from '../../hooks/useInstitutionWhatsApp';

export const AdmissionView = ({ targetProgramId = null }) => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState(targetProgramId || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    programaService.getActivos()
      .then((items) => {
        if (!mounted) return;
        const available = Array.isArray(items) ? items : [];
        setPrograms(available);
        setSelectedProgramId((current) => {
          if (targetProgramId && available.some((program) => String(program.id) === String(targetProgramId))) return String(targetProgramId);
          return current || String(available[0]?.id || '');
        });
      })
      .catch(() => { if (mounted) setError('No se pudo cargar la oferta académica.'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [targetProgramId]);

  const program = programs.find((item) => String(item.id) === String(selectedProgramId)) || programs[0] || null;
  const whatsappUrl = useInstitutionWhatsApp(program
    ? `Hola, deseo información sobre ${program.title}.`
    : 'Hola, deseo información sobre la oferta académica de Posgrado en Estadística.');
  const pdfUrl = typeof program?.enlace_pdf_programa === 'string' && /^https:\/\//i.test(program.enlace_pdf_programa)
    ? program.enlace_pdf_programa
    : null;

  return (
    <section className="section-spacing animate-fade-in" style={{ background: '#f8fafc' }} aria-labelledby="academic-offer-title">
      <div className="container" style={{ maxWidth: 1000 }}>
        <header className="section-header">
          <div className="section-tag"><GraduationCap size={14} /><span>OFERTA ACADÉMICA</span></div>
          <h1 id="academic-offer-title" className="section-title">Programas de Posgrado en Estadística</h1>
          <p className="section-subtitle">Conozca los programas y consulte directamente a la Carrera de Estadística para recibir información actualizada.</p>
        </header>

        {error && <p role="alert">{error}</p>}
        {loading && <p role="status">Cargando programas…</p>}
        {!loading && !error && programs.length === 0 && <p>No hay programas publicados en este momento.</p>}

        {programs.length > 0 && (
          <div className="glass-card" style={{ background: '#fff', padding: '2rem', borderTop: '4px solid var(--color-green-inst)' }}>
            <label className="form-group" htmlFor="academic-program-select">Programa académico
              <select id="academic-program-select" className="form-select" value={selectedProgramId} onChange={(event) => setSelectedProgramId(event.target.value)}>
                {programs.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
            </label>

            {program && <article aria-live="polite" style={{ marginTop: '1.5rem' }}>
              <p className="section-tag">{program.type || 'Posgrado'}{program.periodo ? ` · ${program.periodo}` : ''}</p>
              <h2 style={{ color: 'var(--color-umsa-blue-dark)' }}>{program.title}</h2>
              {program.description && <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{program.description}</p>}
              {(program.duration || program.modality) && <p><strong>Modalidad y duración:</strong> {[program.modality, program.duration].filter(Boolean).join(' · ')}</p>}

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.75rem', marginTop: '1.5rem' }}>
                {pdfUrl && <a className="btn btn-secondary" href={pdfUrl} target="_blank" rel="noopener noreferrer"><FileText size={16} /> Información del programa <ExternalLink size={14} /></a>}
                {whatsappUrl && <a className="btn btn-primary" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={16} /> Consultar información</a>}
              </div>
            </article>}
          </div>
        )}
      </div>
    </section>
  );
};
