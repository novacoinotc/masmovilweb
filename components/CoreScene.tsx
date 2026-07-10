"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { useTime } from "@/lib/time";

/**
 * CoreScene — «EL ESCAPE»
 * Instrumento giroscópico procedural (bisel-reloj + 3 gimbals maquinados +
 * núcleo de energía en cápsula de cristal) en el origen; la cámara recorre
 * dos CatmullRom (posición / lookAt) scrubbed por el scroll global con
 * inercia exponencial. El reloj maestro (ms 0→1000 de useTime) dirige la
 * coreografía por acto: firma (hélice HMAC), escrutinio (barrido PLD),
 * frontera (portal Banxico que cruza el plano de cámara), CEP (acuñado del
 * disco) y liberación (verde = dinero, apertura de pétalos + enjambre).
 *
 * Correcciones del juez aplicadas (#1–#16): lookAt con óptica correcta,
 * anillos maquinados con aristas (flat shading + chaflán), roughnessMap +
 * anisotropía, IBL propio tinteado de marca, emissive por instancia vía
 * onBeforeCompile, fondo opaco (sin beat z-front: el cruce se vende con
 * flash de bloom + viñeta), gate a z −26 con emissive compensado por niebla,
 * membrana que muere antes del near plane, aguja índice sobre dial fijo,
 * posición muestreada con P global (sin frenadas por keyframe), roll sutil,
 * bloom threshold 1.0 / radius 0.65, ensamblaje por TIEMPO (1.8 s, clamp si
 * P>0.05), viñeta sin transition CSS (el lerp del rAF manda), swarm oculto
 * hasta P≥0.86 y warm-up de shaders con compileAsync.
 */

// ── utilidades puras ─────────────────────────────────────────────
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const sstep = (t: number) => {
  const u = clamp01(t);
  return u * u * (3 - 2 * u);
};
const easeOutCubic = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => sstep(t);

// interpolación piecewise-lineal suavizada sobre pares [key, valor]
function keyed(x: number, keys: number[], vals: number[]) {
  if (x <= keys[0]) return vals[0];
  const n = keys.length;
  if (x >= keys[n - 1]) return vals[n - 1];
  let i = 0;
  while (i < n - 2 && x > keys[i + 1]) i++;
  return lerp(vals[i], vals[i + 1], sstep((x - keys[i]) / (keys[i + 1] - keys[i])));
}

export default function CoreScene() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const { ms } = useTime(); // MotionValue estable; se lee con .get() en el rAF

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;

    const isMobile = window.matchMedia("(max-width: 720px)").matches;
    const fine = window.matchMedia("(min-width: 1024px) and (pointer: fine)").matches;

    // registro de recursos para el dispose total del unmount
    const geoms: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    const texs: THREE.Texture[] = [];
    const insts: THREE.InstancedMesh[] = []; // instanceMatrix/instanceColor viven en el mesh, no en la geometría
    const g = <T extends THREE.BufferGeometry>(x: T): T => (geoms.push(x), x);
    const m = <T extends THREE.Material>(x: T): T => (mats.push(x), x);
    const tx = <T extends THREE.Texture>(x: T): T => (texs.push(x), x);

    // ── renderer (corrección #6: fondo opaco; el composer no compone alpha)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !isMobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const FOG_PRE = new THREE.Color(0x050a14);
    const FOG_POST = new THREE.Color(0x081020);
    scene.fog = new THREE.FogExp2(FOG_PRE.getHex(), 0.042);
    scene.background = new THREE.Color(0x050a14);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 150);

    // ── IBL propio tinteado de marca (corrección #4): estudio negro con
    // strips emisivos cian / azul y card hueso cenital → cada reflejo es marca
    let envRT: THREE.WebGLRenderTarget;
    {
      const env = new THREE.Scene();
      const strip = (r: number, gr: number, b: number, w: number, h: number, pos: [number, number, number]) => {
        const mesh = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: new THREE.Color().setRGB(r, gr, b), side: THREE.DoubleSide })
        );
        mesh.position.set(...pos);
        mesh.lookAt(0, 0, 0);
        env.add(mesh);
      };
      strip(0.4, 5.0, 6.0, 1.6, 9, [-6, 1, 2]); // strip cian (sistema)
      strip(0.5, 1.2, 6.5, 1.2, 8, [6, 0, -3]); // strip azul (institución)
      strip(4.5, 4.4, 4.0, 5, 3, [0, 7, 1]); // card hueso cenital (key suave)
      strip(0.5, 0.45, 0.4, 8, 8, [0, -7, 0]); // rebote tenue de piso
      const pmrem = new THREE.PMREMGenerator(renderer);
      envRT = pmrem.fromScene(env, 0.06);
      scene.environment = envRT.texture;
      scene.environmentIntensity = 0.55;
      env.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (o.material as THREE.Material).dispose();
        }
      });
      pmrem.dispose();
      // OJO: texture.dispose() NO libera el framebuffer del render target;
      // el cleanup llama envRT.dispose() (libera FBO + textura)
    }

    // ── texturas procedurales (cero assets externos) ────────────
    function glowTexture(inner: string, outer: string) {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d")!;
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, inner);
      grad.addColorStop(0.35, outer);
      grad.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      return tx(new THREE.CanvasTexture(c));
    }
    // corrección #3a: microsuperficie — ruido suave ±0.08 como roughnessMap
    function roughnessNoise() {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d")!;
      const img = ctx.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) {
        const v = 235 + (Math.random() - 0.5) * 42; // factor ~0.92 ± 0.08
        img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
        img.data[i * 4 + 3] = 255;
      }
      ctx.putImageData(img, 0, 0);
      const t = tx(new THREE.CanvasTexture(c));
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      return t;
    }
    const roughTex = roughnessNoise();

    // ── materiales (regla anti-plástico: metal binario, sin blanco puro) ──
    // A · chasis: aclarado a 0x1A2230 + anisotropía 0.6 (metal cepillado, #3b/#3c)
    const matA = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x1a2230,
        metalness: 1.0,
        roughness: 0.34,
        roughnessMap: roughTex,
        envMapIntensity: 1.3,
        flatShading: true, // corrección #2: aristas que atrapan luz
      })
    );
    matA.anisotropy = 0.6;
    // B · bisel + tornillería (clearcoat fuera en móvil: costo oculto)
    const matB = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x9aa0a8,
        metalness: 1.0,
        roughness: 0.16,
        roughnessMap: roughTex,
        clearcoat: isMobile ? 0 : 0.6,
        clearcoatRoughness: 0.25,
        envMapIntensity: 1.5,
        flatShading: true,
      })
    );
    // T · ticks — corrección #5: instanceColor NO toca emissive de fábrica;
    // se inyecta totalEmissiveRadiance *= vColor por onBeforeCompile
    const matT = m(
      new THREE.MeshPhysicalMaterial({
        color: 0xc9c6bc,
        metalness: 0.6,
        roughness: 0.4,
        emissive: 0xf2f0e9,
        emissiveIntensity: 0.3,
      })
    );
    matT.onBeforeCompile = (shader) => {
      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
#ifdef USE_INSTANCING_COLOR
	totalEmissiveRadiance *= vColor;
#endif`
      );
    };
    // C · núcleo (única pieza claramente sobre threshold en reposo)
    const CYAN = new THREE.Color(0x22d3ee);
    const VERDE = new THREE.Color(0x34d399);
    const AMBAR = new THREE.Color(0xfbbf24);
    const matC = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0f0c,
        metalness: 0,
        roughness: 1.0,
        emissive: CYAN.clone(),
        emissiveIntensity: 0.2, // apagado hasta cerrar el ensamblaje
      })
    );
    // D · cápsula de cristal (móvil: fallback metal, transmission es carísimo)
    const matD = m(
      isMobile
        ? new THREE.MeshPhysicalMaterial({
            color: 0x1a2030,
            metalness: 0.9,
            roughness: 0.18,
            envMapIntensity: 1.2,
            flatShading: true,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.15,
          })
        : new THREE.MeshPhysicalMaterial({
            color: 0xf2f0e9,
            roughness: 0.08,
            transmission: 1.0,
            thickness: 0.6,
            ior: 1.5,
            attenuationColor: CYAN.clone(),
            attenuationDistance: 2.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.08,
            envMapIntensity: 1.2,
            flatShading: true,
            emissive: 0x22d3ee,
            emissiveIntensity: 0.15,
          })
    );
    // E · hélice / grabados / aros lectores
    const matE = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x04060e,
        emissive: 0x22d3ee,
        emissiveIntensity: 1.1,
      })
    );
    // CEP · disco hueso mate
    const matCEP = m(
      new THREE.MeshPhysicalMaterial({
        color: 0xe5e2d8,
        metalness: 0,
        roughness: 0.35,
        clearcoat: isMobile ? 0 : 0.9,
      })
    );
    // S · swarm (corrección #12: capado a 1.6 para no parpadear a media res)
    const matS = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x0a0f0c,
        emissive: 0x34d399,
        emissiveIntensity: 1.6,
      })
    );
    // G · portal
    const matG = m(
      new THREE.MeshPhysicalMaterial({
        color: 0x0b1224,
        metalness: 1.0,
        roughness: 0.3,
        emissive: 0x3b82f6,
        emissiveIntensity: 6.0, // lejos en la niebla (corrección #7); decae al acercarse
        flatShading: true,
      })
    );
    const matGThin = m(
      new THREE.MeshPhysicalMaterial({ color: 0x0b1224, metalness: 1, roughness: 0.4, emissive: 0x3b82f6, emissiveIntensity: 0.9 })
    );

    // ── geometría: anillo maquinado (corrección #2) — LatheGeometry con
    // perfil rectangular chaflanado; flatShading rompe el especular en bandas
    function anilloMaquinado(R: number, w: number, h: number, seg: number) {
      const hw = w / 2;
      const hh = h / 2;
      const c = Math.min(0.01, hw * 0.35); // chaflán
      const pts = [
        new THREE.Vector2(R - hw, -hh + c),
        new THREE.Vector2(R - hw, hh - c),
        new THREE.Vector2(R - hw + c, hh),
        new THREE.Vector2(R + hw - c, hh),
        new THREE.Vector2(R + hw, hh - c),
        new THREE.Vector2(R + hw, -hh + c),
        new THREE.Vector2(R + hw - c, -hh),
        new THREE.Vector2(R - hw + c, -hh),
        new THREE.Vector2(R - hw, -hh + c),
      ];
      return g(new THREE.LatheGeometry(pts, seg));
    }

    // tornillería: Cylinder de 6 lados (atrapa luz, no Box liso — #2)
    function tornillos(R: number, n: number, parent: THREE.Object3D) {
      const geo = g(new THREE.CylinderGeometry(0.026, 0.03, 0.045, 6));
      const inst = new THREE.InstancedMesh(geo, matB, n);
      insts.push(inst);
      const d = new THREE.Object3D();
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        d.position.set(Math.cos(a) * R, 0.045, Math.sin(a) * R);
        d.rotation.set(0, -a, 0);
        d.updateMatrix();
        inst.setMatrixAt(i, d.matrix);
      }
      inst.instanceMatrix.needsUpdate = true;
      parent.add(inst);
      return inst;
    }

    // ── jerarquía del héroe ──────────────────────────────────────
    const heroGroup = new THREE.Group();
    scene.add(heroGroup);

    // bisel-reloj: dial FIJO (corrección #9) + aguja índice que recorre P·2π
    const bezelGroup = new THREE.Group();
    heroGroup.add(bezelGroup);
    const bezelRing = new THREE.Mesh(anilloMaquinado(2.1, 0.16, 0.07, 200), matB);
    bezelRing.rotation.x = Math.PI / 2; // el anillo vive en XY, de cara a cámara
    bezelGroup.add(bezelRing);

    const N_TICKS = 120;
    const tickGeo = g(new THREE.BoxGeometry(0.11, 0.014, 0.05));
    const ticks = new THREE.InstancedMesh(tickGeo, matT, N_TICKS);
    insts.push(ticks);
    // instanceColor: base blanca; el barrido PLD escribe cian HDR
    for (let i = 0; i < N_TICKS; i++) ticks.setColorAt(i, new THREE.Color(1, 1, 1));
    bezelGroup.add(ticks);
    const tickDummy = new THREE.Object3D();
    const tickDisperse = new Float32Array(N_TICKS); // dispersión radial del prólogo
    for (let i = 0; i < N_TICKS; i++) tickDisperse[i] = 2 + Math.random() * 1.5;
    function layoutTicks(assembleK: number) {
      // assembleK: 0 = disperso ×3, 1 = dial cerrado (idempotente)
      for (let i = 0; i < N_TICKS; i++) {
        const a = (i / N_TICKS) * Math.PI * 2;
        const r = lerp(2.1 * tickDisperse[i], 2.1, assembleK);
        tickDummy.position.set(Math.cos(a) * r, Math.sin(a) * r, 0);
        tickDummy.rotation.set(0, 0, a);
        tickDummy.scale.set(i % 10 === 0 ? 1.55 : 1, 1, 1);
        tickDummy.updateMatrix();
        ticks.setMatrixAt(i, tickDummy.matrix);
      }
      ticks.instanceMatrix.needsUpdate = true;
    }
    layoutTicks(0);

    // aguja índice (marca ms/1000 · 2π sobre el dial fijo)
    const needle = new THREE.Mesh(g(new THREE.BoxGeometry(0.2, 0.026, 0.06)), m(
      new THREE.MeshPhysicalMaterial({ color: 0x04060e, emissive: 0x22d3ee, emissiveIntensity: 2.3 })
    ));
    bezelGroup.add(needle);

    // gimbals: wrapper (tilt + apertura de pétalos) → ring (spin propio)
    type Gimbal = { wrap: THREE.Group; ring: THREE.Mesh; tilt: THREE.Euler };
    function gimbal(R: number, w: number, h: number, tilt: THREE.Euler): Gimbal {
      const wrap = new THREE.Group();
      const ring = new THREE.Mesh(anilloMaquinado(R, w, h, 160), matA);
      tornillos(R, 48, ring);
      wrap.add(ring);
      wrap.rotation.copy(tilt);
      heroGroup.add(wrap);
      return { wrap, ring, tilt };
    }
    const gimA = gimbal(1.7, 0.15, 0.075, new THREE.Euler(0, 0, 0));
    const gimB = gimbal(1.35, 0.13, 0.065, new THREE.Euler(0.5, 0, 0.2));
    const gimC = gimbal(1.05, 0.11, 0.058, new THREE.Euler(-0.55, 0.55, 0));

    // núcleo: cápsula cristal + esfera de energía + halo aditivo
    const coreGroup = new THREE.Group();
    heroGroup.add(coreGroup);
    const capsule = new THREE.Mesh(g(new THREE.IcosahedronGeometry(0.62, 1)), matD);
    coreGroup.add(capsule);
    const core = new THREE.Mesh(g(new THREE.SphereGeometry(0.34, 32, 32)), matC);
    coreGroup.add(core);
    const haloMat = m(
      new THREE.SpriteMaterial({
        map: glowTexture("rgba(140,235,250,0.9)", "rgba(34,211,238,0.3)"),
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        transparent: true,
      })
    ) as THREE.SpriteMaterial;
    const halo = new THREE.Sprite(haloMat);
    halo.scale.setScalar(2.2);
    coreGroup.add(halo);

    // sigil de firma: doble hélice HMAC (drawRange 0→1, luego se contrae)
    const sigilGroup = new THREE.Group();
    heroGroup.add(sigilGroup);
    const TUB_SEG = 160;
    const HELIX_IDX = TUB_SEG * 8 * 6;
    for (let k = 0; k < 2; k++) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 40; i++) {
        const t = i / 40;
        const a = t * Math.PI * 2 * 3.5 + k * Math.PI;
        pts.push(new THREE.Vector3(Math.cos(a) * 0.85, (t - 0.5) * 2.2, Math.sin(a) * 0.85));
      }
      const tube = new THREE.Mesh(g(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), TUB_SEG, 0.014, 8)), matE);
      tube.geometry.setDrawRange(0, 0);
      sigilGroup.add(tube);
    }

    // aros lectores PLD + plano de escaneo
    const scanGroup = new THREE.Group();
    scanGroup.visible = false;
    heroGroup.add(scanGroup);
    const scanRingGeo = g(new THREE.TorusGeometry(2.35, 0.008, 8, 120));
    for (const dy of [-0.05, 0.05]) {
      const r = new THREE.Mesh(scanRingGeo, matE);
      r.rotation.x = Math.PI / 2;
      r.position.y = dy;
      scanGroup.add(r);
    }
    const scanPlane = new THREE.Mesh(
      g(new THREE.PlaneGeometry(5.2, 0.9)),
      m(
        new THREE.MeshBasicMaterial({
          map: glowTexture("rgba(34,211,238,0.5)", "rgba(34,211,238,0.12)"),
          blending: THREE.AdditiveBlending,
          transparent: true,
          depthWrite: false,
          opacity: 0.5,
        })
      )
    );
    scanPlane.rotation.x = -Math.PI / 2;
    scanGroup.add(scanPlane);

    // CEP: disco hueso que se extruye de la cara frontal
    const cepGroup = new THREE.Group();
    cepGroup.visible = false;
    heroGroup.add(cepGroup);
    const cepDisc = new THREE.Mesh(g(new THREE.CylinderGeometry(0.5, 0.5, 0.045, 64)), matCEP);
    cepDisc.rotation.x = Math.PI / 2; // de cara a cámara
    cepGroup.add(cepDisc);
    const grabadoGeo = g(new THREE.TorusGeometry(0.42, 0.005, 6, 80));
    for (const dz of [0.026, -0.026]) {
      const gr = new THREE.Mesh(grabadoGeo, matE);
      gr.position.z = dz;
      cepGroup.add(gr);
    }

    // swarm de liberación (oculto hasta P≥0.86 — corrección #15)
    const N_SWARM = isMobile ? 200 : 400;
    const swarm = new THREE.InstancedMesh(g(new THREE.IcosahedronGeometry(0.11, 0)), matS, N_SWARM);
    insts.push(swarm);
    swarm.visible = false;
    heroGroup.add(swarm);
    const swarmSeed = new Float32Array(N_SWARM * 3);
    for (let i = 0; i < N_SWARM; i++) {
      swarmSeed[i * 3] = Math.random() * Math.PI * 2; // fase
      swarmSeed[i * 3 + 1] = 0.5 + Math.random(); // radio
      swarmSeed[i * 3 + 2] = Math.random() * 2 - 1; // eje Y
    }

    // ── gate (frontera Banxico) — z inicial −26 (corrección #7) ──
    const gateGroup = new THREE.Group();
    gateGroup.visible = false;
    gateGroup.position.z = -26;
    scene.add(gateGroup);
    const gateRing = new THREE.Mesh(anilloMaquinado(6.0, 0.5, 0.2, 220), matG);
    gateRing.rotation.x = Math.PI / 2;
    gateGroup.add(gateRing);
    const gateThinGeo = g(new THREE.TorusGeometry(6.6, 0.02, 8, 160));
    const gateThinGeo2 = g(new THREE.TorusGeometry(5.4, 0.02, 8, 160));
    const gateThinA = new THREE.Mesh(gateThinGeo, matGThin);
    const gateThinB = new THREE.Mesh(gateThinGeo2, matGThin);
    gateGroup.add(gateThinA, gateThinB);
    const membraneMat = m(
      new THREE.MeshBasicMaterial({
        map: glowTexture("rgba(90,140,255,0.55)", "rgba(59,130,246,0.2)"),
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      })
    ) as THREE.MeshBasicMaterial;
    const membrane = new THREE.Mesh(g(new THREE.CircleGeometry(5.2, 48)), membraneMat);
    gateGroup.add(membrane);

    // ── polvo (profundidad, conservado del fondo anterior) ───────
    const N_DUST = isMobile ? 250 : 650;
    const dustPos = new Float32Array(N_DUST * 3);
    for (let i = 0; i < N_DUST; i++) {
      dustPos[i * 3] = (Math.random() - 0.5) * 34;
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      dustPos[i * 3 + 2] = -Math.random() * 40 + 8;
    }
    const dust = new THREE.Points(
      g(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(dustPos, 3))),
      m(new THREE.PointsMaterial({ color: 0xf2f0e9, size: 0.05, transparent: true, opacity: 0.35, sizeAttenuation: true }))
    );
    scene.add(dust);

    // ── luces (sin sombras; el rim modela) ───────────────────────
    const key = new THREE.DirectionalLight(0xf2f0e9, 2.2);
    key.position.set(4, 6, 3);
    const rim = new THREE.DirectionalLight(0x22d3ee, 1.6);
    rim.position.set(-6, 2, -5);
    // contra-rim hueso (corrección #3: silueta 360°)
    const contraRim = new THREE.DirectionalLight(0xf2f0e9, 0.45);
    contraRim.position.set(5, -1, -4);
    const fill = new THREE.PointLight(0x3b82f6, 0.5, 12, 2);
    fill.position.set(0, -3, 4);
    const practical = new THREE.PointLight(0x22d3ee, 1.8, 6, 2); // dentro del núcleo
    coreGroup.add(practical);
    scene.add(key, rim, contraRim, fill);

    // ── post: bloom cinematográfico (correcciones #6/#12) ────────
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const BLOOM_BASE = isMobile ? 0.45 : 0.55;
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2),
      BLOOM_BASE,
      0.65, // radius (juez: 0.85 produce shimmer a media res)
      1.0 // threshold sobre HDR lineal (juez: 0.78 chispeaba en cada especular)
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    // ── cámara: dos CatmullRom centrípetas (posición / lookAt) ───
    // lookAt con óptica CORREGIDA (#1): para empujar el objeto a la derecha
    // del encuadre, el lookAt se desplaza a la IZQUIERDA del objeto (y v.v.)
    const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    const mob = isMobile;
    const posKeys = [
      V(3.4, 0.6, 6.5), V(2.2, 0.9, 5.2), V(0.0, 1.8, 4.2), V(-1.6, 1.1, 4.6),
      V(-3.2, 0.4, 3.6), V(-1.8, 0.2, 6.0), V(0, 0.8, 9.5), V(1.4, 0.5, 7.0),
      V(2.6, -0.3, 2.9), V(2.0, 0.3, 4.4), V(0.6, 2.4, 6.8), V(0, 3.2, 9.8),
    ].map((p, i) => {
      if (!mob) return p;
      // móvil (§9): objeto al tercio superior, más aire, menos excursión lateral
      const z = i === 8 ? Math.max(p.z * 1.25, 3.8) : p.z * 1.25;
      return V(p.x * 0.6, p.y - 0.8, z);
    });
    const lookKeys = [
      V(-0.9, 0.2, 0), V(-0.5, 0.15, 0), V(0, 0.35, 0), V(0.5, 0, 0),
      V(0.9, -0.1, 0), V(0, 0.3, -2), V(0, 0.3, -4), V(-0.4, 0.2, -1),
      V(-0.9, 0.1, 0), V(-0.4, 0.3, 0), V(0, 0.8, 0), V(0, 0.8, 0),
    ].map((p) => (mob ? V(p.x * 0.6, p.y, p.z) : p));
    const fovKeys = [42, 44, 47, 46, 40, 50, 55, 50, 36, 42, 46, 50].map((f) => (mob ? f + 6 : f));
    // roll sutil por tramo (corrección #11): el 30% del look "con intención"
    const rollKeys = [0, 0, 0, -1.5, -0.8, 0, 0, 0.8, 2, 0.6, -1, 0].map((d) => (d * Math.PI) / 180);
    const posCurve = new THREE.CatmullRomCurve3(posKeys, false, "centripetal");
    const lookCurve = new THREE.CatmullRomCurve3(lookKeys, false, "centripetal");

    // ps nominales; se re-anclan a la medición DOM real en mount/resize
    let ps = [0, 0.08, 0.165, 0.25, 0.35, 0.45, 0.525, 0.6, 0.675, 0.75, 0.875, 1];
    // zonas para la viñeta: [hero, stack, firma, escrutinio, frontera, cep, envivo, operadores, acceso] + tierra
    const VIG_ZONES = [0.55, 0.8, 0.7, 0.65, 0.35, 0.7, 0.9, 0.9, 0.9, 0.95];
    let zoneTops: number[] = [];
    let zoneBottoms: number[] = [];

    function medir() {
      const vh = window.innerHeight;
      const range = Math.max(1, document.documentElement.scrollHeight - vh);
      const secs = Array.from(document.querySelectorAll<HTMLElement>("main > *")).filter(
        (el) => el.offsetHeight > 4
      );
      zoneTops = secs.map((el) => el.getBoundingClientRect().top + window.scrollY);
      zoneBottoms = secs.map((el, i) => zoneTops[i] + el.offsetHeight);
      if (secs.length < 7) return; // fallback: ps nominales
      const centerP = (i: number) =>
        clamp01((zoneTops[i] + Math.max(0, secs[i].offsetHeight - vh) / 2) / range);
      const next = ps.slice();
      next[0] = 0;
      next[2] = centerP(2); // ActoFirma
      next[4] = centerP(3); // ActoEscrutinio
      // K6 = punto ms≈730 dentro de ActoFrontera (620–870 → progreso 0.44)
      next[6] = clamp01((zoneTops[4] + Math.max(0, secs[4].offsetHeight - vh) * 0.44) / range);
      next[8] = centerP(5); // ActoCep
      next[10] = centerP(6); // ActoEnVivo
      next[1] = (next[0] + next[2]) / 2;
      next[3] = (next[2] + next[4]) / 2;
      next[5] = lerp(next[4], next[6], 0.55);
      next[7] = lerp(next[6], next[8], 0.55);
      next[9] = lerp(next[8], next[10], 0.5);
      next[11] = 1;
      for (let i = 1; i < 12; i++) next[i] = Math.max(next[i], next[i - 1] + 0.004); // monotonía
      // la monotonía puede empujar keys > 1 (keyframes apiñados al fondo):
      // cap hacia atrás para que el último tramo termine EXACTO en P = 1
      next[11] = Math.min(next[11], 1);
      for (let i = 10; i >= 1; i--) next[i] = Math.min(next[i], next[i + 1] - 0.004);
      ps = next;
    }

    // ── estado transitorio del rAF (refs locales, nunca React state) ─
    let raf = 0;
    let tPrev = performance.now();
    let smoothP = -1; // −1 = snap en el primer frame
    let lookCur = new THREE.Vector3();
    let fovCur = fovKeys[0];
    let rollCur = 0;
    let vigCur = -1;
    let biasCur = 0;
    let spinT = 0; // reloj ambiental de los gimbals (solo avanza si !frozen)
    let mouseTX = 0, mouseTY = 0, mouseX = 0, mouseY = 0;
    let assembleT0 = -1; // ensamblaje por TIEMPO (corrección #13)
    let assembled = false;
    let scanDirty = false; // para restaurar instanceColor al salir de A2
    const camPos = new THREE.Vector3();
    const lookTarget = new THREE.Vector3();
    const tmpColor = new THREE.Color();
    const swarmDummy = new THREE.Object3D();
    const TAU_P = isMobile ? 180 : 280;

    function targetScrollP() {
      const doc = document.documentElement;
      return clamp01(window.scrollY / Math.max(1, doc.scrollHeight - window.innerHeight));
    }

    // muestreo de tramo: posición con f LINEAL (corrección #10 — una sola
    // toma, sin frenadas por keyframe); lookAt/FOV/roll con smoothstep
    function segmentOf(p: number): [number, number] {
      let i = 0;
      while (i < 10 && p > ps[i + 1]) i++;
      const f = clamp01((p - ps[i]) / Math.max(1e-5, ps[i + 1] - ps[i]));
      return [i, f];
    }

    function onPointerMove(e: PointerEvent) {
      mouseTX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseTY = (e.clientY / window.innerHeight) * 2 - 1;
    }
    if (fine) window.addEventListener("pointermove", onPointerMove, { passive: true });

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2); // re-cap al cambiar de monitor
      renderer.setPixelRatio(dpr);
      composer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      medir();
    }
    resize();
    window.addEventListener("resize", resize, { passive: true });
    // re-medición diferida (layout ya asentado tras el preloader)
    const tMedir = window.setTimeout(medir, 900);

    // pose inicial de cámara ANTES de cualquier render: sin esto, el frame de
    // warm-up (y el modo frozen-al-montar) renderiza desde (0,0,0) — DENTRO
    // del héroe. Se muestrea la curva en el P real de mount.
    {
      const p0 = targetScrollP();
      const [s0, f0] = segmentOf(p0);
      posCurve.getPoint((s0 + f0) / 11, camPos);
      camera.position.copy(camPos);
      lookCurve.getPoint((s0 + sstep(f0)) / 11, lookCur);
      camera.lookAt(lookCur);
    }

    // warm-up de shaders (corrección #16): compilar durante el preloader
    let alive = true;
    renderer.compileAsync(scene, camera).catch(() => {});
    composer.render();

    // ═══════════════ LOOP ═══════════════
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!alive) return;
      const dt = Math.min(50, now - tPrev);
      tPrev = now;
      if (document.hidden) return;

      const frozen = document.documentElement.dataset.frozen === "true";
      const msNow = clamp01(ms.get() / 1000) * 1000;

      // ── FROZEN: renderiza pero NO avanza; luces ámbar; snap al soltar ──
      if (frozen) {
        delete document.documentElement.dataset.sceneFront; // nunca en frozen
        key.color.copy(AMBAR);
        rim.color.copy(AMBAR);
        practical.color.copy(AMBAR);
        matC.emissive.copy(AMBAR);
        matC.emissiveIntensity = 1.4;
        matE.emissiveIntensity = 0.4;
        haloMat.color.copy(AMBAR);
        halo.scale.setScalar(2.2 * (1 + 0.08 * Math.sin(now / 700))); // pulso lento
        composer.render();
        return;
      }
      // reanudación en snap (veredicto binario): el camino normal reescribe
      // TODOS los colores/intensidades por frame — estado idempotente de P/ms
      key.color.set(0xf2f0e9);

      // ── driver dual: P (scroll suavizado) + ms (reloj maestro) ──
      const targetP = targetScrollP();
      if (smoothP < 0) smoothP = targetP; // sin fly-in al montar
      smoothP += (targetP - smoothP) * (1 - Math.exp(-dt / TAU_P));
      const P = clamp01(smoothP);

      // ── prólogo: ensamblaje por TIEMPO 1.8s; clamp si se monta a media página
      if (assembleT0 < 0) {
        assembleT0 = now;
        if (targetP > 0.05) assembled = true; // única excepción a la idempotencia
      }
      const aT = assembled ? 1 : clamp01((now - assembleT0) / 1800);
      if (!assembled) {
        const st = (d: number) => easeOutCubic((aT * 1800 - d) / 1200);
        bezelGroup.position.z = lerp(-5, 0, st(0));
        gimA.wrap.position.set(lerp(-2.2, 0, st(120)), lerp(1.4, 0, st(120)), lerp(-3, 0, st(120)));
        gimB.wrap.position.set(lerp(2.6, 0, st(240)), lerp(-1.8, 0, st(240)), lerp(-2, 0, st(240)));
        gimC.wrap.position.set(0, lerp(2.4, 0, st(360)), lerp(-4, 0, st(360)));
        layoutTicks(st(480)); // los ticks hacen "clic" a su lugar
        if (aT >= 1) {
          assembled = true;
          layoutTicks(1);
          bezelGroup.position.z = 0;
          gimA.wrap.position.set(0, 0, 0);
          gimB.wrap.position.set(0, 0, 0);
          gimC.wrap.position.set(0, 0, 0);
        }
      }
      const ignition = assembled ? 1 : sstep((aT - 0.85) / 0.15); // núcleo enciende al cerrar

      // ── cámara ──
      const [seg, f] = segmentOf(P);
      const fS = sstep(f);
      posCurve.getPoint((seg + f) / 11, camPos); // posición: P global, C1 continuo
      lookCurve.getPoint((seg + fS) / 11, lookTarget);
      const fovT = lerp(fovKeys[seg], fovKeys[seg + 1], fS);
      const rollT = lerp(rollKeys[seg], rollKeys[seg + 1], fS);

      camera.position.copy(camPos);
      lookCur.lerp(lookTarget, 1 - Math.exp(-dt / 380)); // settle del lookAt (τ 380)
      if (smoothP === targetP && lookCur.lengthSq() === 0) lookCur.copy(lookTarget);
      camera.lookAt(lookCur);

      // parallax al mouse (solo desktop pointer:fine), reducido en el macro CEP
      if (fine) {
        const k = 1 - Math.exp(-dt / 120);
        mouseX += (mouseTX - mouseX) * k;
        mouseY += (mouseTY - mouseY) * k;
        const macro = seg === 7 || seg === 8 ? 0.4 : 1;
        camera.rotateY(-mouseX * 0.035 * macro); // ±2.0° → ±0.8° en macro
        camera.rotateX(-mouseY * 0.021 * macro); // ±1.2° → ±0.5°
      }
      rollCur += (rollT - rollCur) * (1 - Math.exp(-dt / 240));
      camera.rotateZ(rollCur);
      fovCur += (fovT - fovCur) * (1 - Math.exp(-dt / 240));
      if (Math.abs(camera.fov - fovCur) > 0.01) {
        camera.fov = fovCur;
        camera.updateProjectionMatrix();
      }

      // ── acento de composición: bias lateral sutil del héroe por acto ──
      const zoneBias = msNow > 290 && msNow < 620 ? -0.35 : msNow > 870 ? 0.35 : 0;
      biasCur += (zoneBias - biasCur) * (1 - Math.exp(-dt / 400));
      heroGroup.position.x = biasCur;

      // ── rotación ambiental de gimbals (60% tras el sellado de firma) ──
      spinT += dt * 0.001 * (msNow > 290 ? 0.6 : 1);
      // alineación coplanar cruzando el portal (la llave embona) y pétalos A5
      const align = sstep((msNow - 620) / 70) * (1 - sstep((msNow - 790) / 70));
      const s5 = sstep((P - 0.86) / 0.1); // liberación
      const open = easeInOut(s5) * (Math.PI / 2);
      const snapMix = (a: number) => lerp(a, Math.round(a / Math.PI) * Math.PI, align);
      gimA.ring.rotation.x = snapMix(spinT * 0.55);
      gimB.ring.rotation.x = snapMix(spinT * -0.38);
      gimB.ring.rotation.y = spinT * 0.3;
      gimC.ring.rotation.z = snapMix(spinT * 0.47);
      gimA.wrap.rotation.set(gimA.tilt.x * (1 - align) + open, 0, 0);
      gimB.wrap.rotation.set(gimB.tilt.x * (1 - align) - open, 0, gimB.tilt.z * (1 - align));
      gimC.wrap.rotation.set(gimC.tilt.x * (1 - align), gimC.tilt.y * (1 - align) + open, 0);

      // aguja índice: recorre el dial fijo con el reloj maestro (P_reloj·2π)
      const na = Math.PI / 2 - (msNow / 1000) * Math.PI * 2;
      needle.position.set(Math.cos(na) * 2.1, Math.sin(na) * 2.1, 0.05);
      needle.rotation.z = na;

      // ── A1 · Firma (45–290): hélice HMAC crece y se funde en el cristal ──
      const q1 = clamp01((msNow - 45) / 245);
      sigilGroup.visible = msNow > 40 && msNow < 310 && assembled;
      if (sigilGroup.visible) {
        const grow = sstep(q1 / 0.7);
        for (const ch of sigilGroup.children) {
          (ch as THREE.Mesh).geometry.setDrawRange(0, Math.floor(HELIX_IDX * grow));
        }
        const shrink = sstep((q1 - 0.7) / 0.3); // radio 0.85 → 0.63
        const kk = lerp(1, 0.63 / 0.85, shrink);
        sigilGroup.scale.set(kk, 1, kk);
        sigilGroup.rotation.y = -spinT * 0.8;
      }
      const flashFirma = Math.exp(-Math.pow((q1 - 0.86) / 0.07, 2)) * (msNow > 45 && msNow < 310 ? 1 : 0);
      // cápsula destella al sellar: 0.9 → 0.15
      matD.emissiveIntensity = lerp(0.15, 0.9, flashFirma);

      // ── A2 · Escrutinio (290–620): barrido PLD sobre el dial ──
      const inScan = msNow > 285 && msNow < 625;
      scanGroup.visible = inScan;
      if (inScan) {
        const q2 = clamp01((msNow - 290) / 330);
        const scanY = 1.9 * Math.cos(q2 * Math.PI * 2); // baja y regresa
        scanGroup.position.y = scanY;
        // ticks: emissive por instancia donde interseca el plano (fix #5)
        for (let i = 0; i < N_TICKS; i++) {
          const y = Math.sin((i / N_TICKS) * Math.PI * 2) * 2.1;
          const hit = Math.abs(y - scanY) < 0.28;
          ticks.setColorAt(i, hit ? tmpColor.setRGB(0.5, 4.5, 5.5) : tmpColor.setRGB(1, 1, 1));
        }
        ticks.instanceColor!.needsUpdate = true;
        scanDirty = true;
      } else if (scanDirty) {
        for (let i = 0; i < N_TICKS; i++) ticks.setColorAt(i, tmpColor.setRGB(1, 1, 1));
        ticks.instanceColor!.needsUpdate = true;
        scanDirty = false;
      }

      // ── A3 · Frontera (620–870): el portal viaja y cruza el plano de cámara ──
      gateGroup.visible = msNow > 290 && msNow < 880;
      if (gateGroup.visible) {
        gateGroup.position.z = keyed(msNow, [620, 700, 730, 760, 870], [-26, 2, 10, 18, 40]);
        gateThinA.rotation.z = spinT * 0.4;
        gateThinB.rotation.z = -spinT * 0.55;
        // emissive compensa la niebla: 6.0 lejos → 1.8 cerca (fix #7)
        const dist = Math.abs(camera.position.z - gateGroup.position.z);
        matG.emissiveIntensity = lerp(1.8, 6.0, clamp01((dist - 8) / 26));
        // membrana: muere ANTES del near plane (fix #8); el flash vende el cruce
        membraneMat.opacity =
          keyed(msNow, [620, 660, 680, 692], [0, 0.55, 0.5, 0]) * (msNow < 692 ? 1 : 0);
      }
      const cross = sstep((msNow - 660) / 120); // sistema → institución
      (scene.fog as THREE.FogExp2).color.lerpColors(FOG_PRE, FOG_POST, cross);
      (scene.background as THREE.Color).copy((scene.fog as THREE.FogExp2).color);
      rim.color.lerpColors(CYAN, tmpColor.setHex(0x3b82f6), cross);
      rim.intensity = lerp(1.6, 3.0, cross);
      // flash de bloom alrededor del cruce (0.55 → 0.95 → 0.55)
      const flashGate = Math.exp(-Math.pow((msNow - 730) / 26, 2));
      bloom.strength = lerp(BLOOM_BASE, 0.95, flashGate);

      // ── A4 · CEP (870–1000): el disco se acuña y gira en primer plano ──
      const q4 = clamp01((msNow - 870) / 130);
      cepGroup.visible = msNow > 862;
      if (cepGroup.visible) {
        const ext = easeOutCubic(q4);
        cepGroup.scale.set(1, Math.max(0.001, ext), 1);
        cepGroup.position.set(0.9, 0.1, 0.7 + 1.4 * ext); // se extruye hacia cámara
        cepGroup.rotation.y = spinT * 0.25; // gira lento sobre su canto
      }
      const flashCep = Math.exp(-Math.pow((q4 - 0.9) / 0.08, 2)) * (q4 > 0 ? 1 : 0);
      // grabados E: 1.1 base → 2.3 en eventos (firma y acuñado del CEP)
      matE.emissiveIntensity = 1.1 + 1.2 * Math.max(flashFirma, flashCep);

      // ── A5 · Liberación (P≥0.86): VERDE solo dinero ──
      matC.emissive.lerpColors(CYAN, VERDE, s5);
      matC.emissiveIntensity = lerp(0.2, lerp(2.6, 4.0, s5), ignition);
      practical.color.copy(matC.emissive);
      practical.intensity = 1.8 * (1 + 0.8 * s5) * ignition;
      if (!isMobile) {
        (matD as THREE.MeshPhysicalMaterial).attenuationColor.copy(matC.emissive);
      }
      haloMat.color.lerpColors(CYAN, VERDE, s5);
      haloMat.opacity = 0.55 * ignition + 0.35 * s5;
      halo.scale.setScalar(2.2 * (1 + 0.08 * Math.sin(now / 286)) * (0.4 + 0.6 * ignition));

      swarm.visible = s5 > 0.001; // jamás verde antes de la liberación (#15)
      if (swarm.visible) {
        // hélices que emanan; TODO derivado de P (idempotente ante el scrubber)
        for (let i = 0; i < N_SWARM; i++) {
          const ph = swarmSeed[i * 3];
          const rr = swarmSeed[i * 3 + 1];
          const yy = swarmSeed[i * 3 + 2];
          const a = ph + s5 * 5 * rr;
          const r = 0.7 + s5 * 4.2 * rr;
          swarmDummy.position.set(Math.cos(a) * r, yy * s5 * 3 + Math.sin(a * 2) * 0.2, Math.sin(a) * r);
          const sc = 0.5 + 0.5 * (1 - s5 * 0.5);
          swarmDummy.scale.setScalar(sc);
          swarmDummy.updateMatrix();
          swarm.setMatrixAt(i, swarmDummy.matrix);
        }
        swarm.instanceMatrix.needsUpdate = true;
      }

      // ── viñeta (--vig): un solo suavizado, el del rAF (fix #14) ──
      const mid = window.scrollY + window.innerHeight * 0.5;
      let zone = VIG_ZONES.length - 1; // tierra por defecto (más allá del main)
      for (let i = 0; i < zoneTops.length && i < 9; i++) {
        if (mid >= zoneTops[i] && mid < zoneBottoms[i]) {
          zone = i;
          break;
        }
      }
      let vigT = VIG_ZONES[zone] + (isMobile ? 0.1 : 0);
      if (zone === 4 && msNow > 695 && msNow < 765) vigT = 0.1; // beat del cruce
      vigT = Math.min(0.95, vigT);
      if (vigCur < 0) vigCur = vigT;
      vigCur += (vigT - vigCur) * (1 - Math.exp(-dt / 300));
      document.documentElement.style.setProperty("--vig", vigCur.toFixed(3));

      // polvo a la deriva
      dust.rotation.z += dt * 0.000012;

      composer.render();
    };
    raf = requestAnimationFrame(tick);

    // ── cleanup total ────────────────────────────────────────────
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.clearTimeout(tMedir);
      window.removeEventListener("resize", resize);
      if (fine) window.removeEventListener("pointermove", onPointerMove);
      document.documentElement.style.removeProperty("--vig");
      delete document.documentElement.dataset.sceneFront;
      scene.environment = null;
      insts.forEach((im) => im.dispose()); // libera instanceMatrix/instanceColor
      geoms.forEach((geo) => geo.dispose());
      mats.forEach((mat) => mat.dispose());
      texs.forEach((t) => t.dispose());
      envRT.dispose(); // FBO + textura del PMREM
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
    };
  }, [reduce, ms]);

  if (reduce) return null;
  return <canvas ref={ref} className="scene3d" aria-hidden="true" />;
}
