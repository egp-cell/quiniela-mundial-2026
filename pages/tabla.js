import { useState, useEffect } from 'react';

export default function TablaLideres() {
  const [ranking, setRanking] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');

  async function cargar() {
    try {
      const r = await fetch('/api/tabla');
      const d = await r.json();
      if (d.exito) setRanking(d.ranking);
    } catch (e) { console.error(e); }
    setCargando(false);
  }

  useEffect(() => {
    cargar();
    const interval = setInterval(cargar, 30000); // refresca cada 30s
    return () => clearInterval(interval);
  }, []);

  const filtrado = ranking.filter(q =>
    q.nombreQuiniela.toLowerCase().includes(busqueda.toLowerCase()) ||
    q.nombreUsuario.toLowerCase().includes(busqueda.toLowerCase())
  );

  function colorPosicion(pos) {
    if (pos === 1) return { bg: 'linear-gradient(135deg, #FFD700, #FFA500)', text: 'white', emoji: '🥇' };
    if (pos === 2) return { bg: 'linear-gradient(135deg, #C0C0C0, #A8A8A8)', text: 'white', emoji: '🥈' };
    if (pos === 3) return { bg: 'linear-gradient(135deg, #CD7F32, #A0522D)', text: 'white', emoji: '🥉' };
    return { bg: '#F0F2F5', text: '#666', emoji: '' };
  }

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8F9FB', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <header style={{ background: 'linear-gradient(135deg, #042C53, #0C447C)', color: 'white', padding: '24px 30px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <a href="/jugar" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← Volver a mis quinielas</a>
            <button onClick={cargar} style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>🔄 Actualizar</button>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>🏆 Tabla de Líderes</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)', margin: '4px 0 0 0' }}>
            {ranking.length} quinielas activas · Actualización automática cada 30s
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>

        {/* Buscador */}
        <input
          type="text"
          placeholder="🔍 Buscar por nombre de quiniela o jugador..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{ width: '100%', padding: 14, border: '1px solid #E0E0E0', borderRadius: 12, fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }}
        />

        {/* Leyenda */}
        <div style={{ background: 'white', padding: 16, borderRadius: 12, marginBottom: 16, border: '1px solid #E0E0E0' }}>
          <div style={{ fontSize: 11, color: '#888', textTransform: 'uppercase', fontWeight: 700, marginBottom: 8 }}>Sistema de puntos</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 13, color: '#444' }}>
            <span>🎯 <b>5 pts</b> marcador exacto</span>
            <span>✓ <b>3 pts</b> ganador o empate acertado</span>
          </div>
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888' }}>Cargando ranking...</div>
        ) : filtrado.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#888', background: 'white', borderRadius: 14 }}>
            {busqueda ? 'Sin resultados para tu búsqueda' : 'Aún no hay quinielas activas'}
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', border: '1px solid #E0E0E0' }}>
            {/* Header tabla */}
            <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 70px 70px', padding: '12px 16px', background: '#F8F9FB', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', borderBottom: '1px solid #E0E0E0' }}>
              <div style={{ textAlign: 'center' }}>Pos</div>
              <div>Quiniela</div>
              <div style={{ textAlign: 'center' }}>Pts</div>
              <div style={{ textAlign: 'center' }}>🎯 5pts</div>
              <div style={{ textAlign: 'center' }}>✓ 3pts</div>
            </div>

            {/* Filas */}
            {filtrado.map(q => {
              const colores = colorPosicion(q.posicion);
              return (
                <div key={q.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 80px 70px 70px', padding: '14px 16px', borderBottom: '1px solid #F0F2F5', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: colores.bg, color: colores.text, fontWeight: 800, fontSize: 13 }}>
                      {colores.emoji || `#${q.posicion}`}
                    </div>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#042C53', fontSize: 14 }}>{q.nombreQuiniela}</div>
                    <div style={{ fontSize: 12, color: '#888' }}>{q.nombreUsuario}</div>
                  </div>
                  <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 900, color: '#042C53' }}>{q.puntos}</div>
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#1D9E75', fontWeight: 700 }}>{q.exactos}</div>
                  <div style={{ textAlign: 'center', fontSize: 14, color: '#666', fontWeight: 600 }}>{q.aciertos}</div>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 30, fontSize: 12, color: '#888' }}>
          🏆 Quiniela Mundial FIFA 2026
        </div>
      </div>
    </div>
  );
}
