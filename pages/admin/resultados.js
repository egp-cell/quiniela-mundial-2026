import { useState, useEffect } from 'react';

const BANDERAS = {
  'Mexico': 'mx', 'Sudafrica': 'za', 'Corea del Sur': 'kr', 'Chequia': 'cz',
  'Canada': 'ca', 'Bosnia': 'ba', 'Catar': 'qa', 'Suiza': 'ch',
  'Brasil': 'br', 'Marruecos': 'ma', 'Haiti': 'ht', 'Escocia': 'gb-sct',
  'Estados Unidos': 'us', 'Paraguay': 'py', 'Australia': 'au', 'Turquia': 'tr',
  'Alemania': 'de', 'Curazao': 'cw', 'Costa de Marfil': 'ci', 'Ecuador': 'ec',
  'Paises Bajos': 'nl', 'Japon': 'jp', 'Suecia': 'se', 'Tunez': 'tn',
  'Belgica': 'be', 'Iran': 'ir', 'Egipto': 'eg', 'Nueva Zelanda': 'nz',
  'Espana': 'es', 'Uruguay': 'uy', 'Arabia Saudita': 'sa', 'Cabo Verde': 'cv',
  'Francia': 'fr', 'Senegal': 'sn', 'Noruega': 'no', 'Iraq': 'iq',
  'Argentina': 'ar', 'Austria': 'at', 'Argelia': 'dz', 'Jordania': 'jo',
  'Portugal': 'pt', 'Colombia': 'co', 'Uzbekistan': 'uz', 'RD Congo': 'cd',
  'Inglaterra': 'gb-eng', 'Croacia': 'hr', 'Ghana': 'gh', 'Panama': 'pa'
};

export default function AdminResultados() {
  const [partidos, setPartidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState('todos');
  const [resultados, setResultados] = useState({});
  const [guardando, setGuardando] = useState({});

  async function cargar() {
    try {
      const r = await fetch('/api/listar-partidos-admin');
      const d = await r.json();
      if (d.exito) {
        setPartidos(d.partidos);
        const r2 = {};
        d.partidos.forEach(p => {
          if (p.goles_local !== null && p.goles_visitante !== null) {
            r2[p.id] = { gl: p.goles_local, gv: p.goles_visitante };
          }
        });
        setResultados(r2);
      }
    } catch (e) { console.error(e); }
    setCargando(false);
  }

  useEffect(() => { cargar(); }, []);

  async function capturar(partidoId) {
    const r = resultados[partidoId];
    if (!r || r.gl === '' || r.gv === '' || r.gl === undefined || r.gv === undefined) {
      alert('Captura ambos goles antes de guardar');
      return;
    }

    if (!confirm(`Confirmar resultado: ${r.gl} - ${r.gv}?\n\nEsto calculara los puntos de TODAS las quinielas.`)) return;

    setGuardando({ ...guardando, [partidoId]: true });

    try {
      const res = await fetch('/api/capturar-resultado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partidoId,
          golesLocal: r.gl,
          golesVisitante: r.gv
        })
      });
      const d = await res.json();

      if (d.exito) {
        alert(`✓ ${d.mensaje}`);
        cargar();
      } else {
        alert('Error: ' + d.error);
      }
    } catch (e) {
      alert('Error de conexion');
    }

    setGuardando({ ...guardando, [partidoId]: false });
  }

  function formatearFecha(fechaHora) {
    if (!fechaHora) return 'Por definir';
    const f = new Date(fechaHora);
    const dias = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dias[f.getDay()]} ${f.getDate()} ${meses[f.getMonth()]} · ${f.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })}`;
  }

  const partidosFiltrados = partidos.filter(p => {
    if (filtro === 'pendientes') return p.estado !== 'Finalizado';
    if (filtro === 'finalizados') return p.estado === 'Finalizado';
    return true;
  });

  return (
    <div style={{ fontFamily: 'Inter, system-ui, sans-serif', background: '#F8F9FB', minHeight: '100vh' }}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />

      <header style={{ background: 'linear-gradient(135deg, #042C53, #0C447C)', color: 'white', padding: '20px 30px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <a href="/admin" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, textDecoration: 'none' }}>← Panel admin</a>
            <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>⚽ Capturar resultados</h1>
          </div>
          <button onClick={cargar} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>🔄 Refrescar</button>
        </div>
      </header>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: 30 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            ['todos', 'Todos'],
            ['pendientes', 'Pendientes'],
            ['finalizados', 'Finalizados']
          ].map(([key, label]) => (
            <button key={key} onClick={() => setFiltro(key)} style={{
              padding: '10px 18px',
              background: filtro === key ? '#042C53' : 'white',
              color: filtro === key ? 'white' : '#666',
              border: '1px solid #E0E0E0',
              borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13
            }}>{label}</button>
          ))}
        </div>

        {cargando ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Cargando...</div>
        ) : partidosFiltrados.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#888', background: 'white', borderRadius: 14 }}>No hay partidos</div>
        ) : (
          partidosFiltrados.map(p => {
            const finalizado = p.estado === 'Finalizado';
            const r = resultados[p.id] || {};

            return (
              <div key={p.id} style={{
                background: 'white', borderRadius: 14, padding: 18, marginBottom: 10,
                border: finalizado ? '2px solid #1D9E75' : '1px solid #E0E0E0'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12, color: '#888' }}>
                  <span>{p.fase}{p.grupo ? ` · Grupo ${p.grupo}` : ''}</span>
                  <span>{formatearFecha(p.fecha_hora)} {finalizado && '· ✓ Finalizado'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr auto', gap: 12, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.local || 'Por definir'}</span>
                    {BANDERAS[p.local] && <img src={`https://flagcdn.com/w40/${BANDERAS[p.local]}.png`} style={{ width: 24, height: 16, borderRadius: 2 }} />}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <input
                      type="number" min="0" max="20"
                      value={r.gl !== undefined ? r.gl : ''}
                      onChange={e => setResultados({ ...resultados, [p.id]: { ...r, gl: e.target.value } })}
                      style={{ width: 50, height: 40, textAlign: 'center', fontSize: 18, fontWeight: 800, border: '2px solid #E0E0E0', borderRadius: 8 }}
                    />
                    <span style={{ fontSize: 16, color: '#888' }}>-</span>
                    <input
                      type="number" min="0" max="20"
                      value={r.gv !== undefined ? r.gv : ''}
                      onChange={e => setResultados({ ...resultados, [p.id]: { ...r, gv: e.target.value } })}
                      style={{ width: 50, height: 40, textAlign: 'center', fontSize: 18, fontWeight: 800, border: '2px solid #E0E0E0', borderRadius: 8 }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {BANDERAS[p.visitante] && <img src={`https://flagcdn.com/w40/${BANDERAS[p.visitante]}.png`} style={{ width: 24, height: 16, borderRadius: 2 }} />}
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{p.visitante || 'Por definir'}</span>
                  </div>

                  <button
                    onClick={() => capturar(p.id)}
                    disabled={guardando[p.id]}
                    style={{
                      padding: '10px 16px',
                      background: finalizado ? '#EF9F27' : '#1D9E75',
                      color: 'white', border: 'none', borderRadius: 8,
                      cursor: 'pointer', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap'
                    }}
                  >
                    {guardando[p.id] ? '...' : (finalizado ? 'Recalcular' : 'Guardar')}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
