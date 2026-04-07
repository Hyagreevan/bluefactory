import React from 'react';

export default function AiCopilotChat() {
    return (
        <main className="flex-1 flex flex-col overflow-hidden" style={{minHeight: 0}}>
{/* Chat & Interactive Area */}
<div className="flex-1 flex overflow-hidden">
{/* Chat Interface */}
<section className="flex-1 flex flex-col bg-surface-container-lowest relative p-6">
{/* Chat Scroll Area */}
<div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
{/* Message: System */}
<div className="flex gap-4 max-w-2xl">
<div className="w-8 h-8 rounded-lg bg-surface-container-high border border-tertiary/30 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-tertiary text-lg" data-icon="smart_toy">smart_toy</span>
</div>
<div className="space-y-2">
<div className="text-[10px] font-label font-bold uppercase tracking-widest text-tertiary">Copilot • 09:41 AM</div>
<div className="glass-panel p-4 rounded-xl rounded-tl-none border border-outline-variant/10 shadow-lg">
<p className="text-on-surface text-sm leading-relaxed">System operational. 12 AGVs active in the main assembly area. How can I assist with fleet logistics today?</p>
</div>
</div>
</div>
{/* Message: User */}
<div className="flex gap-4 max-w-2xl ml-auto flex-row-reverse">
<div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-on-primary-container text-lg" data-icon="person">person</span>
</div>
<div className="space-y-2 text-right">
<div className="text-[10px] font-label font-bold uppercase tracking-widest text-primary-fixed-dim">Supervisor • 09:42 AM</div>
<div className="bg-primary/10 p-4 rounded-xl rounded-tr-none border border-primary/20 shadow-lg inline-block">
<p className="text-on-surface text-sm leading-relaxed">Move AGV 2 to Zone A and prioritize component delivery for Station 4.</p>
</div>
</div>
</div>
{/* Message: System Analysis */}
<div className="flex gap-4 max-w-3xl">
<div className="w-8 h-8 rounded-lg bg-surface-container-high border border-tertiary/30 flex items-center justify-center shrink-0">
<span className="material-symbols-outlined text-tertiary text-lg" data-icon="query_stats">query_stats</span>
</div>
<div className="space-y-4 flex-1">
<div className="text-[10px] font-label font-bold uppercase tracking-widest text-tertiary">Mission Interpretation</div>
<div className="glass-panel p-6 rounded-xl rounded-tl-none border border-tertiary/20 glow-cyan">
<h3 className="font-headline font-bold text-lg text-on-surface mb-4">Proposed Mission: AGV-02-DELTA</h3>
{/* Interpreted Mission Visualization */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<div className="space-y-3">
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-xs text-on-surface-variant">Target Zone</span>
<span className="text-xs font-bold text-tertiary">ZONE-A (Assembly)</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-xs text-on-surface-variant">Priority Level</span>
<span className="text-xs font-bold text-error">CRITICAL (Station 4)</span>
</div>
<div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/10">
<span className="text-xs text-on-surface-variant">Est. Completion</span>
<span className="text-xs font-bold text-on-surface">4m 12s</span>
</div>
</div>
{/* Path Preview */}
<div className="relative h-40 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface">
<img alt="Factory layout map" className="w-full h-full object-cover opacity-40" data-alt="schematic dark industrial floor plan with glowing cyan paths and highlighted zones in a futuristic architectural style" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC3yv0PNIJ-J32S-UGAfAq3Bn3oEvvz5nsiLgxXx2DfL26506W698XtoDKdgmnn4-_gT9z9X9l0Ejt1ONhpfD7dCV85Ty4-qJzBxJESEXXeLNhhtOKWlzz42lCNDJach1yKUQmFin6AaA7FLgQCXWqKAxDWbd1ZT7XfJnvSakcwTXfo4WNmCx7TEZOQdasHZzG43aV3Q70dbFkb6ErIzYkZXSLEcIx7ic4uygYrUEdwJi0RZDrkyzMRm6nEMX079nleCj2hHvz5mTAa" />
<div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent"></div>
<div className="absolute inset-0 flex items-center justify-center">
<div className="w-full px-8">
<div className="h-0.5 w-full bg-tertiary/20 relative">
<div className="absolute top-0 left-0 h-full w-2/3 bg-tertiary shadow-[0_0_10px_#52dad7]"></div>
<div className="absolute -top-1.5 left-0 w-3 h-3 rounded-full bg-tertiary border-2 border-surface"></div>
<div className="absolute -top-1.5 left-2/3 w-3 h-3 rounded-full bg-tertiary animate-pulse border-2 border-surface"></div>
</div>
</div>
</div>
<div className="absolute bottom-2 left-2 text-[8px] font-label uppercase tracking-widest text-on-surface-variant bg-surface/80 px-2 py-1 rounded">Real-time Path Simulation</div>
</div>
</div>
<div className="mt-6 flex items-center gap-3">
<button className="flex-1 bg-gradient-to-r from-primary to-primary-container text-on-primary-container font-headline font-bold py-2.5 rounded-lg text-sm shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">Execute Command</button>
<button className="px-4 py-2.5 rounded-lg bg-surface-container-high text-on-surface font-headline font-bold text-sm hover:bg-surface-variant transition-colors">Modify</button>
<button className="px-4 py-2.5 rounded-lg text-on-surface-variant font-headline font-bold text-sm hover:text-error transition-colors">Cancel</button>
</div>
</div>
</div>
</div>
</div>
{/* Input Section */}
<div className="mt-6">
<div className="glass-panel p-2 rounded-2xl border border-outline-variant/20 shadow-2xl flex items-center gap-2 glow-blue">
<button className="p-3 rounded-xl hover:bg-surface-container-high text-on-surface-variant transition-colors">
<span className="material-symbols-outlined" data-icon="attach_file">attach_file</span>
</button>
<input className="flex-1 bg-transparent border-none focus:ring-0 text-on-surface font-body text-sm placeholder:text-on-surface-variant/50" placeholder="Type a command (e.g., 'Move AGV 4 to bay 2')..." type="text" />
<div className="flex items-center gap-1 pr-1">
<button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-highest text-primary font-headline font-bold text-xs uppercase tracking-widest hover:bg-primary/10 transition-all">
<span className="material-symbols-outlined text-sm" data-icon="mic" data-weight="fill" style={{'fontVariationSettings': '\'FILL\' 1'}}>mic</span>
                                Voice Input
                            </button>
<button className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary shadow-lg hover:scale-105 active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="send" data-weight="fill" style={{'fontVariationSettings': '\'FILL\' 1'}}>send</span>
</button>
</div>
</div>
<div className="mt-3 flex justify-center gap-6 text-[10px] text-on-surface-variant/40 font-label uppercase tracking-widest">
<span>NLP Engine v4.2.0</span>
<span>AGV Response: 14ms</span>
<span>Safety Protocols: Active</span>
</div>
</div>
</section>
{/* Right Panel: Suggested Commands & Context */}
<aside className="hidden xl:flex w-80 bg-surface flex-col border-l border-outline-variant/10 p-6 overflow-y-auto">
<div className="mb-8">
<h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-6">Suggested Commands</h3>
<div className="space-y-3">
<button className="w-full group text-left p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-primary/30 transition-all">
<div className="flex items-center justify-between mb-1">
<span className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">Move AGV to Zone A</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="north_east">north_east</span>
</div>
<p className="text-[10px] text-on-surface-variant leading-relaxed">Relocate the nearest available unit to assembly row A.</p>
</button>
<button className="w-full group text-left p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-error/30 transition-all">
<div className="flex items-center justify-between mb-1">
<span className="text-xs font-bold text-on-surface group-hover:text-error transition-colors">Avoid Zone C</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="block">block</span>
</div>
<p className="text-[10px] text-on-surface-variant leading-relaxed">Dynamic rerouting to bypass maintenance area in Zone C.</p>
</button>
<button className="w-full group text-left p-4 rounded-xl bg-surface-container-low border border-outline-variant/5 hover:border-tertiary/30 transition-all">
<div className="flex items-center justify-between mb-1">
<span className="text-xs font-bold text-on-surface group-hover:text-tertiary transition-colors">Send to charging</span>
<span className="material-symbols-outlined text-xs text-on-surface-variant" data-icon="battery_charging_full">battery_charging_full</span>
</div>
<p className="text-[10px] text-on-surface-variant leading-relaxed">Optimize fleet by returning low-battery units to docks.</p>
</button>
</div>
</div>
<div className="mb-8">
<h3 className="font-headline font-bold text-[10px] uppercase tracking-[0.2em] text-on-surface-variant mb-4">Fleet Status</h3>
<div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10 space-y-4">
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-tertiary glow-cyan"></div>
<div className="flex-1">
<div className="flex justify-between items-center mb-1">
<span className="text-[10px] font-bold text-on-surface">System Health</span>
<span className="text-[10px] text-tertiary">98.2%</span>
</div>
<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full w-[98%] bg-tertiary"></div>
</div>
</div>
</div>
<div className="flex items-center gap-3">
<div className="w-2 h-2 rounded-full bg-primary glow-blue"></div>
<div className="flex-1">
<div className="flex justify-between items-center mb-1">
<span className="text-[10px] font-bold text-on-surface">Network Latency</span>
<span className="text-[10px] text-primary">12ms</span>
</div>
<div className="h-1 w-full bg-surface-container-high rounded-full overflow-hidden">
<div className="h-full w-[15%] bg-primary"></div>
</div>
</div>
</div>
</div>
</div>
<div className="mt-auto">
<div className="p-4 rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-low border border-outline-variant/10">
<div className="flex items-center gap-2 mb-2">
<span className="material-symbols-outlined text-tertiary-fixed-dim" data-icon="info" data-weight="fill" style={{'fontVariationSettings': '\'FILL\' 1'}}>info</span>
<span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">AI Insight</span>
</div>
<p className="text-[10px] text-on-surface-variant leading-relaxed italic">"Traffic in Row B is increasing. I recommend rerouting Station 4 deliveries through the East bypass."</p>
</div>
</div>
</aside>
</div>

</main>
    );
}
