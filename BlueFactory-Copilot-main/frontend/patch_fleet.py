import re

filepath = r"c:\Users\hyagr\OneDrive\Documents\hyagreevan stitch edited bonfiglioli\BlueFactory-Copilot-main\BlueFactory-Copilot-main\frontend\src\pages\AgvFleetManager.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    orig = f.read()

# 1. Fix hs(agv)
orig = orig.replace(
    "function hs(agv){ let s=100; if(agv.battery<20)s-=20; if(agv.battery<10)s-=20; if((agv.motor_temp||0)>80)s-=15; if((agv.motor_temp||0)>100)s-=20; const st=(agv.status||'').toUpperCase(); if(st==='ERROR'||st==='OVERHEATING')s-=25; return Math.max(0,Math.min(100,s)); }",
    "function hs(agv){ let s=100; if((agv.motor_temp||0)>80)s-=15; if((agv.motor_temp||0)>100)s-=20; const st=(agv.status||'').toUpperCase(); if(st==='ERROR'||st==='OVERHEATING')s-=25; return Math.max(0,Math.min(100,s)); }"
)

# 2. Add Edit Modal State & Actions Handler
orig = orig.replace(
    "const [showModal,  setModal]      = useState(false);",
    "const [showModal,  setModal]      = useState(false);\n  const [editAgv, setEditAgv] = useState(null);"
)

orig = orig.replace(
    "{/* Add AGV Modal */}",
    "{/* Edit & Add Modals */}\n      {editAgv && <AddAgvModal zones={zones} ws={wsRef.current} onClose={()=>setEditAgv(null)} totalFleet={fleet.length} editMode={editAgv} />}\n      {/* Add AGV Modal */}"
)

# 3. Modify AddAgvModal to handle edit mode
modal_sig = "function AddAgvModal({ zones, ws, onClose, totalFleet }) {"
new_modal_sig = "function AddAgvModal({ zones, ws, onClose, totalFleet, editMode }) {"
orig = orig.replace(modal_sig, new_modal_sig)

modal_states = """  const [step, setStep]           = useState(1); // 1=category, 2=model, 3=configure
  const [selectedCat, setCat]     = useState(null);
  const [selectedModel, setModel] = useState(null);
  const [agvName, setAgvName]     = useState('');
  const [spawnZone, setSpawnZone] = useState('');
  const [spawnX, setSpawnX]       = useState(50);
  const [spawnY, setSpawnY]       = useState(50);
  const [loadKg, setLoadKg]       = useState(0);"""

new_modal_states = """  const [step, setStep]           = useState(editMode ? 3 : 1);
  const [selectedCat, setCat]     = useState(null);
  const [selectedModel, setModel] = useState(editMode ? AGV_MODELS.find(m=>m.id===editMode.model) : null);
  const [agvName, setAgvName]     = useState(editMode ? editMode.id : '');
  const [spawnZone, setSpawnZone] = useState('');
  const [spawnX, setSpawnX]       = useState(editMode ? editMode.x : 50);
  const [spawnY, setSpawnY]       = useState(editMode ? editMode.y : 50);
  const [loadKg, setLoadKg]       = useState(editMode ? editMode.load_kg : 0);"""
orig = orig.replace(modal_states, new_modal_states)

modal_submit = "ws.send(JSON.stringify({ type: 'add_agv', name, x, y, model: selectedModel?.id, load_kg: loadKg }));"
new_modal_submit = """if (editMode) {
        ws.send(JSON.stringify({ type: 'edit_agv', agv_id: editMode.id, new_name: name, x, y, load_kg: loadKg }));
      } else {
        ws.send(JSON.stringify({ type: 'add_agv', name, x, y, model: selectedModel?.id, load_kg: loadKg }));
      }"""
orig = orig.replace(modal_submit, new_modal_submit)

modal_title = "{step===1 ? 'Select Series' : step===2 ? 'Select TQW Variant' : `Configure — ${selectedModel?.label}`}"
new_title = "{editMode ? `Edit AGV — ${editMode.id}` : (step===1 ? 'Select Series' : step===2 ? 'Select TQW Variant' : `Configure — ${selectedModel?.label}`)}"
orig = orig.replace(modal_title, new_title)

modal_deploy = "🤖 Deploy AGV"
new_deploy = "{editMode ? '💾 Save Changes' : '🤖 Deploy AGV'}"
orig = orig.replace(modal_deploy, new_deploy)

modal_back = "if(AGV_CATEGORIES.find(c=>c.id===selectedModel?.cat)?.standalone) setStep(1);\n                   else setStep(2);"
new_back = "if(editMode) onClose(); else { if(AGV_CATEGORIES.find(c=>c.id===selectedModel?.cat)?.standalone) setStep(1); else setStep(2); }"
orig = orig.replace(modal_back, new_back)


# 4. Add Actions to Table
headers = "{['AGV ID','Model','Status','Battery','Temp','Speed','Mission','Health'].map(col=>("
new_headers = "{['AGV ID','Model','Status','Battery','Temp','Speed','Mission','Health','Actions'].map(col=>("
orig = orig.replace(headers, new_headers)

row_end = "<span style={{ fontFamily:'monospace', fontWeight:900, fontSize:'13px', color:h>70?'#52dad7':h>40?'#facc15':'#ffb4ab' }}>{h}/100</span>\n                  </td>"
new_row_end = """<span style={{ fontFamily:'monospace', fontWeight:900, fontSize:'13px', color:h>70?'#52dad7':h>40?'#facc15':'#ffb4ab' }}>{h}/100</span>
                  </td>
                  <td style={{ padding:'13px 14px' }}>
                    <div style={{ display:'flex', gap:'8px' }}>
                        <button onClick={(e)=>{ e.stopPropagation(); setEditAgv(agv); }} style={{ background:'transparent', border:'none', color:'#adc7ff', cursor:'pointer' }} title="Edit">✏️</button>
                        <button onClick={(e)=>{ e.stopPropagation(); if(wsRef.current) wsRef.current.send(JSON.stringify({type:'remove_agv', agv_id: agv.id})); }} style={{ background:'transparent', border:'none', color:'#ffb4ab', cursor:'pointer' }} title="Remove">🗑️</button>
                    </div>
                  </td>"""
orig = orig.replace(row_end, new_row_end)


with open(filepath, 'w', encoding='utf-8') as f:
    f.write(orig)

print("fleet patched")
