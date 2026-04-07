import json
import os
import urllib.request
import re

# Load JSON
json_path = r"C:/Users/hyagr/.gemini/antigravity/brain/6e10bf31-58ed-4166-ac51-7c816b278572/.system_generated/steps/40/output.txt"
with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

screens = data["screens"]

pages_dir = "src/pages"
components_dir = "src/components"
os.makedirs(pages_dir, exist_ok=True)
os.makedirs(components_dir, exist_ok=True)

def to_camel_case(name):
    """Convert kebab-case CSS property to camelCase."""
    parts = name.split('-')
    return parts[0] + ''.join(p.capitalize() for p in parts[1:])

def style_attr_to_jsx(match):
    """Convert style="..." to style={{ ... }} with camelCase keys."""
    raw = match.group(1)
    props = []
    for decl in raw.split(';'):
        decl = decl.strip()
        if ':' not in decl:
            continue
        key, _, val = decl.partition(':')
        key = key.strip()
        val = val.strip()
        camel_key = to_camel_case(key)
        # Escape inner single quotes for JS string
        val_escaped = val.replace("'", "\\'")
        props.append(f"'{camel_key}': '{val_escaped}'")
    if not props:
        return 'style={{}}'
    return 'style={{' + ', '.join(props) + '}}'

def html_to_jsx(html):
    """Convert raw HTML snippet to valid JSX."""
    # class -> className, for -> htmlFor
    html = html.replace('class="', 'className="')
    html = html.replace('for="', 'htmlFor="')

    # HTML comments -> JSX comments
    html = html.replace('<!--', '{/*')
    html = html.replace('-->', '*/}')

    # Self-closing void elements — strip any existing trailing slash first, then add proper one
    def make_self_closing(m):
        tag = m.group(1)
        attrs = m.group(2).rstrip().rstrip('/')
        return f'<{tag}{attrs} />'

    html = re.sub(r'<(img|input|br|hr|source|link|meta|area|col|embed|param|track|wbr)([^>]*?)/?>', make_self_closing, html)

    # Convert inline styles to camelCase JSX style objects
    html = re.sub(r'style="([^"]*)"', style_attr_to_jsx, html)

    # SVG attribute fixes: viewbox -> viewBox, stroke-width -> strokeWidth etc. inside tags
    def fix_svg_attrs(m):
        tag = m.group(1)
        attrs = m.group(2)
        # Convert kebab-case attributes to camelCase (svg-specific)
        attrs = re.sub(r'\b(stroke|fill|font|clip|color|marker|paint|pointer|shape|stop|text|vector|word|writing)-(\w)', lambda x: x.group(1) + x.group(2).upper(), attrs)
        # Fix specific known attrs
        attrs = attrs.replace('viewbox=', 'viewBox=')
        attrs = attrs.replace('preserveaspectratio=', 'preserveAspectRatio=')
        attrs = attrs.replace('xlink:href=', 'xlinkHref=')
        return f'<{tag}{attrs}>'

    html = re.sub(r'<(svg|path|circle|rect|line|polyline|polygon|g|use|defs|marker|symbol|text|tspan)([^>]*?)>', fix_svg_attrs, html)

    return html


for screen in screens:
    title = screen["title"]
    comp_name = "".join(x.capitalize() for x in title.replace("&", "").split())
    url = screen["htmlCode"]["downloadUrl"]

    print(f"Downloading {title}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')

    # Extract <main> content only
    main_match = re.search(r'<main[^>]*>([\s\S]*?)</main>', html)
    if not main_match:
        print(f"  No <main> tag found for {title}, skipping.")
        continue

    main_content = main_match.group(0)
    jsx_content = html_to_jsx(main_content)

    comp_code = f"""import React from 'react';

export default function {comp_name}() {{
    return (
        {jsx_content}
    );
}}
"""
    out_path = os.path.join(pages_dir, f"{comp_name}.jsx")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(comp_code)
    print(f"  -> Wrote {out_path}")

print("\nDone! All screens extracted.")
