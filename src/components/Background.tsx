"use client";
import { useEffect, useRef } from "react";

// Premium animated background:
//  - floating gradient orbs (CSS)
//  - a canvas particle network (dots that drift and connect) in BOTH themes
// Mobile path is intentionally lighter (fewer particles, ~30fps, capped DPR).
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    let running = true;
    let pageVisible = document.visibilityState === "visible";
    let inView = true;
    let lastFrame = 0;

    const mobileMq = window.matchMedia("(max-width: 767px)");
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarseMq = window.matchMedia("(pointer: coarse)");

    const isMobile = () => mobileMq.matches || window.innerWidth < 768;
    const prefersReduced = () => reduceMq.matches;

    const getDpr = () => {
      const raw = window.devicePixelRatio || 1;
      return isMobile() ? Math.min(raw, 1.25) : Math.min(raw, 2);
    };

    let dpr = getDpr();

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = getDpr();
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const mouse = { x: -9999, y: -9999 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const useMouse = !isMobile() && !coarseMq.matches;
    if (useMouse) {
      window.addEventListener("mousemove", onMouse, { passive: true });
    }

    const makeParticles = () => {
      const mobile = isMobile();
      const count = mobile
        ? Math.min(18, Math.max(12, Math.floor((w * h) / 45000)))
        : Math.min(70, Math.floor((w * h) / 16000));
      return Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * (mobile ? 0.25 : 0.4),
        vy: (Math.random() - 0.5) * (mobile ? 0.25 : 0.4),
        r: 1 + Math.random() * (mobile ? 1.4 : 1.8),
      }));
    };

    let particles = makeParticles();
    let lastMobile = isMobile();

    const theme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    const drawFrame = () => {
      const mobile = isMobile();
      const isDark = theme() === "dark";
      const reduced = prefersReduced();
      ctx.clearRect(0, 0, w, h);

      const LINK = mobile ? 90 : 130;
      const link2 = LINK * LINK;
      const speedMul = reduced ? 0.08 : 1;

      const dotColor = isDark ? "160,185,255" : "59,90,255";
      const lineColor = isDark ? "120,150,255" : "70,100,255";

      for (const p of particles) {
        p.x += p.vx * speedMul;
        p.y += p.vy * speedMul;
        if (!mobile && !reduced) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150 && dist > 0.1) {
            p.vx += (dx / dist) * 0.01;
            p.vy += (dy / dist) * 0.01;
          }
        }
        const sp = Math.hypot(p.vx, p.vy);
        const cap = mobile ? 0.45 : 0.7;
        if (sp > cap) {
          p.vx = (p.vx / sp) * cap;
          p.vy = (p.vy / sp) * cap;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      ctx.lineWidth = 1;
      const n = particles.length;
      const jStep = mobile ? 2 : 1;
      for (let i = 0; i < n; i++) {
        const a = particles[i];
        for (let j = i + 1; j < n; j += jStep) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < link2) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / LINK) * (isDark ? 0.35 : 0.22);
            ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},${isDark ? 0.85 : 0.7})`;
        ctx.fill();
      }
    };

    const shouldAnimate = () => running && pageVisible && inView;

    const loop = (now: number) => {
      raf = 0;
      if (!shouldAnimate()) return;

      const mobile = isMobile();
      const reduced = prefersReduced();
      // Desktop stays smooth (~60fps). Mobile ~30fps. Reduced motion is very slow.
      const interval = reduced ? 250 : mobile ? 33 : 0;
      if (!interval || now - lastFrame >= interval) {
        lastFrame = now;
        drawFrame();
      }
      if (shouldAnimate()) raf = requestAnimationFrame(loop);
    };

    const kick = () => {
      if (shouldAnimate() && !raf) {
        lastFrame = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    const onVisibility = () => {
      pageVisible = document.visibilityState === "visible";
      if (pageVisible) {
        kick();
      } else if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    let io: IntersectionObserver | null = null;
    const target = wrapRef.current;
    if (typeof IntersectionObserver !== "undefined" && target) {
      io = new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) kick();
          else if (raf) {
            cancelAnimationFrame(raf);
            raf = 0;
          }
        },
        { threshold: 0 }
      );
      io.observe(target);
    }

    const onResize = () => {
      resize();
      const nowMobile = isMobile();
      if (nowMobile !== lastMobile) {
        lastMobile = nowMobile;
        particles = makeParticles();
      }
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Paint immediately so reduced-motion / first frame still shows the network.
    drawFrame();
    kick();

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouse);
      document.removeEventListener("visibilitychange", onVisibility);
      io?.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* base tint */}
      <div className="absolute inset-0 bg-white dark:bg-night-950" />

      {/* animated gradient orbs — 2 on mobile, 4 on desktop (see CSS) */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="orb orb-4" />

      {/* subtle grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_75%)]" />

      {/* canvas particle network (both themes) */}
      <canvas ref={canvasRef} className="absolute inset-0" />

      {/* soft vignette to keep content readable */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white/40 dark:from-night-950/0 dark:via-night-950/0 dark:to-night-950/50" />
    </div>
  );
}
