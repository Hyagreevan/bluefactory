import React, { useEffect, useRef, useState } from 'react';
import LiveMapComponent from '../components/LiveMapComponent';

export default function MapPage() {
  const [fleet, setFleet] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [zones, setZones] = useState({});
  const [connected, setConnected] = useState(false);
  const [layer, setLayer] = useState('standard');
  const wsRef = useRef(null);
  const mapRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [editTool, setEditTool] = useState(null);
  const [newZoneName, setNewZoneName] = useState('');
  
  // Custom Maps & History States
  const [mapHistory, setMapHistory] = useState([]);
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [customPaths, setCustomPaths] = useState([]);
  const [currentPathPoints, setCurrentPathPoints] = useState([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragItem, setDragItem] = useState(null);

  useEffect(() => {
    const hist = localStorage.getItem('bluefactory_map_history');
    if (hist) setMapHistory(JSON.parse(hist));

    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    wsRef.current = ws;
    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.fleet) setFleet(data.fleet);
        if (data.obstacles) setObstacles(data.obstacles);
        if (data.zones) setZones(data.zones);
      } catch {}
    };
    return () => ws.close();
  }, []);

  const saveToHistory = (mapData) => {
    const updated = [{ timestamp: new Date().toLocaleString(), data: mapData }, ...mapHistory].slice(0, 10);
    setMapHistory(updated);
    localStorage.setItem('bluefactory_map_history', JSON.stringify(updated));
  };

  const handlePointerDown = (x, y) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    if (editTool === 'add_hazard') {
      wsRef.current.send(JSON.stringify({ type: 'add_obstacle', x, y }));
    } else if (editTool === 'remove_item') {
      // 1. Delete zones/obstacles in backend
      wsRef.current.send(JSON.stringify({ type: 'remove_item', x, y }));
      
      // 2. Map intersection mathematically to erase custom paths loosely clicked nearby (<3 bounds logic)
      setCustomPaths(prev => prev.filter(cpath => {
        let hit = false;
        for (let pt of cpath.points) {
           const dist = Math.hypot(pt[0] - x, pt[1] - y);
           if (dist < 10.0) { hit = true; break; }
        }
        return !hit; 
      }));

    } else if (editTool === 'add_zone') {
      if (!newZoneName.trim()) return;
      wsRef.current.send(JSON.stringify({ type: 'add_zone', name: newZoneName, x, y }));
      setNewZoneName('');
      setEditTool(null);
    } else if (editTool === 'draw_path') {
      setIsDrawing(true);
      setCurrentPathPoints([[x, y]]);
    } else if (editTool === 'move_item') {
      let found = null;
      Object.entries(zones).forEach(([name, pos]) => {
          if (Math.hypot(pos.x - x, pos.y - y) < 4) found = { type: 'zone', name, orgX: pos.x, orgY: pos.y };
      });
      obstacles.forEach(o => {
          if (Math.hypot(o.x - x, o.y - y) < 4) found = { type: 'obstacle', orgX: o.x, orgY: o.y };
      });
      setDragItem(found);
    }
  };

  const handlePointerMove = (x, y) => {
    if (editTool === 'draw_path' && isDrawing) {
      if (currentPathPoints.length > 0) {
        const last = currentPathPoints[currentPathPoints.length - 1];
        if (Math.hypot(x - last[0], y - last[1]) > 0.8) {
           setCurrentPathPoints(prev => [...prev, [x, y]]);
        }
      }
    } else if (editTool === 'move_item' && dragItem) {
      // Temporary drag
    }
  };

  const handlePointerUp = (x, y) => {
    if (editTool === 'draw_path' && isDrawing) {
      setIsDrawing(false);
      // Wait for finishDrawingPath via button instead of auto-completing
    } else if (editTool === 'move_item' && dragItem) {
      wsRef.current.send(JSON.stringify({ type: 'remove_item', x: dragItem.orgX, y: dragItem.orgY }));
      setTimeout(() => {
        if (dragItem.type === 'zone') wsRef.current.send(JSON.stringify({ type: 'add_zone', name: dragItem.name, x, y }));
        if (dragItem.type === 'obstacle') wsRef.current.send(JSON.stringify({ type: 'add_obstacle', x, y }));
      }, 50); // Offset to allow removal queue
      setDragItem(null);
    }
  };

  const finishDrawingPath = () => {
    if (currentPathPoints.length > 1) {
      setCustomPaths([...customPaths, { points: currentPathPoints, isSwarmReroute: false }]);
    }
    setCurrentPathPoints([]);
    setEditTool(null);
  };

  const simulateSwarmReroute = () => {
    setCustomPaths(customPaths.map(p => ({ ...p, isSwarmReroute: !p.isSwarmReroute })));
  };

  const handleMapUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const payload = JSON.parse(ev.target.result);
        if (payload.zones && wsRef.current) {
            // Push individual zones to backend
            Object.entries(payload.zones).forEach(([name, pos]) => {
                wsRef.current.send(JSON.stringify({ type: 'add_zone', name, x: pos.x, y: pos.y }));
            });
        }
        if (payload.obstacles && wsRef.current) {
            payload.obstacles.forEach(obs => {
                wsRef.current.send(JSON.stringify({ type: 'add_obstacle', x: obs.x, y: obs.y }));
            });
        }
        if (payload.customPaths) setCustomPaths(payload.customPaths);
        saveToHistory(payload);
        alert('Map loaded and synced to backend successfully.');
      } catch (err) {
        alert('Invalid Map JSON File.');
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleDownloadMap = () => {
    const payload = { zones, obstacles, customPaths };
    saveToHistory(payload);
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bluefactory_map_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const statusColors = { MOVING: '#52dad7', 'EN ROUTE': '#52dad7', IDLE: '#adc7ff', LOADING: '#f59e0b', CHARGING: '#4ade80', ERROR: '#ffb4ab', 'E-STOP': '#8b90a0', OVERHEATING: '#fb923c', 'LOW BATT - RETURNING': '#facc15', REROUTING: '#c084fc' };

  const displayPaths = [...customPaths];
  if (currentPathPoints.length > 0) {
    displayPaths.push({ points: currentPathPoints, isSwarmReroute: false });
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 84px)', overflow: 'hidden', background: 'var(--color-surface-container-lowest)', position: 'relative' }}>

      {/* ── MAP AREA ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* Map toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-low)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '16px', color: 'var(--color-on-surface)' }}>Live Factory Map</span>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: connected ? '#4ade80' : '#ffb4ab', boxShadow: connected ? '0 0 8px #4ade80' : '0 0 8px #ffb4ab', display: 'inline-block' }}></span>
            <span style={{ fontSize: '10px', color: connected ? '#4ade80' : '#ffb4ab', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{connected ? 'Live' : 'Disconnected'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {/* Map History Tool */}
            <div style={{ position: 'relative' }}>
                <button onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                  style={{ padding: '5px 14px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'var(--color-surface-container-highest)', color: 'var(--color-on-surface)' }}>
                  🕒 Map History
                </button>
                {showHistoryDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: 'var(--color-surface-container-highest)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', width: '220px', zIndex: 100, boxShadow: '0 8px 16px rgba(0,0,0,0.5)' }}>
                        <div style={{ padding: '8px', borderBottom: '1px solid var(--color-outline-variant)', fontSize: '10px', color: 'var(--color-on-surface-variant)', fontWeight: 700 }}>RECENT SAVES</div>
                        {mapHistory.length === 0 ? <div style={{ padding: '12px', fontSize: '11px', color: 'var(--color-on-surface)' }}>No history found.</div> : mapHistory.map((hist, i) => (
                            <div key={i} style={{ padding: '8px 12px', fontSize: '11px', color: '#adc7ff', borderBottom: '1px solid rgba(255,255,255,0.02)', cursor: 'pointer' }} onClick={() => {
                                if(hist.data.zones && wsRef.current) { Object.entries(hist.data.zones).forEach(([n, p]) => wsRef.current.send(JSON.stringify({ type: 'add_zone', name: n, x: p.x, y: p.y}))); }
                                if(hist.data.obstacles && wsRef.current) { hist.data.obstacles.forEach(o => wsRef.current.send(JSON.stringify({ type: 'add_obstacle', x: o.x, y: o.y}))); }
                                if(hist.data.customPaths) setCustomPaths(hist.data.customPaths);
                                setShowHistoryDropdown(false);
                            }}>
                                {hist.timestamp}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Layer toggles */}
            <div style={{ display: 'flex', gap: '4px', background: 'var(--color-surface-container)', borderRadius: '8px', padding: '3px' }}>
              {['standard', 'heatmap', 'paths'].map(l => (
                <button key={l} onClick={() => setLayer(l)}
                  style={{ padding: '5px 14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.15s',
                    background: layer === l ? 'var(--color-primary)' : 'transparent', color: layer === l ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)' }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map canvas */}
        <LiveMapComponent
          fleet={fleet}
          zones={zones}
          obstacles={obstacles}
          layer={layer}
          editTool={editTool}
          newZoneName={newZoneName}
          onMapPointerDown={handlePointerDown}
          onMapPointerMove={handlePointerMove}
          onMapPointerUp={handlePointerUp}
          showZoomControls={true}
          customPaths={displayPaths}
          onAgvClick={(id) => {
            localStorage.setItem('bluefactory_selected_agv', id);
            alert(`Selected AGV ${id} for Global Safety Controls`);
          }}
        />
      </div>

      {/* ── RIGHT PANEL: MAP EDITOR ── */}
      <div style={{ width: '260px', flexShrink: 0, background: 'var(--color-surface-container-low)', borderLeft: '1px solid var(--color-outline-variant)', display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '16px 12px', gap: '16px' }}>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
             <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', margin: 0 }}>Map Tools & Flow</p>
             <button onClick={() => setShowSpecModal(true)} style={{ background: 'transparent', border: '1px solid var(--color-primary)', color: 'var(--color-primary)', borderRadius: '4px', fontSize: '9px', fontWeight: 700, padding: '2px 6px', cursor: 'pointer' }}>SPECS</button>
          </div>

          {/* Map Management: Import/Export */}
          <div style={{ background: 'var(--color-surface-container)', borderRadius: '10px', padding: '12px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
             <input type="file" ref={fileInputRef} onChange={handleMapUpload} style={{ display: 'none' }} accept=".json" />
             <button onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px dashed var(--color-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '10px', background: 'transparent', color: 'var(--color-primary)' }}>📂 Upload JSON</button>
             <button onClick={handleDownloadMap} style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '10px', background: 'var(--color-primary)', color: 'var(--color-on-primary)' }}>💾 Save Map</button>
          </div>

          {/* Draw Path Swarm Logic */}
          <div style={{ background: 'var(--color-surface-container)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 8px 0' }}>✨ Custom Paths & Swarm</p>
            {editTool === 'draw_path' ? (
                <button onClick={finishDrawingPath} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '11px', background: 'var(--color-primary-container)', color: 'var(--color-on-primary-container)', marginBottom: '8px' }}>
                    ✔ Complete Path
                </button>
            ) : (
                <button onClick={() => { setEditTool('draw_path'); setCurrentPathPoints([]); }} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', cursor: 'pointer', fontWeight: 700, fontSize: '11px', background: 'transparent', color: 'var(--color-on-surface)', marginBottom: '8px' }}>
                    ✏️ Map Custom Route
                </button>
            )}
            <button onClick={simulateSwarmReroute} disabled={customPaths.length === 0} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', cursor: customPaths.length > 0 ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: '10px', background: customPaths.length > 0 ? 'var(--color-primary)' : 'var(--color-surface-container-highest)', color: customPaths.length > 0 ? 'var(--color-on-primary)' : 'var(--color-on-surface-variant)' }}>
              🧬 Simulate Swarm Reroute
            </button>
          </div>

          {/* Add Zone */}
          <div style={{ background: 'var(--color-surface-container)', borderRadius: '10px', padding: '12px', marginBottom: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-on-surface)', margin: '0 0 8px 0' }}>📍 Add Station</p>
            <input type="text" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} placeholder="Zone name e.g. 'Bay-3'" style={{ width: '100%', background: 'var(--color-surface-container-lowest)', border: '1px solid var(--color-outline-variant)', borderRadius: '6px', padding: '6px 10px', fontSize: '12px', color: 'var(--color-on-surface)', outline: 'none', marginBottom: '8px', boxSizing: 'border-box' }} />
            <button onClick={() => setEditTool(editTool === 'add_zone' ? null : 'add_zone')}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '11px', background: editTool === 'add_zone' ? 'var(--color-primary)' : 'var(--color-surface-container-high)', color: editTool === 'add_zone' ? 'var(--color-on-primary)' : 'var(--color-on-surface)' }}>
              {editTool === 'add_zone' ? '✓ Click map to drop' : 'Activate Tool'}
            </button>
          </div>

          {/* Add Hazard */}
          <button onClick={() => setEditTool(editTool === 'add_hazard' ? null : 'add_hazard')}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px', marginBottom: '6px', background: editTool === 'add_hazard' ? 'var(--color-error)' : 'var(--color-surface-container-high)', color: editTool === 'add_hazard' ? 'var(--color-surface)' : 'var(--color-on-surface)' }}>
            ⚠ {editTool === 'add_hazard' ? 'Click map to place hazard' : 'Add Hazard'}
          </button>

          {/* Remove Item */}
          <button onClick={() => setEditTool(editTool === 'remove_item' ? null : 'remove_item')}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '12px', marginBottom: '6px', background: editTool === 'remove_item' ? '#f59e0b' : 'var(--color-surface-container-high)', color: editTool === 'remove_item' ? '#000' : 'var(--color-on-surface)' }}>
            ✕ {editTool === 'remove_item' ? 'Click item to erase' : 'Erase Item'}
          </button>

          {/* Move Item */}
          <button onClick={() => setEditTool(editTool === 'move_item' ? null : 'move_item')}
            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px dashed var(--color-primary)', cursor: 'pointer', fontWeight: 700, fontSize: '12px', marginBottom: '6px', background: editTool === 'move_item' ? 'var(--color-primary)' : 'var(--color-surface-container-high)', color: editTool === 'move_item' ? 'var(--color-on-primary)' : 'var(--color-primary)' }}>
            ⬌ {editTool === 'move_item' ? 'Drag item to move' : 'Move Item'}
          </button>

          {/* Cancel */}
          {editTool && editTool !== 'draw_path' && (
            <button onClick={() => { setEditTool(null); setNewZoneName(''); }}
              style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--color-outline-variant)', cursor: 'pointer', fontWeight: 700, fontSize: '11px', background: 'transparent', color: 'var(--color-on-surface-variant)' }}>
              Cancel Edit Mode
            </button>
          )}
        </div>

        {/* Zone & Fleet Status lists */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-on-surface-variant)', margin: '0 0 8px 0' }}>Zones ({Object.keys(zones).length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {Object.keys(zones).length === 0 && <span style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic' }}>No zones placed yet</span>}
            {Object.entries(zones).map(([id, pos]) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--color-surface-container)', borderRadius: '6px', padding: '6px 10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-on-surface)' }}>{id}</span>
                <span style={{ fontSize: '9px', color: 'var(--color-on-surface-variant)' }}>{pos.x.toFixed(0)}%, {pos.y.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Spec Modal */}
      {showSpecModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <div style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)', borderRadius: '16px', padding: '24px', width: '300px' }}>
                 <h2 style={{ fontSize: '16px', color: 'var(--color-on-surface)', marginTop: 0 }}>Map Specifications</h2>
                 <div style={{ color: 'var(--color-on-surface-variant)', fontSize: '12px', marginBottom: '20px', lineHeight: '1.5' }}>
                    <p><strong>Canvas Render Size:</strong> 100x100 relative points</p>
                    <p><strong>Total Zones Mapped:</strong> {Object.keys(zones).length}</p>
                    <p><strong>Hazards Detected:</strong> {obstacles.length}</p>
                    <p><strong>Fleet Density:</strong> {fleet.length} active instances.</p>
                 </div>
                 <button onClick={() => setShowSpecModal(false)} style={{ width: '100%', padding: '10px', background: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>Close Specifications</button>
             </div>
          </div>
      )}
    </div>
  );
}
