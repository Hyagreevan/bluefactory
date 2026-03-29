from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import asyncio
import json
import math
import heapq

app = FastAPI()

# Dynamic Zones Dictionary
ZONES = {}

fleet = []

obstacles = []

# --- CRASH-PROOF A* PATHFINDING ---
def calculate_path(start_x, start_y, goal_x, goal_y, extra_obstacles=None):
    start, goal = (round(start_x), round(start_y)), (round(goal_x), round(goal_y))
    if extra_obstacles is None: extra_obstacles = []
    def heuristic(a, b): return math.hypot(a[0]-b[0], a[1]-b[1])
    
    oheap = []
    heapq.heappush(oheap, (0, start))
    came_from = {}
    gscore = {start: 0}
    
    iterations = 0 # SAFETY BREAKER: Prevents infinite loops!

    while oheap and iterations < 1000:
        iterations += 1
        current = heapq.heappop(oheap)[1]
        
        # If we are within 5% of the target, snap to it!
        if heuristic(current, goal) <= 5:
            path = [goal]
            while current in came_from:
                path.append(current)
                current = came_from[current]
            return path[::-1]

        # Scan 8 directions (Up, Down, Diagonals)
        for dx, dy in [(0,4), (0,-4), (4,0), (-4,0), (4,4), (-4,-4), (4,-4), (-4,4)]:
            neighbor = (current[0]+dx, current[1]+dy)
            if 0 <= neighbor[0] <= 100 and 0 <= neighbor[1] <= 100:
                
                # Check Hazards
                hit_obstacle = False
                for obs in obstacles:
                    if math.hypot(neighbor[0]-obs['x'], neighbor[1]-obs['y']) < 8:
                        hit_obstacle = True; break
                
                # Check other moving AGVs
                for e_obs in extra_obstacles:
                    if math.hypot(neighbor[0]-e_obs['x'], neighbor[1]-e_obs['y']) < 8:
                        hit_obstacle = True; break
                        
                if hit_obstacle: continue

                tentative_g = gscore[current] + math.hypot(dx,dy)
                if neighbor not in gscore or tentative_g < gscore[neighbor]:
                    came_from[neighbor] = current
                    gscore[neighbor] = tentative_g
                    fscore = tentative_g + heuristic(neighbor, goal)
                    heapq.heappush(oheap, (fscore, neighbor))
                    
    return [] # Return empty if totally trapped

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    async def receive_commands():
        while True:
            try:
                data = await websocket.receive_text()
                message = json.loads(data)
                msg_type = message.get("type")
                
                # 1. Execute Mission
                if msg_type == "quick_command":
                    agv_id, zone_id, load = message.get("agv_id"), message.get("zone_id"), int(message.get("load_kg", 0))
                    target_agv = next((agv for agv in fleet if agv["id"] == agv_id), None)
                    target_pos = ZONES.get(zone_id)

                    if target_agv and target_pos:
                        target_agv["target_x"], target_agv["target_y"], target_agv["target_zone"] = target_pos["x"], target_pos["y"], zone_id
                        target_agv["load_kg"] = load
                        target_agv["status"] = "CALCULATING..."
                        target_agv["path"] = calculate_path(target_agv["x"], target_agv["y"], target_pos["x"], target_pos["y"])
                        target_agv["status"] = "EN ROUTE"
                
                # 2. Editor Commands
                elif msg_type == "add_zone":
                    ZONES[message.get("name")] = {"x": message.get("x"), "y": message.get("y")}
                    
                elif msg_type == "move_zone":
                    z_name = message.get("name")
                    if z_name in ZONES:
                        ZONES[z_name] = {"x": message.get("x"), "y": message.get("y")}
                        # Recalculate if a zone moved while routing!
                        for agv in fleet:
                            if agv["target_zone"] == z_name and agv["status"] == "EN ROUTE":
                                agv["target_x"], agv["target_y"] = message.get("x"), message.get("y")
                                agv["path"] = calculate_path(agv["x"], agv["y"], agv["target_x"], agv["target_y"])
                        
                elif msg_type == "add_agv":
                    colors = ["#3b82f6", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#00ffcc", "#ff00ff"]
                    new_color = colors[len(fleet) % len(colors)]
                    fleet.append({
                        "id": message.get("name"), "x": message.get("x"), "y": message.get("y"),
                        "target_x": message.get("x"), "target_y": message.get("y"), "target_zone": "Idle",
                        "battery": 100.0, "color": new_color, "motor_temp": 45.0, "status": "IDLE",
                        "path": [], "load_kg": 0, "speed_kmh": 0
                    })
                    
                elif msg_type == "add_obstacle":
                    obstacles.append({"x": message.get("x"), "y": message.get("y")})
                    for agv in fleet:
                        if agv["status"] in ["EN ROUTE", "REROUTING"]:
                            agv["path"] = calculate_path(agv["x"], agv["y"], agv["target_x"], agv["target_y"])
                            
                elif msg_type == "remove_item":
                    x, y = message.get("x"), message.get("y")
                    removed = False
                    for obs in obstacles:
                        if math.hypot(obs['x'] - x, obs['y'] - y) < 6:
                            obstacles.remove(obs)
                            removed = True; break
                    if not removed:
                        to_delete = None
                        for z_name, z_pos in ZONES.items():
                            if math.hypot(z_pos['x'] - x, z_pos['y'] - y) < 6:
                                to_delete = z_name; break
                        if to_delete: 
                            del ZONES[to_delete]
                            removed = True
                    if not removed:
                        for agv in fleet:
                            if math.hypot(agv['x'] - x, agv['y'] - y) < 6:
                                fleet.remove(agv); break

            except WebSocketDisconnect:
                print("React Disconnected!")
                break
            except Exception as e:
                print(f"Receiver Error: {e}")

    async def send_updates():
        while True:
            try:
                for i, agv in enumerate(fleet):
                    agv["speed_kmh"] = max(2.0, 15.0 - (agv["load_kg"] * 0.01)) 
                    map_speed = agv["speed_kmh"] * 0.06 
                    
                    if len(agv["path"]) == 0 and ("charg" in agv["target_zone"].lower() or "power" in agv["target_zone"].lower()):
                        agv["status"] = "CHARGING"
                        agv["battery"] = min(100.0, agv["battery"] + 0.6) 
                        agv["motor_temp"] = max(45.0, agv["motor_temp"] - 0.5) 
                    
                    if len(agv["path"]) > 0:
                        next_wpt = agv["path"][0]
                        dx, dy = next_wpt[0] - agv["x"], next_wpt[1] - agv["y"]
                        dist = math.hypot(dx, dy)
                        
                        next_x = agv["x"] + (dx / dist) * map_speed if dist > map_speed else next_wpt[0]
                        next_y = agv["y"] + (dy / dist) * map_speed if dist > map_speed else next_wpt[1]

                        collision_detected = False
                        for j, other_agv in enumerate(fleet):
                            if i != j and len(other_agv["path"]) > 0: 
                                if math.hypot(next_x - other_agv["x"], next_y - other_agv["y"]) < 6.0: 
                                    
                                    # FIX: The Tie-Breaker! If loads are equal, lowest ID yields.
                                    if agv["load_kg"] < other_agv["load_kg"] or (agv["load_kg"] == other_agv["load_kg"] and agv["id"] > other_agv["id"]):
                                        collision_detected = True
                                        agv["status"] = "REROUTING"
                                        agv["path"] = calculate_path(agv["x"], agv["y"], agv["target_x"], agv["target_y"], extra_obstacles=[other_agv])
                                    break

                        if not collision_detected:
                            agv["x"], agv["y"] = next_x, next_y
                            if agv["status"] == "REROUTING": agv["status"] = "EN ROUTE" 
                            if dist <= map_speed: agv["path"].pop(0)
                                
                            agv["battery"] = max(0.0, agv["battery"] - (0.01 + (agv["load_kg"] * 0.00005)))
                            agv["motor_temp"] = min(120.0, agv["motor_temp"] + (0.05 + (agv["load_kg"] * 0.0005)))
                            
                            if agv["battery"] < 15.0 and "charg" not in agv["target_zone"].lower() and "power" not in agv["target_zone"].lower():
                                charge_zones = [z for z in ZONES.keys() if "charg" in z.lower() or "power" in z.lower()]
                                if charge_zones:
                                    best_zone = charge_zones[0] 
                                    agv["target_x"], agv["target_y"], agv["target_zone"] = ZONES[best_zone]["x"], ZONES[best_zone]["y"], best_zone
                                    agv["path"] = calculate_path(agv["x"], agv["y"], agv["target_x"], agv["target_y"])
                                    agv["status"] = "LOW BATT - RETURNING"
                    else:
                        if agv["status"] != "CHARGING":
                            agv["status"] = "IDLE"
                            agv["motor_temp"] = max(45.0, agv["motor_temp"] - 0.1)
                            
                    if agv["motor_temp"] > 90: agv["status"] = "OVERHEATING"

                await websocket.send_text(json.dumps({"fleet": fleet, "obstacles": obstacles, "zones": ZONES}))
                await asyncio.sleep(0.05) 
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                print(f"Sender Error: {e}")
                await asyncio.sleep(1) # Prevent tight crash loops

    await asyncio.gather(receive_commands(), send_updates())