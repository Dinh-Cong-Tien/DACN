import React, { useEffect, useRef } from 'react';
import { cn, isLowPowerDevice } from '@/shared/utils';

export interface ThreeBackgroundProps {
  /** globe: quả cầu điểm + vành quỹ đạo + vệ tinh (tinh thần "Orbi"); particles: hạt lơ lửng + khối đa diện wireframe */
  variant?: 'globe' | 'particles';
  /** Nền tối → dùng màu sáng hơn */
  dark?: boolean;
  className?: string;
  /** Parallax theo chuột */
  interactive?: boolean;
  /** Vị trí quả cầu theo trục X (tỷ lệ chiều rộng, -1..1). Mặc định lệch phải */
  offsetX?: number;
}

const PALETTE = {
  light: { points: 0x118a72, ring1: 0xfa5330, ring2: 0xf5b000, ring3: 0x141a2b, sat: 0xfa5330, particle: 0x118a72, wire: 0xfa5330 },
  dark: { points: 0x73d6b9, ring1: 0xffa088, ring2: 0xffd24d, ring3: 0xffffff, sat: 0xffd24d, particle: 0xa9e8d4, wire: 0xffd24d },
};

/**
 * Nền 3D bằng Three.js, tải lười (dynamic import) để không làm nặng bundle đầu.
 * Tự dừng khi cuộn khuất, dpr tối đa 1.5. Khi máy bật giảm chuyển động: vẫn chuyển động nhưng chậm hơn và tắt parallax theo chuột.
 */
export const ThreeBackground: React.FC<ThreeBackgroundProps> = ({ variant = 'globe', dark, className, interactive = true, offsetX = 0.55 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    // Điện thoại / máy yếu: không tải Three.js, không chạy WebGL (nguyên nhân giật chính trên mobile)
    if (!host || isLowPowerDevice()) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    import('three').then((THREE) => {
      if (disposed || !host) return;
      const colors = dark ? PALETTE.dark : PALETTE.light;
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const speed = reduced ? 0.45 : 1;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.setClearColor(0x000000, 0);
      host.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 0, 9);

      const root = new THREE.Group();
      scene.add(root);
      const disposables: { dispose: () => void }[] = [];

      // ===== Biến thể GLOBE =====
      const satellites: { mesh: import('three').Mesh; ring: import('three').Mesh; radius: number; speed: number; phase: number; tilt: import('three').Euler }[] = [];
      let sphere: import('three').Points | null = null;
      if (variant === 'globe') {
        const N = 1600;
        const pos = new Float32Array(N * 3);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < N; i++) {
          const y = 1 - (i / (N - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const th = golden * i;
          pos[i * 3] = Math.cos(th) * r * 2.2;
          pos[i * 3 + 1] = y * 2.2;
          pos[i * 3 + 2] = Math.sin(th) * r * 2.2;
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const mat = new THREE.PointsMaterial({ color: colors.points, size: 0.035, transparent: true, opacity: 0.85, sizeAttenuation: true });
        const points = new THREE.Points(geo, mat);
        root.add(points);
        sphere = points;
        disposables.push(geo, mat);

        const rings = [
          { r: 2.9, tilt: new THREE.Euler(1.2, 0.3, 0), color: colors.ring1, speed: 0.35 },
          { r: 3.3, tilt: new THREE.Euler(0.5, 1.1, 0.4), color: colors.ring2, speed: -0.22 },
          { r: 3.7, tilt: new THREE.Euler(1.9, -0.4, 0.8), color: colors.ring3, speed: 0.15 },
        ];
        rings.forEach((rg) => {
          const g = new THREE.TorusGeometry(rg.r, 0.012, 8, 160);
          const m = new THREE.MeshBasicMaterial({ color: rg.color, transparent: true, opacity: 0.55 });
          const mesh = new THREE.Mesh(g, m);
          mesh.rotation.copy(rg.tilt);
          root.add(mesh);
          disposables.push(g, m);
          const sg = new THREE.SphereGeometry(0.07, 12, 12);
          const sm = new THREE.MeshBasicMaterial({ color: colors.sat });
          const sat = new THREE.Mesh(sg, sm);
          root.add(sat);
          disposables.push(sg, sm);
          satellites.push({ mesh: sat, ring: mesh, radius: rg.r, speed: rg.speed, phase: Math.random() * Math.PI * 2, tilt: rg.tilt });
        });
        root.position.x = offsetX * 4;
        root.rotation.z = -0.15;
      }

      // ===== Biến thể PARTICLES =====
      let pGeo: import('three').BufferGeometry | null = null;
      const wires: import('three').Mesh[] = [];
      if (variant === 'particles') {
        const N = 420;
        const pos = new Float32Array(N * 3);
        for (let i = 0; i < N; i++) {
          pos[i * 3] = (Math.random() - 0.5) * 16;
          pos[i * 3 + 1] = (Math.random() - 0.5) * 9;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
        }
        pGeo = new THREE.BufferGeometry();
        pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        const pm = new THREE.PointsMaterial({ color: colors.particle, size: 0.05, transparent: true, opacity: 0.7 });
        root.add(new THREE.Points(pGeo, pm));
        disposables.push(pGeo, pm);
        const shapes = [new THREE.IcosahedronGeometry(0.9, 0), new THREE.OctahedronGeometry(0.7, 0), new THREE.TorusKnotGeometry(0.45, 0.14, 64, 8)];
        const spots = [new THREE.Vector3(-5.5, 1.8, -1), new THREE.Vector3(5.8, -1.2, -2), new THREE.Vector3(3.5, 2.6, -3)];
        shapes.forEach((g, i) => {
          const m = new THREE.MeshBasicMaterial({ color: i === 1 ? colors.points : colors.wire, wireframe: true, transparent: true, opacity: 0.45 });
          const mesh = new THREE.Mesh(g, m);
          mesh.position.copy(spots[i]);
          root.add(mesh);
          wires.push(mesh);
          disposables.push(g, m);
        });
      }

      // ===== Kích thước, parallax, vòng lặp =====
      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(host);

      const target = { x: 0, y: 0 };
      const onMove = (e: MouseEvent) => {
        target.x = (e.clientX / window.innerWidth - 0.5) * 2;
        target.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      if (interactive && !reduced) window.addEventListener('mousemove', onMove, { passive: true });

      // Chỉ chạy vòng vẽ khi nền đang hiện trên màn hình và tab đang mở; khuất thì dừng hẳn requestAnimationFrame
      let raf = 0;
      let inView = true;
      const clock = new THREE.Clock();
      const run = () => {
        const on = inView && !document.hidden && host.clientWidth > 0;
        if (on && !raf) raf = requestAnimationFrame(tick);
        if (!on && raf) {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      };
      const io = new IntersectionObserver(([en]) => {
        inView = en.isIntersecting;
        run();
      });
      io.observe(host);
      document.addEventListener('visibilitychange', run);
      const tick = () => {
        raf = requestAnimationFrame(tick);
        const t = clock.getElapsedTime() * speed;
        root.rotation.y += 0.0022 * speed;
        root.rotation.x += (target.y * 0.25 - root.rotation.x) * 0.03;
        root.position.y += (-target.y * 0.3 - root.position.y) * 0.03;
        if (variant === 'globe') root.position.x += (offsetX * 4 + target.x * 0.4 - root.position.x) * 0.03;
        // Vành quỹ đạo chao nhẹ quanh trục, vệ tinh bám theo vành; quả cầu điểm tự quay chậm hơn
        satellites.forEach((s, i) => {
          s.ring.rotation.set(s.tilt.x + Math.sin(t * 0.25 + i * 2) * 0.12, s.tilt.y + Math.cos(t * 0.2 + i) * 0.1, s.tilt.z);
          const a = t * s.speed * 1.6 + s.phase;
          const v = new THREE.Vector3(Math.cos(a) * s.radius, Math.sin(a) * s.radius, 0);
          v.applyEuler(s.ring.rotation);
          s.mesh.position.copy(v);
          s.mesh.scale.setScalar(1 + Math.sin(t * 2 + i) * 0.25);
        });
        if (sphere) sphere.rotation.y -= 0.0012 * speed;
        if (pGeo) {
          const arr = pGeo.attributes.position.array as Float32Array;
          for (let i = 0; i < arr.length; i += 3) arr[i + 1] += Math.sin(t * 0.6 + i) * 0.0012;
          pGeo.attributes.position.needsUpdate = true;
        }
        // Khối wireframe: tự xoay, bồng bềnh và "thở" nhẹ
        wires.forEach((w, i) => {
          w.rotation.x += (0.003 + i * 0.001) * speed;
          w.rotation.y += 0.004 * speed;
          w.position.y += Math.sin(t * 0.8 + i) * 0.002 * speed;
          w.scale.setScalar(1 + Math.sin(t * 0.6 + i * 1.7) * 0.06);
        });
        renderer.render(scene, camera);
      };
      run();

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener('visibilitychange', run);
        window.removeEventListener('mousemove', onMove);
        disposables.forEach((d) => d.dispose());
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, [variant, dark, interactive, offsetX]);

  return <div ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} />;
};
