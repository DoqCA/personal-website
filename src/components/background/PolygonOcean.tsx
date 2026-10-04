"use client";

import { useEffect, useRef } from "react";
import { config } from "./config";
import { createResources, destroyResources, type OceanResources } from "./gl";
import { multiply, orbitView, perspective } from "./math";

/** Grid density, particle count, and render quality, scaled down for narrow screens and low-power devices. */
function pickDetail() {
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
  // MSAA multiplies framebuffer memory ~4x; on phones that pressure is what gets the context lost.
  return { segments: n, particles: p, antialias: !narrow && !lowPower };
}

/** Runs `fn` once the main thread is idle so shader compiles and mesh building stay off the critical path. */
function whenIdle(fn: () => void): () => void {
  // Safari has no requestIdleCallback.
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 1500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = setTimeout(fn, 200);
  return () => clearTimeout(id);
}

/** Sets up WebGL, the render loop, and listeners on `canvas`. Returns the teardown. */
function startOcean(canvas: HTMLCanvasElement): () => void {
  const detail = pickDetail();
  const gl = canvas.getContext("webgl2", { antialias: detail.antialias, powerPreference: "default" });
  if (!gl) return () => {}; // CSS fallback background stays visible.

  let res: OceanResources | null = createResources(gl, detail.segments, detail.particles);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canHover = window.matchMedia("(hover: hover) and (pointer: fine)");

  let raf = 0;
  let running = false;
  let sized = false;
  let ready = false;
  let elapsed = 0;
  let last = 0;

  // Pointer target in -1..1 (x: left → right, y: top → bottom), eased toward by a spring each frame.
  const target = { x: 0, y: 0 };
  const spring = { x: 0, y: 0, vx: 0, vy: 0 };

  const stepSpring = (dt: number) => {
    const { stiffness, damping, mass } = config.spring;
    spring.vx += ((-stiffness * (spring.x - target.x) - damping * spring.vx) / mass) * dt;
    spring.vy += ((-stiffness * (spring.y - target.y) - damping * spring.vy) / mass) * dt;
    spring.x += spring.vx * dt;
    spring.y += spring.vy * dt;
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
    if (!ready) {
      ready = true;
      canvas.dataset.ready = "";
    }
  };

  const redraw = () =>
    running ? draw(elapsed, spring.x, spring.y) : draw(config.render.staticTime, 0, 0);

  const frame = (now: number) => {
    // Clamp the step so a stalled tab doesn't lurch the waves forward.
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    elapsed += dt * config.waves.timeScale;
    stepSpring(dt);
    draw(elapsed, spring.x, spring.y);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (running || !res || !sized || document.hidden || reducedMotion.matches) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  const refresh = () => {
    if (reducedMotion.matches) stop();
    else start();
    redraw();
  };

  const onPointerMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !canHover.matches) return;
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const onVisibility = () => (document.hidden ? stop() : start());

  const onContextLost = (e: Event) => {
    e.preventDefault();
    stop();
    ready = false;
    delete canvas.dataset.ready; // Fade back to the CSS fallback rather than flash.
    res = null; // GPU objects are already gone; nothing to delete.
  };

  const onContextRestored = () => {
    res = createResources(gl, detail.segments, detail.particles);
    refresh();
  };

  // Size comes from the observer entry (no layout read, so no forced reflow). Resizing a canvas
  // clears it, and observers fire after this frame's rAF draw, so redraw here or the cleared
  // buffer gets presented as a black frame.
  const observer = new ResizeObserver(([entry]) => {
    const dpr = Math.min(window.devicePixelRatio || 1, config.render.maxDpr);
    const w = Math.max(1, Math.round(entry.contentRect.width * dpr));
    const h = Math.max(1, Math.round(entry.contentRect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    if (sized) {
      redraw();
    } else {
      sized = true;
      refresh();
    }
  });
  observer.observe(canvas);

  window.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);
  reducedMotion.addEventListener("change", refresh);
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);

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
}

/**
 * Full-viewport, fixed, live-rendered low-poly ocean (raw WebGL2) with red leaves and drops
 * falling into it.
 * The wrapper's CSS background doubles as the fallback when WebGL2 is unavailable or the context
 * is lost; the canvas fades in over it once the first frame is drawn.
 */
export default function PolygonOcean() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let teardown: (() => void) | undefined;
    const cancel = whenIdle(() => {
      teardown = startOcean(canvas);
    });
    return () => {
      cancel();
      teardown?.();
    };
  }, []);

  // h-lvh (largest viewport height) keeps the canvas size fixed while mobile browser toolbars
  // show and hide during scrolling, so it isn't reallocated on every scroll direction change.
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 -z-10 h-[calc(100lvh+120px)] w-full bg-ocean bg-[radial-gradient(ellipse_at_50%_45%,#0b1018_0%,var(--color-ocean)_65%)]"
    >
      <canvas
        ref={canvasRef}
        className="block size-full opacity-0 transition-opacity duration-700 data-ready:opacity-100"
      />
    </div>
  );
}
