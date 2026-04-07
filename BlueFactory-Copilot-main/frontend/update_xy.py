import re

filepath = r"c:\Users\hyagr\OneDrive\Documents\hyagreevan stitch edited bonfiglioli\BlueFactory-Copilot-main\BlueFactory-Copilot-main\frontend\src\pages\AgvFleetManager.jsx"

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update states
replacement_state = """const [spawnZone, setSpawnZone] = useState('');
  const [spawnX, setSpawnX]       = useState(50);
  const [spawnY, setSpawnY]       = useState(50);
  const [loadKg, setLoadKg]       = useState(0);"""

content = re.sub(r"const \[spawnZone, setSpawnZone\] = useState\(''\);\n\s*const \[loadKg, setLoadKg\]       = useState\(0\);", replacement_state, content)

# 2. Update handleCreate
replacement_create = """const handleCreate = () => {
    const name = agvName.trim() || defaultName;
    let x = spawnX;
    let y = spawnY;
    if (spawnZone && zones[spawnZone]) { x = zones[spawnZone].x; y = zones[spawnZone].y; }
    if (ws && ws.readyState === WebSocket.OPEN) {"""

content = re.sub(r'const handleCreate = \(\) => \{.*?if \(ws && ws\.readyState === WebSocket\.OPEN\) \{', replacement_create, content, flags=re.DOTALL)

# 3. Add Input UI
target_ui = r"<div>\s*<label[^>]*>Spawn Location \(Zone\)</label>\s*<select[^>]*>[\s\S]*?</select>\s*</div>"
replacement_ui = """<div>
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
              </div>"""

content = re.sub(target_ui, replacement_ui, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("success!")
