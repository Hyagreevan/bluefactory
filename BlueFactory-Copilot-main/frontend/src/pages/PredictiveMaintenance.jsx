import React, { useState, useEffect } from 'react';

export default function PredictiveMaintenance() {
    const [fleet, setFleet] = useState([]);
    
    useEffect(() => {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                if (data.fleet) setFleet(data.fleet);
            } catch {}
        };
        return () => ws.close();
    }, []);

    const calculateHealth = (agv) => {
        let val = agv.battery;
        if (agv.status === 'ERROR' || agv.status === 'OVERHEATING') val = val * 0.4;
        return Math.max(10, Math.min(100, Math.round(val)));
    };

    return (
        <main className="flex-1 overflow-y-auto p-6 bg-surface-container-lowest space-y-6 pb-20">
{/* Page Header Action Bar */}
<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
<div>
<h2 className="text-3xl font-headline font-bold text-on-surface tracking-tight">Predictive Maintenance</h2>
<p className="text-on-surface-variant text-sm mt-1">Real-time health monitoring and failure prediction for AGV ID-001 through ID-014</p>
</div>
<div className="flex gap-3">
<button onClick={() => alert("Alerts configuration dialog opening...")} className="px-5 py-2.5 bg-surface-container-high text-primary-fixed border border-outline-variant/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">notifications_active</span> Set Alerts
                    </button>
<button onClick={() => alert("Detailed PDF report downloading...")} className="px-5 py-2.5 bg-surface-container-high text-primary-fixed border border-outline-variant/10 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-surface-container-highest transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">analytics</span> View Detailed Report
                    </button>
<button onClick={() => alert("Maintenance Scheduler launching...")} className="px-5 py-2.5 industrial-gradient text-on-primary-container rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/10 hover:brightness-110 transition-all flex items-center gap-2">
<span className="material-symbols-outlined text-sm">calendar_month</span> Schedule Maintenance
                    </button>
</div>
</div>
{/* AGV Health Scores Bento Grid */}
<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
{fleet.map((agv, i) => {
    const health = calculateHealth(agv);
    const isCritical = health < 50;
    const isWarning = health >= 50 && health < 80;
    const colorClass = isCritical ? 'bg-error' : (isWarning ? 'bg-secondary' : 'bg-tertiary');
    const textColorClass = isCritical ? 'text-error' : (isWarning ? 'text-secondary' : 'text-on-surface');
    const shadowColor = isCritical ? 'rgba(255,180,171,0.6)' : (isWarning ? 'rgba(215,195,120,0.6)' : 'rgba(82,218,215,0.6)');
    const borderColorClass = isCritical ? 'border-l-2 border-l-error' : 'border border-outline-variant/5 hover:border-primary/20';

    return (
        <div key={agv.id} className={`bg-surface-container-low p-4 rounded-xl ${borderColorClass} transition-all group`}>
            <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-bold text-outline uppercase tracking-tighter">{agv.id}</span>
                <div className={`w-2 h-2 rounded-full ${colorClass}`} style={{boxShadow: `0 0 8px ${shadowColor}`}}></div>
            </div>
            <div className={`text-2xl font-headline font-bold ${textColorClass} mb-1`}>{health}%</div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">Health Score</div>
            <div className="mt-4 pt-3 border-t border-outline-variant/10">
                <div className="text-[9px] text-outline uppercase font-bold mb-1">RUL Prediction</div>
                <div className="text-xs font-medium text-on-surface">{Math.round(health * 18.5)} Hours</div>
            </div>
        </div>
    );
})}
</div>
{/* Visualization Section */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
{/* Vibration Analysis Chart */}
<div className="lg:col-span-2 bg-surface-container-low rounded-2xl p-6 border border-outline-variant/5 flex flex-col h-[400px]">
<div className="flex justify-between items-center mb-6">
<div>
<h3 className="font-headline font-bold text-lg text-on-surface">Vibration Analysis</h3>
<p className="text-xs text-on-surface-variant uppercase tracking-widest font-bold">Real-time Spectral Density | AGV-004 Focus</p>
</div>
<div className="flex gap-2">
<span className="px-2 py-1 rounded bg-secondary-container/20 text-secondary text-[10px] font-bold uppercase tracking-widest">Live Monitoring</span>
</div>
</div>
<div className="flex-1 relative flex items-end gap-1 px-4 overflow-hidden">
{/* Simulated Chart Content */}
<div className="absolute inset-0 flex flex-col justify-between py-4 pointer-events-none opacity-20">
<div className="w-full h-[1px] bg-error border-t border-dashed border-error"></div>
<div className="w-full h-[1px] bg-outline-variant"></div>
<div className="w-full h-[1px] bg-outline-variant"></div>
<div className="w-full h-[1px] bg-outline-variant"></div>
</div>
{/* Bars (Visual Mock) */}
<div className="w-full h-full flex items-end gap-1 pb-4">
<div className="flex-1 bg-secondary/10 h-[30%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/10 h-[35%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/20 h-[50%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/20 h-[45%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/30 h-[60%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/40 h-[70%] rounded-t-sm"></div>
<div className="flex-1 bg-error/50 h-[85%] rounded-t-sm relative">
<div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-error font-bold">PEAK</div>
</div>
<div className="flex-1 bg-secondary/40 h-[65%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/30 h-[40%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/20 h-[30%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/30 h-[50%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/40 h-[75%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/50 h-[80%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/30 h-[55%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/20 h-[40%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/10 h-[30%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/20 h-[45%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/40 h-[65%] rounded-t-sm"></div>
<div className="flex-1 bg-secondary/50 h-[90%] rounded-t-sm border-t-2 border-secondary"></div>
<div className="flex-1 bg-secondary/40 h-[60%] rounded-t-sm"></div>
</div>
<div className="absolute top-10 right-10 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-secondary"></div> Motor Phase A</div>
<div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-error"></div> Critical Threshold</div>
</div>
</div>
</div>
{/* Temperature & Alerts Column */}
<div className="space-y-6">
{/* Temperature Trend Micro-Card */}
<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/5">
<div className="flex justify-between items-start mb-4">
<div>
<h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Avg Operating Temp</h4>
<p className="text-2xl font-headline font-bold text-on-surface">42.8°C <span className="text-xs font-normal text-error">+2.1%</span></p>
</div>
<span className="material-symbols-outlined text-outline">thermostat</span>
</div>
{/* Sparkline */}
<div className="h-12 w-full flex items-center">
<svg className="w-full h-full overflow-visible" viewBox="0 0 100 20">
<path d="M0 15 L10 12 L20 18 L30 14 L40 10 L50 8 L60 12 L70 5 L80 14 L90 8 L100 12" fill="none" stroke="#52dad7" strokeLinecap="round" strokeWidth="1.5"></path>
<line stroke="#ffb4ab" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="100" y1="5" y2="5"></line>
</svg>
</div>
<div className="flex justify-between text-[10px] text-outline font-bold mt-2 uppercase">
<span>08:00 AM</span>
<span>Now</span>
</div>
</div>
{/* Alerts Feed */}
<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant/5 flex flex-col flex-1">
<h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Maintenance Required Soon</h4>
<div className="space-y-3">
{/* Alert 1 */}
<div className="glass-card p-3 rounded-xl border border-error/20 flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-error-container/30 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-error text-lg" style={{'fontVariationSettings': '\'FILL\' 1'}}>warning</span>
</div>
<div className="min-w-0">
<div className="flex justify-between items-center mb-0.5">
<h5 className="text-xs font-bold text-on-surface">AGV-004: Gearbox Wear</h5>
<span className="text-[9px] font-bold text-error uppercase">94% Prob.</span>
</div>
<p className="text-[10px] text-on-surface-variant line-clamp-1">Abnormal vibration patterns detected in primary drive unit.</p>
</div>
</div>
{/* Alert 2 */}
<div className="bg-surface-container-high p-3 rounded-xl border border-outline-variant/10 flex items-start gap-3">
<div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-tertiary text-lg" style={{'fontVariationSettings': '\'FILL\' 1'}}>bolt</span>
</div>
<div className="min-w-0">
<div className="flex justify-between items-center mb-0.5">
<h5 className="text-xs font-bold text-on-surface">AGV-011: Battery Cycle</h5>
<span className="text-[9px] font-bold text-on-surface-variant uppercase">68% Prob.</span>
</div>
<p className="text-[10px] text-on-surface-variant line-clamp-1">Cell voltage deviation exceeds recommended parameters.</p>
</div>
</div>
</div>
</div>
</div>
</div>
{/* Detailed Grid */}
<div className="bg-surface-container-low rounded-2xl border border-outline-variant/5 overflow-hidden">
<div className="px-6 py-4 border-b border-outline-variant/5 flex justify-between items-center">
<h3 className="font-headline font-bold text-on-surface uppercase tracking-widest text-xs">Fleet Telemetry Overview</h3>
<div className="flex gap-2">
<span className="text-[10px] text-on-surface-variant font-bold uppercase">Showing 14 of 14 Units</span>
</div>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead>
<tr className="bg-surface-container-lowest">
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">ID</th>
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Status</th>
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Temperature</th>
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Vibration (G)</th>
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Efficiency</th>
<th className="px-6 py-3 text-[10px] font-bold text-outline uppercase tracking-widest">Next Service</th>
</tr>
</thead>
<tbody className="divide-y divide-outline-variant/5">
{fleet.map(agv => {
    const health = calculateHealth(agv);
    const isCritical = health < 50;
    const isWarning = health >= 50 && health < 80;
    
    let statusText = 'Optimal';
    let statusColor = 'bg-tertiary/10 text-tertiary';
    let lineClass = 'bg-tertiary';
    let rowBg = 'hover:bg-surface-container-high/50 transition-colors';
    
    if (isCritical) {
        statusText = 'Critical';
        statusColor = 'bg-error/10 text-error';
        lineClass = 'bg-error';
        rowBg += ' bg-error/5';
    } else if (isWarning) {
        statusText = 'Warning';
        statusColor = 'bg-secondary/10 text-secondary';
        lineClass = 'bg-secondary';
    }

    return (
        <tr key={agv.id} className={rowBg}>
            <td className="px-6 py-4 text-xs font-bold text-on-surface">{agv.id}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded-full ${statusColor} text-[9px] font-bold uppercase`}>{statusText}</span>
            </td>
            <td className={`px-6 py-4 text-xs ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{ (35 + (100 - health)*0.4).toFixed(1) }°C</td>
            <td className={`px-6 py-4 text-xs ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{ (0.1 + (100 - health)*0.02).toFixed(2) }</td>
            <td className="px-6 py-4">
                <div className="w-24 h-1 bg-surface-container-highest rounded-full">
                    <div className={`h-full ${lineClass} rounded-full`} style={{ width: `${health}%` }}></div>
                </div>
            </td>
            <td className={`px-6 py-4 text-xs ${isCritical ? 'text-error font-bold' : 'text-on-surface-variant'}`}>{isCritical ? 'IMMEDIATE' : `In ${Math.ceil(health/10)} Days`}</td>
        </tr>
    );
})}
</tbody>
</table>
</div>
</div>
</main>
    );
}
