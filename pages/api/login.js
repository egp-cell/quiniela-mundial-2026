import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ exito: false, error: 'Metodo no permitido' });
  }

  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ exito: false, error: 'Faltan datos' });
    }

    const { data: user, error } = await supabase
      .from('usuarios')
      .select('id, nombre, usuario, password, estado, cantidad_quinielas')
      .eq('usuario', usuario.toLowerCase().trim())
      .maybeSingle();

    if (error || !user) {
      return res.status(401).json({ exito: false, error: 'Usuario o password incorrectos' });
    }

    if (user.password !== password) {
      return res.status(401).json({ exito: false, error: 'Usuario o password incorrectos' });
    }

    if (user.estado !== 'Activo') {
      return res.status(403).json({ exito: false, error: 'Tu cuenta no esta activa todavia. Espera a que se confirme tu pago.' });
    }

    // Cargar quinielas del usuario
    const { data: quinielas } = await supabase
      .from('quinielas')
      .select('id, nombre, puntos, posicion')
      .eq('usuario_id', user.id)
      .order('id');

    return res.status(200).json({
      exito: true,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        usuario: user.usuario,
        cantidad_quinielas: user.cantidad_quinielas,
        quinielas: quinielas || []
      }
    });

  } catch (error) {
    console.error('Error login:', error);
    return res.status(500).json({ exito: false, error: error.message });
  }
}
