import { useEffect, useState, useRef } from 'react'

function App() {
  const [fleet, setFleet] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [zones, setZones] = useState({});

  const [activePage, setActivePage] = useState('dashboard'); // 'dashboard', 'fleet', 'tasks', 'map', 'notifications', 'settings'
  const [selectedAgv, setSelectedAgv] = useState("");
  const [selectedZone, setSelectedZone] = useState("");
  const [loadKg, setLoadKg] = useState(0);

  const [editTool, setEditTool] = useState('add_hazard');
  const [newItemName, setNewItemName] = useState("");
  const [zoneToMove, setZoneToMove] = useState("");

  const [theme, setTheme] = useState('light');

  const wsRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1:8000/ws");
    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.fleet) setFleet(data.fleet);
      if (data.obstacles) setObstacles(data.obstacles);
      if (data.zones) setZones(data.zones);
    };
    return () => { if (wsRef.current) wsRef.current.close(); }
  }, []);

  const tColor = {
    bg: theme === 'light' ? '#f8fafc' : '#0f172a',
    panel: theme === 'light' ? 'white' : '#1e293b',
    text: theme === 'light' ? '#0f172a' : '#f8fafc',
    textMuted: theme === 'light' ? '#64748b' : '#94a3b8',
    border: theme === 'light' ? '#e2e8f0' : '#334155',
    input: theme === 'light' ? '#f1f5f9' : '#0b1120',
    mapGrid: theme === 'light' ? '#e2e8f0' : '#334155',
    mapBg: theme === 'light' ? '#ffffff' : '#0a0f18',
    tableHeader: theme === 'light' ? '#f8fafc' : '#0b1120',
  };

  const handleDeploy = () => {
    if (!selectedAgv) { alert("⚠️ ERROR: You must select an AGV from Step 1!"); return; }
    if (!selectedZone) { alert("⚠️ ERROR: You must select a Destination from Step 2!"); return; }

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "quick_command", agv_id: selectedAgv, zone_id: selectedZone, load_kg: Number(loadKg) }));
      setActivePage('dashboard');
    } else {
      alert("⚠️ DISCONNECTED! Restart your Python server.");
    }
  };

  const handleMapClick = (e) => {
    if (activePage !== 'map' || !mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;

    if (editTool === 'add_hazard') {
      wsRef.current.send(JSON.stringify({ type: "add_obstacle", x: xPct, y: yPct }));
    } else if (editTool === 'remove_item') {
      wsRef.current.send(JSON.stringify({ type: "remove_item", x: xPct, y: yPct }));
    } else if (editTool === 'add_zone') {
      if (!newItemName.trim()) { alert("Please type a station name first!"); return; }
      wsRef.current.send(JSON.stringify({ type: "add_zone", name: newItemName, x: xPct, y: yPct }));
      setNewItemName("");
    } else if (editTool === 'move_zone') {
      if (!zoneToMove) { alert("Select a zone from the dropdown to move first!"); return; }
      wsRef.current.send(JSON.stringify({ type: "move_zone", name: zoneToMove, x: xPct, y: yPct }));
    } else if (editTool === 'add_agv') {
      if (!newItemName.trim()) { alert("Please type an AGV name first!"); return; }
      wsRef.current.send(JSON.stringify({ type: "add_agv", name: newItemName, x: xPct, y: yPct }));
      setNewItemName("");
    }
  };

  const activeAgvCount = fleet.filter(a => a.status === 'MOVING' || a.status === 'LOADING' || a.status === 'CHARGING').length;

  const renderMap = (isEditMode) => (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: tColor.bg, borderRadius: '12px', overflow: 'hidden', border: isEditMode ? '3px dashed #f59e0b' : `1px solid ${tColor.border}`, position: 'relative' }}>
      <div ref={mapRef} onClick={handleMapClick} style={{
        flex: 1, backgroundColor: tColor.mapBg, position: 'relative', overflow: 'hidden', cursor: isEditMode ? 'crosshair' : 'default',
        backgroundImage: `radial-gradient(${tColor.mapGrid} 2px, transparent 2px)`, backgroundSize: '40px 40px'
      }}>

        {/* STATS FLOATER */}
        {!isEditMode && (
          <div style={{ position: 'absolute', top: '20px', left: '20px', display: 'flex', gap: '15px', backgroundColor: tColor.panel, padding: '10px 20px', borderRadius: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', zIndex: 20, border: `1px solid ${tColor.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', color: tColor.text }}>
              🚚 Total: {fleet.length}
            </div>
            <div style={{ width: '1px', backgroundColor: tColor.border }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '14px', color: tColor.text }}>
              📈 Active: {activeAgvCount}
            </div>
          </div>
        )}

        {/* THICKER SVG ROUTES */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
          {fleet.map(agv => {
            if (!agv.path || agv.path.length === 0) return null;
            const points = `${agv.x},${agv.y} ` + agv.path.map(p => `${p[0]},${p[1]}`).join(' ');
            return (
              <polyline key={agv.id} points={points} fill="none" stroke={agv.color}
                strokeWidth="0.8" strokeDasharray="1.5,1.5" style={{ animation: 'dash-flow 1.5s linear infinite' }}
                opacity="0.9" vectorEffect="non-scaling-stroke" />
            )
          })}
        </svg>

        {Object.entries(zones).map(([id, pos], index) => {
          const color = id.toLowerCase().includes('charg') ? '#10b981' : '#f59e0b';
          const isAisle = id.toLowerCase().includes('aisle');
          return (
            <div key={id} style={{ position: 'absolute', top: `${pos.y}%`, left: `${pos.x}%`, width: isAisle ? '60px' : '80px', height: isAisle ? '300px' : '100px', transform: 'translate(-50%, -50%)', border: `2px solid ${color}50`, backgroundColor: isAisle ? (theme === 'light' ? '#fff7ed' : '#2a1a08') : `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, fontWeight: '700', fontSize: '14px', borderRadius: '8px', zIndex: 2, pointerEvents: 'none' }}>
              {id}
            </div>
          )
        })}

        {obstacles.map((obs, idx) => (
          <div key={idx} style={{ position: 'absolute', left: `${obs.x}%`, top: `${obs.y}%`, width: '6%', height: '6%', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '2px solid #ef4444', borderRadius: '8px', transform: 'translate(-50%, -50%)', zIndex: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 'bold', fontSize: '12px', pointerEvents: 'none' }}>⚠</div>
        ))}

        {fleet.map((agv) => (
          <div key={agv.id} style={{ position: 'absolute', left: `${agv.x}%`, top: `${agv.y}%`, width: '24px', height: '24px', backgroundColor: agv.color, borderRadius: '6px', border: '2px solid white', boxShadow: `0 2px 5px rgba(0,0,0,0.2)`, transition: 'all 0.05s linear', transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '10px', color: 'white', fontWeight: '900' }}>R</span>
            <span style={{ position: 'absolute', top: '-25px', width: '60px', textAlign: 'center', fontSize: '12px', color: '#334155', fontWeight: '800', background: 'white', padding: '2px 4px', borderRadius: '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>{agv.id}</span>
            {agv.load_kg > 0 && <span style={{ position: 'absolute', bottom: '-22px', width: '50px', textAlign: 'center', fontSize: '11px', color: '#ef4444', fontWeight: '800' }}>{agv.load_kg}kg</span>}
          </div>
        ))}

        {/* LEGEND */}
        {!isEditMode && (
          <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '15px', backgroundColor: tColor.panel, padding: '12px 24px', borderRadius: '30px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', zIndex: 20, border: `1px solid ${tColor.border}` }}>
            {[{ l: 'Moving', c: '#10b981' }, { l: 'Idle', c: '#3b82f6' }, { l: 'Loading', c: '#f59e0b' }, { l: 'Charging', c: '#eab308' }, { l: 'Error', c: '#ef4444' }, { l: 'E-Stop', c: '#475569' }].map(item => (
              <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '600', color: tColor.textMuted }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.c }} /> {item.l}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tColor.bg, color: tColor.text, fontFamily: '"Inter", system-ui, sans-serif', display: 'flex' }}>

      <style>{`
        @keyframes dash-flow { to { stroke-dashoffset: -30; } }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${tColor.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${tColor.textMuted}; }
        .nav-item {
          display: flex; align-items: center; gap: 14px; padding: 14px 20px; border-radius: 12px;
          cursor: pointer; transition: all 0.2s; font-weight: 700; font-size: 14px;
          margin-bottom: 8px;
        }
        .nav-item.active { box-shadow: 0 4px 10px rgba(249, 115, 22, 0.2); }
      `}</style>

      {/* EXTENDED SIDEBAR */}
      <div style={{ width: '260px', backgroundColor: tColor.panel, borderRight: `1px solid ${tColor.border}`, display: 'flex', flexDirection: 'column', padding: '24px 20px', zIndex: 100, flexShrink: 0, transition: 'background-color 0.3s' }}>

        {/* LOGO AREA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px', paddingLeft: '10px' }}>
          <div style={{ width: '42px', height: '42px', backgroundColor: '#f97316', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '20px', flexShrink: 0, boxShadow: '0 4px 10px rgba(249, 115, 22, 0.3)' }}>
            🚚
          </div>
          <div style={{ color: '#f97316', fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px' }}>
            Blueroll Copilot
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div className={`nav-item ${activePage === 'dashboard' ? 'active' : ''}`} onClick={() => setActivePage('dashboard')} style={{ backgroundColor: activePage === 'dashboard' ? '#f97316' : 'transparent', color: activePage === 'dashboard' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>❖</span> <span style={{ paddingTop: '2px' }}>Dashboard</span>
          </div>
          <div className={`nav-item ${activePage === 'fleet' ? 'active' : ''}`} onClick={() => setActivePage('fleet')} style={{ backgroundColor: activePage === 'fleet' ? '#f97316' : 'transparent', color: activePage === 'fleet' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>🚚</span> <span style={{ paddingTop: '2px' }}>AGV Fleet</span>
          </div>
          <div className={`nav-item ${activePage === 'tasks' ? 'active' : ''}`} onClick={() => setActivePage('tasks')} style={{ backgroundColor: activePage === 'tasks' ? '#f97316' : 'transparent', color: activePage === 'tasks' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>📋</span> <span style={{ paddingTop: '2px' }}>Manage Tasks</span>
          </div>
          <div className={`nav-item ${activePage === 'map' ? 'active' : ''}`} onClick={() => setActivePage('map')} style={{ backgroundColor: activePage === 'map' ? '#f97316' : 'transparent', color: activePage === 'map' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>🗺️</span> <span style={{ paddingTop: '2px' }}>Live Map</span>
          </div>

          <div style={{ height: '20px' }}></div>

          <div className={`nav-item ${activePage === 'notifications' ? 'active' : ''}`} onClick={() => setActivePage('notifications')} style={{ backgroundColor: activePage === 'notifications' ? '#f97316' : 'transparent', color: activePage === 'notifications' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>🔔</span> <span style={{ paddingTop: '2px' }}>Notifications</span>
          </div>
          <div className={`nav-item ${activePage === 'settings' ? 'active' : ''}`} onClick={() => setActivePage('settings')} style={{ backgroundColor: activePage === 'settings' ? '#f97316' : 'transparent', color: activePage === 'settings' ? 'white' : tColor.textMuted }}>
            <span style={{ fontSize: '20px' }}>⚙️</span> <span style={{ paddingTop: '2px' }}>Settings</span>
          </div>
        </div>

        <div style={{ flex: 1 }}></div>

        {/* SYSTEM STATUS in SIDEBAR */}
        <div style={{ backgroundColor: theme === 'light' ? '#fff7ed' : '#2a1a08', padding: '16px', borderRadius: '16px', border: theme === 'light' ? '1px solid #fed7aa' : '1px solid #7c2d12', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: tColor.text, marginBottom: '8px' }}>System Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: tColor.textMuted, fontWeight: '500' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            All systems operational
          </div>
        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* TOP BAR */}
        <div style={{ height: '86px', backgroundColor: tColor.panel, borderBottom: `1px solid ${tColor.border}`, display: 'flex', alignItems: 'center', padding: '0 30px', justifyContent: 'flex-end', zIndex: 50, flexShrink: 0, transition: 'background-color 0.3s' }}>

          <div style={{ display: 'flex', alignItems: 'center', gap: '25px' }}>
            <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ width: '42px', height: '42px', backgroundColor: tColor.input, color: tColor.text, border: `1px solid ${tColor.border}`, borderRadius: '21px', fontWeight: '800', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <button style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '30px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)' }}>
              <span>!</span> E-STOP
            </button>
            <div style={{ fontSize: '20px', cursor: 'pointer' }}>🤖</div>
            <div style={{ fontSize: '20px', cursor: 'pointer', position: 'relative' }}>
              🔔<span style={{ position: 'absolute', top: 0, right: '-2px', backgroundColor: '#f59e0b', width: '8px', height: '8px', borderRadius: '50%' }}></span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `1px solid ${tColor.border}`, paddingLeft: '25px', cursor: 'pointer' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: tColor.input, border: `1px solid ${tColor.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f97316', fontWeight: 'bold' }}>A</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: tColor.text }}>Admin User</span>
                <span style={{ fontSize: '11px', color: tColor.textMuted }}>Warehouse Manager</span>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE CONTENT */}
        <div style={{ flex: 1, padding: '24px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' }}>

          {activePage === 'dashboard' && renderMap(false)}

          {activePage === 'map' && (
            <div style={{ display: 'flex', gap: '20px', height: '100%', flex: 1, minHeight: 0 }}>
              {renderMap(true)}

              <div style={{ backgroundColor: tColor.panel, padding: '20px', borderRadius: '12px', border: `1px solid ${tColor.border}`, width: '300px', flexShrink: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', transition: 'background-color 0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                  <button onClick={() => setActivePage('dashboard')} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '900', fontSize: '13px', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)', width: '100%' }}>
                    EXIT MAP EDITOR
                  </button>
                </div>

                <div style={{ marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: tColor.text, marginBottom: '12px', fontWeight: '800' }}>1. Place New Station</p>
                  <input type="text" value={editTool === 'add_zone' ? newItemName : ""} onChange={(e) => { setEditTool('add_zone'); setNewItemName(e.target.value) }} placeholder="e.g. 'Main Power Hub'" style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${tColor.border}`, backgroundColor: tColor.input, color: tColor.text, marginBottom: '10px', boxSizing: 'border-box' }} />
                  <button onClick={() => setEditTool('add_zone')} style={{ width: '100%', padding: '10px', backgroundColor: editTool === 'add_zone' ? '#f97316' : tColor.input, color: editTool === 'add_zone' ? 'white' : tColor.text, border: `1px solid ${editTool === 'add_zone' ? '#f97316' : tColor.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: editTool === 'add_zone' ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none' }}>
                    {editTool === 'add_zone' ? 'Click map to place station 👉' : 'Select Tool: Add Station'}
                  </button>
                </div>

                <div style={{ marginBottom: '25px', borderTop: `1px solid ${tColor.border}`, paddingTop: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: tColor.text, marginBottom: '12px', fontWeight: '800' }}>2. Move Existing Station</p>
                  <select value={zoneToMove} onChange={(e) => { setEditTool('move_zone'); setZoneToMove(e.target.value) }} style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: `1px solid ${tColor.border}`, backgroundColor: tColor.input, color: tColor.text, marginBottom: '10px', boxSizing: 'border-box' }}>
                    <option value="" disabled>Select a zone to move</option>
                    {Object.keys(zones).map(z => <option key={z} value={z}>{z}</option>)}
                  </select>
                  <button onClick={() => setEditTool('move_zone')} style={{ width: '100%', padding: '10px', backgroundColor: editTool === 'move_zone' ? '#f97316' : tColor.input, color: editTool === 'move_zone' ? 'white' : tColor.text, border: `1px solid ${editTool === 'move_zone' ? '#f97316' : tColor.border}`, borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', boxShadow: editTool === 'move_zone' ? '0 0 10px rgba(249, 115, 22, 0.2)' : 'none' }}>
                    {editTool === 'move_zone' ? 'Click map to move it 👉' : 'Select Tool: Move Station'}
                  </button>
                </div>

                <div style={{ borderTop: `1px solid ${tColor.border}`, paddingTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
                  <p style={{ fontSize: '13px', color: tColor.text, margin: 0, fontWeight: '800' }}>3. Map Modifiers</p>
                  <button onClick={() => setEditTool('add_hazard')} style={{ width: '100%', padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    {editTool === 'add_hazard' ? 'Click map to drop Hazard 👉' : 'Select Tool: Add Hazard'}
                  </button>
                  <button onClick={() => setEditTool('remove_item')} style={{ width: '100%', padding: '12px', backgroundColor: editTool === 'remove_item' ? '#f59e0b' : tColor.input, color: editTool === 'remove_item' ? 'white' : tColor.text, border: `1px solid ${editTool === 'remove_item' ? '#f59e0b' : tColor.border}`, borderRadius: '8px', cursor: 'pointer', fontWeight: '800', fontSize: '14px' }}>
                    {editTool === 'remove_item' ? 'Click item to Delete it 👉' : 'Select Tool: The Eraser'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activePage === 'fleet' && (
            <div style={{ backgroundColor: tColor.panel, borderRadius: '12px', border: `1px solid ${tColor.border}`, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'background-color 0.3s' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tColor.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: tColor.text, fontWeight: '800' }}>Fleet Physics Data</h2>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input type="text" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. 'Titan-1'" style={{ padding: '8px 12px', borderRadius: '6px', border: `1px solid ${tColor.border}`, backgroundColor: tColor.input, color: tColor.text, boxSizing: 'border-box', fontSize: '13px', width: '180px' }} />
                  <button onClick={() => {
                    if (!newItemName.trim()) { alert("Please type an AGV name first!"); return; }
                    wsRef.current.send(JSON.stringify({ type: "add_agv", name: newItemName, x: 10, y: 10 }));
                    setNewItemName("");
                  }} style={{ backgroundColor: '#f97316', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(249, 115, 22, 0.2)' }}>
                    + Deploy AGV
                  </button>
                </div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ backgroundColor: tColor.tableHeader, color: tColor.textMuted, borderBottom: `1px solid ${tColor.border}` }}>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>AGV ID</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>MODEL</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>PAYLOAD</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>SPEED</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>STATUS</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>BATTERY</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>TEMP</th>
                      <th style={{ padding: '15px 24px', fontWeight: '600' }}>CURRENT TASK</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fleet.length === 0 && (
                      <tr style={{ borderBottom: `1px solid ${tColor.border}` }}>
                        <td colSpan="8" style={{ padding: '60px', textAlign: 'center', color: tColor.textMuted, fontSize: '14px' }}>No AGVs Found in Fleet</td>
                      </tr>
                    )}
                    {fleet.map(agv => (
                      <tr key={agv.id} style={{ borderBottom: `1px solid ${tColor.border}` }}>
                        <td style={{ padding: '15px 24px', fontWeight: '700', color: tColor.text }}>{agv.id}</td>
                        <td style={{ padding: '15px 24px', color: tColor.textMuted }}>{"Titan-1"}</td>
                        <td style={{ padding: '15px 24px', color: agv.load_kg > 0 ? '#ef4444' : tColor.textMuted, fontWeight: agv.load_kg > 0 ? '800' : 'normal' }}>{agv.load_kg || 0} kg</td>
                        <td style={{ padding: '15px 24px', color: '#10b981', fontWeight: '600' }}>{(agv.speed_kmh || 0).toFixed(1)} km/h</td>
                        <td style={{ padding: '15px 24px' }}>
                          <span style={{ padding: '4px 12px', backgroundColor: agv.status === 'CHARGING' ? '#d1fae5' : (theme === 'light' ? '#f1f5f9' : '#1e293b'), color: agv.status === 'CHARGING' ? '#059669' : tColor.textMuted, borderRadius: '20px', fontSize: '11px', fontWeight: '800' }}>{agv.status || 'UNKNOWN'}</span>
                        </td>
                        <td style={{ padding: '15px 24px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '40px', height: '6px', backgroundColor: tColor.border, borderRadius: '3px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${Math.max(0, agv.battery || 0)}%`, backgroundColor: agv.battery < 20 ? '#ef4444' : '#10b981' }}></div>
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: agv.battery < 20 ? '#ef4444' : tColor.textMuted }}>{(agv.battery || 0).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '15px 24px' }}>
                          <span style={{ color: (agv.motor_temp || 45) > 75 ? '#ef4444' : tColor.textMuted, fontWeight: (agv.motor_temp || 45) > 75 ? '800' : 'normal' }}>{(agv.motor_temp || 45).toFixed(1)}°C</span>
                        </td>
                        <td style={{ padding: '15px 24px', color: tColor.textMuted, fontSize: '13px', fontWeight: '500' }}>{agv.current_task || 'Awaiting Task'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activePage === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1, gap: '20px' }}>
              {renderMap(false)}

              {/* THE BOTTOM BAR BUTTONS */}
              <div style={{ backgroundColor: tColor.panel, padding: '24px', borderRadius: '12px', border: `1px solid ${tColor.border}`, flexShrink: 0, display: 'flex', gap: '30px', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', transition: 'background-color 0.3s' }}>

                <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: tColor.textMuted, marginBottom: '10px', fontWeight: '700' }}>1. Select AGV</div>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {fleet.length === 0 ? <span style={{ fontSize: '12px', color: tColor.textMuted, fontStyle: 'italic' }}>No AGVs Available</span> : fleet.map(agv => (
                      <button key={agv.id} onClick={() => setSelectedAgv(agv.id)} style={{
                        padding: '10px 18px', borderRadius: '8px', border: selectedAgv === agv.id ? '2px solid #f97316' : `1px solid ${tColor.border}`,
                        backgroundColor: selectedAgv === agv.id ? (theme === 'light' ? '#fff7ed' : '#2a1a08') : tColor.panel,
                        color: selectedAgv === agv.id ? '#f97316' : tColor.textMuted, cursor: 'pointer', fontWeight: '800', fontSize: '13px', transition: 'all 0.2s', flexShrink: 0
                      }}>{agv.id}</button>
                    ))}
                  </div>
                </div>

                <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ fontSize: '12px', color: tColor.textMuted, marginBottom: '10px', fontWeight: '700' }}>2. Assign Vector Destination</div>
                  <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {Object.keys(zones).length === 0 ? <span style={{ fontSize: '12px', color: tColor.textMuted, fontStyle: 'italic' }}>No Zones Found</span> : Object.keys(zones).map(zone => (
                      <button key={zone} onClick={() => setSelectedZone(zone)} style={{
                        padding: '10px 18px', borderRadius: '8px', border: selectedZone === zone ? '2px solid #3b82f6' : `1px solid ${tColor.border}`,
                        backgroundColor: selectedZone === zone ? (theme === 'light' ? '#eff6ff' : '#1e3a8a') : tColor.panel,
                        color: selectedZone === zone ? '#3b82f6' : tColor.textMuted, cursor: 'pointer', fontWeight: '800', fontSize: '13px', transition: 'all 0.2s', flexShrink: 0
                      }}>{zone.toUpperCase()}</button>
                    ))}
                  </div>
                </div>

                <div style={{ flex: '0 0 160px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: '12px', color: tColor.textMuted, marginBottom: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>3. Payload</span> <span style={{ color: '#ef4444', fontWeight: '900' }}>{loadKg} kg</span>
                  </div>
                  <input type="range" min="0" max="1000" step="50" value={loadKg} onChange={(e) => setLoadKg(e.target.value)} style={{ width: '100%', cursor: 'pointer', accentColor: '#f97316' }} />
                </div>

                <button onClick={handleDeploy} style={{ padding: '0 40px', height: '54px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '900', fontSize: '16px', flexShrink: 0, boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', letterSpacing: '0.5px' }}>DEPLOY</button>
              </div>
            </div>
          )}

          {activePage === 'notifications' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: tColor.panel, borderRadius: '12px', border: `1px solid ${tColor.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tColor.border}` }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: tColor.text, fontWeight: '800' }}>Notifications Hub</h2>
              </div>
              <div style={{ padding: '40px', display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1, color: tColor.textMuted }}>
                No new critical alerts from your fleet currently.
              </div>
            </div>
          )}

          {activePage === 'settings' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: tColor.panel, borderRadius: '12px', border: `1px solid ${tColor.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: `1px solid ${tColor.border}` }}>
                <h2 style={{ margin: 0, fontSize: '18px', color: tColor.text, fontWeight: '800' }}>System Preferences</h2>
              </div>
              <div style={{ padding: '40px', color: tColor.text, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ border: `1px solid ${tColor.border}`, padding: '20px', borderRadius: '10px', backgroundColor: tColor.bg }}>
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: tColor.text }}>User Preferences</h3>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', color: tColor.textMuted }}>
                    <input type="checkbox" checked={theme === 'dark'} onChange={() => setTheme(t => t === 'light' ? 'dark' : 'light')} style={{ accentColor: '#f97316' }} /> Enable Dark Mode
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default App