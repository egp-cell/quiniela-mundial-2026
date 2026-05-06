import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ exito: false, error: 'Metodo no permitido' });
  }

  try {
    const { quinielaId } = req.query;

    if (!quinielaId) {
      return res.status(400).json({ exito: false, error: 'Falta quinielaId' });
    }

    // Cargar todos los partidos
    const { data: partidos, error: errorPartidos } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha_hora', { ascending: true });

    if (errorPartidos) {
      return res.status(500).json({ exito: false, error: errorPartidos.message });
    }

    // Cargar pronosticos existentes de esta quiniela
    const { data: pronosticos } = await supabase
      .from('pronosticos')
      .select('*')
      .eq('quiniela_id', quinielaId);

    // Cargar info de la quiniela
    const { data: quiniela } = await supabase
      .from('quinielas')
      .select('id, nombre, puntos, posicion, usuario_id')
      .eq('id', quinielaId)
      .single();

    // Indexar pronosticos por partido_id
    const pronosticosMap = {};
    (pronosticos || []).forEach(p => {
      pronosticosMap[p.partido_id] = {
        goles_local: p.goles_local,
        goles_visitante: p.goles_visitante
      };
    });

    return res.status(200).json({
      exito: true,
      quiniela,
      partidos,
      pronosticos: pronosticosMap
    });

  } catch (error) {
    console.error('Error partidos:', error);
    return res.status(500).json({ exito: false, error: error.message });
  }
}
