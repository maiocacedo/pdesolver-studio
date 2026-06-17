import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { FieldOut } from "../types";
import type { Palette } from "./colormap";

interface Props {
  field: FieldOut;
  palette?: Palette;
  tIndex?: number;
}

// OKLCH to RGB conversion helper
function oklchToRgb(l: number, c: number, hDeg: number): [number, number, number] {
  const hRad = (hDeg * Math.PI) / 180;
  const a = c * Math.cos(hRad);
  const b = c * Math.sin(hRad);

  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855414 * b;

  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  const r = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
  const g = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
  const b_ = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

  const gamma = (val: number) => {
    val = Math.max(0, Math.min(1, val));
    return val <= 0.0031308 ? 12.92 * val : 1.055 * Math.pow(val, 1 / 2.4) - 0.055;
  };

  return [gamma(r), gamma(g), gamma(b_)];
}

// Interpolate and map field values to RGB colors
function colormapToRgb(v: number, palette: Palette = "viridis"): [number, number, number] {
  const t = Math.max(0, Math.min(1, v));
  let l = 0, c = 0, h = 0;
  if (palette === "cool") {
    h = 260 - 70 * t;
    l = 0.4 + 0.5 * t;
    c = 0.16 - 0.04 * Math.abs(t - 0.5) * 2;
  } else if (palette === "magma") {
    h = 20 + 60 * t - 60 * (1 - t);
    if (h < 0) h += 360;
    l = 0.15 + 0.8 * t;
    c = 0.05 + 0.18 * t * (1 - t * 0.3);
  } else {
    // viridis
    const stops: [number, number, number][] = [
      [0.18, 0.13, 280], [0.32, 0.15, 250], [0.52, 0.13, 200],
      [0.68, 0.14, 155], [0.82, 0.15, 110], [0.92, 0.16, 90],
    ];
    const f = t * (stops.length - 1);
    const i = Math.floor(f);
    const k = f - i;
    const a = stops[Math.min(i, stops.length - 1)];
    const b = stops[Math.min(i + 1, stops.length - 1)];
    l = a[0] + (b[0] - a[0]) * k;
    c = a[1] + (b[1] - a[1]) * k;
    h = a[2] + (b[2] - a[2]) * k;
  }
  return oklchToRgb(l, c, h);
}

export function Surface3DWebGL({ field, palette = "viridis", tIndex = 0 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const geometryRef = useRef<THREE.BufferGeometry | null>(null);
  const frontierLineRef = useRef<THREE.Line | null>(null);

  const xisRef = useRef<number[]>([]);
  const yisRef = useRef<number[]>([]);
  const tisRef = useRef<number[]>([]);

  const { xs, ts, grid, min, max } = field;
  const is2D = !!field.ys;
  const ys = field.ys ?? [];

  // Dimensions of 3D workspace
  const widthScale = 8;
  const depthScale = 8;
  const heightScale = 3.5;

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = null;

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 300;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(8, 6, 8);
    cameraRef.current = camera;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    // Controls setup
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;

    // Lighting setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(10, 20, 10);
    scene.add(dirLight);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.2);
    dirLight2.position.set(-10, 10, -10);
    scene.add(dirLight2);

    // Adaptive Downsampling
    let strideX = 1;
    let strideY = 1;

    if (is2D) {
      const totalPoints = xs.length * ys.length;
      if (totalPoints > 10000) {
        strideX = Math.max(1, Math.ceil(xs.length / 80));
        strideY = Math.max(1, Math.ceil(ys.length / 80));
      }
    } else {
      const totalPoints = xs.length * ts.length;
      if (totalPoints > 10000) {
        strideX = Math.max(1, Math.ceil(xs.length / 80));
        strideY = Math.max(1, Math.ceil(ts.length / 80)); // represents strideT
      }
    }

    const xis: number[] = [];
    for (let i = 0; i < xs.length; i += strideX) xis.push(i);
    if (xis[xis.length - 1] !== xs.length - 1) xis.push(xs.length - 1);

    const yis: number[] = []; // Used for Y coordinates in 2D
    const tis: number[] = []; // Used for T coordinates in 1D

    if (is2D) {
      for (let j = 0; j < ys.length; j += strideY) yis.push(j);
      if (yis[yis.length - 1] !== ys.length - 1) yis.push(ys.length - 1);
    } else {
      for (let j = 0; j < ts.length; j += strideY) tis.push(j);
      if (tis[tis.length - 1] !== ts.length - 1) tis.push(ts.length - 1);
    }

    xisRef.current = xis;
    yisRef.current = yis;
    tisRef.current = tis;

    const nx = xis.length;
    const ny = is2D ? yis.length : tis.length;

    const xSpan = xs[xs.length - 1] - xs[0] || 1;
    const ySpan = is2D ? (ys[ys.length - 1] - ys[0] || 1) : 1;
    const tSpan = !is2D ? (ts[ts.length - 1] - ts[0] || 1) : 1;
    const uRange = max - min || 1;

    const vertices: number[] = [];
    const colors: number[] = [];
    const indices: number[] = [];

    // Construct the initial mesh vertices
    if (is2D) {
      // 2D Spatial Mesh: coordinates are X and Y, height is field value u(x,y,tIndex)
      for (let j = 0; j < ny; j++) {
        const yj = yis[j];
        const yNorm = (ys[yj] - ys[0]) / ySpan;
        const z = (yNorm - 0.5) * depthScale;

        for (let i = 0; i < nx; i++) {
          const xi = xis[i];
          const xNorm = (xs[xi] - xs[0]) / xSpan;
          const x = (xNorm - 0.5) * widthScale;

          const u = grid[tIndex]?.[yj * xs.length + xi] ?? min;
          const uNorm = (u - min) / uRange;
          const y = (uNorm - 0.5) * heightScale;

          vertices.push(x, y, z);

          const [r, g, b] = colormapToRgb(uNorm, palette);
          colors.push(r, g, b);
        }
      }
    } else {
      // 1D Space-Time Surface: coordinates are X and T, height is field value u(x,t)
      for (let j = 0; j < ny; j++) {
        const tj = tis[j];
        const tNorm = (ts[tj] - ts[0]) / tSpan;
        const z = (tNorm - 0.5) * depthScale;

        for (let i = 0; i < nx; i++) {
          const xi = xis[i];
          const xNorm = (xs[xi] - xs[0]) / xSpan;
          const x = (xNorm - 0.5) * widthScale;

          const u = grid[tj][xi];
          const uNorm = (u - min) / uRange;
          const y = (uNorm - 0.5) * heightScale;

          vertices.push(x, y, z);

          const [r, g, b] = colormapToRgb(uNorm, palette);
          colors.push(r, g, b);
        }
      }
    }

    // Construct standard indices for the grid faces
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = j * nx + i;
        const b = j * nx + (i + 1);
        const c = (j + 1) * nx + i;
        const d = (j + 1) * nx + (i + 1);

        indices.push(a, b, d);
        indices.push(a, d, c);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(vertices), 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(colors), 3));
    geometry.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
    geometry.computeVertexNormals();
    geometryRef.current = geometry;

    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      side: THREE.DoubleSide,
      roughness: 0.3,
      metalness: 0.08,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Bounding wireframe
    const wireframeMat = new THREE.MeshBasicMaterial({
      color: 0x111111,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireframe = new THREE.Mesh(geometry, wireframeMat);
    scene.add(wireframe);

    // Bounding Box
    const boxGeo = new THREE.BoxGeometry(widthScale, heightScale, depthScale);
    const boxEdge = new THREE.EdgesGeometry(boxGeo);
    const boxMat = new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 1 });
    const boxHelper = new THREE.LineSegments(boxEdge, boxMat);
    boxHelper.position.y = 0;
    scene.add(boxHelper);

    // Floor grid
    const gridHelper = new THREE.GridHelper(widthScale, 10, 0x555555, 0x333333);
    gridHelper.position.y = -heightScale / 2;
    scene.add(gridHelper);

    // Axes lines
    const axesHelper = new THREE.AxesHelper(widthScale / 2);
    axesHelper.position.set(-widthScale / 2, -heightScale / 2, -depthScale / 2);
    scene.add(axesHelper);

    // 1D Frontier curve line highlight
    let line: THREE.Line | null = null;
    if (!is2D) {
      const lineGeo = new THREE.BufferGeometry();
      const lineVertices = new Float32Array(nx * 3);
      const lineColors = new Float32Array(nx * 3);
      for (let i = 0; i < nx; i++) {
        lineVertices[i * 3] = 0;
        lineVertices[i * 3 + 1] = 0;
        lineVertices[i * 3 + 2] = 0;

        // Glowing golden line
        lineColors[i * 3] = 1.0;
        lineColors[i * 3 + 1] = 0.8;
        lineColors[i * 3 + 2] = 0.0;
      }
      lineGeo.setAttribute("position", new THREE.BufferAttribute(lineVertices, 3));
      lineGeo.setAttribute("color", new THREE.BufferAttribute(lineColors, 3));

      const lineMat = new THREE.LineBasicMaterial({
        vertexColors: true,
        linewidth: 4.0,
      });

      line = new THREE.Line(lineGeo, lineMat);
      scene.add(line);
      frontierLineRef.current = line;
    }

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Resize Handling
    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(containerRef.current);
    handleResize();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      wireframeMat.dispose();
      boxEdge.dispose();
      boxGeo.dispose();
      boxMat.dispose();
      renderer.dispose();
      if (line) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    };
  }, [xs, ts, ys, grid, min, max, palette, is2D]);

  // Secondary useEffect: update geometry positions/colors or slice draw range on slider tick
  useEffect(() => {
    const geometry = geometryRef.current;
    if (!geometry) return;

    const uRange = max - min || 1;
    const xis = xisRef.current;
    const nx = xis.length;

    if (is2D) {
      // 2D Animation: Update height (Y) and colors of vertices for current tIndex
      const yis = yisRef.current;
      const ny = yis.length;
      const nx_orig = xs.length;

      const posAttr = geometry.getAttribute("position") as THREE.BufferAttribute;
      const colorAttr = geometry.getAttribute("color") as THREE.BufferAttribute;

      let index = 0;
      for (let j = 0; j < ny; j++) {
        const yj = yis[j];
        for (let i = 0; i < nx; i++) {
          const xi = xis[i];

          const u = grid[tIndex]?.[yj * nx_orig + xi] ?? min;
          const uNorm = (u - min) / uRange;

          // Height (Y in our 3D space)
          const y = (uNorm - 0.5) * heightScale;
          posAttr.setY(index, y);

          // Color
          const [r, g, b] = colormapToRgb(uNorm, palette);
          colorAttr.setXYZ(index, r, g, b);

          index++;
        }
      }

      posAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
      geometry.computeVertexNormals();
    } else {
      // 1D Space-Time Animation: Adjust draw range to slice surface up to tIndex
      const tis = tisRef.current;

      let activeNt = 0;
      for (let j = 0; j < tis.length; j++) {
        if (tis[j] <= tIndex) {
          activeNt = j + 1;
        } else {
          break;
        }
      }

      // 6 indices per cell (2 triangles)
      const indexCount = Math.max(0, (activeNt - 1) * (nx - 1) * 6);
      geometry.setDrawRange(0, indexCount);

      // Update frontier line positions
      const frontierLine = frontierLineRef.current;
      if (frontierLine) {
        const lineGeo = frontierLine.geometry;
        const linePos = lineGeo.getAttribute("position") as THREE.BufferAttribute;

        const currentJ = Math.max(0, activeNt - 1);
        const tj = tis[currentJ];
        const tSpan = ts[ts.length - 1] - ts[0] || 1;
        const tNorm = (ts[tj] - ts[0]) / tSpan;
        const z = (tNorm - 0.5) * depthScale;
        const xSpan = xs[xs.length - 1] - xs[0] || 1;

        for (let i = 0; i < nx; i++) {
          const xi = xis[i];
          const xNorm = (xs[xi] - xs[0]) / xSpan;
          const x = (xNorm - 0.5) * widthScale;

          const u = grid[tj][xi];
          const uNorm = (u - min) / uRange;
          const y = (uNorm - 0.5) * heightScale;

          linePos.setXYZ(i, x, y, z);
        }
        linePos.needsUpdate = true;
      }
    }
  }, [tIndex, palette, min, max, grid, xs, ts, is2D]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {/* Help Overlay */}
      <div
        style={{
          position: "absolute",
          bottom: "8px",
          right: "8px",
          background: "rgba(0, 0, 0, 0.6)",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "10px",
          color: "var(--text-muted)",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        Left Click + Drag: Rotate | Right Click + Drag: Pan | Scroll: Zoom
      </div>
    </div>
  );
}
