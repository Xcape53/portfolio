# Fabryka LabInc: izometryczna scena w stylu Satisfactory, pętla 6 s bez szwu.
# Uruchomienie: blender -b -P factory.py -- <katalog_wyjścia> [klatka|all]
import bpy, bmesh, math, random, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "//out"
MODE = argv[1] if len(argv) > 1 else "1"
random.seed(7)

FPS, T = 30, 6.0
F = int(FPS * T)          # 180 klatek na pętlę
V = 1.6                   # prędkość taśmy [j/s]
BELT_Z = 0.9

# ---------- scena ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "BLENDER_EEVEE"
sc.render.fps = FPS
sc.frame_start, sc.frame_end = 1, F
sc.render.resolution_x, sc.render.resolution_y = 1200, 900
sc.render.film_transparent = True
sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "AgX"
sc.view_settings.look = "AgX - Medium High Contrast"
ee = sc.eevee
for k, v in (("taa_render_samples", 48), ("use_raytracing", True), ("use_shadows", True), ("shadow_ray_count", 2), ("shadow_step_count", 8)):
    try: setattr(ee, k, v)
    except Exception: pass
try:
    ee.ray_tracing_options.resolution_scale = "1"
except Exception: pass

world = bpy.data.worlds.new("w"); sc.world = world; world.use_nodes = True
bg = world.node_tree.nodes["Background"]; bg.inputs[0].default_value = (0.0007, 0.0024, 0.0080, 1); bg.inputs[1].default_value = 1.0

def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1,)

# ---------- materiały ----------
def mat(name, col, rough=0.5, metal=0.0, emit=None, es=0.0, alpha=1.0, trans=0.0, coat=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = col
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if coat: b.inputs["Coat Weight"].default_value = coat
    if emit:
        b.inputs["Emission Color"].default_value = emit; b.inputs["Emission Strength"].default_value = es
    if trans:
        b.inputs["Transmission Weight"].default_value = trans; b.inputs["IOR"].default_value = 1.45
    return m

M = {
    "white": mat("paint_white", srgb("#c9ced6"), 0.42, coat=0.3),
    "grey": mat("paint_grey", srgb("#5d6573"), 0.5),
    "blue": mat("paint_blue", srgb("#2c7ffe"), 0.38, coat=0.3),
    "violet": mat("paint_violet", srgb("#642efd"), 0.4, coat=0.3),
    "dark": mat("metal_dark", srgb("#1a1e26"), 0.38, 0.85),
    "steel": mat("steel", srgb("#8a93a3"), 0.28, 1.0),
    "rubber": mat("rubber", srgb("#0d1016"), 0.8),
    "glowB": mat("glow_blue", srgb("#0b1a3a"), 0.4, emit=srgb("#2c7ffe"), es=9),
    "glowV": mat("glow_violet", srgb("#1a0b3a"), 0.4, emit=srgb("#7a4dff"), es=10),
    "glowO": mat("glow_orange", srgb("#3a1a0b"), 0.4, emit=srgb("#ff8a3a"), es=5),
    "glowC": mat("glow_cyan", srgb("#0b2a33"), 0.4, emit=srgb("#3df5e0"), es=7),
    "glass": mat("glass", srgb("#9fc4ff"), 0.06, coat=1.0),
    "hazY": mat("haz_yellow", srgb("#f2b632"), 0.5),
    "screen": mat("screen", srgb("#06122e"), 0.3, emit=srgb("#2c7ffe"), es=2.5),
    "gold": mat("gold", srgb("#ffc94a"), 0.25, 1.0),
    "rock": mat("rock", srgb("#2a2d36"), 0.9),
    "ore": mat("ore", srgb("#3b4152"), 0.75, 0.2),
}
M["glass"].node_tree.nodes["Principled BSDF"].inputs["Alpha"].default_value = 0.16
if hasattr(M["glass"], "surface_render_method"): M["glass"].surface_render_method = "BLENDED"
try: M["glass"].use_backface_culling = True
except Exception: pass

# podłoga: płyty fundamentów z fugami (Brick Texture)
fl = bpy.data.materials.new("foundation"); fl.use_nodes = True
nt = fl.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.82
br = nt.nodes.new("ShaderNodeTexBrick"); br.offset = 0; br.squash = 1
br.inputs["Color1"].default_value = srgb("#0c1630"); br.inputs["Color2"].default_value = srgb("#0a132a")
br.inputs["Mortar"].default_value = srgb("#030816"); br.inputs["Scale"].default_value = 0.25
br.inputs["Mortar Size"].default_value = 0.012; br.inputs["Brick Width"].default_value = 1.0; br.inputs["Row Height"].default_value = 1.0
tc = nt.nodes.new("ShaderNodeTexCoord"); nt.links.new(tc.outputs["Object"], br.inputs["Vector"])
nt.links.new(br.outputs["Color"], b.inputs["Base Color"])

# taśma: pasy przesuwane wartością animowaną (offset = V * t)
belt_m = bpy.data.materials.new("belt"); belt_m.use_nodes = True
nt = belt_m.node_tree; b = nt.nodes["Principled BSDF"]; b.inputs["Roughness"].default_value = 0.7
tc = nt.nodes.new("ShaderNodeTexCoord"); sep = nt.nodes.new("ShaderNodeSeparateXYZ")
off = nt.nodes.new("ShaderNodeValue"); off.name = "belt_offset"
sub = nt.nodes.new("ShaderNodeMath"); sub.operation = "SUBTRACT"
div = nt.nodes.new("ShaderNodeMath"); div.operation = "DIVIDE"; div.inputs[1].default_value = 0.4
fr = nt.nodes.new("ShaderNodeMath"); fr.operation = "FRACT"
lt = nt.nodes.new("ShaderNodeMath"); lt.operation = "LESS_THAN"; lt.inputs[1].default_value = 0.18
mix = nt.nodes.new("ShaderNodeMix"); mix.data_type = "RGBA"
mix.inputs[6].default_value = srgb("#151a24"); mix.inputs[7].default_value = srgb("#2b3346")
nt.links.new(tc.outputs["Object"], sep.inputs[0]); nt.links.new(sep.outputs[0], sub.inputs[0]); nt.links.new(off.outputs[0], sub.inputs[1])
nt.links.new(sub.outputs[0], div.inputs[0]); nt.links.new(div.outputs[0], fr.inputs[0]); nt.links.new(fr.outputs[0], lt.inputs[0])
nt.links.new(lt.outputs[0], mix.inputs[0]); nt.links.new(mix.outputs[2], b.inputs["Base Color"])
off.outputs[0].default_value = 0
off.outputs[0].keyframe_insert("default_value", frame=1)
off.outputs[0].default_value = V * T
off.outputs[0].keyframe_insert("default_value", frame=F + 1)

def linear_cycle(idb):
    ad = idb.animation_data
    if not ad or not ad.action: return
    for fc in _fcurves(ad.action):
        for kp in fc.keyframe_points: kp.interpolation = "LINEAR"
        fc.extrapolation = "LINEAR"

def _fcurves(action):
    if hasattr(action, "fcurves") and len(action.fcurves): return list(action.fcurves)
    out = []
    for layer in getattr(action, "layers", []):
        for strip in layer.strips:
            for cb in strip.channelbags: out += list(cb.fcurves)
    return out

linear_cycle(belt_m.node_tree)

# ---------- geometria ----------
col = bpy.data.collections.new("factory"); sc.collection.children.link(col)
def link(o):
    for c in o.users_collection: c.objects.unlink(o)
    col.objects.link(o); return o

def box(name, size, loc, m, bevel=0.05, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 3; md.limit_method = "ANGLE"
    o.data.materials.append(M[m] if isinstance(m, str) else m)
    return link(o)

def cyl(name, r, h, loc, m, rot=(0, 0, 0), verts=40, bevel=0.03, r2=None, fill="NGON"):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, location=loc, rotation=rot, vertices=verts, end_fill_type=fill)
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, location=loc, rotation=rot, vertices=verts, end_fill_type=fill)
    o = bpy.context.active_object; o.name = name
    for p in o.data.polygons: p.use_smooth = True
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 2; md.limit_method = "ANGLE"
    o.data.materials.append(M[m] if isinstance(m, str) else m)
    return link(o)

def torus(name, R, r, loc, m, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=loc, rotation=rot, major_segments=64, minor_segments=12)
    o = bpy.context.active_object; o.name = name
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(M[m]); return link(o)

def parent(ch, pa):
    bpy.context.view_layer.update()
    for c in ch:
        mw = c.matrix_world.copy(); c.parent = pa; c.matrix_world = mw

def spin(o, axis, turns, phase=0.0):
    idx = "XYZ".index(axis)
    r = list(o.rotation_euler); r[idx] = phase; o.rotation_euler = r; o.keyframe_insert("rotation_euler", index=idx, frame=1)
    r[idx] = phase + turns * 2 * math.pi; o.rotation_euler = r; o.keyframe_insert("rotation_euler", index=idx, frame=F + 1)
    linear_cycle(o)

def empty(name, loc):
    e = bpy.data.objects.new(name, None); e.location = loc; col.objects.link(e); return e

# podłoga
# płyta fundamentów (diorama), tło przezroczyste
# kwadratowa płyta: w rzucie izometrycznym równy romb
floor = box("foundation", (14.0, 14.0, 0.5), (2.3, 3.9, -0.25), fl, bevel=0.08)
box("foundation_trim", (14.06, 14.06, 0.06), (2.3, 3.9, -0.14), "blue", bevel=0.0)
box("foundation_under", (13.6, 13.6, 0.4), (2.3, 3.9, -0.55), "dark", bevel=0.05)

# ---------- taśmociągi ----------
def belt(a, b):
    a, b = Vector(a), Vector(b); d = b - a; L = d.length; ang = math.atan2(d.y, d.x); mid = (a + b) / 2
    parts = []
    surf = box("belt_surf", (L, 0.62, 0.06), (mid.x, mid.y, BELT_Z), belt_m, bevel=0.0, rot=(0, 0, ang)); parts.append(surf)
    for s in (-1, 1):
        ox, oy = -math.sin(ang) * 0.36 * s, math.cos(ang) * 0.36 * s
        parts.append(box("rail", (L, 0.1, 0.16), (mid.x + ox, mid.y + oy, BELT_Z + 0.02), "grey", bevel=0.02, rot=(0, 0, ang)))
        parts.append(box("rail_trim", (L, 0.04, 0.03), (mid.x + ox, mid.y + oy, BELT_Z + 0.11), "glowB", bevel=0.0, rot=(0, 0, ang)))
    parts.append(box("belt_under", (L, 0.5, 0.08), (mid.x, mid.y, BELT_Z - 0.09), "dark", bevel=0.01, rot=(0, 0, ang)))
    n = max(1, int(L // 1.6))
    for i in range(n + 1):
        p = a + d * (i / n if n else 0.5)
        if i in (0, n): p = a + d * (0.12 if i == 0 else 0.88)
        parts.append(box("leg", (0.12, 0.12, BELT_Z - 0.12), (p.x, p.y, (BELT_Z - 0.12) / 2), "dark", bevel=0.015))
        parts.append(box("foot", (0.34, 0.34, 0.06), (p.x, p.y, 0.03), "grey", bevel=0.01))
    return parts

# ---------- maszyny ----------
# koparka (Miner) na złożu
MX, MY = 0.15, 0.0
for i in range(9):
    a = i / 9 * 2 * math.pi + 0.35; r = 1.9 + random.random() * 0.4
    if abs(math.atan2(math.sin(a - math.pi / 2), math.cos(a - math.pi / 2))) < 0.5: continue   # wolne miejsce na taśmę
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.35 + random.random() * 0.3, location=(MX + math.cos(a) * r, MY + math.sin(a) * r, 0.1))
    rk = link(bpy.context.active_object); rk.scale = (1, 0.8 + random.random() * 0.4, 0.55)
    for v in rk.data.vertices: v.co *= 0.85 + random.random() * 0.3
    rk.data.materials.append(M["rock"])
for i in range(5):
    a = i / 5 * 2 * math.pi + 0.3
    box("crystal", (0.12, 0.12, 0.5 + random.random() * 0.4), (MX + math.cos(a) * 1.65, MY + math.sin(a) * 1.65, 0.25), "glowC", bevel=0.01, rot=(random.random() * 0.6, random.random() * 0.6, a))
box("miner_base", (3.0, 3.0, 0.5), (MX, MY, 0.25), "dark", 0.06)
# pasy ostrzegawcze na krawędzi podstawy
for i in range(14):
    u = -1.4 + i * 0.215
    for (x, y, rz) in ((MX + u, MY - 1.52, 0), (MX + 1.52, MY + u, math.pi / 2)):
        box("haz", (0.11, 0.04, 0.16), (x, y, 0.3), "hazY" if i % 2 == 0 else "rubber", 0.0, rot=(0, 0, rz))
# świder wchodzący w złoże + poświata
cyl("drill_bit", 0.35, 0.7, (MX - 0.15, MY, 0.55), "steel", verts=24, r2=0.08)
light_node = cyl("node_glow", 1.25, 0.02, (MX - 0.15, MY, 0.51), "glowC", verts=48, bevel=0.0)
# drabina i barierka na głowicy
for z in [2.3 + k * 0.32 for k in range(10)]:
    box("rung", (0.04, 0.42, 0.04), (MX - 0.15 - 0.92, MY - 0.75, z), "steel", 0.0)
for dy in (-0.21, 0.21):
    box("ladder_rail", (0.05, 0.05, 3.3), (MX - 0.15 - 0.92, MY - 0.75 + dy, 3.7), "grey", 0.01)
for (x, y, sx, sy) in ((0, 1.05, 2.1, 0.04), (0, -1.05, 2.1, 0.04), (1.05, 0, 0.04, 2.1), (-1.05, 0, 0.04, 2.1)):
    box("railing", (sx, sy, 0.04), (MX - 0.15 + x, MY + y, 6.15), "hazY", 0.0)
for (x, y) in ((1.05, 1.05), (-1.05, 1.05), (1.05, -1.05), (-1.05, -1.05), (0, 1.05), (1.05, 0), (0, -1.05), (-1.05, 0)):
    box("post", (0.04, 0.04, 0.42), (MX - 0.15 + x, MY + y, 5.95), "grey", 0.0)
box("miner_screen", (0.03, 0.7, 0.42), (MX + 1.01, MY - 0.55, 1.35), "screen", 0.0)
box("miner_body", (2.3, 2.1, 1.5), (MX - 0.15, MY, 1.27), "white", 0.08)
box("miner_band", (2.32, 2.12, 0.18), (MX - 0.15, MY, 1.62), "blue", 0.02)
box("miner_port", (0.8, 0.7, 0.5), (MX - 0.15, MY + 1.15, BELT_Z + 0.05), "dark", 0.04)
box("miner_port_glow", (0.6, 0.04, 0.08), (MX - 0.15, MY + 1.5, BELT_Z + 0.25), "glowB", 0.0)
for sx in (-1, 1):
    for sy in (-1, 1):
        box("miner_leg", (0.16, 0.16, 3.2), (MX - 0.15 + sx * 0.75, MY + sy * 0.75, 3.6), "grey", 0.03)
for z in (2.6, 3.6, 4.6):
    box("brace", (1.66, 0.08, 0.08), (MX - 0.15, MY + 0.75, z), "dark", 0.01)
    box("brace", (0.08, 1.66, 0.08), (MX + 0.6, MY, z), "dark", 0.01)
box("miner_head", (1.9, 1.9, 0.7), (MX - 0.15, MY, 5.4), "white", 0.08)
box("miner_head_band", (1.92, 1.92, 0.12), (MX - 0.15, MY, 5.12), "blue", 0.02)
cyl("miner_motor", 0.42, 0.5, (MX - 0.15, MY, 6.0), "dark")
drill = cyl("drill_shaft", 0.14, 4.4, (MX - 0.15, MY, 3.3), "steel", bevel=0.0, verts=24)
gear = cyl("drill_gear", 0.55, 0.22, (MX - 0.15, MY, 3.1), "steel", verts=24, bevel=0.02)
teeth = []
for i in range(12):
    a = i / 12 * 2 * math.pi
    teeth.append(box("tooth", (0.16, 0.1, 0.22), (MX - 0.15 + math.cos(a) * 0.6, MY + math.sin(a) * 0.6, 3.1), "steel", 0.01, rot=(0, 0, a)))
parent(teeth, gear); spin(gear, "Z", 3)
light_m = cyl("miner_beacon", 0.12, 0.12, (MX - 0.15 + 0.6, MY - 0.6, 5.83), "glowO", verts=16)

CX, CY = 0.0, 0.0   # wyjście z kopalni (huta połączona z kopalnią w jedną fabrykę)
# skrzynie
for (x, y, s) in ((-3.4, 6.2, 0.7), (-2.8, 6.9, 0.55), (-3.5, 7.2, 0.6), (7.6, -0.8, 0.7), (8.2, -0.2, 0.5), (4.6, 8.6, 0.6), (5.3, 9.1, 0.5)):
    box("crate", (s, s, s), (x, y, s / 2), "grey", 0.04, rot=(0, 0, random.random() * 0.4))
    box("crate_band", (s + 0.02, s * 0.2, s + 0.02), (x, y, s / 2), "blue", 0.0, rot=(0, 0, 0))

# splitter
SX, SY = 0.0, 4.4
box("split", (1.2, 1.2, 0.95), (SX, SY, BELT_Z - 0.05), "grey", 0.06)
box("split_top", (1.0, 1.0, 0.08), (SX, SY, BELT_Z + 0.45), "dark", 0.02)
box("split_arrow1", (0.4, 0.08, 0.02), (SX + 0.2, SY, BELT_Z + 0.5), "glowB", 0.0)
box("split_arrow2", (0.08, 0.4, 0.02), (SX, SY + 0.2, BELT_Z + 0.5), "glowV", 0.0)

# sprzedaż: lej jak AWESOME Sink
KX, KY = 0.0, 9.2
cyl("sink_base", 1.9, 0.5, (KX, KY, 0.25), "dark", verts=64)
cyl("sink_body", 1.45, 1.6, (KX, KY, 1.3), "white", verts=64)
cyl("sink_band", 1.47, 0.18, (KX, KY, 1.75), "violet", verts=64, bevel=0.0)
fun = cyl("sink_funnel", 1.25, 1.2, (KX, KY, 2.7), "grey", verts=64, r2=2.1, fill="NOTHING", bevel=0.0)
fun.modifiers.new("sol", "SOLIDIFY").thickness = 0.06
torus("sink_mouth", 2.1, 0.09, (KX, KY, 3.3), "dark")
vort = torus("sink_vortex", 1.5, 0.05, (KX, KY, 3.28), "glowV")
vort2 = torus("sink_vortex2", 0.95, 0.045, (KX, KY, 3.05), "glowV")
vort3 = torus("sink_vortex3", 0.5, 0.04, (KX, KY, 2.75), "glowB")
cyl("sink_core", 0.45, 0.04, (KX, KY, 2.6), "glowV", verts=48, bevel=0.0)
for i in range(4):
    a = i * math.pi / 2 + 0.4
    box("sink_vane", (0.9, 0.06, 0.04), (KX + math.cos(a) * 0.9, KY + math.sin(a) * 0.9, 2.95), "steel", 0.0, rot=(0, -0.45, a))
for i in range(6):
    a = i / 6 * 2 * math.pi
    box("sink_rib", (0.1, 0.2, 1.6), (KX + math.cos(a) * 1.47, KY + math.sin(a) * 1.47, 1.3), "dark", 0.02, rot=(0, 0, a))
box("sink_in", (0.9, 0.5, 0.6), (KX, KY - 1.55, BELT_Z + 0.05), "dark", 0.04)

# research: laboratorium z kopułą i atomem
LX, LY = 5.8, 4.4
box("lab_base", (3.2, 3.2, 0.3), (LX, LY, 0.15), "dark", 0.05)
box("lab_body", (2.8, 2.8, 1.3), (LX, LY, 0.95), "white", 0.1)
box("lab_band", (2.82, 2.82, 0.16), (LX, LY, 1.45), "blue", 0.02)
cyl("lab_ring", 1.3, 0.16, (LX, LY, 1.68), "grey", verts=64)
bpy.ops.mesh.primitive_uv_sphere_add(radius=1.2, location=(LX, LY, 1.75), segments=64, ring_count=32)
dome = link(bpy.context.active_object)
bm = bmesh.new(); bm.from_mesh(dome.data)
bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.01], context="VERTS"); bm.to_mesh(dome.data); bm.free()
for p in dome.data.polygons: p.use_smooth = True
dome.data.materials.append(M["glass"])
atom = empty("atom", (LX, LY, 2.35))
bpy.ops.mesh.primitive_uv_sphere_add(radius=0.2, location=(LX, LY, 2.35)); nuc = link(bpy.context.active_object); nuc.data.materials.append(M["glowB"])
orbs = []
for i, rot in enumerate(((1.2, 0, 0), (1.2, 0, 2.094), (1.2, 0, 4.189))):
    o = torus("orbit", 0.62, 0.018, (LX, LY, 2.35), "glowV", rot=rot)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.07, location=(LX + 0.62, LY, 2.35)); e = link(bpy.context.active_object); e.data.materials.append(M["glowB"])
    pv = empty("orb_p", (LX, LY, 2.35)); pv.rotation_euler = rot
    parent([e], pv); spin(pv, "Z", 2 + i, phase=i * 1.3)
    orbs += [o, pv]
parent(orbs, atom); spin(atom, "Z", 1)
box("lab_in", (0.5, 0.9, 0.6), (LX - 1.55, LY, BELT_Z + 0.05), "dark", 0.04)
for i in range(3):
    box("lab_led", (0.04, 0.3, 0.06), (LX + 1.41, LY - 0.6 + i * 0.6, 0.9), "glowB", 0.0)

# taśmy
belt((CX, CY + 1.8), (SX, SY - 0.6))
belt((SX, SY + 0.6), (KX, KY - 1.8))
belt((SX + 0.6, SY), (LX - 1.8, LY))

# ---------- przedmioty na taśmach ----------
N = 12; DT = T / N
def place(o, frame, loc, s):
    o.location = loc; o.scale = (s, s, s)
    o.keyframe_insert("location", frame=frame); o.keyframe_insert("scale", frame=frame)

def path_pos(pts, d):
    for a, b in zip(pts, pts[1:]):
        L = (b - a).length
        if d <= L: return a + (b - a) * (d / L)
        d -= L
    return pts[-1]
def path_len(pts): return sum((b - a).length for a, b in zip(pts, pts[1:]))

# pierwiastki: kopalnia -> splitter -> sprzedaż / research
ELS = [("H", "#5ec8ff"), ("C", "#8b95a8"), ("Fe", "#e08a4c"), ("Cu", "#d9773f"), ("Si", "#9db0c8"), ("Au", "#ffc94a"),
       ("O", "#ff6b6b"), ("Al", "#c5ccd8"), ("U", "#7dff9e"), ("Ag", "#e3e8f0"), ("N", "#6aa8ff"), ("Ne", "#ff5fa2")]
font = None
try: font = bpy.data.fonts.load("C:/Windows/Fonts/segoeuib.ttf")
except Exception: pass
ink = mat("ink", srgb("#0a0f1c"), 0.6)
common = [Vector((CX, CY + 1.0, BELT_Z + 0.36)), Vector((SX, SY, BELT_Z + 0.36))]
to_sell = common + [Vector((KX, KY - 1.0, BELT_Z + 0.36))]
to_lab = common + [Vector((LX - 1.0, LY, BELT_Z + 0.36))]
for j, (sym, hexc) in enumerate(ELS):
    em = mat("el_" + sym, srgb(hexc), 0.32, 0.6 if sym in ("Au", "Ag", "Fe", "Cu", "Al") else 0.0,
             emit=srgb(hexc) if sym in ("U", "Ne") else None, es=1.5, coat=0.5)
    cube = box("el_" + sym, (0.6, 0.6, 0.6), (0, 0, -5), em, bevel=0.07)
    cu = bpy.data.curves.new("t_" + sym, "FONT"); cu.body = sym; cu.size = 0.34; cu.align_x = "CENTER"; cu.align_y = "CENTER"; cu.extrude = 0.01
    if font: cu.font = font
    tx = bpy.data.objects.new("t_" + sym, cu); col.objects.link(tx); tx.data.materials.append(ink)
    tx.parent = cube; tx.location = (0, 0, 0.302); tx.rotation_euler = (0, 0, math.radians(45))
    pts = to_sell if j % 2 == 0 else to_lab; Lp = path_len(pts)
    for f in range(1, F + 2):
        t = ((f - 1) / FPS - j * DT) % T; d = t * V
        on = d <= Lp; p = path_pos(pts, min(d, Lp))
        edge = min(1, d / 0.3, max(0, (Lp - d) / 0.3)) if on else 0
        place(cube, f, p, edge)

# monety nad lejem: jedna na każdy sprzedany pierwiastek
Lsell = path_len(to_sell)
for j in range(0, N, 2):
    c = cyl("coin", 0.22, 0.05, (0, 0, -5), "gold", rot=(math.radians(90), 0, math.radians(45)), verts=32, bevel=0.01)
    for f in range(1, F + 2):
        t = ((f - 1) / FPS - j * DT - Lsell / V) % T
        k = t / 1.4
        if k < 1:
            place(c, f, (KX, KY, 3.4 + k * 1.6), math.sin(min(1, k * 1.2) * math.pi) ** 0.6)
        else:
            place(c, f, (KX, KY, 3.4), 0)
    spin(c, "Z", 3)
spin(vort, "Z", 2); spin(vort2, "Z", -3); spin(vort3, "Z", 4)
for o in [o for o in col.objects if o.name.startswith("sink_vane")]:
    pv = empty("vane_p", (KX, KY, 2.95)); parent([o], pv); spin(pv, "Z", -2)

for o in col.objects:
    if o.animation_data and o.animation_data.action and o.name.startswith(("el_", "ore", "Ico", "coin")):
        for fc in _fcurves(o.animation_data.action):
            for kp in fc.keyframe_points: kp.interpolation = "LINEAR"

# ---------- światło ----------
def light(kind, loc, energy, color, size=1.0, rot=None):
    ld = bpy.data.lights.new(kind, kind); ld.energy = energy; ld.color = color
    if kind == "AREA": ld.size = size
    if kind == "SUN": ld.angle = math.radians(size)
    lo = bpy.data.objects.new(kind, ld); lo.location = loc; col.objects.link(lo)
    if rot: lo.rotation_euler = rot
    return lo

light("SUN", (0, 0, 10), 2.6, (1.0, 0.95, 0.9), size=3, rot=(math.radians(40), math.radians(-25), math.radians(-30)))
light("AREA", (-6, 10, 9), 900, (0.45, 0.6, 1.0), size=10, rot=(math.radians(-35), math.radians(-30), 0))
light("AREA", (10, -6, 7), 600, (0.55, 0.35, 1.0), size=8, rot=(math.radians(50), math.radians(30), 0))
for p, e, c in (((LX, LY, 2.4), 150, (0.3, 0.55, 1.0)), ((KX, KY, 3.6), 160, (0.5, 0.3, 1.0)), ((MX, MY - 1.8, 0.8), 90, (0.3, 1.0, 0.9))):
    light("POINT", p, e, c).data.shadow_soft_size = 0.4

# ---------- kamera izometryczna ----------
cd = bpy.data.cameras.new("cam"); cd.type = "ORTHO"; cd.ortho_scale = 21.0
cam = bpy.data.objects.new("cam", cd); col.objects.link(cam); sc.camera = cam
tgt = Vector((2.3, 3.9, 1.3))
cam.rotation_euler = (math.radians(54.7356), 0, math.radians(45))
dirv = Vector((0, 0, 1)); dirv.rotate(cam.rotation_euler)
cam.location = tgt + dirv * 40

sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGBA"
sc.render.filepath = OUT.rstrip("/\\") + "/f_"
if MODE == "all":
    bpy.ops.render.render(animation=True)
elif MODE != "none":
    for fr_ in [int(x) for x in MODE.split(",")]:
        sc.frame_set(fr_); sc.render.filepath = OUT.rstrip("/\\") + "/test_%03d.png" % fr_
        bpy.ops.render.render(write_still=True)
print("DONE")
