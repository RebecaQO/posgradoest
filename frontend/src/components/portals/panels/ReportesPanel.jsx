import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, Printer, RefreshCw } from 'lucide-react';
import { apiJson } from '../../../utils/api';
import './ReportesPanel.css';

const REPORTES = [
  { id: 'resumen', label: 'Resumen general' },
  { id: 'ediciones', label: 'Versiones, ediciones y materias' },
  { id: 'docentes', label: 'Lista de docentes' },
  { id: 'defensas-actuales', label: 'Defensas actuales' },
  { id: 'historial-defensas', label: 'Historial de defensas' },
];

const desanidar = (respuesta) => respuesta?.data ?? respuesta;
const lista = (valor) => Array.isArray(valor) ? valor : [];
const docenteNombre = (docente) => [
  docente?.titulo_academico || docente?.titulo,
  docente?.nombre_completo || `${docente?.nombre_doc || docente?.nombre || ''} ${docente?.apellido_doc || docente?.apellido || ''}`.trim(),
].filter(Boolean).join(' ') || `Docente #${docente?.id_doc ?? docente?.id ?? '?'}`;
const fechaLocal = () => {
  const partes = new Intl.DateTimeFormat('en', {
    timeZone: 'America/La_Paz', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date()).reduce((resultado, parte) => ({ ...resultado, [parte.type]: parte.value }), {});
  return `${partes.year}-${partes.month}-${partes.day}`;
};
const formatFecha = (fecha) => {
  if (!fecha) return '—';
  const valor = String(fecha).slice(0, 10);
  const [year, month, day] = valor.split('-');
  return year && month && day ? `${day}/${month}/${year}` : valor;
};
const nombrePrograma = (edicion) => edicion?.programa?.nombre_programa || `Programa #${edicion?.id_programa ?? '?'}`;
const estadoDefensa = (defensa, hoy) => String(defensa?.fecha_defensa || '').slice(0, 10) >= hoy ? 'actual' : 'historial';

const normalizarMateria = (relacion) => {
  const materia = relacion?.materia || relacion;
  return {
    nombre: materia?.nombre_mat || materia?.nombre || 'Materia sin nombre',
    descripcion: materia?.descripcion || '',
    creditos: relacion?.pivot?.creditos ?? relacion?.creditos ?? '—',
    carga: relacion?.pivot?.carga_horaria ?? relacion?.carga_horaria ?? '—',
  };
};

const materiasDeEdicion = (edicion) => {
  const malla = edicion?.malla;
  if (!malla) return [];
  const modulos = lista(malla.modulos).flatMap((modulo) => lista(modulo.materias).map((materia) => ({
    ...normalizarMateria(materia), modulo: modulo.nombre_mod || 'Módulo',
  })));
  const directas = lista(malla.materias_diplomado || malla.materiasDiplomado).map((materia) => ({
    ...normalizarMateria(materia), modulo: 'Plan del diplomado',
  }));
  return [...modulos, ...directas];
};

const asignacionesDocente = (docente, ediciones) => ediciones
  .filter((edicion) => lista(edicion.docentes).some((asignado) => Number(asignado.id_doc ?? asignado.id) === Number(docente.id_doc ?? docente.id)))
  .map((edicion) => `${nombrePrograma(edicion)} · ${edicion.nombre_edicion || `Edición #${edicion.id_edicion}`}`);

const tarjeta = (titulo, valor, detalle) => (
  <article className="report-metric-card" key={titulo}>
    <span>{titulo}</span><strong>{valor}</strong><small>{detalle}</small>
  </article>
);

export default function ReportesPanel() {
  const [datos, setDatos] = useState({ programas: [], ediciones: [], docentes: [], defensas: [] });
  const [reporte, setReporte] = useState('ediciones');
  const [programaFiltro, setProgramaFiltro] = useState('todos');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actualizado, setActualizado] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const respuesta = desanidar(await apiJson('/api/admin/reportes/metricas'));
      setDatos({
        programas: lista(respuesta?.programas),
        ediciones: lista(respuesta?.ediciones),
        docentes: lista(respuesta?.docentes),
        defensas: lista(respuesta?.defensas),
      });
      setActualizado(new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' }));
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los datos de los reportes.');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const hoy = fechaLocal();
  const edicionesFiltradas = useMemo(() => datos.ediciones.filter((edicion) => (
    programaFiltro === 'todos' || String(edicion.id_programa) === programaFiltro
  )), [datos.ediciones, programaFiltro]);
  const docentesFiltrados = useMemo(() => datos.docentes.filter((docente) => (
    programaFiltro === 'todos' || asignacionesDocente(docente, edicionesFiltradas).length > 0
  )), [datos.docentes, edicionesFiltradas, programaFiltro]);
  const defensasFiltradas = useMemo(() => datos.defensas.filter((defensa) => (
    (programaFiltro === 'todos' || String(defensa.edicion?.id_programa) === programaFiltro) &&
    (reporte === 'defensas-actuales' ? estadoDefensa(defensa, hoy) === 'actual' : estadoDefensa(defensa, hoy) === 'historial')
  )), [datos.defensas, programaFiltro, reporte, hoy]);

  const materiasContadas = edicionesFiltradas.reduce((total, edicion) => total + materiasDeEdicion(edicion).length, 0);
  const defensasDelFiltro = datos.defensas.filter((defensa) => programaFiltro === 'todos' || String(defensa.edicion?.id_programa) === programaFiltro);
  const defensasActuales = defensasDelFiltro.filter((defensa) => estadoDefensa(defensa, hoy) === 'actual').length;
  const defensasHistoricas = defensasDelFiltro.length - defensasActuales;
  const edicionesVigentes = edicionesFiltradas.filter((edicion) => !['Concluida', 'Cancelada'].includes(edicion.estado)).length;
  const programasFiltrados = datos.programas.filter((programa) => programaFiltro === 'todos' || String(programa.id_programa) === programaFiltro);
  const tituloReporte = REPORTES.find((item) => item.id === reporte)?.label || 'Reportes administrativos';

  const imprimir = () => {
    const tituloOriginal = document.title;
    document.title = `Reporte - ${tituloReporte} - ${new Date().toLocaleDateString('es-BO')}`;
    window.print();
    window.setTimeout(() => { document.title = tituloOriginal; }, 1000);
  };

  return (
    <section className="admin-reports animate-fade-in">
      <div className="report-header">
        <div>
          <h2>Métricas y reportes académicos</h2>
          <p>Consulta versiones, ediciones, docentes, materias y defensas. Los informes se pueden imprimir o guardar como PDF.</p>
        </div>
        <div className="report-actions report-screen-only">
          <button type="button" className="btn btn-secondary" onClick={cargar} disabled={cargando}>
            <RefreshCw size={16} /> Actualizar
          </button>
          <button type="button" className="btn btn-primary" onClick={imprimir} disabled={cargando || Boolean(error)}>
            <Download size={16} /> Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {error && <div className="em-alert em-alert-error" role="alert">{error}</div>}
      {cargando && <p role="status">Cargando registros para los reportes…</p>}

      {!cargando && !error && <>
        <div className="report-metrics-grid report-screen-only">
          {tarjeta('Programas / versiones', programasFiltrados.length, 'Registros académicos')}
          {tarjeta('Ediciones vigentes', edicionesVigentes, `De ${edicionesFiltradas.length} ediciones registradas`)}
          {tarjeta('Docentes registrados', datos.docentes.length, `${docentesFiltrados.length} vinculados al filtro actual`)}
          {tarjeta('Materias en ediciones', materiasContadas, 'Incluye materias repetidas en distintas ediciones')}
          {tarjeta('Defensas actuales', defensasActuales, `Desde ${formatFecha(hoy)}`)}
          {tarjeta('Historial de defensas', defensasHistoricas, 'Defensas con fecha anterior')}
        </div>

        <div className="report-filters report-screen-only">
          <label>Programa / versión
            <select value={programaFiltro} onChange={(event) => setProgramaFiltro(event.target.value)}>
              <option value="todos">Todos los programas</option>
              {datos.programas.map((programa) => <option key={programa.id_programa} value={programa.id_programa}>{programa.nombre_programa}</option>)}
            </select>
          </label>
          <small>{actualizado ? `Datos actualizados: ${actualizado}` : ''}</small>
        </div>

        <nav className="report-tabs report-screen-only" aria-label="Tipo de reporte">
          {REPORTES.map((item) => (
            <button key={item.id} type="button" className={reporte === item.id ? 'active' : ''} onClick={() => setReporte(item.id)}>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="report-print-area">
          <header className="report-print-heading">
            <h1>{tituloReporte}</h1>
            <p>Posgrado en Estadística · Universidad Mayor de San Andrés</p>
            <p>Generado: {new Date().toLocaleString('es-BO', { timeZone: 'America/La_Paz' })}</p>
            {programaFiltro !== 'todos' && <p>Programa: {datos.programas.find((programa) => String(programa.id_programa) === programaFiltro)?.nombre_programa}</p>}
          </header>

          {reporte === 'resumen' && <>
            <div className="report-summary-grid">
              {tarjeta('Programas / versiones', programasFiltrados.length, 'Registros académicos')}
              {tarjeta('Ediciones vigentes', edicionesVigentes, `De ${edicionesFiltradas.length} ediciones registradas`)}
              {tarjeta('Docentes registrados', docentesFiltrados.length, 'Nómina general o docentes asignados al programa')}
              {tarjeta('Materias en ediciones', materiasContadas, 'Materias contadas por edición')}
              {tarjeta('Defensas actuales', defensasActuales, `Desde ${formatFecha(hoy)}`)}
              {tarjeta('Historial de defensas', defensasHistoricas, 'Defensas con fecha anterior')}
            </div>
            <p className="report-summary-note">Las cifras se calculan con los registros actuales del sistema y se actualizan al pulsar «Actualizar».</p>
          </>}

          {reporte === 'ediciones' && (
            <div className="report-editions-list">
              <h2 className="report-section-title">Programas y versiones</h2>
              <table className="report-table">
                <thead><tr><th>Programa / versión</th><th>Tipo</th><th>Área</th><th>Estado</th><th>Ediciones</th></tr></thead>
                <tbody>{programasFiltrados.length === 0 ? <tr><td colSpan={5}>No hay programas registrados para este filtro.</td></tr> : programasFiltrados.map((programa) => {
                  const cantidadEdiciones = datos.ediciones.filter((edicion) => Number(edicion.id_programa) === Number(programa.id_programa)).length;
                  return <tr key={programa.id_programa}><td>{programa.nombre_programa}</td><td>{programa.tipo_programa || '—'}</td><td>{programa.area_conocimiento || '—'}</td><td>{programa.activo ? 'Activo' : 'Inactivo'}</td><td>{cantidadEdiciones}</td></tr>;
                })}</tbody>
              </table>
              {edicionesFiltradas.length === 0 && <p>No hay ediciones para el filtro seleccionado.</p>}
              {edicionesFiltradas.map((edicion) => {
                const materias = materiasDeEdicion(edicion);
                return (
                  <article className="report-edition" key={edicion.id_edicion}>
                    <header>
                      <div><h2>{nombrePrograma(edicion)}</h2><h3>{edicion.nombre_edicion || `Edición #${edicion.id_edicion}`}</h3></div>
                      <strong>{edicion.estado || 'Sin estado'}</strong>
                    </header>
                    <div className="report-edition-meta">
                      <span>Tipo: {edicion.programa?.tipo_programa || '—'}</span>
                      <span>Periodo: {formatFecha(edicion.fecha_inicio)} – {formatFecha(edicion.fecha_fin)}</span>
                      <span>Versión curricular: {edicion.malla?.nombre_malla || 'Sin malla asociada'}</span>
                    </div>
                    <h4>Docentes asignados ({lista(edicion.docentes).length})</h4>
                    {lista(edicion.docentes).length ? <ul className="report-teacher-list">{edicion.docentes.map((docente) => <li key={docente.id_doc ?? docente.id}>{docenteNombre(docente)}</li>)}</ul> : <p className="report-empty">Sin docentes asignados a esta edición.</p>}
                    <h4>Materias detalladas ({materias.length})</h4>
                    {materias.length ? (
                      <table className="report-table">
                        <thead><tr><th>Módulo</th><th>Materia</th><th>Créditos</th><th>Carga horaria</th><th>Descripción</th></tr></thead>
                        <tbody>{materias.map((materia, index) => <tr key={`${materia.modulo}-${materia.nombre}-${index}`}>
                          <td>{materia.modulo}</td><td>{materia.nombre}</td><td>{materia.creditos}</td><td>{materia.carga} h</td><td>{materia.descripcion || '—'}</td>
                        </tr>)}</tbody>
                      </table>
                    ) : <p className="report-empty">La malla de esta edición no tiene materias registradas.</p>}
                  </article>
                );
              })}
            </div>
          )}

          {reporte === 'docentes' && (
            <table className="report-table">
              <thead><tr><th>#</th><th>Docente</th><th>Especialidad</th><th>Correo</th><th>Ediciones asignadas</th><th>Estado</th></tr></thead>
              <tbody>{docentesFiltrados.length === 0 ? <tr><td colSpan={6}>No hay docentes registrados para este filtro.</td></tr> : docentesFiltrados.map((docente, index) => <tr key={docente.id_doc ?? docente.id}>
                <td>{index + 1}</td><td>{docenteNombre(docente)}</td><td>{docente.especialidad || '—'}</td><td>{docente.email || '—'}</td>
                <td>{asignacionesDocente(docente, edicionesFiltradas).join('; ') || 'Sin asignación registrada'}</td><td>{docente.activo ? 'Activo' : 'Inactivo'}</td>
              </tr>)}</tbody>
            </table>
          )}

          {(reporte === 'defensas-actuales' || reporte === 'historial-defensas') && (
            <table className="report-table">
              <thead><tr><th>Fecha</th><th>Hora</th><th>Defensa / tesis</th><th>Autor</th><th>Tutor</th><th>Programa y edición</th><th>Resultado</th><th>Publicación</th></tr></thead>
              <tbody>{defensasFiltradas.map((defensa) => <tr key={defensa.id_defensa ?? defensa.id}>
                <td>{formatFecha(defensa.fecha_defensa)}</td><td>{defensa.hora_defensa || '—'}</td>
                <td>{defensa.nombre_defensa || defensa.titulo_tesis || `Defensa #${defensa.id_defensa ?? defensa.id}`}</td>
                <td>{defensa.autor || '—'}</td><td>{defensa.tutor || '—'}</td>
                <td>{nombrePrograma(defensa.edicion)} · {defensa.edicion?.nombre_edicion || `Edición #${defensa.id_edicion}`}</td>
                <td>{defensa.resultado || 'Pendiente'}</td><td>{defensa.publicado ? 'Publicada' : 'No publicada'}</td>
              </tr>)}</tbody>
            </table>
          )}
          {(reporte === 'defensas-actuales' || reporte === 'historial-defensas') && defensasFiltradas.length === 0 && <p>No hay defensas para este informe y filtro.</p>}
        </div>
      </>}
    </section>
  );
}
