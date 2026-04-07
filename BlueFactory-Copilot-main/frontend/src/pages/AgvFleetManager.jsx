import React, { useEffect, useRef, useState, useCallback } from 'react';

const BASE_IMG = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJw8Usg1IXk9goEgI_mm6Y6MoZHELtdmLARK46Er1pc5c5INgUf6b46Z2uuY1nLwJuaAzzemi7FB61GHjK5wexVL8sP8KOEoTbhC9liTOOzwI58QDc85nzGou5RIX8wX6guhR5O7YqR_KETPalxqvF_-oT4dbqWyKUOzEXPOwBMoBt9ytDlr-x7rENs8oGQpYLLgH62DKjAsJCqaolND2hOm5FoFsWvjO8YDi2ZfT8-Yr5EfhRdnjXy0YrvTPeYno7-K--v6e3_vp2';

/* ─── AGV Categories & Models ─── */
const AGV_CATEGORIES = [
  { id: 'Basic', label: 'BlueRoll Basic', icon: '⚙️', color: '#8b90a0', img: BASE_IMG, desc: 'Standalone TQW precision planetary gearboxes.' },
  { id: 'Advanced', label: 'BlueRoll Advanced', icon: '⚡', color: '#52dad7', img: BASE_IMG, desc: 'Integrates TQW gearbox with a BMD servomotor.' },
  { id: 'Compact', label: 'BlueRoll Compact', icon: '🚀', color: '#c084fc', img: BASE_IMG, desc: 'Extra-compact design for maximum space savings.' }
];

const AGV_MODELS = [
  { id: 'BR-Basic-060', cat: 'Basic', label: 'TQW 060', maxLoad: 360, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: BASE_IMG, desc: '160 mm industrial wheel, high energy efficiency.' },
  { id: 'BR-Basic-070', cat: 'Basic', label: 'TQW 070', maxLoad: 720, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: BASE_IMG, desc: '200 mm wheel, utilizing reinforced bearings.' },
  { id: 'BR-Basic-090', cat: 'Basic', label: 'TQW 090', maxLoad: 1020, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: BASE_IMG, desc: '250 mm wheel, built for demanding environments.' },
  { id: 'BR-Adv-060', cat: 'Advanced', label: 'TQW 060 Base', maxLoad: 360, speed: 15, icon: '⚡', color: '#52dad7', img: BASE_IMG, desc: 'Combines TQW 060 gearbox with a servomotor.' },
  { id: 'BR-Adv-070', cat: 'Advanced', label: 'TQW 070 Base', maxLoad: 720, speed: 15, icon: '⚡', color: '#52dad7', img: BASE_IMG, desc: 'Integrates TQW 070 gearbox.' },
  { id: 'BR-Adv-090', cat: 'Advanced', label: 'TQW 090 Base', maxLoad: 1020, speed: 15, icon: '⚡', color: '#52dad7', img: BASE_IMG, desc: 'The most powerful Advanced configuration.' },
  { id: 'BR-Comp-060', cat: 'Compact', label: 'TQW 060 Base', maxLoad: 360, speed: 10, icon: '🚀', color: '#c084fc', img: BASE_IMG, desc: '25% shorter design, perfect for space constraints.' },
  { id: 'BR-Comp-070', cat: 'Compact', label: 'TQW 070 Base', maxLoad: 720, speed: 10, icon: '🚀', color: '#c084fc', img: BASE_IMG, desc: 'Extra-compact motor platform.' },
  { id: 'BR-Comp-090', cat: 'Compact', label: 'TQW 090 Base', maxLoad: 1020, speed: 10, icon: '🚀', color: '#c084fc', img: BASE_IMG, desc: 'Highest capacity compact option.' }
];

const STATUS_COLORS = {
  'IDLE':                 { bg:'rgba(173,199,255,.12)', text:'#adc7ff', border:'rgba(173,199,255,.25)' },
  'EN ROUTE':             { bg:'rgba(82,218,215,.12)',  text:'#52dad7', border:'rgba(82,218,215,.25)'  },
  'MOVING':               { bg:'rgba(82,218,215,.12)',  text:'#52dad7', border:'rgba(82,218,215,.25)'  },
  'CHARGING':             { bg:'rgba(74,222,128,.12)',  text:'#4ade80', border:'rgba(74,222,128,.25)'  },
  'REROUTING':            { bg:'rgba(192,132,252,.12)', text:'#c084fc', border:'rgba(192,132,252,.25)' },
  'ERROR':                { bg:'rgba(255,180,171,.12)', text:'#ffb4ab', border:'rgba(255,180,171,.25)' },
  'OVERHEATING':          { bg:'rgba(251,146,60,.12)',  text:'#fb923c', border:'rgba(251,146,60,.25)'  },
  'LOW BATT - RETURNING': { bg:'rgba(250,204,21,.12)',  text:'#facc15', border:'rgba(250,204,21,.25)'  },
  'CALCULATING...':       { bg:'rgba(173,199,255,.07)', text:'#8b90a0', border:'rgba(173,199,255,.12)' },
};
function sc(s)  { return STATUS_COLORS[s] || {bg:'rgba(255,255,255,.06)',text:'#8b90a0',border:'rgba(255,255,255,.1)'}; }
function bc(b)  { return b>50?'#52dad7':b>20?'#facc15':'#ffb4ab'; }
function hs(agv){ let s=100; if((agv.motor_temp||0)>80)s-=15; if((agv.motor_temp||0)>100)s-=20; const st=(agv.status||'').toUpperCase(); if(st==='ERROR'||st==='OVERHEATING')s-=25; return Math.max(0,Math.min(100,s)); }

/* ─── Add-AGV Modal ─── */
function AddAgvModal({ zones, ws, onClose, totalFleet, editMode }) {
  const [step, setStep]           = useState(editMode ? 3 : 1);
  const [selectedCat, setCat]     = useState(null);
  const [selectedModel, setModel] = useState(editMode ? AGV_MODELS.find(m=>m.id===editMode.model) : null);
  const [agvName, setAgvName]     = useState(editMode ? editMode.id : '');
  const [spawnZone, setSpawnZone] = useState('');
  const [spawnX, setSpawnX]       = useState(editMode ? editMode.x : 50);
  const [spawnY, setSpawnY]       = useState(editMode ? editMode.y : 50);
  const [loadKg, setLoadKg]       = useState(editMode ? editMode.load_kg : 0);
  const overlayRef = useRef(null);

  const counter = totalFleet + 1;
  const defaultName = selectedModel
    ? `${selectedModel.id}-${String(counter).padStart(3,'0')}`
    : '';

  const handleCreate = () => {
    const name = agvName.trim() || defaultName;
    let x = spawnX;
    let y = spawnY;
    if (spawnZone && zones[spawnZone]) { x = zones[spawnZone].x; y = zones[spawnZone].y; }
    if (ws && ws.readyState === WebSocket.OPEN) {
      if (editMode) {
        ws.send(JSON.stringify({ type: 'edit_agv', agv_id: editMode.id, new_name: name, x, y, load_kg: loadKg }));
      } else {
        ws.send(JSON.stringify({ type: 'add_agv', name, x, y, model: selectedModel?.id, load_kg: loadKg }));
      }
    }
    onClose();
  };

  const handleCatSelect = (c) => {
    if (c.standalone) {
      setModel(AGV_MODELS.find(m=>m.cat === c.id));
      setStep(3);
    } else {
      setCat(c);
      setStep(2);
    }
  };

  const currentModels = selectedCat ? AGV_MODELS.filter(m => m.cat === selectedCat.id) : [];

  return (
    <div ref={overlayRef} onClick={e => { if(e.target===overlayRef.current) onClose(); }}
      style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', zIndex:2000, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:'640px', maxWidth:'95vw', background:'#11171f', border:'1px solid rgba(173,199,255,0.15)', borderRadius:'20px', overflow:'hidden', boxShadow:'0 40px 100px rgba(0,0,0,0.8)' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 24px', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h3 style={{ margin:0, fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'18px', color:'#dde3ec' }}>
              {editMode ? `Edit AGV — ${editMode.id}` : (step===1 ? 'Select Series' : step===2 ? 'Select TQW Variant' : `Configure — ${selectedModel?.label}`)}
            </h3>
            <p style={{ margin:'2px 0 0', fontSize:'12px', color:'rgba(193,198,215,0.5)' }}>Step {step} of 3</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.06)', border:'none', color:'#c1c6d7', width:'32px', height:'32px', borderRadius:'50%', cursor:'pointer', fontSize:'18px', display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
        </div>

        {step===1 && (
          <div style={{ padding:'20px 24px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
              {AGV_CATEGORIES.map(c => (
                <div key={c.id} onClick={() => handleCatSelect(c)}
                  style={{ background: 'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.15s', display:'flex', gap:'12px', alignItems:'center' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=c.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <div style={{ width:'80px', height:'80px', borderRadius:'8px', overflow:'hidden', flexShrink:0 }}>
                    <img src={c.img} alt={c.label} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.8)' }} />
                  </div>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                      <span style={{ fontSize:'16px' }}>{c.icon}</span>
                      <span style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'14px', color:c.color }}>{c.label}</span>
                    </div>
                    <div style={{ fontSize:'11px', color:'rgba(193,198,215,0.5)', marginTop:'4px' }}>{c.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step===2 && (
          <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column' }}>
             <button onClick={()=>setStep(1)} style={{ marginBottom:'16px', alignSelf:'flex-start', padding:'6px 12px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(193,198,215,0.7)', fontWeight:700, fontSize:'11px', cursor:'pointer' }}>← Back to Series</button>
             <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
              {currentModels.map(m => (
                <div key={m.id} onClick={() => { setModel(m); setStep(3); }}
                  style={{ background: 'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'12px', padding:'16px', cursor:'pointer', transition:'all 0.15s', display:'flex', flexDirection:'column', gap:'8px' }}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=m.color}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
                  <div style={{ height:'80px', borderRadius:'8px', overflow:'hidden', opacity:0.6 }}>
                     <img src={m.img} alt={m.label} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'13px', color:'#dde3ec' }}>{m.label}</div>
                    <div style={{ fontSize:'10px', color:'rgba(193,198,215,0.5)', marginTop:'4px', lineHeight:'1.2' }}>{m.desc}</div>
                  </div>
                  <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'auto' }}>
                    <span style={{ fontSize:'9px', fontWeight:700, background:`${m.color}18`, color:m.color, border:`1px solid ${m.color}33`, padding:'2px 6px', borderRadius:'4px' }}>Max {m.maxLoad}kg</span>
                    <span style={{ fontSize:'9px', fontWeight:700, background:`${m.color}18`, color:m.color, border:`1px solid ${m.color}33`, padding:'2px 6px', borderRadius:'4px' }}>{m.speed}km/h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step===3 && selectedModel && (
          <div style={{ padding:'20px 24px', display:'flex', gap:'20px' }}>
            <div style={{ width:'180px', flexShrink:0 }}>
              <div style={{ height:'160px', borderRadius:'12px', overflow:'hidden', position:'relative', border:`1px solid ${selectedModel.color}33` }}>
                <img src={selectedModel.img} alt={selectedModel.label} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.8)' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(17,23,31,0.8) 0%,transparent 50%)' }} />
                <div style={{ position:'absolute', bottom:'8px', left:'8px' }}>
                  <span style={{ fontSize:'9px', fontWeight:700, background:selectedModel.color, color:'#0e141a', padding:'2px 8px', borderRadius:'4px' }}>{selectedModel.label}</span>
                </div>
              </div>
              <div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'4px' }}>
                {[['Max Load', `${selectedModel.maxLoad.toLocaleString()} kg`], ['Top Speed', `${selectedModel.speed} km/h`]].map(([k,v])=>(
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:'10px' }}>
                    <span style={{ color:'rgba(193,198,215,0.5)' }}>{k}</span>
                    <span style={{ color:'#dde3ec', fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:'14px' }}>
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', marginBottom:'6px' }}>AGV Name / ID</label>
                <input value={agvName} onChange={e=>setAgvName(e.target.value)} placeholder={defaultName}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
              </div>
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', marginBottom:'6px' }}>Spawn Location (Zone or Custom X/Y)</label>
                <select value={spawnZone} onChange={e=>setSpawnZone(e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box', cursor:'pointer', marginBottom: spawnZone ? '0' : '8px' }}>
                  <option value="">— Manual X/Y Coordinates —</option>
                  {Object.keys(zones).map(z=><option key={z} value={z}>{z}</option>)}
                </select>
                {!spawnZone && (
                  <div style={{ display:'flex', gap:'10px' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'9px', color:'rgba(193,198,215,0.5)', marginBottom:'4px', fontWeight:700 }}>MAP X (0-100)</div>
                      <input type="number" value={spawnX} onChange={e=>setSpawnX(Number(e.target.value))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'8px 10px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'9px', color:'rgba(193,198,215,0.5)', marginBottom:'4px', fontWeight:700 }}>MAP Y (0-100)</div>
                      <input type="number" value={spawnY} onChange={e=>setSpawnY(Number(e.target.value))}
                        style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'8px 10px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', marginBottom:'6px' }}>Initial Load (kg)</label>
                <input type="number" min="0" max={selectedModel.maxLoad} value={loadKg} onChange={e=>setLoadKg(Number(e.target.value))}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'auto' }}>
                <button onClick={()=>{
                   if(editMode) onClose(); else { if(AGV_CATEGORIES.find(c=>c.id===selectedModel?.cat)?.standalone) setStep(1); else setStep(2); }
                }} style={{ flex:1, padding:'11px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(193,198,215,0.7)', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>← Back</button>
                <button onClick={handleCreate}
                  style={{ flex:2, padding:'11px', borderRadius:'8px', border:'none', background:`linear-gradient(90deg,${selectedModel.color},#adc7ff)`, color:'#0e141a', fontWeight:900, fontSize:'13px', cursor:'pointer', letterSpacing:'0.04em' }}>
                  {editMode ? '💾 Save Changes' : '🤖 Deploy AGV'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── AGV Detail Floating Panel ─── */
function AgvPanel({ agv, zones, ws, anchor, onClose }) {
  const panelRef  = useRef(null);
  const leaveRef  = useRef(null);
  const [assignZone, setZone] = useState('');
  const [loadKg,  setLoad]    = useState(0);
  const [msg,     setMsg]     = useState('');

  const send = useCallback(payload => {
    if (ws?.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
  }, [ws]);

  // Close on click outside
  useEffect(() => {
    const handler = e => { if (panelRef.current && !panelRef.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close after cursor leaves panel (with small delay to allow cursor transit)
  const handlePanelLeave = () => {
    leaveRef.current = setTimeout(onClose, 300);
  };
  const handlePanelEnter = () => {
    clearTimeout(leaveRef.current);
  };

  const assignMission = () => {
    if (!assignZone) return;
    send({ type:'quick_command', agv_id:agv.id, zone_id:assignZone, load_kg:loadKg });
    setMsg(`✓ Routed to ${assignZone}`);
    setTimeout(()=>setMsg(''), 3000);
  };
  const sendToCharge = () => {
    const cz = Object.keys(zones).find(z=>z.toLowerCase().includes('charg')||z.toLowerCase().includes('power'));
    if (cz) { send({ type:'quick_command', agv_id:agv.id, zone_id:cz, load_kg:0 }); setMsg(`⚡ → ${cz}`); }
    else setMsg('⚠ No charging zone on map');
    setTimeout(()=>setMsg(''), 3000);
  };

  const h = hs(agv);
  const c = sc(agv.status);
  const model = AGV_MODELS.find(m=>m.id===agv.model) || AGV_MODELS[0];

  // Position: try right side of anchor, fallback left
  const style = {
    position: 'fixed',
    top: Math.min(anchor.y, window.innerHeight - 560),
    left: anchor.x + 16,
    width: '340px',
    zIndex: 1500,
    background: 'rgba(14,20,26,0.97)',
    backdropFilter: 'blur(24px)',
    border: '1px solid rgba(173,199,255,0.2)',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
    animation: 'panelIn .16s ease',
  };

  return (
    <div ref={panelRef} style={style} onMouseEnter={handlePanelEnter} onMouseLeave={handlePanelLeave}>
      <style>{`@keyframes panelIn{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}`}</style>

      {/* Photo header */}
      <div style={{ position:'relative', height:'148px', overflow:'hidden' }}>
        <img src={model.img} alt={model.label} style={{ width:'100%', height:'100%', objectFit:'cover', filter:'brightness(0.65) saturate(0.7)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(14,20,26,1) 0%,transparent 55%)' }} />
        {/* Close btn */}
        <button onClick={onClose} style={{ position:'absolute', top:'8px', right:'8px', background:'rgba(0,0,0,0.5)', border:'none', color:'#c1c6d7', width:'26px', height:'26px', borderRadius:'50%', cursor:'pointer', fontSize:'15px', display:'flex', alignItems:'center', justifyContent:'center', lineHeight:'1' }}>×</button>
        {/* Badges */}
        <div style={{ position:'absolute', bottom:'36px', left:'12px', display:'flex', gap:'5px' }}>
          <span style={{ background:'rgba(173,199,255,0.25)', color:'#adc7ff', fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Lidar Active</span>
          <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'4px', textTransform:'uppercase' }}>{agv.status}</span>
        </div>
        {/* AGV title */}
        <div style={{ position:'absolute', bottom:'10px', left:'12px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'16px', color:'#dde3ec' }}>{agv.id}</div>
        <div style={{ position:'absolute', bottom:'10px', right:'12px', fontSize:'10px', color:model.color, fontWeight:700 }}>{model.label}</div>
      </div>

      {/* Telemetry 3-column */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px', padding:'10px 12px 6px' }}>
        {[['Motor Torque','14.2','Nm'],['Travel Speed',(agv.speed_kmh||0).toFixed(1),'km/h'],['Temp',(agv.motor_temp||0).toFixed(0),'°C']].map(([l,v,u])=>(
          <div key={l} style={{ background:'rgba(255,255,255,0.04)', borderRadius:'8px', padding:'8px', textAlign:'center' }}>
            <div style={{ fontSize:'8px', fontWeight:700, color:'rgba(193,198,215,0.45)', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'4px' }}>{l}</div>
            <div style={{ fontFamily:'monospace', fontWeight:900, fontSize:'14px', color:'#dde3ec' }}>{v} <span style={{ fontSize:'9px', color:'rgba(193,198,215,0.5)' }}>{u}</span></div>
          </div>
        ))}
      </div>

      {/* Battery bar */}
      <div style={{ padding:'0 12px 6px', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ fontSize:'9px', color:'rgba(193,198,215,0.4)', fontWeight:700, width:'50px' }}>BATTERY</span>
        <div style={{ flex:1, height:'5px', background:'rgba(255,255,255,0.08)', borderRadius:'4px', overflow:'hidden' }}>
          <div style={{ width:`${agv.battery}%`, height:'100%', background:bc(agv.battery), borderRadius:'4px', transition:'width .5s' }} />
        </div>
        <span style={{ fontSize:'11px', fontWeight:900, color:bc(agv.battery), fontFamily:'monospace', width:'34px', textAlign:'right' }}>{agv.battery.toFixed(0)}%</span>
      </div>

      {/* Health Trend */}
      <div style={{ padding:'0 12px 8px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
          <span style={{ fontSize:'9px', fontWeight:700, color:'rgba(193,198,215,0.4)', textTransform:'uppercase', letterSpacing:'0.07em' }}>Health Trend (7d)</span>
          <span style={{ fontSize:'10px', color:'#52dad7', fontWeight:700 }}>{h >= 80 ? '+' : ''}{(h-94).toFixed(1)}%</span>
        </div>
        <div style={{ display:'flex', gap:'3px', alignItems:'flex-end', height:'28px' }}>
          {[0.45,0.55,0.5,0.65,0.7,0.8,h/100].map((v,i)=>(
            <div key={i} style={{ flex:1, height:`${v*100}%`, background:`rgba(173,199,255,${0.2+v*0.5})`, borderRadius:'2px 2px 0 0' }} />
          ))}
        </div>
      </div>

      {/* History Log */}
      <div style={{ padding:'0 12px 8px', borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:'8px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'5px', marginBottom:'6px' }}>
          <span style={{ fontSize:'9px', fontWeight:700, color:'rgba(193,198,215,0.4)', textTransform:'uppercase', letterSpacing:'0.07em' }}>📋 History Log</span>
        </div>
        {[`Mission completed → ${Object.keys(zones)[0] || 'Depot'}`, 'Battery cycle charged', 'Telemetry synced'].map((t,i)=>(
          <div key={i} style={{ display:'flex', gap:'6px', marginBottom:'4px', alignItems:'flex-start' }}>
            <div style={{ width:'3px', borderRadius:'2px', background:['#52dad7','#adc7ff','rgba(255,255,255,0.2)'][i], flexShrink:0, height:'30px', marginTop:'2px' }} />
            <div>
              <div style={{ fontSize:'10px', color:'#dde3ec', fontWeight:600 }}>{t}</div>
              <div style={{ fontSize:'9px', color:'rgba(193,198,215,0.4)' }}>{['Just now','12 min ago','1 hr ago'][i]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Assign mission */}
      <div style={{ padding:'0 12px 8px' }}>
        <div style={{ display:'flex', gap:'5px' }}>
          <select value={assignZone} onChange={e=>setZone(e.target.value)}
            style={{ flex:1, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'6px 8px', fontSize:'11px', color:'#dde3ec', outline:'none', cursor:'pointer' }}>
            <option value="">— Select target zone —</option>
            {Object.keys(zones).map(z=><option key={z} value={z}>{z}</option>)}
          </select>
          <input type="number" value={loadKg} onChange={e=>setLoad(Number(e.target.value))} placeholder="kg" min="0"
            style={{ width:'46px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'6px', padding:'6px', fontSize:'11px', color:'#dde3ec', outline:'none', textAlign:'center' }} />
        </div>
        {msg && <div style={{ fontSize:'10px', color:'#52dad7', fontWeight:600, marginTop:'4px' }}>{msg}</div>}
      </div>

      {/* Action buttons */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', padding:'0 12px 14px' }}>
        <button onClick={()=>send({type:'agv_cmd',agv_id:agv.id,cmd:'start'})}
          style={{ padding:'9px', borderRadius:'7px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', background:'rgba(255,255,255,0.06)', color:'#dde3ec', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          ▶ Start AGV
        </button>
        <button onClick={()=>send({type:'agv_cmd',agv_id:agv.id,cmd:'stop'})}
          style={{ padding:'9px', borderRadius:'7px', border:'none', cursor:'pointer', fontWeight:700, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', background:'rgba(255,180,171,0.1)', color:'#ffb4ab', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          ■ Stop AGV
        </button>
        <button onClick={assignMission} disabled={!assignZone}
          style={{ padding:'9px', borderRadius:'7px', border:'none', cursor:assignZone?'pointer':'not-allowed', fontWeight:700, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', background:assignZone?'linear-gradient(90deg,#adc7ff,#4a8eff)':'rgba(255,255,255,0.04)', color:assignZone?'#0e141a':'#8b90a0', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          📋 Assign Mission
        </button>
        <button onClick={sendToCharge}
          style={{ padding:'9px', borderRadius:'7px', border:'1px solid rgba(74,222,128,0.3)', cursor:'pointer', fontWeight:700, fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.05em', background:'rgba(74,222,128,0.08)', color:'#4ade80', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px' }}>
          ⚡ Charging
        </button>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
export default function AgvFleetManager() {
  const [fleet,      setFleet]      = useState([]);
  const [zones,      setZones]      = useState({});
  const [connected,  setConnected]  = useState(false);
  const [showModal,  setModal]      = useState(false);
  const [editAgv, setEditAgv] = useState(null);
  const [panel,      setPanel]      = useState(null); // {agv, anchor:{x,y}}
  const [filter,     setFilter]     = useState('all');
  const [search,     setSearch]     = useState('');
  const wsRef = useRef(null);
  const panelLeaveRef = useRef(null);

  useEffect(()=>{
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    wsRef.current = ws;
    ws.onopen  = ()=>setConnected(true);
    ws.onclose = ()=>setConnected(false);
    ws.onerror = ()=>setConnected(false);
    ws.onmessage= e => {
      try { const d=JSON.parse(e.data); if(d.fleet) setFleet(d.fleet); if(d.zones) setZones(d.zones); } catch{}
    };
    return ()=>ws.close();
  },[]);

  const filtered = fleet.filter(a=>{
    const s=(a.status||'').toUpperCase();
    if(filter==='active'   && s==='IDLE')                        return false;
    if(filter==='idle'     && s!=='IDLE')                        return false;
    if(filter==='charging' && s!=='CHARGING')                    return false;
    if(filter==='error'    && s!=='ERROR' && s!=='OVERHEATING')  return false;
    if(filter==='low'      && a.battery>=20)                     return false;
    if(search && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeCount   = fleet.filter(a=>a.status!=='IDLE'&&a.status!=='CHARGING').length;
  const criticalCount = fleet.filter(a=>['ERROR','OVERHEATING'].includes((a.status||'').toUpperCase())||a.battery<10).length;
  const avgBatt       = fleet.length?(fleet.reduce((s,a)=>s+(a.battery||0),0)/fleet.length).toFixed(0):'—';

  const openPanel = (agv, e) => {
    clearTimeout(panelLeaveRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setPanel({ agv, anchor:{ x: rect.right, y: rect.top } });
  };
  const scheduleClose = () => { panelLeaveRef.current = setTimeout(()=>setPanel(null), 350); };
  const cancelClose   = () => clearTimeout(panelLeaveRef.current);

  return (
    <div style={{ padding:'24px', overflowY:'auto', minHeight:'calc(100vh - 84px)', position:'relative' }}>

      {/* Edit & Add Modals */}
      {editAgv && <AddAgvModal zones={zones} ws={wsRef.current} onClose={()=>setEditAgv(null)} totalFleet={fleet.length} editMode={editAgv} />}
      {/* Add AGV Modal */}
      {showModal && <AddAgvModal zones={zones} ws={wsRef.current} onClose={()=>setModal(false)} totalFleet={fleet.length} />}

      {/* Floating panel */}
      {panel && (
        <AgvPanel agv={panel.agv} zones={zones} ws={wsRef.current} anchor={panel.anchor}
          onClose={()=>setPanel(null)} />
      )}

      {/* Page header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'24px' }}>
        <div>
          <h2 style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'28px', color:'#dde3ec', margin:0 }}>Fleet Analytics</h2>
          <p style={{ fontSize:'13px', color:'rgba(193,198,215,0.55)', margin:'4px 0 0', display:'flex', alignItems:'center', gap:'8px' }}>
            Real-time oversight of autonomous logistical units
            <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:connected?'#4ade80':'#ffb4ab', boxShadow:connected?'0 0 6px #4ade80':'none', display:'inline-block' }}></span>
            <span style={{ fontSize:'10px', fontWeight:700, color:connected?'#4ade80':'#ffb4ab', textTransform:'uppercase' }}>{connected?'Live':'Disconnected'}</span>
          </p>
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 16px', borderRadius:'9px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(193,198,215,0.8)', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
            🔬 Run Diagnostics
          </button>
          <button onClick={()=>setModal(true)}
            style={{ display:'flex', alignItems:'center', gap:'7px', padding:'10px 18px', borderRadius:'9px', border:'none', background:'linear-gradient(90deg,#adc7ff,#4a8eff)', color:'#0e141a', fontWeight:900, fontSize:'13px', cursor:'pointer', boxShadow:'0 4px 20px rgba(173,199,255,0.25)' }}>
            + Add New AGV
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'24px' }}>
        {[
          { label:'Total AGVs',      value:fleet.length,   color:'#adc7ff', sub:'registered units' },
          { label:'Active Units',    value:activeCount,    color:'#52dad7', sub:`${fleet.length?((activeCount/fleet.length)*100).toFixed(0):0}% uptime` },
          { label:'Critical Alerts', value:criticalCount,  color:criticalCount>0?'#ffb4ab':'#52dad7', sub:criticalCount>0?'Action Required':'All Clear' },
          { label:'Avg Battery',     value:`${avgBatt}%`,  color:Number(avgBatt)>50?'#52dad7':'#facc15', sub:'fleet average' },
        ].map(({label,value,color,sub})=>(
          <div key={label} style={{ background:'#161c22', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'18px 20px' }}>
            <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(193,198,215,0.5)', marginBottom:'8px' }}>{label}</div>
            <div style={{ fontSize:'30px', fontFamily:"'Space Grotesk',sans-serif", fontWeight:900, color, lineHeight:1 }}>{value}</div>
            <div style={{ fontSize:'10px', marginTop:'4px', color:'rgba(193,198,215,0.4)' }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:'180px', maxWidth:'280px' }}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search AGV ID..."
            style={{ width:'100%', background:'#161c22', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'8px 12px 8px 32px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
          <span style={{ position:'absolute', left:'10px', top:'50%', transform:'translateY(-50%)', color:'#8b90a0' }}>🔍</span>
        </div>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
          {[['all','All Units'],['active','Active'],['idle','Idle'],['charging','Charging'],['error','Errors'],['low','Low Batt']].map(([key,lbl])=>(
            <button key={key} onClick={()=>setFilter(key)}
              style={{ padding:'6px 14px', borderRadius:'20px', border:'none', cursor:'pointer', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.05em', transition:'all .15s',
                background:filter===key?'#adc7ff':'rgba(255,255,255,0.06)', color:filter===key?'#0e141a':'rgba(193,198,215,0.7)' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Fleet Table */}
      <div style={{ background:'#161c22', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', overflow:'hidden', marginBottom:'20px' }}>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
              {['AGV ID','Model','Status','Battery','Temp','Speed','Mission','Health','Actions'].map(col=>(
                <th key={col} style={{ padding:'11px 14px', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', textAlign:'left', whiteSpace:'nowrap' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length===0 && (
              <tr><td colSpan={8} style={{ padding:'40px', textAlign:'center', color:'rgba(193,198,215,0.4)', fontSize:'13px' }}>
                {fleet.length===0
                  ? <span>No AGVs deployed yet. <button onClick={()=>setModal(true)} style={{ color:'#adc7ff', background:'none', border:'none', cursor:'pointer', fontWeight:700, textDecoration:'underline' }}>+ Add your first AGV</button></span>
                  : 'No AGVs match filter.'}
              </td></tr>
            )}
            {filtered.map((agv, idx)=>{
              const c  = sc(agv.status);
              const h  = hs(agv);
              const b  = bc(agv.battery);
              const m  = AGV_MODELS.find(x=>x.id===agv.model) || null;
              return (
                <tr key={agv.id}
                  style={{ borderBottom:idx<filtered.length-1?'1px solid rgba(255,255,255,0.05)':'none', transition:'background .15s',
                    background:panel?.agv?.id===agv.id?'rgba(173,199,255,0.06)':'transparent' }}>

                  {/* AGV ID — hoverable trigger */}
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                      <span style={{ width:'7px', height:'7px', borderRadius:'50%', background:c.text, boxShadow:`0 0 5px ${c.text}`, flexShrink:0, display:'inline-block' }}></span>
                      <button
                        onClick={(e) => { e.stopPropagation(); localStorage.setItem('bluefactory_selected_agv', agv.id); alert(`Selected AGV ${agv.id} for Global Safety Controls`); }}
                        onMouseEnter={e=>openPanel(agv,e)}
                        onMouseLeave={scheduleClose}
                        style={{ fontFamily:"'Space Grotesk',sans-serif", fontWeight:700, fontSize:'13px', color:'#adc7ff', background:'none', border:'none', cursor:'pointer', padding:0, textDecoration:'underline dotted', textUnderlineOffset:'3px' }}>
                        {agv.id}
                      </button>
                    </div>
                  </td>

                  {/* Model */}
                  <td style={{ padding:'13px 14px' }}>
                    {m ? <span style={{ fontSize:'10px', fontWeight:700, color:m.color, background:`${m.color}15`, border:`1px solid ${m.color}30`, padding:'2px 7px', borderRadius:'4px' }}>{m.label}</span>
                        : <span style={{ fontSize:'10px', color:'rgba(193,198,215,0.3)', fontStyle:'italic' }}>—</span>}
                  </td>

                  {/* Status */}
                  <td style={{ padding:'13px 14px' }}>
                    <span style={{ background:c.bg, color:c.text, border:`1px solid ${c.border}`, fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'5px', textTransform:'uppercase', letterSpacing:'0.04em', whiteSpace:'nowrap' }}>{agv.status}</span>
                  </td>

                  {/* Battery */}
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                      <div style={{ width:'72px', height:'4px', background:'rgba(255,255,255,0.1)', borderRadius:'4px', overflow:'hidden' }}>
                        <div style={{ width:`${agv.battery}%`, height:'100%', background:b, borderRadius:'4px', transition:'width .5s' }} />
                      </div>
                      <span style={{ fontSize:'11px', fontWeight:700, color:b, fontFamily:'monospace' }}>{agv.battery.toFixed(0)}%</span>
                    </div>
                  </td>

                  {/* Temp */}
                  <td style={{ padding:'13px 14px', fontSize:'12px', fontFamily:'monospace', color:(agv.motor_temp||0)>80?'#fb923c':'rgba(193,198,215,0.8)', fontWeight:600 }}>
                    {(agv.motor_temp||0).toFixed(1)}°C
                  </td>

                  {/* Speed */}
                  <td style={{ padding:'13px 14px', fontSize:'12px', fontFamily:'monospace', color:'rgba(193,198,215,0.8)', fontWeight:600 }}>
                    {(agv.speed_kmh||0).toFixed(1)} km/h
                  </td>

                  {/* Mission */}
                  <td style={{ padding:'13px 14px', fontSize:'12px', color:agv.target_zone==='Idle'?'rgba(193,198,215,0.35)':'#dde3ec', fontStyle:agv.target_zone==='Idle'?'italic':'normal', maxWidth:'140px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {agv.target_zone==='Idle'?'Awaiting Assignment':`→ ${agv.target_zone}`}
                  </td>

                  {/* Health */}
                  <td style={{ padding:'13px 14px' }}>
                    <span style={{ fontFamily:'monospace', fontWeight:900, fontSize:'13px', color:h>70?'#52dad7':h>40?'#facc15':'#ffb4ab' }}>{h}/100</span>
                  </td>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <button onClick={(e)=>{ e.stopPropagation(); setEditAgv(agv); }} style={{ background:'transparent', border:'none', color:'#adc7ff', cursor:'pointer' }} title="Edit">✏️</button>
                        <button onClick={(e)=>{ e.stopPropagation(); if(wsRef.current) wsRef.current.send(JSON.stringify({type:'remove_agv', agv_id: agv.id})); }} style={{ background:'transparent', border:'none', color:'#ffb4ab', cursor:'pointer' }} title="Remove">🗑️</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Zones + auto-assign */}
      {Object.keys(zones).length>0 && (
        <div style={{ background:'#161c22', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'12px', padding:'16px 20px' }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'rgba(193,198,215,0.5)', marginBottom:'12px' }}>Map Zones — Quick Assign ({Object.keys(zones).length})</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {Object.entries(zones).map(([id])=>{
              const isCharge = id.toLowerCase().includes('charg')||id.toLowerCase().includes('power');
              const col = isCharge?'#4ade80':'#f59e0b';
              const idleAgv = fleet.find(a=>a.status==='IDLE');
              return (
                <div key={id} style={{ display:'flex', alignItems:'center', gap:'6px', background:`${col}10`, border:`1px solid ${col}30`, borderRadius:'8px', padding:'6px 12px' }}>
                  <span style={{ fontSize:'11px', fontWeight:700, color:col }}>{id}</span>
                  {idleAgv && (
                    <button onClick={()=>{ if(wsRef.current?.readyState===WebSocket.OPEN) wsRef.current.send(JSON.stringify({type:'quick_command',agv_id:idleAgv.id,zone_id:id,load_kg:0})); }}
                      style={{ fontSize:'9px', fontWeight:700, background:col, color:'#0e141a', border:'none', borderRadius:'4px', padding:'2px 8px', cursor:'pointer', textTransform:'uppercase' }}>
                      Auto-Assign
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
