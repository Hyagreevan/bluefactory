import re

filepath = r"c:\Users\hyagr\OneDrive\Documents\hyagreevan stitch edited bonfiglioli\BlueFactory-Copilot-main\BlueFactory-Copilot-main\frontend\src\pages\AgvFleetManager.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

new_models = """/* ─── AGV Categories & Models ─── */
const AGV_CATEGORIES = [
  { id: 'Basic', label: 'BlueRoll Basic', icon: '⚙️', color: '#8b90a0', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJw8Usg1IXk9goEgI_mm6Y6MoZHELtdmLARK46Er1pc5c5INgUf6b46Z2uuY1nLwJuaAzzemi7FB61GHjK5wexVL8sP8KOEoTbhC9liTOOzwI58QDc85nzGou5RIX8wX6guhR5O7YqR_KETPalxqvF_-oT4dbqWyKUOzEXPOwBMoBt9ytDlr-x7rENs8oGQpYLLgH62DKjAsJCqaolND2hOm5FoFsWvjO8YDi2ZfT8-Yr5EfhRdnjXy0YrvTPeYno7-K--v6e3_vp2', desc: 'Standalone TQW precision planetary gearboxes.' },
  { id: 'Advanced', label: 'BlueRoll Advanced', icon: '⚡', color: '#52dad7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTDSeQqarVltwjo3FpBBY4f3zCd1NhA8N41lybBpROg-DsQGKirMIn5yXJRsZzYmqh0wyQKcdNtE_7fwMdzveRqMNN0K6wdumVIbBtXPP8_GagakYDsG7XTWtgnCJK-Q7QCMjV2QxP6Av6PNJOPlNiqwQgw82LaFARL7cLzOeaTGWlWAg6z6JX42Syo34XKRoI8X2axh-XX2TGejAUOmsznix4j-_6v9r69b9xIurXaOW8Cd4WL30CaSTB_VWmna977MiHV4cH713', desc: 'Integrates TQW gearbox with a BMD servomotor.' },
  { id: 'Compact', label: 'BlueRoll Compact', icon: '🚀', color: '#c084fc', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC02c8ghdCkYh_USUdhilXU8MKrJH48lExPNvQvf1-34wmGbJZLqY0QOhOdDJ7gOFVbvYLh9lGe-IerKFA4A3Sz6C6sK7IYjqKSvudiTu96KDidVxPIbxN9tqDOLmDl2Js5CNhSkHRZl-ecODXrqbItt55vB0XEr1BiI5t4YqQZJ-z8qkiULgtMLCJvyOnHaD0QjYsrUZGJzwH7ETblNylCAHr5io0LbS4tRtalEjHClOS6wIyrfoP2o5skXzhhVfCPCA18ImkDEsHy', desc: 'Extra-compact design for maximum space savings.' },
  { id: 'Forklift', label: 'Heavy Forklift', icon: '🏗', color: '#f59e0b', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBJw8Usg1IXk9goEgI_mm6Y6MoZHELtdmLARK46Er1pc5c5INgUf6b46Z2uuY1nLwJuaAzzemi7FB61GHjK5wexVL8sP8KOEoTbhC9liTOOzwI58QDc85nzGou5RIX8wX6guhR5O7YqR_KETPalxqvF_-oT4dbqWyKUOzEXPOwBMoBt9ytDlr-x7rENs8oGQpYLLgH62DKjAsJCqaolND2hOm5FoFsWvjO8YDi2ZfT8-Yr5EfhRdnjXy0YrvTPeYno7-K--v6e3_vp2', desc: 'Classic heavy load transport units.', standalone: true, model: { id: 'BF-Forklift', maxLoad: 5000, speed: 8 } },
  { id: 'PalletJack', label: 'Pallet Jack', icon: '📦', color: '#adc7ff', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANTDSeQqarVltwjo3FpBBY4f3zCd1NhA8N41lybBpROg-DsQGKirMIn5yXJRsZzYmqh0wyQKcdNtE_7fwMdzveRqMNN0K6wdumVIbBtXPP8_GagakYDsG7XTWtgnCJK-Q7QCMjV2QxP6Av6PNJOPlNiqwQgw82LaFARL7cLzOeaTGWlWAg6z6JX42Syo34XKRoI8X2axh-XX2TGejAUOmsznix4j-_6v9r69b9xIurXaOW8Cd4WL30CaSTB_VWmna977MiHV4cH713', desc: 'Mid-range pallet handler.', standalone: true, model: { id: 'BF-PalletJack', maxLoad: 2000, speed: 12 } },
  { id: 'TowTractor', label: 'Tow Tractor', icon: '🚛', color: '#52dad7', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC02c8ghdCkYh_USUdhilXU8MKrJH48lExPNvQvf1-34wmGbJZLqY0QOhOdDJ7gOFVbvYLh9lGe-IerKFA4A3Sz6C6sK7IYjqKSvudiTu96KDidVxPIbxN9tqDOLmDl2Js5CNhSkHRZl-ecODXrqbItt55vB0XEr1BiI5t4YqQZJ-z8qkiULgtMLCJvyOnHaD0QjYsrUZGJzwH7ETblNylCAHr5io0LbS4tRtalEjHClOS6wIyrfoP2o5skXzhhVfCPCA18ImkDEsHy', desc: 'Tow tractor for pulling trailers.', standalone: true, model: { id: 'BF-TowTractor', maxLoad: 3000, speed: 15 } }
];

const AGV_MODELS = [
  { id: 'BR-Basic-060', cat: 'Basic', label: 'TQW 060', maxLoad: 360, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: AGV_CATEGORIES[0].img, desc: '160 mm industrial wheel, high energy efficiency.' },
  { id: 'BR-Basic-070', cat: 'Basic', label: 'TQW 070', maxLoad: 720, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: AGV_CATEGORIES[0].img, desc: '200 mm wheel, utilizing reinforced bearings.' },
  { id: 'BR-Basic-090', cat: 'Basic', label: 'TQW 090', maxLoad: 1020, speed: 7.2, icon: '⚙️', color: '#8b90a0', img: AGV_CATEGORIES[0].img, desc: '250 mm wheel, built for demanding environments.' },
  { id: 'BR-Adv-060', cat: 'Advanced', label: 'TQW 060 Base', maxLoad: 360, speed: 15, icon: '⚡', color: '#52dad7', img: AGV_CATEGORIES[1].img, desc: 'Combines TQW 060 gearbox with a servomotor.' },
  { id: 'BR-Adv-070', cat: 'Advanced', label: 'TQW 070 Base', maxLoad: 720, speed: 15, icon: '⚡', color: '#52dad7', img: AGV_CATEGORIES[1].img, desc: 'Integrates TQW 070 gearbox.' },
  { id: 'BR-Adv-090', cat: 'Advanced', label: 'TQW 090 Base', maxLoad: 1020, speed: 15, icon: '⚡', color: '#52dad7', img: AGV_CATEGORIES[1].img, desc: 'The most powerful Advanced configuration.' },
  { id: 'BR-Comp-060', cat: 'Compact', label: 'TQW 060 Base', maxLoad: 360, speed: 10, icon: '🚀', color: '#c084fc', img: AGV_CATEGORIES[2].img, desc: '25% shorter design, perfect for space constraints.' },
  { id: 'BR-Comp-070', cat: 'Compact', label: 'TQW 070 Base', maxLoad: 720, speed: 10, icon: '🚀', color: '#c084fc', img: AGV_CATEGORIES[2].img, desc: 'Extra-compact motor platform.' },
  { id: 'BR-Comp-090', cat: 'Compact', label: 'TQW 090 Base', maxLoad: 1020, speed: 10, icon: '🚀', color: '#c084fc', img: AGV_CATEGORIES[2].img, desc: 'Highest capacity compact option.' },
  { id: 'BF-Forklift', cat: 'Forklift', label: 'Heavy Forklift', maxLoad: 5000, speed: 8, icon: '🏗', color: '#f59e0b', img: AGV_CATEGORIES[3].img, desc: 'High-capacity forklift.' },
  { id: 'BF-PalletJack', cat: 'PalletJack', label: 'Pallet Jack', maxLoad: 2000, speed: 12, icon: '📦', color: '#adc7ff', img: AGV_CATEGORIES[4].img, desc: 'Mid-range pallet handler.' },
  { id: 'BF-TowTractor', cat: 'TowTractor', label: 'Tow Tractor', maxLoad: 3000, speed: 15, icon: '🚛', color: '#52dad7', img: AGV_CATEGORIES[5].img, desc: 'Tow tractor.' }
];"""

content = re.sub(r'/\* ─── AGV Model Catalogue ─── \*/.*?(?=const STATUS_COLORS)', new_models + '\n\n', content, flags=re.DOTALL)


new_modal = """/* ─── Add-AGV Modal ─── */
function AddAgvModal({ zones, ws, onClose, totalFleet }) {
  const [step, setStep]           = useState(1); // 1=category, 2=model, 3=configure
  const [selectedCat, setCat]     = useState(null);
  const [selectedModel, setModel] = useState(null);
  const [agvName, setAgvName]     = useState('');
  const [spawnZone, setSpawnZone] = useState('');
  const [loadKg, setLoadKg]       = useState(0);
  const overlayRef = useRef(null);

  const counter = totalFleet + 1;
  const defaultName = selectedModel
    ? `${selectedModel.id}-${String(counter).padStart(3,'0')}`
    : '';

  const handleCreate = () => {
    const name = agvName.trim() || defaultName;
    let x = 20 + Math.random() * 60;
    let y = 20 + Math.random() * 60;
    if (spawnZone && zones[spawnZone]) { x = zones[spawnZone].x; y = zones[spawnZone].y; }
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'add_agv', name, x, y, model: selectedModel?.id, load_kg: loadKg }));
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
              {step===1 ? 'Select Series' : step===2 ? 'Select TQW Variant' : `Configure — ${selectedModel?.label}`}
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
                <label style={{ display:'block', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', marginBottom:'6px' }}>Spawn Location (Zone)</label>
                <select value={spawnZone} onChange={e=>setSpawnZone(e.target.value)}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box', cursor:'pointer' }}>
                  <option value="">— Random position on map —</option>
                  {Object.keys(zones).map(z=><option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em', color:'rgba(193,198,215,0.5)', marginBottom:'6px' }}>Initial Load (kg)</label>
                <input type="number" min="0" max={selectedModel.maxLoad} value={loadKg} onChange={e=>setLoadKg(Number(e.target.value))}
                  style={{ width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', padding:'10px 12px', fontSize:'13px', color:'#dde3ec', outline:'none', boxSizing:'border-box' }} />
              </div>

              <div style={{ display:'flex', gap:'10px', marginTop:'auto' }}>
                <button onClick={()=>{
                   if(AGV_CATEGORIES.find(c=>c.id===selectedModel?.cat)?.standalone) setStep(1);
                   else setStep(2);
                }} style={{ flex:1, padding:'11px', borderRadius:'8px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(193,198,215,0.7)', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>← Back</button>
                <button onClick={handleCreate}
                  style={{ flex:2, padding:'11px', borderRadius:'8px', border:'none', background:`linear-gradient(90deg,${selectedModel.color},#adc7ff)`, color:'#0e141a', fontWeight:900, fontSize:'13px', cursor:'pointer', letterSpacing:'0.04em' }}>
                  🤖 Deploy AGV
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}"""

content = re.sub(r'/\* ─── Add-AGV Modal ─── \*/.*?function AgvPanel', new_modal + '\n\n/* ─── AGV Detail Floating Panel ─── */\nfunction AgvPanel', content, flags=re.DOTALL)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
