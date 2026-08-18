"use client";
import { useEffect, useRef } from "react";

// Premium animated background:
//  - floating gradient orbs (CSS)
//  - a canvas particle network (dots that drift and connect) in BOTH themes
export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: -9999, y: -9999 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener("mousemove", onMouse);

    // particle setup
    const count = Math.min(70, Math.floor((w * h) / 16000));
    const particles = Array.from({ length: count }).map(() => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1 + Math.random() * 1.8,
    }));

    const theme = () =>
      document.documentElement.classList.contains("dark") ? "dark" : "light";

    const draw = () => {
      const isDark = theme() === "dark";
      ctx.clearRect(0, 0, w, h);

      // connection distance
      const LINK = 130;

      // dot color + line color per theme
      const dotColor = isDark ? "160,185,255" : "59,90,255"; // blue-ish, brighter in dark
      const lineColor = isDark ? "120,150,255" : "70,100,255";

      // update positions
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        // gentle attraction to mouse
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 150 && dist > 0.1) {
          p.vx += dx / dist * 0.01;
          p.vy += dy / dist * 0.01;
        }
        // cap speed
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 0.7) {
          p.vx = (p.vx / sp) * 0.7;
          p.vy = (p.vy / sp) * 0.7;
        }
        // wrap
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;
      }

      // draw connections
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const alpha = (1 - d / LINK) * (isDark ? 0.35 : 0.22);
            ctx.strokeStyle = `rgba(${lineColor},${alpha})`;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // draw dots
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotColor},${isDark ? 0.85 : 0.7})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      {/* base tint */}
      <div className="absolute inset-0 bg-white dark:bg-night-950" />

      {/* animated gradient orbs */}
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
