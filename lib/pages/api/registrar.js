import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  const { nombre, email, telefono, cantidad } = req.body;

  if (!nombre || !email || !telefono || !cantidad) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Verificar si email ya existe
  const { data: existe } = await supabase
    .from('usuarios')
    .select('id')
    .eq('email', email)
    .single();

  if (existe) {
    return res.status(400).json({ error: 'Email ya registrado' });
  }

  // Crear usuario
  const { data, error } = await supabase
    .from('usuarios')
    .insert([{
      nombre,
      email,
      telefono,
      cantidad_quinielas: cantidad,
      total_pagado: 0,
      estado: 'Pendiente_Pago'
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Crear pago pendiente
  await supabase.from('pagos').insert([{
    usuario_id: data.id,
    monto: cantidad * 3000,
    estado: 'Pendiente'
  }]);

  return res.status(200).json({
    exito: true,
    usuario: data,
    linkMoneyPool: 'https://www.moneypool.mx/p/myMV4GY',
    monto: cantidad * 3000
  });
}
