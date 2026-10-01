"use client";

import { useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { config } from "./config";
import { createResources, destroyResources, type OceanResources } from "./gl";
import { multiply, orbitView, perspective } from "./math";

/** Grid density and particle count, scaled down for narrow screens and low-power devices. */
function pickDetail(): { segments: number; particles: number } {
  const { segments, segmentsNarrow, segmentsLowPower, narrowBreakpoint } = config.grid;
  const { count, countNarrow, countLowPower } = config.particles;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowPower = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const narrow = window.innerWidth < narrowBreakpoint;
  let n: number = segments;
  let p: number = count;
  if (narrow) {
    n = Math.min(n, segmentsNarrow);
    p = Math.min(p, countNarrow);
  }
  if (lowPower) {
    n = Math.min(n, segmentsLowPower);
    p = Math.min(p, countLowPower);
  }
  return { segments: n, particles: p };
}

/**
 * Full-viewport, fixed, live-rendered low-poly ocean (raw WebGL2) with red leaves and drops
 * falling into it.
 * The canvas's CSS background doubles as the fallback when WebGL2 is unavailable or the context is lost.
 */
export default function PolygonOcean() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Pointer in -1..1 (x: left → right, y: top → bottom). Springs are read with .get() in the
  // render loop, so pointer movement never re-renders React.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, config.spring);
  const springY = useSpring(pointerY, config.spring);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2", { antialias: true, powerPreference: "default" });
    if (!gl) return; // CSS fallback background stays visible.

    const detail = pickDetail();
    let res: OceanResources | null = createResources(gl, detail.segments, detail.particles);

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

    let raf = 0;
    let running = false;
    let elapsed = 0;
    let last = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, config.render.maxDpr);
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };

    const draw = (time: number, px: number, py: number) => {
      if (!res || gl.isContextLost()) return;
      const { pitchMin, pitchMax, rollMax, fovY, near, far, distance } = config.camera;

      // Mouse down (py → 1) lowers toward the plane; up (py → -1) goes top-down.
      const pitch = pitchMax + (pitchMin - pitchMax) * ((py + 1) / 2);
      // Mouse left → counter-clockwise (positive) roll; right → clockwise.
      const roll = -px * rollMax;

      const { view, eye } = orbitView(pitch, roll, distance);
      const proj = perspective(fovY, canvas.width / canvas.height, near, far);
      const viewProj = multiply(proj, view);

      const setFrameUniforms = (u: OceanResources["uniforms"]) => {
        gl.uniformMatrix4fv(u.viewProj, false, viewProj);
        gl.uniform1f(u.time, time);
        gl.uniform3f(u.cameraPos, eye[0], eye[1], eye[2]);
        gl.uniform2f(u.resolution, canvas.width, canvas.height);
      };

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(res.program);
      setFrameUniforms(res.uniforms);
      gl.bindVertexArray(res.vao);
      gl.drawElements(gl.TRIANGLES, res.indexCount, gl.UNSIGNED_INT, 0);

      const particles = res.particles;
      if (particles) {
        // Depth-tested against the water (so they sink into it) but never written, so they
        // don't occlude each other.
        gl.useProgram(particles.program);
        setFrameUniforms(particles.uniforms);
        // Camera basis for billboarding: the first two rows of the (column-major) view matrix.
        gl.uniform3f(particles.uniforms.camRight, view[0], view[4], view[8]);
        gl.uniform3f(particles.uniforms.camUp, view[1], view[5], view[9]);
        gl.enable(gl.BLEND);
        gl.depthMask(false);
        gl.bindVertexArray(particles.vao);
        gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, particles.count);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
      }
      gl.bindVertexArray(null);
    };

    const drawStatic = () => draw(config.render.staticTime, 0, 0);

    const frame = (now: number) => {
      // Clamp the step so a stalled tab doesn't lurch the waves forward.
      elapsed += Math.min((now - last) / 1000, 0.1) * config.waves.timeScale;
      last = now;
      draw(elapsed, springX.get(), springY.get());
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running || !res || document.hidden || reducedMotion.matches) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const refresh = () => {
      resize();
      if (reducedMotion.matches) {
        stop();
        drawStatic();
      } else {
        start();
        if (running) draw(elapsed, springX.get(), springY.get());
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || !canHover.matches) return;
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };

    const onVisibility = () => (document.hidden ? stop() : start());

    const onContextLost = (e: Event) => {
      e.preventDefault();
      stop();
      res = null; // GPU objects are already gone; nothing to delete.
    };

    const onContextRestored = () => {
      res = createResources(gl, detail.segments, detail.particles);
      refresh();
    };

    const observer = new ResizeObserver(() => {
      resize();
      if (!running) drawStatic();
    });
    observer.observe(canvas);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    reducedMotion.addEventListener("change", refresh);
    canvas.addEventListener("webglcontextlost", onContextLost);
    canvas.addEventListener("webglcontextrestored", onContextRestored);

    refresh();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      reducedMotion.removeEventListener("change", refresh);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      if (res && !gl.isContextLost()) destroyResources(gl, res);
      res = null;
    };
  }, [pointerX, pointerY, springX, springY]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full bg-ocean bg-[radial-gradient(ellipse_at_50%_45%,#0b1018_0%,var(--color-ocean)_65%)]"
    />
  );
}
