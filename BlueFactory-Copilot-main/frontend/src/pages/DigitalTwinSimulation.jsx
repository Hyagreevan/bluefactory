import React, { useState, useEffect } from 'react';

export default function DigitalTwinSimulation() {
    const [fleet, setFleet] = useState([]);
    const [obstacles, setObstacles] = useState([]);
    
    useEffect(() => {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.fleet) setFleet(data.fleet);
                if (data.obstacles) setObstacles(data.obstacles);
            } catch {}
        };
        return () => ws.close();
    }, []);

    const collisionRisk = obstacles.length > 0 ? (obstacles.length * 1.5).toFixed(2) : '0.04';
    const isSafe = obstacles.length === 0;

    return (
        <main className="flex-1 p-6 overflow-y-auto bg-surface space-y-6">
{/* Header & Primary Controls */}
<div className="flex justify-between items-end">
<div>
<h1 className="font-headline text-3xl font-bold text-on-surface">Digital Twin Simulation</h1>
<p className="text-on-surface-variant font-body text-sm mt-1">Real-time predictive analysis for AGV Fleet Alpha</p>
</div>
<div className="flex gap-3">
<button onClick={() => alert("Optimizing route using quantum heuristic...")} className="bg-surface-container-high px-4 py-2 rounded-lg text-primary-fixed font-medium text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all">
<span className="material-symbols-outlined text-sm">route</span> Optimize Route
                    </button>
<button onClick={() => alert("Validating mission constraints...")} className="bg-surface-container-high px-4 py-2 rounded-lg text-primary-fixed font-medium text-sm flex items-center gap-2 hover:bg-surface-container-highest transition-all">
<span className="material-symbols-outlined text-sm">rule</span> Validate Mission
                    </button>
<button onClick={() => alert("Simulation running. Results caching...")} className="bg-gradient-to-br from-primary to-primary-container px-6 py-2 rounded-lg text-on-primary font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all">
<span className="material-symbols-outlined text-sm" style={{'fontVariationSettings': '\'FILL\' 1'}}>play_arrow</span> Run Simulation
                    </button>
</div>
</div>
{/* Main Dashboard Grid */}
<div className="grid grid-cols-12 gap-6">
{/* Simulation Viewport */}
<div className="col-span-12 lg:col-span-8 bg-surface-container-low rounded-xl relative overflow-hidden group min-h-[500px]">
<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-surface-variant/20 via-transparent to-transparent opacity-50"></div>
<div className="absolute top-4 left-4 z-10 flex gap-2">
<span className="bg-surface-container-highest/80 backdrop-blur px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-primary flex items-center gap-2">
<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Live Render
                        </span>
<span className="bg-surface-container-highest/80 backdrop-blur px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest text-tertiary flex items-center gap-2">
                            AGV-042 Focus
                        </span>
</div>
{/* Placeholder for 3D View */}
<div className="w-full h-full flex items-center justify-center">
<img className="w-full h-full object-cover opacity-40 mix-blend-screen" data-alt="Technical architectural blueprint of a modern factory floor with glowing blue neon lines representing AGV paths and digital twin overlays" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCw-ZlB2SNKIORGZI4HJJqljbJ3o0Ke3FHs4i4owz4BtzwaA2wNYizrO8ZvJ95Kr0fmunW7vL2N7ao2cF0xzX9HcZR6jHBzu0wOH_PNrQsGc73MsNphY4_boC7qJA8BiZ_UAYNC46e3AxN84VqJw0-6TVkkNw9L3HSiNwFRhS2fnwknoxMj60NgcvQJpeNxjUQBeiIK426m7DLiXEMwQQ_R7xo7mZzhkVf7S_3B9OFa5RL2w6MNPYC52FxVwUEk3O7y0n13TycSOt6s" />
<div className="absolute inset-0 flex items-center justify-center">
<div className="w-[80%] h-[70%] border border-primary/10 rounded-lg flex items-center justify-center bg-surface-container-highest/10 backdrop-blur-sm">
<span className="material-symbols-outlined text-primary/30 text-8xl">view_in_ar</span>
</div>
</div>
</div>
{/* Overlay Data Panels */}
<div className="absolute bottom-4 left-4 right-4 flex gap-4">
<div className="glass-panel p-4 rounded-xl flex-1 border border-outline-variant/10">
<p className="label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Predicted Collision Risk</p>
<div className="flex items-center gap-2 mt-2">
<div className="h-2 flex-1 bg-surface-container-lowest rounded-full overflow-hidden">
<div className={`h-full ${isSafe ? 'bg-tertiary' : 'bg-error'}`} style={{ width: `${Math.min(100, Math.max(12, collisionRisk * 10))}%` }}></div>
</div>
<span className={`${isSafe ? 'text-tertiary' : 'text-error'} font-headline text-lg font-bold`}>{collisionRisk}%</span>
</div>
</div>
<div className="glass-panel p-4 rounded-xl flex-1 border border-outline-variant/10">
<p className="label-sm text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Path Efficiency</p>
<div className="flex items-center gap-2 mt-2">
<div className="h-2 flex-1 bg-surface-container-lowest rounded-full overflow-hidden">
<div className="h-full bg-primary w-[94%]"></div>
</div>
<span className="text-primary font-headline text-lg font-bold">94.2%</span>
</div>
</div>
</div>
</div>
{/* Right Analytics Column */}
<div className="col-span-12 lg:col-span-4 space-y-6">
{/* Status Bar */}
<div className={`bg-surface-container-low p-5 rounded-xl border-l-4 ${isSafe ? 'border-tertiary' : 'border-error'}`}>
<div className="flex justify-between items-start">
<div>
<h3 className={`font-headline font-bold text-xl flex items-center gap-2 ${isSafe ? 'text-tertiary' : 'text-error'}`}>
<span className="material-symbols-outlined" style={{'fontVariationSettings': '\'FILL\' 1'}}>{isSafe ? 'check_circle' : 'warning'}</span>
                                    {isSafe ? 'SAFE STATE' : 'COLLISION RISK'}
                                </h3>
<p className="text-xs text-on-surface-variant mt-1">{isSafe ? 'Simulation predicts zero high-risk events' : `${obstacles.length} hazards detected on grid`}</p>
</div>
<span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${isSafe ? 'text-on-surface-variant bg-surface-container-high' : 'bg-error/20 text-error'}`}>{isSafe ? 'Stable' : 'Warning'}</span>
</div>
</div>
{/* Battery Usage Simulation */}
<div className="bg-surface-container-low p-5 rounded-xl">
<div className="flex justify-between items-center mb-4">
<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Battery Depletion Projection</p>
<span className="material-symbols-outlined text-primary text-sm">battery_charging_full</span>
</div>
<div className="h-24 w-full flex items-end gap-1">
<div className="w-full bg-primary/20 h-[80%] rounded-t-sm"></div>
<div className="w-full bg-primary/20 h-[75%] rounded-t-sm"></div>
<div className="w-full bg-primary/20 h-[72%] rounded-t-sm"></div>
<div className="w-full bg-primary/40 h-[65%] rounded-t-sm"></div>
<div className="w-full bg-primary/40 h-[60%] rounded-t-sm"></div>
<div className="w-full bg-primary/60 h-[52%] rounded-t-sm"></div>
<div className="w-full bg-primary h-[45%] rounded-t-sm"></div>
<div className="w-full bg-primary h-[38%] rounded-t-sm"></div>
<div className="w-full bg-primary h-[30%] rounded-t-sm"></div>
<div className="w-full bg-secondary-container h-[22%] rounded-t-sm"></div>
</div>
<div className="flex justify-between mt-2 text-[10px] text-on-surface-variant font-medium">
<span>0m</span>
<span>Projected Shutdown: 42m</span>
</div>
</div>
{/* Warning Logs */}
<div className="bg-surface-container-low p-5 rounded-xl h-[240px] flex flex-col">
<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Simulation Logs</p>
<div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar">
<div className="flex gap-3 text-[11px] border-l-2 border-outline-variant pl-3 py-1">
<span className="text-on-surface-variant shrink-0">14:22:01</span>
<span className="text-on-surface">AGV-042 initiated obstacle avoidance maneuver at Node 7.</span>
</div>
<div className="flex gap-3 text-[11px] border-l-2 border-outline-variant pl-3 py-1">
<span className="text-on-surface-variant shrink-0">14:21:45</span>
<span className="text-on-surface">Digital twin synchronization delta: &lt; 2ms.</span>
</div>
<div className="flex gap-3 text-[11px] border-l-2 border-primary pl-3 py-1 bg-primary/5">
<span className="text-primary shrink-0">14:21:30</span>
<span className="text-on-surface">Optimal route recalculated for high-priority mission.</span>
</div>
<div className="flex gap-3 text-[11px] border-l-2 border-error pl-3 py-1 bg-error/5">
<span className="text-error shrink-0">14:20:12</span>
<span className="text-on-surface font-medium">Simulation Warn: Narrow clearance detected at Zone C.</span>
</div>
</div>
</div>
</div>
</div>
{/* Bottom Metrics Grid */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
{/* Torque vs Time */}
<div className="bg-surface-container-low p-6 rounded-xl">
<div className="flex justify-between items-center mb-6">
<h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Torque vs Time (Predicted)</h4>
<span className="text-primary font-headline text-sm">Peak: 142 Nm</span>
</div>
<div className="h-40 relative">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
<path className="textPrimary" d="M0,80 Q50,70 80,40 T150,50 T200,20 T280,60 T350,45 T400,30" fill="none" stroke="currentColor" strokeWidth="2"></path>
<path d="M0,80 Q50,70 80,40 T150,50 T200,20 T280,60 T350,45 T400,30 V100 H0 Z" fill="url(#grad1)" opacity="0.1"></path>
<defs>
<lineargradient id="grad1" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" style={{'stopColor': 'var(--primary)', 'stopOpacity': '1'}}></stop>
<stop offset="100%" style={{'stopColor': 'var(--primary)', 'stopOpacity': '0'}}></stop>
</lineargradient>
</defs>
</svg>
</div>
</div>
{/* Temperature vs Time */}
<div className="bg-surface-container-low p-6 rounded-xl">
<div className="flex justify-between items-center mb-6">
<h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Motor Temp Simulation</h4>
<span className="text-secondary font-headline text-sm">Avg: 42°C</span>
</div>
<div className="h-40 relative">
<svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 100">
<path className="textSecondary-fixed-dim" d="M0,70 L40,68 L80,65 L120,60 L160,55 L200,52 L240,48 L280,45 L320,40 L360,38 L400,35" fill="none" stroke="currentColor" strokeWidth="2"></path>
<circle className="fillSecondary-fixed-dim animate-ping" cx="320" cy="40" r="4"></circle>
<circle className="fillSecondary-fixed-dim" cx="320" cy="40" r="3"></circle>
</svg>
</div>
</div>
</div>
</main>
    );
}
