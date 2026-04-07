import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LiveMapComponent from '../components/LiveMapComponent';

export default function AgvFleetDashboard() {
    const navigate = useNavigate();
    const [fleet, setFleet] = useState([]);
    const [obstacles, setObstacles] = useState([]);
    const [zones, setZones] = useState({});
    const [layer, setLayer] = useState('standard');
    const [isFullScreen, setIsFullScreen] = useState(false);
    const wsRef = useRef(null);

    useEffect(() => {
        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        wsRef.current = ws;
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

    const activeMissions = fleet.filter(a => a.status !== 'IDLE' && a.status !== 'CHARGING').length;
    const idleVehicles = fleet.filter(a => a.status === 'IDLE').length;

    return (
        <main className="flex-1 p-6 overflow-y-auto bg-surface space-y-6 pb-20">
            {/* Top Summary Cards (Asymmetric Bento Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-primary group hover:bg-surface-container transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Total AGVs</span>
                        <span className="material-symbols-outlined text-primary-fixed-dim text-xl">smart_toy</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-headline font-bold">{fleet.length}</span>
                        <span className="text-tertiary text-xs font-medium">Online</span>
                    </div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-tertiary group hover:bg-surface-container transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Active Missions</span>
                        <span className="material-symbols-outlined text-tertiary text-xl">rocket_launch</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-headline font-bold">{String(activeMissions).padStart(2, '0')}</span>
                        <span className="text-tertiary text-xs font-medium">Running</span>
                    </div>
                </div>
                <div className="bg-surface-container-low p-5 rounded-xl border-l-4 border-outline group hover:bg-surface-container transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-on-surface-variant font-label text-[10px] uppercase tracking-widest">Idle Vehicles</span>
                        <span className="material-symbols-outlined text-outline text-xl">pause_circle</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-headline font-bold">{String(idleVehicles).padStart(2, '0')}</span>
                        <span className="text-on-surface-variant text-xs font-medium">Ready</span>
                    </div>
                </div>
                <div className="bg-error-container/10 border-l-4 border-error p-5 rounded-xl group hover:bg-error-container/20 transition-all duration-300">
                    <div className="flex justify-between items-start">
                        <span className="text-error font-label text-[10px] uppercase tracking-widest font-bold">Critical Alerts</span>
                        <span className="material-symbols-outlined text-error text-xl" style={{'fontVariationSettings': '\'FILL\' 1'}}>warning</span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-3xl font-headline font-bold text-error">{String(obstacles.length).padStart(2, '0')}</span>
                        <span className="text-error text-xs font-medium animate-pulse">ACTION REQ.</span>
                    </div>
                </div>
            </div>

            {/* Center Content: Map & Alerts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Map Preview (2/3) */}
                <div className={`xl:col-span-2 space-y-4 ${isFullScreen ? 'fixed inset-0 z-[100] bg-surface p-6 flex flex-col h-screen max-w-none col-span-1' : ''}`}>
                    <div className="flex items-center justify-between shrink-0">
                        <h3 className="font-headline font-bold text-lg flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            Real-time Factory Grid
                        </h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setLayer(layer === 'heatmap' ? 'standard' : 'heatmap')}
                                className="bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors"
                            >
                                Layer: {layer === 'heatmap' ? 'Standard' : 'Heatmap'}
                            </button>
                            <button 
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="bg-surface-container-high px-4 py-1.5 rounded-lg text-xs font-label uppercase tracking-wider text-on-surface-variant hover:text-primary transition-colors flex items-center gap-2"
                            >
                                {isFullScreen ? (
                                    <><span className="material-symbols-outlined text-[14px]">close_fullscreen</span> Shrink Map</>
                                ) : (
                                    <><span className="material-symbols-outlined text-[14px]">fullscreen</span> View Full Map</>
                                )}
                            </button>
                        </div>
                    </div>
                    <div className={`relative rounded-2xl overflow-hidden bg-surface-container-lowest border border-outline-variant/10 group ${isFullScreen ? 'flex-1 h-full' : 'h-[450px]'}`}>
                        <LiveMapComponent
                            fleet={fleet}
                            zones={zones}
                            obstacles={obstacles}
                            layer={layer}
                            showZoomControls={true}
                        />
                    </div>
                </div>

                {/* Right Panel: Alerts Feed (1/3) */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-headline font-bold text-lg">Alerts Feed</h3>
                        <span className="bg-error/20 text-error px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">Live</span>
                    </div>
                    <div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5">
                        <div className="p-1 space-y-1">
                            {/* Alert Item */}
                            <div className="p-4 bg-error-container/20 rounded-xl flex gap-4 items-start border-l-4 border-error">
                                <div className="w-10 h-10 rounded-lg bg-error/20 flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-error">noise_aware</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-headline font-bold text-sm text-error">Collision Risk</h4>
                                        <span className="text-[9px] text-on-surface-variant font-medium">JUST NOW</span>
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">AGV-011 and manual forklift nearing proximity in Zone B-4.</p>
                                    <button className="mt-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline">Remote Intervene</button>
                                </div>
                            </div>
                            {/* Alert Item */}
                            <div className="p-4 hover:bg-surface-container-high transition-colors rounded-xl flex gap-4 items-start border-l-4 border-error/50">
                                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-error">thermostat</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-headline font-bold text-sm">Overheating</h4>
                                        <span className="text-[9px] text-on-surface-variant font-medium">2 MIN AGO</span>
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1">ID-004 motor temperature at 85°C. Performance throttled to 40%.</p>
                                </div>
                            </div>
                            {/* Alert Item */}
                            <div className="p-4 hover:bg-surface-container-high transition-colors rounded-xl flex gap-4 items-start border-l-4 border-primary">
                                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-primary">battery_2_bar</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-headline font-bold text-sm">Low Battery</h4>
                                        <span className="text-[9px] text-on-surface-variant font-medium">12 MIN AGO</span>
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1">ID-009 battery at 12%. Re-routing to Charging Station Alpha.</p>
                                </div>
                            </div>
                            {/* Alert Item */}
                            <div className="p-4 hover:bg-surface-container-high transition-colors rounded-xl flex gap-4 items-start opacity-60">
                                <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-tertiary">task_alt</span>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-headline font-bold text-sm">Mission Completed</h4>
                                        <span className="text-[9px] text-on-surface-variant font-medium">45 MIN AGO</span>
                                    </div>
                                    <p className="text-xs text-on-surface-variant mt-1">AGV-002 successfully delivered payload to Dock 7.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button onClick={() => navigate('/mission-management')} className="w-full bg-primary-fixed-dim text-on-primary-fixed py-2 rounded-lg font-label text-[10px] uppercase tracking-[0.2em] font-bold hover:brightness-110 transition-all">
                        Create New Mission
                    </button>
                </div>
            </div>

            {/* Bottom Section: Telemetry Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Torque */}
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Fleet Avg Torque (Nm)</span>
                        <span className="text-primary font-headline font-bold">42.8</span>
                    </div>
                    <div className="h-16 flex items-end gap-[2px]">
                        <div className="bg-primary-container/30 w-full h-8 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-12 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-10 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-14 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-16 rounded-sm"></div>
                        <div className="bg-primary w-full h-12 rounded-sm"></div>
                        <div className="bg-primary w-full h-10 rounded-sm"></div>
                        <div className="bg-primary w-full h-14 rounded-sm"></div>
                        <div className="bg-primary w-full h-15 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-9 rounded-sm"></div>
                        <div className="bg-primary-container/30 w-full h-11 rounded-sm"></div>
                    </div>
                </div>
                {/* Temperature */}
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">System Temperature (°C)</span>
                        <span className="text-tertiary font-headline font-bold">34.2</span>
                    </div>
                    <div className="h-16 flex items-end gap-[2px]">
                        <div className="bg-tertiary-container/20 w-full h-6 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-7 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-8 rounded-sm"></div>
                        <div className="bg-tertiary w-full h-8 rounded-sm shadow-[0_0_8px_rgba(82,218,215,0.3)]"></div>
                        <div className="bg-tertiary w-full h-9 rounded-sm shadow-[0_0_8px_rgba(82,218,215,0.3)]"></div>
                        <div className="bg-tertiary-container/20 w-full h-8 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-7 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-7 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-8 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-9 rounded-sm"></div>
                        <div className="bg-tertiary-container/20 w-full h-9 rounded-sm"></div>
                    </div>
                </div>
                {/* Battery */}
                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/10">
                    <div className="flex justify-between items-center mb-4">
                        <span className="font-label text-[10px] uppercase tracking-widest text-on-surface-variant">Fleet Efficiency (%)</span>
                        <span className="text-secondary-fixed-dim font-headline font-bold">94.1</span>
                    </div>
                    <div className="h-16 flex items-end gap-[2px]">
                        <div className="bg-secondary/10 w-full h-14 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-15 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-16 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-15 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-14 rounded-sm"></div>
                        <div className="bg-secondary w-full h-15 rounded-sm"></div>
                        <div className="bg-secondary w-full h-16 rounded-sm shadow-[0_0_8px_rgba(0,218,243,0.3)]"></div>
                        <div className="bg-secondary w-full h-16 rounded-sm shadow-[0_0_8px_rgba(0,218,243,0.3)]"></div>
                        <div className="bg-secondary w-full h-15 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-14 rounded-sm"></div>
                        <div className="bg-secondary/10 w-full h-15 rounded-sm"></div>
                    </div>
                </div>
            </div>
        </main>
    );
}
