import re

filepath = r'c:\Users\hyagr\OneDrive\Documents\hyagreevan stitch edited bonfiglioli\BlueFactory-Copilot-main\BlueFactory-Copilot-main\backend\main.py'
with open(filepath, 'r', encoding='utf-8') as f:
    orig = f.read()

# Refactor the main.py websocket events completely to fix routing bugs.

# Replace add_agv and below
new_handlers = """elif msg_type == "add_agv":
                    colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#00ffcc", "#ff00ff"]
                    new_color = colors[len(fleet) % len(colors)]
                    fleet.append({
                        "id": message.get("name"), "x": message.get("x"), "y": message.get("y"),
                        "target_x": message.get("x"), "target_y": message.get("y"), "target_zone": "Idle",
                        "battery": 100.0, "color": new_color, "motor_temp": 45.0, "status": "IDLE",
                        "path": [], "load_kg": message.get("load_kg", 0), "speed_kmh": 0,
                        "model": message.get("model", "BR-Basic-060"),
                        "mission_queue": [], "current_leg": None
                    })
                    
                elif msg_type == "remove_agv":
                    agv_id = message.get("agv_id")
                    for a in fleet:
                        if a["id"] == agv_id:
                            fleet.remove(a)
                            break
                            
                elif msg_type == "edit_agv":
                    agv_id = message.get("agv_id")
                    for a in fleet:
                        if a["id"] == agv_id:
                            if "new_name" in message and message["new_name"]: a["id"] = message.get("new_name")
                            if "load_kg" in message: a["load_kg"] = message.get("load_kg")
                            if "x" in message: a["x"], a["target_x"] = message.get("x"), message.get("x")
                            if "y" in message: a["y"], a["target_y"] = message.get("y"), message.get("y")
                            a["target_zone"] = "Idle"
                            a["path"] = []
                            a["mission_queue"] = []
                            a["status"] = "IDLE"
                            
                elif msg_type == "multi_leg_mission":
                    agv_id = message.get("agv_id")
                    pickup = message.get("pickup_zone")
                    drop = message.get("drop_zone")
                    load = message.get("load_kg", 0)
                    for a in fleet:
                        if a["id"] == agv_id:
                            a["mission_queue"] = [
                                {"type": "PICKUP", "zone": pickup, "load": load},
                                {"type": "DROP", "zone": drop, "load": 0}
                            ]
                            a["status"] = "ASSIGNED"
                            a["path"] = []"""

orig = re.sub(r'elif msg_type == "add_agv":.*?fleet\.append\(\{.*?\}\)', new_handlers, orig, flags=re.DOTALL)

# Refactor the send loop
queue_logic = """
                    if len(agv.get("path", [])) == 0 and ("charg" in agv["target_zone"].lower() or "power" in agv["target_zone"].lower()):
                        agv["status"] = "CHARGING"
                        agv["battery"] = min(100.0, agv.get("battery", 100) + 0.6) 
                        agv["motor_temp"] = max(45.0, agv.get("motor_temp", 45) - 0.5) 
                        
                    # Queue logic
                    elif len(agv.get("path", [])) == 0 and len(agv.get("mission_queue", [])) > 0:
                        leg = agv["mission_queue"].pop(0)
                        agv["current_leg"] = leg
                        z = ZONES.get(leg["zone"])
                        if z:
                            agv["target_x"], agv["target_y"], agv["target_zone"] = z["x"], z["y"], leg["zone"]
                            agv["path"] = calculate_path(agv["x"], agv["y"], agv["target_x"], agv["target_y"])
                            agv["status"] = "IN TRANSIT"
                    
                    elif len(agv.get("path", [])) == 0 and agv.get("status") in ["IN TRANSIT", "REROUTING"]:
                        leg = agv.get("current_leg")
                        if leg and leg["type"] == "PICKUP":
                            agv["status"] = "LOADING..."
                            agv["load_kg"] = leg["load"]
                            agv["current_leg"] = None
                        elif leg and leg["type"] == "DROP":
                            agv["status"] = "IDLE"
                            agv["load_kg"] = 0
                            agv["current_leg"] = None
                            agv["target_zone"] = "Idle"
                        else:
                            agv["status"] = "IDLE"
                            agv["target_zone"] = "Idle"

                    if len(agv.get("path", [])) > 0:"""

orig = re.sub(r'if len\(agv.get\("path", \[\]\)\) == 0 and \("charg".*?if len\(agv.get\("path", \[\]\)\) > 0:', queue_logic, orig, flags=re.DOTALL)
orig = orig.replace('if len(agv["path"]) == 0 and ("charg"', 'if len(agv.get("path", [])) == 0 and ("charg"')
orig = orig.replace('if len(agv["path"]) > 0:', 'if len(agv.get("path", [])) > 0:')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(orig)

print("backend patched!")
