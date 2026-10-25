# Radioteleskop SeeSky (3 m): model do GLB z osiami "az" i "el" do obracania w przeglądarce.
# Uruchomienie: blender -b -P dish.py -- <plik.glb> [podgląd.png]
import bpy, bmesh, math, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "//dish.glb"
PREVIEW = argv[1] if len(argv) > 1 else None

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene

def srgb(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple(((x / 12.92) if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4) for x in c) + (1,)

def mat(name, col, rough=0.5, metal=0.0, emit=None, es=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = col; b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    if emit: b.inputs["Emission Color"].default_value = emit; b.inputs["Emission Strength"].default_value = es
    return m

M = {"dish": mat("dish_white", srgb("#dfe4ec"), 0.42), "back": mat("dish_back", srgb("#9aa4b4"), 0.5, 0.3),
     "steel": mat("steel", srgb("#8c96a6"), 0.32, 0.9), "dark": mat("dark_paint", srgb("#2a313d"), 0.45, 0.5),
     "conc": mat("concrete", srgb("#3a404b"), 0.9), "feed": mat("feed", srgb("#c9ced6"), 0.35, 0.6),
     "led": mat("led", srgb("#3a0b18"), 0.4, emit=srgb("#ff3d7f"), es=6), "rim": mat("rim", srgb("#c3cad5"), 0.35, 0.7)}

def obj(name, mesh_fn, m, parent=None, loc=(0, 0, 0), rot=(0, 0, 0), smooth=True, bevel=0.0):
    mesh_fn(); o = bpy.context.active_object; o.name = name
    o.location = loc; o.rotation_euler = rot
    if smooth:
        for p in o.data.polygons: p.use_smooth = True
    if bevel:
        md = o.modifiers.new("bv", "BEVEL"); md.width = bevel; md.segments = 2; md.limit_method = "ANGLE"
    o.data.materials.append(M[m])
    if parent: o.parent = parent
    return o

def empty(name, loc, parent=None):
    e = bpy.data.objects.new(name, None); e.location = loc; sc.collection.objects.link(e)
    if parent: e.parent = parent
    return e

def strut(name, a, b, r, m, parent):
    a, b = Vector(a), Vector(b); d = b - a
    o = obj(name, lambda: bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=d.length, vertices=12), m, parent, loc=(a + b) / 2)
    o.rotation_mode = "QUATERNION"; o.rotation_quaternion = Vector((0, 0, 1)).rotation_difference(d.normalized())
    return o

# ---------- podstawa (nieruchoma) ----------
obj("pad", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=1.25, depth=0.3, vertices=64), "conc", loc=(0, 0, 0.15), bevel=0.03)
obj("pedestal", lambda: bpy.ops.mesh.primitive_cone_add(radius1=0.42, radius2=0.26, depth=2.3, vertices=48), "dark", loc=(0, 0, 1.45), bevel=0.02)
obj("flange", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.5, depth=0.08, vertices=48), "steel", loc=(0, 0, 0.34))
for i in range(8):
    a = i / 8 * math.tau
    obj("bolt", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.03, depth=0.06, vertices=10), "steel", loc=(math.cos(a) * 0.43, math.sin(a) * 0.43, 0.4))

# ---------- oś azymutu ----------
AZ_Z = 2.62
az = empty("az", (0, 0, AZ_Z))
obj("turntable", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.48, depth=0.16, vertices=64), "steel", az, loc=(0, 0, 0), bevel=0.02)
obj("ring_gear", lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.48, minor_radius=0.035, major_segments=64, minor_segments=8), "dark", az, loc=(0, 0, -0.06))
obj("yoke_base", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "dark", az, loc=(0, 0, 0.16), bevel=0.03).scale = (0.42, 1.25, 0.16)
for s in (-1, 1):
    arm = obj("yoke_arm", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "dark", az, loc=(0, s * 0.56, 0.62), bevel=0.03); arm.scale = (0.3, 0.12, 0.92)
    obj("bearing", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.16, vertices=32), "steel", az, loc=(0, s * 0.56, 1.0), rot=(math.pi / 2, 0, 0), bevel=0.02)
obj("motor_az", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "steel", az, loc=(-0.28, 0, 0.3), bevel=0.02).scale = (0.18, 0.22, 0.18)
obj("status_led", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "led", az, loc=(-0.375, 0, 0.32)).scale = (0.01, 0.05, 0.02)

# ---------- oś elewacji (czasza patrzy w +Z przy el = 0 w Blenderze, czyli w górę) ----------
el = empty("el", (0, 0, 1.0), az)
obj("axle", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.07, depth=1.3, vertices=24), "steel", el, rot=(math.pi / 2, 0, 0))
obj("hub", lambda: bpy.ops.mesh.primitive_cylinder_add(radius=0.26, depth=0.34, vertices=40), "back", el, loc=(0, 0, 0.12), bevel=0.02)

R, F, DEPTH0 = 1.5, 0.9, 0.32       # promień 1,5 m (średnica 3 m), ogniskowa, wysokość wierzchołka nad osią
prof = [Vector((R * i / 40, 0, (R * i / 40) ** 2 / (4 * F))) for i in range(41)]
bm = bmesh.new()
verts = [bm.verts.new(p) for p in prof]
for a, b in zip(verts, verts[1:]): bm.edges.new((a, b))
bmesh.ops.spin(bm, geom=bm.verts[:] + bm.edges[:], cent=(0, 0, 0), axis=(0, 0, 1), steps=96, angle=math.tau)
bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
me = bpy.data.meshes.new("reflector"); bm.to_mesh(me); bm.free()
refl = bpy.data.objects.new("reflector", me); sc.collection.objects.link(refl); refl.parent = el; refl.location = (0, 0, DEPTH0)
for p in me.polygons: p.use_smooth = True
sol = refl.modifiers.new("sol", "SOLIDIFY"); sol.thickness = 0.025; sol.offset = -1
me.materials.append(M["dish"]); me.materials.append(M["back"]); sol.material_offset = 1
RIM_Z = DEPTH0 + R * R / (4 * F)
obj("rim", lambda: bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.022, major_segments=96, minor_segments=10), "rim", el, loc=(0, 0, RIM_Z))
# szwy paneli na powierzchni (16 promieni) i pierścień
for i in range(16):
    a = i / 16 * math.tau
    pts = [Vector((math.cos(a) * r, math.sin(a) * r, DEPTH0 + r * r / (4 * F) + 0.004)) for r in (0.32, 0.75, 1.15, 1.48)]
    for p0, p1 in zip(pts, pts[1:]): strut("seam", p0, p1, 0.006, "back", el)
obj("seam_ring", lambda: bpy.ops.mesh.primitive_torus_add(major_radius=0.85, minor_radius=0.006, major_segments=96, minor_segments=6), "back", el, loc=(0, 0, DEPTH0 + 0.85 ** 2 / (4 * F) + 0.004))
# kratownica z tyłu: żebra biegną pod powierzchnią, wzdłuż krzywizny
surf = lambda r: DEPTH0 + r * r / (4 * F)
for i in range(12):
    a = i / 12 * math.tau
    rs = [0.24, 0.55, 0.9, 1.2, R * 0.97]
    pts = [(math.cos(a) * r, math.sin(a) * r, surf(r) - 0.05 - 0.05 * (1 - r / R)) for r in rs]
    pts[0] = (math.cos(a) * 0.24, math.sin(a) * 0.24, 0.12)
    for p0, p1 in zip(pts, pts[1:]): strut("rib", p0, p1, 0.016, "steel", el)
for rr in (0.55, 1.05):
    obj("hoop", lambda: bpy.ops.mesh.primitive_torus_add(major_radius=rr, minor_radius=0.012, major_segments=64, minor_segments=6), "steel", el, loc=(0, 0, surf(rr) - 0.07))
# czteronożny wspornik i tuba zasilająca w ognisku
FZ = DEPTH0 + F
for i in range(4):
    a = i / 4 * math.tau + math.pi / 4
    strut("leg", (math.cos(a) * R * 0.94, math.sin(a) * R * 0.94, RIM_Z - 0.02), (math.cos(a) * 0.08, math.sin(a) * 0.08, FZ + 0.02), 0.016, "steel", el)
obj("feed_box", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "feed", el, loc=(0, 0, FZ + 0.12), bevel=0.01).scale = (0.16, 0.16, 0.18)
obj("feed_horn", lambda: bpy.ops.mesh.primitive_cone_add(radius1=0.06, radius2=0.12, depth=0.16, vertices=32, end_fill_type="NOTHING"), "feed", el, loc=(0, 0, FZ - 0.04), rot=(math.pi, 0, 0))
# przeciwwaga za osią
strut("cw_arm", (0, 0, 0), (0, 0, -0.7), 0.04, "dark", el)
obj("counterweight", lambda: bpy.ops.mesh.primitive_cube_add(size=1), "dark", el, loc=(0, 0, -0.78), bevel=0.02).scale = (0.36, 0.5, 0.18)

for o in sc.objects:
    o.select_set(o.type == "MESH" or o.type == "EMPTY")
bpy.ops.export_scene.gltf(filepath=OUT, export_format="GLB", export_apply=True, export_yup=True, use_selection=False)

if PREVIEW:
    el.rotation_euler = (math.radians(50), 0, 0); az.rotation_euler = (0, 0, math.radians(-20))
    sc.render.engine = "BLENDER_EEVEE"; sc.render.resolution_x = 900; sc.render.resolution_y = 900; sc.render.film_transparent = True
    w = bpy.data.worlds.new("w"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[0].default_value = (0.25, 0.3, 0.45, 1)
    ld = bpy.data.lights.new("sun", "SUN"); ld.energy = 5; lo = bpy.data.objects.new("sun", ld); lo.rotation_euler = (0.7, 0.2, 0.8); sc.collection.objects.link(lo)
    cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = (6.5, -6.5, 4.2); d = Vector((0, 0, 2.6)) - cam.location; cam.rotation_euler = d.to_track_quat("-Z", "Y").to_euler(); cd.lens = 50
    sc.render.filepath = PREVIEW; bpy.ops.render.render(write_still=True)
print("DONE")
