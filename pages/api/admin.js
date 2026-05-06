import { createClient } from '@supabase/supabase-js';

function generarUsername(nombre, id) {
  const limpio = nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '').trim().split(' ');
  let base = limpio[0];
  if (limpio.length > 1) base += '.' + limpio[limpio.length - 1];
  return base + String(id).padStart(3, '0');
}

function generarPassword() {
  const m = 'abcdefghjkmnpqrstuvwxyz';
  const M = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const n = '23456789';
  const s = '!@#$%';
  let p = '';
  p += M.charAt(Math.floor(Math.random() * M.length));
  p += m.charAt(Math.floor(Math.random() * m.length));
  p += m.charAt(Math.floor(Math.random() * m.length));
  p += n.charAt(Math.floor(Math.random() * n.length));
  p += s.charAt(Math.floor(Math.random() * s.length));
  p += m.charAt(Math.floor(Math.random() * m.length));
  p += n.charAt(Math.floor(Math.random() * n.length));
  p += M.charAt(Math.floor(Math.random() * M.length));
  return p;
}

export default async function handler(req, res) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_KEY
  );

  if (req.method === 'GET') {
    const { data: usuarios, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('fecha_registro', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    let registrados = 0, pendientes = 0, activos = 0, recaudado = 0;
    usuarios.forEach(u => {
      registrados++;
      if (u.estado === 'Activo') {
        activos++;
        recaudado += Number(u.total_pagado) || 0;
      } else if (u.estado === 'Pendiente_Pago') {
        pendientes++;
      }
    });

    return res.status(200).json({
      exito: true,
      stats: { registrados, pendientes, activos, recaudado },
      usuarios
    });
  }

  if (req.method === 'POST') {
    const { accion, id } = req.body;

    if (accion === 'aprobar') {
      const { data: usuario } = await supabase
        .from('usuarios').select('*').eq('id', id).single();

      if (!usuario) return res.status(404).json({ error: 'No encontrado' });
      if (usuario.estado === 'Activo') return res.status(400).json({ error: 'Ya activo' });

      const username = generarUsername(usuario.nombre, usuario.id);
      const password = generarPassword();
      const total = usuario.cantidad_quinielas * 3000;

      await supabase.from('usuarios').update({
        usuario: username,
        password: password,
        estado: 'Activo',
        total_pagado: total,
        fecha_aprobacion: new Date().toISOString()
      }).eq('id', id);

      const quinielas = [];
      for (let i = 1; i <= usuario.cantidad_quinielas; i++) {
        quinielas.push({
          usuario_id: usuario.id,
          nombre: usuario.cantidad_quinielas === 1 ? 'Mi quiniela' : 'Quiniela ' + i,
          estado: 'Pagada'
        });
      }
      await supabase.from('quinielas').insert(quinielas);

      await supabase.from('pagos').update({
        estado: 'Aprobado',
        fecha_confirmacion: new Date().toISOString()
      }).eq('usuario_id', id).eq('estado', 'Pendiente');

      return res.status(200).json({
        exito: true,
        datos: { ...usuario, usuario: username, password, cantidad: usuario.cantidad_quinielas }
      });
    }

    if (accion === 'rechazar') {
      await supabase.from('usuarios').update({ estado: 'Rechazado' }).eq('id', id);
      await supabase.from('pagos').update({ estado: 'Rechazado' }).eq('usuario_id', id);
      return res.status(200).json({ exito: true });
    }

    return res.status(400).json({ error: 'Accion invalida' });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
