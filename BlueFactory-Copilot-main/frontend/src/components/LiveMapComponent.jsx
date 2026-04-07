import React, { useRef, useState } from 'react';

const statusColorsDefault = { 
  MOVING: '#52dad7', 'EN ROUTE': '#52dad7', IDLE: '#adc7ff', 
  LOADING: '#f59e0b', 'LOADING...': '#f59e0b', 
  CHARGING: '#4ade80', ERROR: '#ffb4ab', 'E-STOP': '#8b90a0', 
  OVERHEATING: '#fb923c', 'LOW BATT - RETURNING': '#facc15', 
  REROUTING: '#c084fc', ASSIGNED: '#71717a'
};

export default function LiveMapComponent({ 
  fleet = [], 
  zones = {}, 
  obstacles = [], 
  layer = 'standard', 
  editTool = null,
  newZoneName = '',
  newAgvName = '',
  agvCounter = 1,
  onMapPointerDown = null,
  onMapPointerMove = null,
  onMapPointerUp = null,
  statusColors = statusColorsDefault,
  height = '100%',
  showZoomControls = false,
  customPaths = [],
  onAgvClick = null
}) {
  const mapRef = useRef(null);
  const [scale, setScale] = useState(1);

  const getCoords = (e) => {
    const rect = mapRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return [x, y];
  };

  const handlePointerDown = (e) => {
    e.target.setPointerCapture(e.pointerId);
    if (onMapPointerDown) onMapPointerDown(...getCoords(e));
  };
  const handlePointerMove = (e) => {
    if (onMapPointerMove) onMapPointerMove(...getCoords(e));
  };
  const handlePointerUp = (e) => {
    e.target.releasePointerCapture(e.pointerId);
    if (onMapPointerUp) onMapPointerUp(...getCoords(e));
  };

  const handleZoomIn = () => setScale(s => Math.min(s + 0.2, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.2, 0.5));

  return (
    <div style={{ width: '100%', height: height, position: 'relative', overflow: 'hidden', background: 'var(--color-surface-container-lowest)' }}>
      <div
        ref={mapRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={layer !== 'heatmap' ? 'map-grid' : ''}
        style={{
          width: '100%', height: '100%', position: 'absolute', inset: 0,
          transform: `scale(${scale})`, transformOrigin: 'center center', transition: 'transform 0.2s ease',
          backgroundSize: '40px 40px',
          cursor: editTool ? 'crosshair' : 'default',
        }}
      >
        {/* Heatmap overlay dummy simulation */}
        {layer === 'heatmap' && (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.2) 0%, transparent 40%), radial-gradient(circle at 30% 70%, rgba(239, 68, 68, 0.15) 0%, transparent 30%)', pointerEvents: 'none', zIndex: 0 }} />
        )}

        {/* SVG routes layer */}
        {(layer === 'standard' || layer === 'paths') && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} preserveAspectRatio="none" viewBox="0 0 100 100">
            
            {/* Custom Manual Paths */}
            {customPaths.map((cpath, idx) => {
              if (!cpath.points || cpath.points.length === 0) return null;
              const pts = cpath.points.map(p => `${p[0]},${p[1]}`).join(' ');
              return <polyline key={`cp-${idx}`} points={pts} fill="none" stroke={cpath.isSwarmReroute ? '#c084fc' : '#facc15'} strokeWidth="0.8" strokeDasharray="1,1" opacity="1" vectorEffect="non-scaling-stroke" />;
            })}

            {/* Standard Fleet Paths */}
            {fleet.map(agv => {
              if (!agv.path || agv.path.length === 0) return null;
              const pts = `${agv.x},${agv.y} ` + agv.path.map(p => `${p[0]},${p[1]}`).join(' ');
              return <polyline key={agv.id} points={pts} fill="none" stroke={statusColors[agv.status] || '#adc7ff'} strokeWidth="0.5" strokeDasharray="1.5,1.5" opacity="0.7" vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
        )}

        {/* Zones */}
        {Object.entries(zones).map(([id, pos]) => {
          const isCharge = id.toLowerCase().includes('charg') || id.toLowerCase().includes('power');
          const c = isCharge ? '#4ade80' : '#f59e0b';
          return (
            <div key={id} style={{ position: 'absolute', left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)', padding: '4px 10px', border: `1px solid ${c}55`, background: `${c}12`, borderRadius: '6px', color: c, fontSize: '11px', fontWeight: 700, zIndex: 2, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
              {id}
            </div>
          );
        })}

        {/* Obstacles */}
        {obstacles.map((obs, i) => (
          <div key={i} style={{ position: 'absolute', left: `${obs.x}%`, top: `${obs.y}%`, transform: 'translate(-50%, -50%)', width: '28px', height: '28px', border: '2px solid #ffb4ab', background: 'rgba(255,180,171,0.15)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffb4ab', fontSize: '13px', fontWeight: 900, zIndex: 3, pointerEvents: 'none' }}>⚠</div>
        ))}

        {/* AGVs */}
        {fleet.map(agv => {
          const c = statusColors[agv.status] || '#adc7ff';
          return (
            <div key={agv.id} 
              onPointerDown={(e) => { e.stopPropagation(); if (onAgvClick) onAgvClick(agv.id); }}
              style={{ position: 'absolute', left: `${agv.x}%`, top: `${agv.y}%`, transform: 'translate(-50%, -50%)', zIndex: 10, pointerEvents: 'auto', transition: 'left 0.1s linear, top 0.1s linear', cursor: 'pointer' }}>
              <div style={{ width: '22px', height: '22px', background: c, borderRadius: '5px', border: '2px solid var(--color-surface)', boxShadow: `0 0 8px ${c}88`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '8px', fontWeight: 900, color: 'var(--color-surface-container-lowest)' }}>R</span>
              </div>
              <div style={{ position: 'absolute', bottom: '26px', left: '50%', transform: 'translateX(-50%)', background: 'var(--color-surface-container-highest)', border: `1px solid ${c}55`, padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 700, color: c, whiteSpace: 'nowrap' }}>{agv.id}</div>
              {agv.load_kg > 0 && <div style={{ position: 'absolute', top: '24px', left: '50%', transform: 'translateX(-50%)', fontSize: '9px', fontWeight: 700, color: '#f59e0b', whiteSpace: 'nowrap' }}>{agv.load_kg}kg</div>}
            </div>
          );
        })}

        {/* Edit mode indicator */}
        {editTool && (
          <div style={{ position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(173,199,255,0.15)', border: '1px solid #adc7ff', borderRadius: '20px', padding: '6px 20px', fontSize: '12px', fontWeight: 700, color: '#adc7ff', zIndex: 20 }}>
            {editTool === 'add_hazard' && '⚠ Click map to place hazard'}
            {editTool === 'remove_item' && '✕ Click item to remove'}
            {editTool === 'add_zone' && `📍 ${newZoneName ? `Click to place "${newZoneName}"` : 'Type zone name first →'}`}
            {editTool === 'spawn_agv' && `🤖 Click map to spawn "${newAgvName || `AGV-${String(agvCounter).padStart(3,'0')}`}"`}
            {editTool === 'draw_path' && `✨ Click map to map route nodes`}
          </div>
        )}
      </div>

      {/* Legend */}
      {layer === 'standard' && (
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', display: 'flex', gap: '10px', background: 'var(--color-surface-container-highest)', backdropFilter: 'blur(8px)', border: '1px solid var(--color-outline-variant)', borderRadius: '12px', padding: '8px 16px', zIndex: 20, flexWrap: 'wrap' }}>
          {Object.entries({ Moving: '#52dad7', Idle: '#adc7ff', Loading: '#f59e0b', Charging: '#4ade80', Error: '#ffb4ab' }).map(([label, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '10px', fontWeight: 700, color: 'var(--color-on-surface)' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: color, display: 'inline-block' }}></span> {label}
            </div>
          ))}
        </div>
      )}

      {/* Zoom Controls */}
      {showZoomControls && (
        <div style={{ position: 'absolute', bottom: '16px', right: '16px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 20 }}>
          <button onClick={handleZoomIn} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-container-highest)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
          </button>
          <button onClick={handleZoomOut} style={{ width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-container-highest)', border: '1px solid var(--color-outline-variant)', borderRadius: '8px', cursor: 'pointer', color: 'var(--color-primary)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>remove</span>
          </button>
        </div>
      )}
    </div>
  );
}
