import { useState, useEffect } from 'react';
import { defensaService } from '../services/defensaService';

export function useDefensas() {
  const [defensas, setDefensas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDefensas = async () => {
    setError(null);
    try {
      const data = await defensaService.getDefensasPublicas();
      const rows = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setDefensas(rows.map((defensa) => ({
        id: defensa.id,
        programa: defensa.edicion?.programa,
        imagen: defensa.imagen_url || defensa.imagen || defensa.edicion?.banner,
        fecha: defensa.fecha_defensa,
        hora: defensa.hora_defensa,
        nombre: defensa.nombre_defensa || `Defensa de ${defensa.autor || 'tesis'}`,
        titulo: defensa.titulo_tesis,
        postulante: defensa.autor,
        tutor: defensa.tutor,
        modalidad: defensa.modalidad || defensa.edicion?.modalidad,
        lugar: defensa.lugar,
        estado: 'Programada',
      })));
    } catch (err) {
      console.error('Error cargando defensas de tesis:', err);
      setError(err.message || 'Error al cargar defensas de tesis');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefensas();
    const intervalId = window.setInterval(fetchDefensas, 60_000);
    window.addEventListener('focus', fetchDefensas);
    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', fetchDefensas);
    };
  }, []);

  return { defensas, loading, error, refetch: fetchDefensas };
}

export default useDefensas;
