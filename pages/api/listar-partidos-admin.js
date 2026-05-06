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
    const { data: partidos, error } = await supabase
      .from('partidos')
      .select('*')
      .order('fecha_hora', { ascending: true });

    if (error) {
      return res.status(500).json({ exito: false, error: error.message });
    }

    return res.status(200).json({ exito: true, partidos });

  } catch (error) {
    return res.status(500).json({ exito: false, error: error.message });
  }
}
