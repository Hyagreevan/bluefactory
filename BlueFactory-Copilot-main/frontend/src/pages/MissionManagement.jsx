import React, { useState, useEffect, useRef } from 'react';

const AGV_MODELS = [
  { id: 'BR-Basic-060', cat: 'Basic', maxLoad: 360 },
  { id: 'BR-Basic-070', cat: 'Basic', maxLoad: 720 },
  { id: 'BR-Basic-090', cat: 'Basic', maxLoad: 1020 },
  { id: 'BR-Adv-060', cat: 'Advanced', maxLoad: 360 },
  { id: 'BR-Adv-070', cat: 'Advanced', maxLoad: 720 },
  { id: 'BR-Adv-090', cat: 'Advanced', maxLoad: 1020 },
  { id: 'BR-Comp-060', cat: 'Compact', maxLoad: 360 },
  { id: 'BR-Comp-070', cat: 'Compact', maxLoad: 720 },
  { id: 'BR-Comp-090', cat: 'Compact', maxLoad: 1020 }
];

export default function MissionManagement() {
    const [fleet, setFleet] = useState([]);
    const [zones, setZones] = useState({});
    const [connected, setConnected] = useState(false);
    
    // Tabs
    const [activeTab, setActiveTab] = useState('create');
    const [missionHistory, setMissionHistory] = useState([]);
    const prevFleetRef = useRef([]);

    // Form states
    const [selectedAgv, setSelectedAgv] = useState('');
    const [pickup, setPickup] = useState('');
    const [drop, setDrop] = useState('');
    const [loadKg, setLoadKg] = useState(0);
    const [priority, setPriority] = useState('LOW');
    const [assignedPathIndex, setAssignedPathIndex] = useState(-1);
    const [savedCustomPaths, setSavedCustomPaths] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        wsRef.current = ws;
        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);
        ws.onerror = () => setConnected(false);
        ws.onmessage = e => {
            try { 
                const d = JSON.parse(e.data); 
                if(d.fleet) setFleet(d.fleet); 
                if(d.zones) setZones(d.zones); 
            } catch{}
        };

        try {
            const hist = JSON.parse(localStorage.getItem('bluefactory_map_history'));
            if (hist && hist.length > 0 && hist[0].data.customPaths) {
                setSavedCustomPaths(hist[0].data.customPaths);
            }
        } catch(e) {}

        return () => ws.close();
    }, []);

    // Mission history logger hook
    useEffect(() => {
        const prevFleet = prevFleetRef.current;
        if (prevFleet.length > 0) {
            const completed = [];
            fleet.forEach(curr => {
                const prev = prevFleet.find(p => p.id === curr.id);
                if (prev) {
                    if (prev.status !== 'IDLE' && prev.status !== 'CHARGING' && prev.status !== 'ERROR' && curr.status === 'IDLE') {
                        completed.push({
                            id: curr.id,
                            zone: curr.zone || curr.target_zone || prev.target_zone || 'Unknown',
                            time: new Date().toLocaleTimeString(),
                            load: prev.load_kg || 0
                        });
                    }
                }
            });
            if (completed.length > 0) {
                setMissionHistory(h => [...completed, ...h].slice(0, 50));
            }
        }
        prevFleetRef.current = fleet;
    }, [fleet]);

    const idleAgvs = fleet.filter(a => {
        if (a.status !== 'IDLE') return false;
        // Exclude if physically located in a charging zone despite IDLE status
        const isChargingZone = a.zone && (a.zone.toLowerCase().includes('charg') || a.zone.toLowerCase().includes('power'));
        return !isChargingZone;
    });
    const activeMissions = fleet.filter(a => a.status !== 'IDLE' && a.status !== 'ERROR');
    const zoneNames = Object.keys(zones);

    const handleSubmit = () => {
        setErrorMsg('');
        if (!selectedAgv) return setErrorMsg('Please select an AGV.');
        if (!pickup) return setErrorMsg('Please select a pickup zone.');
        if (!drop) return setErrorMsg('Please select a drop zone.');
        if (pickup === drop) return setErrorMsg('Pickup and Drop cannot be the same.');
        if (loadKg < 0) return setErrorMsg('Load cannot be negative.');

        const agvData = fleet.find(a => a.id === selectedAgv);
        const modelData = AGV_MODELS.find(m => m.id === agvData?.model);
        if (modelData && loadKg > modelData.maxLoad) {
            return setErrorMsg(`Load of ${loadKg}kg exceeds max capacity of ${modelData.maxLoad}kg for this model!`);
        }

        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ 
                type: 'multi_leg_mission', 
                agv_id: selectedAgv, 
                pickup_zone: pickup, 
                drop_zone: drop, 
                load_kg: loadKg,
                priority: priority,
                custom_path: assignedPathIndex >= 0 && savedCustomPaths[assignedPathIndex] ? savedCustomPaths[assignedPathIndex].points : null
            }));
            
            // Reset form
            setSelectedAgv('');
            setPickup('');
            setDrop('');
            setLoadKg(0);
            
            // Jump to active missions automatically!
            setActiveTab('active');
        }
    };
    
    const cancelMission = (agvId) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'edit_agv', agv_id: agvId }));
        }
    };

    const getStatusColor = (status) => {
        switch((status||'').toUpperCase()) {
            case 'LOADING...': return 'bg-secondary/10 text-secondary border-secondary/20';
            case 'UNLOADING': return 'bg-tertiary/10 text-tertiary border-tertiary/20';
            case 'IN TRANSIT': return 'bg-primary/10 text-primary border-primary/20';
            case 'REROUTING': return 'bg-[#c084fc]/10 text-[#c084fc] border-[#c084fc]/20';
            case 'ASSIGNED': return 'bg-surface-container-highest text-on-surface-variant border-outline-variant/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
        }
    };

    const activeCount = activeMissions.length;
    const density = fleet.length ? (activeCount / fleet.length) * 100 : 0;
    const barHeights = [
        Math.min(100, Math.max(10, density + Math.random()*20)),
        Math.min(100, Math.max(15, density + Math.random()*15)),
        Math.min(100, Math.max(30, density + 30)),
        Math.min(100, Math.max(20, density + Math.random()*30)),
        Math.min(100, Math.max(10, density + Math.random()*10)),
        Math.min(100, Math.max(5, density)),
        Math.min(100, Math.max(2, density * 0.5))
    ];

    const TabBtn = ({ id, label }) => (
        <button 
            onClick={() => setActiveTab(id)} 
            className={`pb-2 border-b-2 px-1 font-medium transition-all ${activeTab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}
        >
            {label}
        </button>
    );

    // Reusable active missions table component
    const LiveMissionsTable = () => (
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/5 flex-1 flex flex-col w-full">
            <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary">pulse_alert</span>
                    Live Monitoring
                </h3>
                <div className="flex gap-2">
                    <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-on-surface-variant uppercase">{activeCount} Running</span>
                    <span className="px-2 py-1 bg-surface-container-highest rounded text-[10px] font-bold text-on-surface-variant uppercase">{idleAgvs.length} Idle</span>
                </div>
            </div>
            <div className="overflow-x-auto w-full">
                <table className="w-full text-left">
                    <thead className="bg-surface-container-lowest/50">
                        <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">AGV</th>
                            <th className="px-6 py-4">Routing Progress</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                        {activeMissions.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-sm text-on-surface-variant/50 border-none font-bold italic">No active missions running</td></tr>
                        )}
                        {activeMissions.map((agv) => (
                            <tr key={agv.id} className="hover:bg-surface-container-high transition-colors">
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusColor(agv.status)}`}>
                                        {agv.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-on-surface">{agv.id}</span>
                                        <span className="text-[9px] text-on-surface-variant mt-0.5">{(agv.load_kg || 0)} kg payload</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 w-1/2">
                                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden relative">
                                        <div className={`h-full absolute left-0 bg-primary w-full origin-left bg-gradient-to-r ${agv.status.includes('LOAD') ? 'from-secondary to-secondary/50' : 'from-primary to-tertiary'} overflow-hidden`}>
                                            <div 
                                                className="w-full h-full bg-white/20 animate-[progress_2s_ease-in-out_infinite]"
                                                style={{ animationDuration: `${20 / Math.max(0.5, agv.speed_kmh || 5)}s` }}
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[9px] font-bold mt-1 block text-on-surface flex justify-between">
                                        <span>{agv.current_leg ? agv.current_leg.zone : agv.target_zone}</span>
                                        <span className="text-on-surface-variant">({(agv.speed_kmh||0).toFixed(1)} km/h)</span>
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => cancelMission(agv.id)} className="material-symbols-outlined text-sm text-error/70 hover:text-error" title="Cancel Mission">cancel</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <main className="flex-1 p-8 overflow-y-auto mb-12">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="font-headline text-3xl font-bold tracking-tight mb-2">Mission Management</h1>
                    <div className="flex gap-4">
                        <TabBtn id="create" label="Create Mission" />
                        <TabBtn id="active" label="Active Missions" />
                        <TabBtn id="history" label="Mission History" />
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="px-4 py-2 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-tertiary' : 'bg-error'}`}></span>
                        <span className="text-xs font-label uppercase tracking-widest">{connected ? 'Swarm Sync: Active' : 'Disconnected'}</span>
                    </div>
                </div>
            </div>

            {activeTab === 'create' && (
                <div className="grid grid-cols-12 gap-6">
                    <section className="col-span-12 lg:col-span-5 flex flex-col gap-6">
                        <div className="glass-card p-6 rounded-xl border border-outline-variant/10">
                            <h3 className="font-headline text-lg font-semibold mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">add_task</span>
                                Configuration
                            </h3>
                            {errorMsg && <div className="mb-4 p-3 bg-error/10 border border-error/50 rounded-lg text-error text-xs font-bold">{errorMsg}</div>}
                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">AGV Selection (Idle Only)</label>
                                        <select value={selectedAgv} onChange={e=>setSelectedAgv(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm p-2 outline-none focus:border-primary text-on-surface">
                                            <option value="">-- Select --</option>
                                            {idleAgvs.map(a => <option key={a.id} value={a.id}>{a.id} ({a.battery.toFixed(0)}% Batt)</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Priority</label>
                                        <div className="flex p-1 bg-surface-container-lowest border border-outline-variant/30 rounded-lg">
                                            <button onClick={() => setPriority('LOW')} className={`flex-1 py-1 text-[10px] ${priority==='LOW'?'text-on-surface bg-surface-container-highest flex-shrink-0 shadow':'text-on-surface-variant'} font-bold rounded`}>LOW</button>
                                            <button onClick={() => setPriority('MED')} className={`flex-1 py-1 text-[10px] ${priority==='MED'?'text-on-surface bg-surface-container-highest flex-shrink-0 shadow':'text-on-surface-variant'} font-bold rounded`}>MED</button>
                                            <button onClick={() => setPriority('HIGH')} className={`flex-1 py-1 text-[10px] ${priority==='HIGH'?'text-on-surface bg-surface-container-highest flex-shrink-0 shadow':'text-on-surface-variant'} font-bold rounded`}>HIGH</button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Pickup Location</label>
                                        <select value={pickup} onChange={e=>setPickup(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm p-2 outline-none focus:border-primary text-on-surface">
                                            <option value="">-- Start Zone --</option>
                                            {zoneNames.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Drop Location</label>
                                        <select value={drop} onChange={e=>setDrop(e.target.value)} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm p-2 outline-none focus:border-primary text-on-surface">
                                            <option value="">-- End Zone --</option>
                                            {zoneNames.map(z => <option key={z} value={z}>{z}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Payload (kg)</label>
                                        <input type="number" min="0" value={loadKg} onChange={e=>setLoadKg(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm p-2 outline-none focus:border-primary text-on-surface" placeholder="0" />
                                    </div>
                                    <div className="space-y-1.5 flex flex-col">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Route Preference</label>
                                        <select value={assignedPathIndex} onChange={e=>setAssignedPathIndex(Number(e.target.value))} className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-sm p-2 outline-none focus:border-primary text-on-surface">
                                            <option value={-1}>System AI (Auto)</option>
                                            {savedCustomPaths.map((p, i) => <option key={i} value={i}>Map Route #{i + 1}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Avoid Zones</label>
                                        <div className="flex gap-2">
                                            <span className="px-2 py-1 bg-surface-container text-on-surface-variant text-[9px] font-bold rounded border border-outline-variant/20">None</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex flex-col gap-3">
                                    <button onClick={handleSubmit} className="w-full p-3 rounded-lg bg-gradient-to-r from-primary to-primary-container text-[#0e141a] font-headline font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                                        <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>play_arrow</span>
                                        Submit Mission
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <span className="material-symbols-outlined text-tertiary-fixed-dim/20 text-6xl rotate-12">monitoring</span>
                            </div>
                            <h4 className="font-headline font-bold text-sm mb-4">Traffic Density</h4>
                            <div className="flex items-end gap-1 h-12 mb-2">
                                {barHeights.map((h, i) => (
                                    <div key={i} className={`flex-1 ${h > 70 ? 'bg-tertiary' : h > 40 ? 'bg-tertiary/50' : 'bg-surface-container-highest'} rounded-t-sm`} style={{height: `${h}%`, transition: 'height 1s ease'}}></div>
                                ))}
                            </div>
                            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Facility Grid Congestion Index ({density.toFixed(0)}%)</p>
                        </div>
                    </section>

                    <section className="col-span-12 lg:col-span-7 flex flex-col gap-6">
                        <LiveMissionsTable />
                    </section>
                </div>
            )}

            {activeTab === 'active' && (
                <div className="w-full">
                    <LiveMissionsTable />
                </div>
            )}

            {activeTab === 'history' && (
                <div className="w-full bg-surface-container-low rounded-xl border border-outline-variant/5">
                    <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container/50">
                        <h3 className="font-headline text-lg font-semibold flex items-center gap-2">
                            <span className="material-symbols-outlined text-secondary">history</span>
                            Mission History Logs
                        </h3>
                        <span className="bg-secondary/10 text-secondary border border-secondary/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">
                            {missionHistory.length} Jobs Completed
                        </span>
                    </div>
                    <div className="p-0">
                        <table className="w-full text-left table-fixed">
                            <thead className="bg-surface-container-lowest/50">
                                <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">
                                    <th className="px-6 py-4 w-1/4">Time Updated</th>
                                    <th className="px-6 py-4 w-1/4">Assigned AGV</th>
                                    <th className="px-6 py-4 w-1/4">Final Destination</th>
                                    <th className="px-6 py-4 text-right w-1/4">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/10">
                                {missionHistory.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-sm text-on-surface-variant/50 border-none font-bold italic">
                                            No completed missions recorded yet.
                                        </td>
                                    </tr>
                                )}
                                {missionHistory.map((m, i) => (
                                    <tr key={i} className="hover:bg-surface-container-high transition-colors">
                                        <td className="px-6 py-4 font-label text-xs font-semibold text-on-surface-variant">
                                            {m.time}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-secondary text-base">local_shipping</span>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-on-surface">{m.id}</span>
                                                    {m.load > 0 && <span className="text-[9px] text-tertiary font-bold">{m.load}kg delivered</span>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-label text-xs font-semibold">
                                            Zone: {m.zone}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-1 bg-tertiary/10 text-tertiary border border-tertiary/20 rounded text-[10px] font-bold uppercase">
                                                Completed
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
}