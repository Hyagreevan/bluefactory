import React, { useState, useEffect } from 'react';

export default function SwarmCoordination() {
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

    const activeCount = fleet.filter(a => a.status !== 'IDLE' && a.status !== 'CHARGING' && a.status !== 'ERROR' && a.status !== 'OFFLINE').length;
    const chargingCount = fleet.filter(a => a.status === 'CHARGING').length;
    const errorCount = fleet.filter(a => a.status === 'ERROR' || a.status === 'OVERHEATING' || a.status === 'E-STOP').length;

    return (
        <main className="swarm-page bg-surface-container-lowest" style={{minHeight: 'calc(100vh - 84px)'}}>

{/* Full Screen Map Background */}
<div className="absolute inset-0 map-grid opacity-30"></div>
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface-container-lowest/80"></div>
{/* Map Visualization Layer */}
<div className="absolute inset-0 pointer-events-none">
<img className="w-full h-full object-cover opacity-20 mix-blend-screen" data-alt="blueprint styled floor plan of a massive automated warehouse with neon cyan path lines and glowing orange obstacle zones" data-location="Munich Smart Factory" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnrmi-EEqQBYJnB07aXXJarsETbj6tyyluvAAqHcmpl-t6mBsb12Ef5iyh5UJsLo_cBSR2xHqHGyr0Dx3xRjyRm0USetas3xih40Jmu5PkFJ4Zi8uNtaiY1xn7mBxl36sDUvQrq527OOm58xUKHpjSoB206b4NBqDK6maWpmB8WQxpS4tWnidc2Ag12W9A0JLTb2IMklyN96JJ5acMR4trN1r7a_EtXu3vb8mRAX0HNTZ7XW2QxA3oVrXiwBdJEkAYCPPhf2RqJJls" />
{/* SVG Paths and AGV Icons */}
<svg className="absolute inset-0 w-full h-full">
{/* Communication Links */}
<line className="glow-line opacity-50" stroke="#adc7ff" strokeDasharray="4 2" strokeWidth="1" x1="30%" x2="50%" y1="40%" y2="60%"></line>
<line className="glow-line opacity-50" stroke="#adc7ff" strokeDasharray="4 2" strokeWidth="1" x1="50%" x2="70%" y1="60%" y2="35%"></line>
{/* Predicted Path */}
<path className="opacity-60" d="M 200 400 Q 400 350 600 500" fill="none" stroke="#52dad7" strokeDasharray="8 4" strokeWidth="2"></path>
{/* Collision Zone */}
<circle cx="50%" cy="58%" fill="rgba(255, 180, 171, 0.15)" r="40" stroke="#ffb4ab" strokeDasharray="4 2" strokeWidth="1"></circle>
</svg>
{/* AGV Markers */}
<div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 group pointer-events-auto">
<div className="relative w-10 h-10 bg-surface-container-highest rounded-lg border border-primary flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(173,199,255,0.4)]">
<span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-0.5 rounded text-[10px] font-bold text-primary whitespace-nowrap border border-primary/20">AGV-104 (98%)</div>
</div>
</div>
<div className="absolute top-[60%] left-[50%] -translate-x-1/2 -translate-y-1/2 group pointer-events-auto">
<div className="relative w-10 h-10 bg-surface-container-highest rounded-lg border border-error flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,180,171,0.4)]">
<span className="material-symbols-outlined text-error text-xl">warning</span>
<div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-error-container px-2 py-0.5 rounded text-[10px] font-bold text-on-error-container whitespace-nowrap">AGV-202 (CONFLICT)</div>
</div>
</div>
</div>
{/* Left Panel: Conflict Alerts */}
<div className="absolute left-6 top-6 bottom-6 w-80 flex flex-col gap-4 pointer-events-none">
<div className="glass-panel p-4 rounded-xl border border-outline-variant/10 shadow-2xl pointer-events-auto overflow-hidden">
<div className="flex items-center justify-between mb-4">
<h3 className="font-headline font-bold text-sm tracking-tight flex items-center gap-2">
<span className="material-symbols-outlined text-error text-sm">emergency_home</span> Conflict Alerts
                        </h3>
<span className="bg-error/10 text-error text-[10px] font-bold px-2 py-0.5 rounded-full">{obstacles.length} Active</span>
</div>
<div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
{/* Alert Card */}
<div className="p-3 bg-error-container/10 border-l-4 border-error rounded-r-lg space-y-2 group hover:bg-error-container/20 transition-all cursor-pointer">
<div className="flex justify-between items-start">
<span className="text-xs font-bold text-error">Path Intersection</span>
<span className="text-[10px] text-on-surface-variant">2s ago</span>
</div>
<p className="text-[11px] text-on-surface-variant leading-relaxed">AGV-202 &amp; AGV-104 projected collision in Zone B-12 within 0.4s.</p>
<div className="flex gap-2 pt-1">
<button className="flex-1 py-1.5 bg-error text-on-error text-[10px] font-bold rounded uppercase">Apply Re-Route</button>
<button className="p-1.5 bg-surface-container-highest text-on-surface-variant rounded"><span className="material-symbols-outlined text-xs">close</span></button>
</div>
</div>
{/* Secondary Alert */}
<div className="p-3 bg-surface-container-low border-l-4 border-tertiary rounded-r-lg space-y-2 opacity-80">
<div className="flex justify-between items-start">
<span className="text-xs font-bold text-tertiary">Optimization Ready</span>
<span className="text-[10px] text-on-surface-variant">12m ago</span>
</div>
<p className="text-[11px] text-on-surface-variant">AGV-012 path can be shortened by 15% using Corridor G.</p>
</div>
</div>
</div>
{/* Floating Controls */}
<div className="glass-panel p-4 rounded-xl border border-outline-variant/10 shadow-2xl pointer-events-auto">
<h4 className="font-headline font-bold text-[10px] uppercase tracking-widest text-on-surface-variant mb-3">Coordination Controls</h4>
<div className="grid grid-cols-1 gap-2">
<button className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-error to-[#93000a] text-white rounded-lg font-headline font-bold text-xs uppercase tracking-tight group hover:scale-[1.02] transition-all">
<span>Re-route All AGVs</span>
<span className="material-symbols-outlined text-sm group-hover:rotate-180 transition-transform">autorenew</span>
</button>
<div className="grid grid-cols-2 gap-2">
<button className="flex items-center justify-center gap-2 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed-dim rounded-lg text-[10px] font-bold uppercase transition-all">
<span className="material-symbols-outlined text-xs">priority</span> Set Priority
                            </button>
<button className="flex items-center justify-center gap-2 py-2.5 bg-surface-container-high hover:bg-surface-container-highest text-primary-fixed-dim rounded-lg text-[10px] font-bold uppercase transition-all">
<span className="material-symbols-outlined text-xs">block</span> Block Zone
                            </button>
</div>
</div>
</div>
</div>
{/* Right Panel: Priority Queue */}
<div className="absolute right-6 top-6 bottom-6 w-72 pointer-events-none">
<div className="glass-panel h-full rounded-xl border border-outline-variant/10 shadow-2xl pointer-events-auto flex flex-col p-4">
<h3 className="font-headline font-bold text-sm tracking-tight mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-primary text-sm">list_alt</span> Priority Queue
                    </h3>
<div className="flex-1 space-y-4 overflow-y-auto pr-2">
{/* Task Item */}
<div className="relative pl-4 border-l-2 border-primary/30">
<div className="flex justify-between mb-1">
<span className="text-[10px] font-bold uppercase text-primary">Mission #8841</span>
<span className="text-[10px] text-tertiary">High</span>
</div>
<h4 className="text-xs font-bold mb-1">Heavy Pallet Transfer</h4>
<div className="flex items-center gap-2 mb-2">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-primary h-full w-[65%]"></div>
</div>
<span className="text-[9px] text-on-surface-variant">65%</span>
</div>
<div className="flex gap-2">
<span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">AGV-104</span>
<span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">Bay 4</span>
</div>
</div>
{/* Task Item */}
<div className="relative pl-4 border-l-2 border-outline-variant/30 opacity-60">
<div className="flex justify-between mb-1">
<span className="text-[10px] font-bold uppercase text-on-surface-variant">Mission #8842</span>
<span className="text-[10px] text-on-surface-variant">Med</span>
</div>
<h4 className="text-xs font-bold mb-1">Sensor Maintenance</h4>
<div className="flex items-center gap-2 mb-2">
<div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
<div className="bg-outline-variant h-full w-[12%]"></div>
</div>
<span className="text-[9px] text-on-surface-variant">12%</span>
</div>
<div className="flex gap-2">
<span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">AGV-302</span>
<span className="text-[9px] px-1.5 py-0.5 bg-surface-container-highest rounded text-on-surface-variant">Hub A</span>
</div>
</div>
{/* Sparkline/Telemetry Card */}
<div className="mt-6 p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
<div className="flex justify-between items-center mb-2">
<span className="text-[10px] uppercase font-bold text-on-surface-variant">Swarm Throughput</span>
<span className="text-[10px] text-tertiary">+4.2%</span>
</div>
<div className="h-10 w-full flex items-end gap-[2px]">
<div className="bg-tertiary/20 w-full h-[40%] rounded-t-sm"></div>
<div className="bg-tertiary/20 w-full h-[60%] rounded-t-sm"></div>
<div className="bg-tertiary/20 w-full h-[50%] rounded-t-sm"></div>
<div className="bg-tertiary/40 w-full h-[80%] rounded-t-sm"></div>
<div className="bg-tertiary/30 w-full h-[70%] rounded-t-sm"></div>
<div className="bg-tertiary/50 w-full h-[90%] rounded-t-sm"></div>
<div className="bg-tertiary w-full h-[100%] rounded-t-sm"></div>
</div>
</div>
</div>
</div>
</div>
{/* Bottom Data Strips */}
<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
<div className="glass-panel px-6 py-3 rounded-full border border-outline-variant/10 flex items-center gap-4">
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_#52dad7]"></div>
<span className="text-[10px] font-headline font-bold uppercase tracking-wider">Active: {activeCount}</span>
</div>
<div className="w-px h-4 bg-outline-variant/30"></div>
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#adc7ff]"></div>
<span className="text-[10px] font-headline font-bold uppercase tracking-wider">Charging: {chargingCount}</span>
</div>
<div className="w-px h-4 bg-outline-variant/30"></div>
<div className="flex items-center gap-2">
<div className="w-2 h-2 rounded-full bg-error shadow-[0_0_8px_#ffb4ab]"></div>
<span className="text-[10px] font-headline font-bold uppercase tracking-wider">Offline: {errorCount}</span>
</div>
</div>
</div>
</main>
    );
}
