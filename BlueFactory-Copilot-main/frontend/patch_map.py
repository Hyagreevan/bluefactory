import re
import sys

def patch_map_page():
    with open('src/pages/MapPage.jsx', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. Update imports
    old_import = "import React, { useEffect, useRef, useState } from 'react';"
    if old_import not in text:
        old_import = "import React, { useEffect, useState, useRef } from 'react';"
    
    # Just safely prepend LiveMapComponent if it's not already there
    if "LiveMapComponent" not in text:
        text = text.replace(old_import, f"{old_import}\nimport LiveMapComponent from '../components/LiveMapComponent';")
    
    # 2. Update mapClick function to take x,y instead of event
    old_click_start = "  const handleMapClick = (e) => {"
    old_click_inner = "    if (!mapRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;\n    const rect = mapRef.current.getBoundingClientRect();\n    const x = ((e.clientX - rect.left) / rect.width) * 100;\n    const y = ((e.clientY - rect.top) / rect.height) * 100;"
    
    if old_click_start in text:
        text = text.replace(old_click_start, "  const handleMapClick = (x, y) => {")
        text = text.replace(old_click_inner, "    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;")
    
    # 3. Target exactly lines 94 through 165 and replace them.
    # Searching for the div block
    pattern_map = r'(<!-- Map canvas -->.*?<div[\s\S]*?ref=\{mapRef\}[\s\S]*?onClick=\{handleMapClick\}[\s\S]*?)(</div>\s*</div>\s*\{/\*\s*── RIGHT PANEL)'
    if not re.search(pattern_map, text):
        pattern_map = r'(<div[^>]*ref=\{mapRef\}[\s\S]*?>\s*\{/\* SVG routes layer \*\/\}[\s\S]*?)(</div>\s*</div>\s*\{/\* ── RIGHT PANEL)'
    
    replacement = r'''      <LiveMapComponent
        fleet={fleet}
        zones={zones}
        obstacles={obstacles}
        layer={layer}
        editTool={editTool}
        newZoneName={newZoneName}
        newAgvName={newAgvName}
        agvCounter={agvCounter}
        onMapClick={handleMapClick}
        showZoomControls={true}
      />\n    \g<2>'''
    
    text = re.sub(pattern_map, replacement, text, flags=re.IGNORECASE)

    with open('src/pages/MapPage.jsx', 'w', encoding='utf-8') as f:
        f.write(text)

patch_map_page()
print("MapPage patched successfully.")
