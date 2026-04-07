import React, { useState, useEffect, useRef } from 'react';

export default function SafetySettings() {
    const [systemState, setSystemState] = useState({ global_estop: false, global_pause: false });
    const wsRef = useRef(null);
    const [selectedAgv, setSelectedAgv] = useState('');

    useEffect(() => {
        // Read local storage target assigned from map or fleet manager
        const localActive = localStorage.getItem('bluefactory_selected_agv');
        if (localActive) setSelectedAgv(localActive);

        const ws = new WebSocket('ws://127.0.0.1:8000/ws');
        wsRef.current = ws;
        ws.onmessage = e => {
            try {
                const d = JSON.parse(e.data);
                if (d.system) setSystemState(d.system);
            } catch {}
        };
        return () => ws.close();
    }, []);

    const toggleGlobalEstop = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'global_estop', state: !systemState.global_estop }));
        }
    };

    const togglePauseAll = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: 'pause_all', state: !systemState.global_pause }));
        }
    };

    const toggleStopSelectedAgv = () => {
        // Find existing stop flag? Or just broadcast toggle (always toggle TRUE if not stopping properly, but best to toggle)
        if (wsRef.current?.readyState === WebSocket.OPEN && selectedAgv) {
            // Read from fleet? Without fleet context, we just emit opposite. But simpler to emit a toggle
            // We can emit stop_selected_agv and the server handles toggle, or we can just emit state: true and the button toggles between Stop/Resume.
            // Let's emit a specific command: toggle_agv_stop
            wsRef.current.send(JSON.stringify({ type: 'stop_selected_agv', agv_id: selectedAgv, state: true }));
        }
    };

    const resumeSelectedAgv = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN && selectedAgv) {
            wsRef.current.send(JSON.stringify({ type: 'stop_selected_agv', agv_id: selectedAgv, state: false }));
        }
    };

    return (
        <main className="flex-1 overflow-y-auto p-8 space-y-8 bg-surface">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">System &amp; Safety Control</h1>
                    <p className="text-on-surface-variant font-body mt-2">Global overrides and fleet-wide configuration parameters.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant/10">
                        <span className="relative flex h-3 w-3">
                            {!systemState.global_estop && !systemState.global_pause && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>}
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${systemState.global_estop ? 'bg-error' : systemState.global_pause ? 'bg-[#FF9800]' : 'bg-tertiary'}`}></span>
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${systemState.global_estop ? 'text-error' : systemState.global_pause ? 'text-[#FF9800]' : 'text-tertiary'}`}>
                            {systemState.global_estop ? "E-STOP ACTIVE" : systemState.global_pause ? "PAUSED" : "All Systems Nominal"}
                        </span>
                    </div>
                </div>
            </header>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-12 glass-panel p-8 rounded-xl border border-error/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-error/5 to-transparent pointer-events-none"></div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="material-symbols-outlined text-error text-3xl" style={{fontVariationSettings: "'FILL' 1"}}>warning</span>
                            <h2 className="text-2xl font-headline font-bold text-error uppercase tracking-tighter">Critical Safety Panel</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <button onClick={toggleGlobalEstop} className={`flex flex-col items-center justify-center gap-4 h-32 rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg ${systemState.global_estop ? 'bg-surface text-error border-2 border-error shadow-error/20' : 'bg-error text-on-error'}`}>
                                <span className="material-symbols-outlined text-5xl" style={{fontVariationSettings: "'FILL' 1"}}>{systemState.global_estop ? 'lock_open' : 'cancel'}</span>
                                <span className="font-headline font-extrabold text-sm uppercase tracking-widest text-center px-4">{systemState.global_estop ? 'Resume System' : 'Global E-Stop'}</span>
                            </button>
                            <button onClick={toggleStopSelectedAgv} className="flex flex-col items-center justify-center gap-4 bg-error-container text-on-error-container h-32 border border-transparent hover:border-error-container rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl">stop_circle</span>
                                <span className="font-headline font-bold text-xs uppercase tracking-wider text-center px-4">Stop Selected AGV</span>
                                {selectedAgv && <span className="text-[10px] bg-error text-on-error px-2 py-0.5 rounded shadow mt-1">{selectedAgv}</span>}
                            </button>
                            <button onClick={resumeSelectedAgv} className="flex flex-col items-center justify-center gap-4 bg-tertiary/10 text-tertiary h-32 border border-tertiary/30 hover:bg-tertiary/20 rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>play_circle</span>
                                <span className="font-headline font-bold text-xs uppercase tracking-wider text-center px-4">Resume Selected</span>
                            </button>
                            <button onClick={togglePauseAll} className={`col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center gap-4 h-32 rounded-xl hover:scale-[1.02] active:scale-95 transition-all duration-300 shadow-lg ${systemState.global_pause ? 'bg-surface text-[#FF9800] border-2 border-[#FF9800]' : 'bg-[#FF9800] text-[#212121]'}`}>
                                <span className="material-symbols-outlined text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>{systemState.global_pause ? 'play_arrow' : 'pause_circle'}</span>
                                <span className="font-headline font-bold text-xs uppercase tracking-wider text-center px-4">{systemState.global_pause ? 'Resume Operations' : 'Pause All Operations'}</span>
                            </button>
                            <button className="flex flex-col items-center justify-center gap-4 bg-surface-container-highest text-primary h-32 rounded-xl border border-primary/20 hover:bg-primary hover:text-on-primary transition-all duration-300">
                                <span className="material-symbols-outlined text-4xl">pan_tool</span>
                                <span className="font-headline font-bold text-xs uppercase tracking-wider text-center px-4">Manual Override Mode</span>
                            </button>
                        </div>
                    </div>
                </div>
<div className="lg:col-span-4 space-y-6">
<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
<h3 className="text-lg font-headline font-bold text-on-surface mb-4">Active Safety Alerts</h3>
<div className="space-y-4">
<div className="flex gap-4 p-3 bg-error-container/20 rounded-lg border-l-4 border-error">
<span className="material-symbols-outlined text-error">sensors_off</span>
<div>
<p className="text-sm font-bold text-on-error-container">Lidar Obstruction - AGV-04</p>
<p className="text-xs text-on-error-container/70 mt-1">Zone C-12, Maintenance required</p>
</div>
</div>
<div className="flex gap-4 p-3 bg-tertiary-container/10 rounded-lg border-l-4 border-tertiary">
<span className="material-symbols-outlined text-tertiary">battery_low</span>
<div>
<p className="text-sm font-bold text-tertiary">Low Charge - AGV-12</p>
<p className="text-xs text-on-surface-variant mt-1">Rerouting to station Alpha-2</p>
</div>
</div>
</div>
</div>
<div className="bg-surface-container-low rounded-xl p-6 border border-outline-variant/10">
<h3 className="text-lg font-headline font-bold text-on-surface mb-4">Quick Safety Toggles</h3>
<div className="space-y-6">
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-on-surface">Proximity Braking</p>
<p className="text-xs text-on-surface-variant">Auto-stop within 2 meters</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-on-surface">Collision Prediction</p>
<p className="text-xs text-on-surface-variant">AI-driven path calculation</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input checked="" className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
<div className="flex items-center justify-between">
<div>
<p className="text-sm font-medium text-on-surface">Audible Alarms</p>
<p className="text-xs text-on-surface-variant">Enable floor-level sounders</p>
</div>
<label className="relative inline-flex items-center cursor-pointer">
<input className="sr-only peer" type="checkbox" />
<div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-tertiary"></div>
</label>
</div>
</div>
</div>
</div>
<div className="lg:col-span-8 bg-surface-container-low rounded-xl border border-outline-variant/10 overflow-hidden flex flex-col">
<div className="flex border-b border-outline-variant/10 overflow-x-auto">
<button className="px-6 py-4 text-sm font-headline font-bold text-primary border-b-2 border-primary whitespace-nowrap">AGV Configuration</button>
<button className="px-6 py-4 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">Map Configuration</button>
<button className="px-6 py-4 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">User Roles</button>
<button className="px-6 py-4 text-sm font-headline font-bold text-on-surface-variant hover:text-on-surface transition-colors whitespace-nowrap">API Integrations</button>
</div>
<div className="p-8 space-y-8 flex-1">
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="space-y-4">
<label className="block">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Fleet Identification Prefix</span>
<input className="mt-2 block w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary/50 transition-all py-3 px-4" type="text" value="BF-AGV-MAIN" />
</label>
<label className="block">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Default Speed Limit (m/s)</span>
<input className="mt-2 block w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary/50 transition-all py-3 px-4" step="0.1" type="number" value="1.5" />
</label>
</div>
<div className="space-y-4">
<label className="block">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Network Gateway IP</span>
<input className="mt-2 block w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary/50 transition-all py-3 px-4" placeholder="192.168.1.100" type="text" />
</label>
<label className="block">
<span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Communication Protocol</span>
<select className="mt-2 block w-full bg-surface-container-highest border-none rounded-lg text-on-surface focus:ring-2 focus:ring-primary/50 transition-all py-3 px-4">
<option>MQTT (Industrial Standard)</option>
<option>ROS2 Humble</option>
<option>WebSocket Secure</option>
</select>
</label>
</div>
</div>
<div className="pt-6 border-t border-outline-variant/10">
<h4 className="text-sm font-headline font-bold text-on-surface mb-4">Safety Mode Permissions</h4>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
<div className="flex items-center gap-3 bg-surface p-4 rounded-lg">
<input checked="" className="w-5 h-5 rounded bg-surface-container-highest border-none text-primary focus:ring-primary" type="checkbox" />
<span className="text-sm text-on-surface">Operator Level</span>
</div>
<div className="flex items-center gap-3 bg-surface p-4 rounded-lg">
<input checked="" className="w-5 h-5 rounded bg-surface-container-highest border-none text-primary focus:ring-primary" type="checkbox" />
<span className="text-sm text-on-surface">Maintenance</span>
</div>
<div className="flex items-center gap-3 bg-surface p-4 rounded-lg">
<input className="w-5 h-5 rounded bg-surface-container-highest border-none text-primary focus:ring-primary" type="checkbox" />
<span className="text-sm text-on-surface">Guest View</span>
</div>
</div>
</div>
<div className="pt-6 flex justify-end gap-4">
<button className="px-6 py-2.5 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors font-headline font-bold text-sm">
                                Reset to Default
                            </button>
<button className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                                Save Changes
                            </button>
</div>
</div>
</div>
</section>
</main>
    );
}
