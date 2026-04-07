import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/',                       icon: 'home',                    label: 'Dashboard',        end: true  },
  { to: '/map',                    icon: 'map',                     label: 'Map',              end: false },
  { to: '/mission-management',     icon: 'assignment',              label: 'Missions',         end: false },
  { to: '/fleet-manager',          icon: 'precision_manufacturing', label: 'Fleet Analytics',  end: false },
  { to: '/digital-twin',           icon: 'view_in_ar',              label: 'Digital Twin',     end: false },
  { to: '/swarm-coordination',     icon: 'hub',                     label: 'Swarm',            end: false },
  { to: '/predictive-maintenance', icon: 'build',                   label: 'Maintenance',      end: false },
  { to: '/safety-settings',        icon: 'shield',                  label: 'Safety',           end: false },
];

export default function Layout() {
  const [fleet, setFleet] = useState([]);
  const [systemState, setSystemState] = useState({ global_estop: false, global_pause: false });
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws');
    wsRef.current = ws;
    ws.onmessage = e => {
      try {
        const d = JSON.parse(e.data);
        if (d.fleet) setFleet(d.fleet);
        if (d.system) setSystemState(d.system);
      } catch {}
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (isLightMode) document.body.classList.add('light-mode');
    else document.body.classList.remove('light-mode');
  }, [isLightMode]);

  const triggerEstop = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'global_estop', state: !systemState.global_estop }));
    }
  };

  const notifications = fleet.filter(a => a.status === 'ERROR' || a.status === 'OVERHEATING' || a.status === 'LOW BATT - RETURNING' || a.status === 'REROUTING').map(a => ({ id: a.id, msg: `${a.id} is currently ${a.status}` }));

  return (
    <>
      {/* Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
      <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0" rel="stylesheet" />

      <style>{`
        * { box-sizing: border-box; }
        html, body, #root { height: 100%; margin: 0; padding: 0; }
        .ms {
          font-family: 'Material Symbols Outlined' !important;
          font-weight: normal; font-style: normal;
          font-size: 20px; line-height: 1; letter-spacing: normal;
          text-transform: none; display: inline-block;
          white-space: nowrap; direction: ltr;
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
          -webkit-font-smoothing: antialiased;
        }
      `}</style>

      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--color-background, #0e141a)', color: 'var(--color-on-background, #dde3ec)', fontFamily: "'Inter', sans-serif", overflow: 'hidden' }}>

        {/* ── TOP HEADER ── */}
        <header style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '52px', borderBottom: '1px solid var(--color-outline-variant, rgba(255,255,255,0.08))', background: 'var(--color-surface-container-lowest, #0a0f14)', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '18px', color: 'var(--color-primary, #adc7ff)', fontStyle: 'italic' }}>BlueFactory Copilot</span>
            <nav style={{ display: 'flex', gap: '2px' }}>
              {[
                { to: '/',                       label: 'Dashboard',       end: true  },
                { to: '/fleet-manager',          label: 'Fleet Analytics', end: false },
                { to: '/ai-copilot',             label: 'AI Copilot',      end: false },
                { to: '/predictive-maintenance', label: 'Maintenance',     end: false },
                { to: '/safety-settings',        label: 'Safety',          end: false },
              ].map(({ to, label, end }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  style={({ isActive }) => ({
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--color-primary, #adc7ff)' : 'var(--color-outline, rgba(193,198,215,0.7))',
                    textDecoration: 'none',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    borderBottom: isActive ? '2px solid var(--color-primary, #adc7ff)' : '2px solid transparent',
                    transition: 'all 0.15s',
                  })}
                >{label}</NavLink>
              ))}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ position: 'relative' }}>
              <span className="ms" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-outline, #8b90a0)', fontSize: '16px' }}>search</span>
              <input type="text" placeholder="Search AGV ID..." style={{ background: 'var(--color-surface-container-low, #161c22)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 12px 6px 34px', fontSize: '13px', color: 'var(--color-on-surface, #dde3ec)', outline: 'none', width: '200px' }} />
            </div>
            
            {/* NOTIFICATIONS */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowNotif(!showNotif)} style={{ background: 'none', border: 'none', color: 'var(--color-outline, rgba(193,198,215,0.7))', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}>
                <span className="ms">{notifications.length > 0 ? 'notifications_active' : 'notifications'}</span>
                {notifications.length > 0 && <span style={{position:'absolute', top:0, right:0, background:'var(--color-error,#ffb4ab)', width:8, height:8, borderRadius:4}}></span>}
              </button>
              {showNotif && (
                <div style={{position:'absolute', right:0, top:'40px', background:'var(--color-surface-container-high, #252b31)', border:'1px solid var(--color-outline-variant)', width:'250px', borderRadius:'8px', padding:'12px', zIndex:999, boxShadow:'0 10px 25px rgba(0,0,0,0.5)'}}>
                  <p style={{fontSize:'12px', fontWeight:700, marginBottom:'8px'}}>NOTIFICATIONS</p>
                  {notifications.length === 0 ? <p style={{fontSize:'11px', color:'var(--color-outline)'}}>No active alerts.</p> : 
                    notifications.map((n, i) => <div key={i} style={{fontSize:'11px', padding:'6px', background:'rgba(255,0,0,0.1)', marginBottom:'4px', borderRadius:'4px'}}><b style={{color:'var(--color-error)'}}>{n.id}</b>: {n.msg}</div>)
                  }
                </div>
              )}
            </div>

            {/* THEME TOGGLE */}
            <button onClick={() => setIsLightMode(!isLightMode)} style={{ background: 'none', border: 'none', color: 'var(--color-tertiary, #52dad7)', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}>
              <span className="ms">{isLightMode ? 'dark_mode' : 'light_mode'}</span>
            </button>
            
            {/* PROFILE */}
            <div style={{ position: 'relative' }}>
              <div onClick={() => setShowProfile(!showProfile)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid var(--color-primary, rgba(173,199,255,0.3))', overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                <img alt="User" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC02c8ghdCkYh_USUdhilXU8MKrJH48lExPNvQvf1-34wmGbJZLqY0QOhOdDJ7gOFVbvYLh9lGe-IerKFA4A3Sz6C6sK7IYjqKSvudiTu96KDidVxPIbxN9tqDOLmDl2Js5CNhSkHRZl-ecODXrqbItt55vB0XEr1BiI5t4YqQZJ-z8qkiULgtMLCJvyOnHaD0QjYsrUZGJzwH7ETblNylCAHr5io0LbS4tRtalEjHClOS6wIyrfoP2o5skXzhhVfCPCA18ImkDEsHy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              {showProfile && (
                <div style={{position:'absolute', right:0, top:'40px', background:'var(--color-surface-container-high, #252b31)', border:'1px solid var(--color-outline-variant)', width:'180px', borderRadius:'8px', zIndex:999, boxShadow:'0 10px 25px rgba(0,0,0,0.5)', overflow:'hidden'}}>
                   <div style={{padding:'12px', borderBottom:'1px solid var(--color-outline-variant)'}}>
                      <p style={{fontSize:'13px', fontWeight:'bold'}}>System Admin</p>
                      <p style={{fontSize:'10px', color:'var(--color-outline)'}}>admin@bluefactory.ai</p>
                   </div>
                   <button style={{width:'100%', padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', color:'var(--color-on-surface)', fontSize:'12px', cursor:'pointer', textAlign:'left'}}>
                      <span className="ms" style={{fontSize:'16px'}}>edit</span> Edit Profile
                   </button>
                   <button style={{width:'100%', padding:'10px 12px', display:'flex', alignItems:'center', gap:'8px', background:'none', border:'none', color:'var(--color-error)', fontSize:'12px', cursor:'pointer', textAlign:'left'}}>
                      <span className="ms" style={{fontSize:'16px'}}>logout</span> Logout
                   </button>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* ── BODY ── */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ── SIDEBAR ── */}
          <aside style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'var(--color-surface-container-lowest, #0a0f14)', borderRight: '1px solid var(--color-outline-variant, rgba(255,255,255,0.08))', overflow: 'hidden' }}>
            <div style={{ padding: '16px 14px 8px' }}>
              <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '13px', color: 'var(--color-primary, #adc7ff)', margin: 0 }}>Fleet Control</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: systemState.global_estop ? 'var(--color-error)' : 'var(--color-tertiary, #52dad7)', boxShadow: '0 0 8px rgba(82,218,215,0.7)', display: 'inline-block' }}></span>
                <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: systemState.global_estop ? 'var(--color-error)' : 'var(--color-outline, rgba(193,198,215,0.5))' }}>
                   {systemState.global_estop ? 'E-STOP ACTIVE' : 'System Ready'}
                </span>
              </div>
            </div>

            <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {navItems.map(({ to, icon, label, end }) => (
                <NavLink
                  key={label}
                  to={to}
                  end={end}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '9px 12px', borderRadius: '8px', textDecoration: 'none',
                    fontSize: '12px', fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
                    transition: 'all 0.2s',
                    background: isActive ? 'linear-gradient(90deg, var(--color-primary), var(--color-primary-container))' : 'transparent',
                    color: isActive ? 'var(--color-surface)' : 'var(--color-on-surface-variant)',
                    boxShadow: isActive ? '0 0 15px rgba(173,199,255,0.2)' : 'none',
                  })}
                >
                  <span className="ms" style={{ fontSize: '18px' }}>{icon}</span>
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Emergency Stop */}
            <div style={{ padding: '12px 8px', borderTop: '1px solid var(--color-outline-variant)' }}>
              <button 
                onClick={triggerEstop}
                style={{ width: '100%', background: systemState.global_estop ? '#ffdad6' : '#93000a', color: systemState.global_estop ? '#93000a' : '#ffdad6', fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '8px', padding: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}>
                <span className="ms" style={{ fontSize: '18px', fontVariationSettings: "'FILL' 1" }}>{systemState.global_estop ? 'lock_open' : 'emergency_home'}</span>
                {systemState.global_estop ? 'Resume Operations' : 'Emergency Stop'}
              </button>
            </div>
          </aside>

          {/* ── MAIN CONTENT — SCROLLABLE ── */}
          <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', background: 'var(--color-surface, #0e141a)' }}>
            <Outlet />
          </main>
        </div>

        {/* ── FOOTER ── */}
        <footer style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', height: '32px', borderTop: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-outline)' }}>
          <span>System Online | AGV Connectivity: 100% | Last Sync: Just Now</span>
          <div style={{ display: 'flex', gap: '16px' }}>
            {['Diagnostics', 'Support', 'API'].map(t => (
              <a key={t} href="#" style={{ color: 'var(--color-outline)', textDecoration: 'none' }}>{t}</a>
            ))}
          </div>
        </footer>
      </div>
    </>
  );
}
