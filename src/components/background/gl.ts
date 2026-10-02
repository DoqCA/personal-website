// Raw WebGL2 setup for the polygon ocean: shader compile/link, jittered grid mesh, uniforms.

import { config, hexToRgb } from "./config";
import {
  fragmentShader,
  MAX_WAVES,
  particleFragmentShader,
  particleVertexShader,
  vertexShader,
} from "./shaders";

const isDev = process.env.NODE_ENV !== "production";

export type OceanUniforms = {
  viewProj: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  cameraPos: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
};

export type ParticleUniforms = OceanUniforms & {
  camRight: WebGLUniformLocation | null;
  camUp: WebGLUniformLocation | null;
};

export type ParticleResources = {
  program: WebGLProgram;
  shaders: [WebGLShader, WebGLShader];
  vao: WebGLVertexArrayObject;
  quadBuffer: WebGLBuffer;
  instanceBuffer: WebGLBuffer;
  count: number;
  uniforms: ParticleUniforms;
};

export type OceanResources = {
  program: WebGLProgram;
  shaders: [WebGLShader, WebGLShader];
  vao: WebGLVertexArrayObject;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
  uniforms: OceanUniforms;
  /** Null when there are no particles or their program failed; the ocean still renders. */
  particles: ParticleResources | null;
};

function compileShader(gl: WebGL2RenderingContext, type: GLenum, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (isDev) {
      const kind = type === gl.VERTEX_SHADER ? "vertex" : "fragment";
      console.error(`[PolygonOcean] ${kind} shader failed to compile:\n${gl.getShaderInfoLog(shader)}`);
    }
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/** Deterministic integer hash → [0, 1). */
function hash(x: number, y: number, seed: number): number {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(seed, 1442695041)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/**
 * Indexed grid on the XZ plane. Each vertex is (x, z, heightSeed, phase), with X/Z jittered by a
 * hash so facets vary in size and shape. Cell diagonals are also flipped by hash.
 */
export function buildGrid(segments: number) {
  const { halfSize, jitter } = config.grid;
  const size = halfSize * 2;
  const cell = size / segments;
  const row = segments + 1;

  const vertices = new Float32Array(row * row * 4);
  for (let j = 0; j <= segments; j++) {
    for (let i = 0; i <= segments; i++) {
      const o = (j * row + i) * 4;
      vertices[o] = -halfSize + i * cell + (hash(i, j, 1) * 2 - 1) * jitter * cell;
      vertices[o + 1] = -halfSize + j * cell + (hash(i, j, 2) * 2 - 1) * jitter * cell;
      vertices[o + 2] = hash(i, j, 3) * 2 - 1;
      vertices[o + 3] = hash(i, j, 4);
    }
  }

  const indices = new Uint32Array(segments * segments * 6);
  let k = 0;
  for (let j = 0; j < segments; j++) {
    for (let i = 0; i < segments; i++) {
      const a = j * row + i;
      const b = a + 1;
      const c = a + row;
      const d = c + 1;
      if (hash(i, j, 5) < 0.5) {
        indices.set([a, c, b, b, c, d], k);
      } else {
        indices.set([a, c, d, a, d, b], k);
      }
      k += 6;
    }
  }

  return { vertices, indices };
}

function uniformLocator(gl: WebGL2RenderingContext, program: WebGLProgram) {
  return (name: string) => {
    const l = gl.getUniformLocation(program, name);
    if (!l && isDev) console.warn(`[PolygonOcean] uniform ${name} not found`);
    return l;
  };
}

/** Waves, fog, and vignette: everything both programs need to agree on. */
function setSharedUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const loc = uniformLocator(gl, program);

  const waves = new Float32Array(MAX_WAVES * 4);
  const amplitudes = new Float32Array(4);
  config.waves.list.slice(0, MAX_WAVES).forEach((w, i) => {
    const len = Math.hypot(w.dir[0], w.dir[1]) || 1;
    waves.set([w.dir[0] / len, w.dir[1] / len, w.frequency, w.speed], i * 4);
    amplitudes[i] = w.amplitude;
  });

  gl.uniform4fv(loc("uWaves"), waves);
  gl.uniform4fv(loc("uWaveAmplitudes"), amplitudes);
  gl.uniform2f(loc("uFog"), config.fog.near, config.fog.far);
  gl.uniform2fv(loc("uVignetteCenter"), config.vignette.center);
  gl.uniform3f(loc("uVignette"), config.vignette.inner, config.vignette.outer, config.vignette.strength);

  return {
    viewProj: loc("uViewProj"),
    time: loc("uTime"),
    cameraPos: loc("uCameraPos"),
    resolution: loc("uResolution"),
  };
}

function setOceanUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): OceanUniforms {
  const loc = uniformLocator(gl, program);
  const [lx, ly, lz] = config.light.direction;
  const lLen = Math.hypot(lx, ly, lz) || 1;
  const { specularTint, patchTint, patchScale, patchSpeed } = config.reflection;

  gl.uniform1f(loc("uHeightNoise"), config.grid.heightNoise);
  gl.uniform1f(loc("uHeightNoiseDrift"), config.grid.heightNoiseDrift);
  gl.uniform3f(loc("uLightDir"), lx / lLen, ly / lLen, lz / lLen);
  gl.uniform3fv(loc("uBaseColor"), hexToRgb(config.colors.base));
  gl.uniform3fv(loc("uShadowColor"), hexToRgb(config.colors.shadow));
  gl.uniform3fv(loc("uHighlightColor"), hexToRgb(config.colors.highlight));
  gl.uniform3fv(loc("uReflectionColor"), hexToRgb(config.colors.reflection));
  gl.uniform4f(loc("uReflection"), specularTint, patchTint, patchScale, patchSpeed);
  gl.uniform2f(loc("uShadeRange"), config.light.shadeLow, config.light.shadeHigh);
  gl.uniform3f(loc("uSpecular"), config.light.specularStrength, config.light.specularPower, config.light.brightnessCap);

  return setSharedUniforms(gl, program);
}

function setParticleUniforms(gl: WebGL2RenderingContext, program: WebGLProgram): ParticleUniforms {
  const loc = uniformLocator(gl, program);
  const p = config.particles;

  gl.uniform1f(loc("uHeight"), p.height);
  gl.uniform1f(loc("uSway"), p.sway);
  gl.uniform1f(loc("uSurfaceFade"), p.surfaceFade);
  gl.uniform3fv(loc("uColorA"), hexToRgb(p.colorA));
  gl.uniform3fv(loc("uColorB"), hexToRgb(p.colorB));
  gl.uniform1f(loc("uOpacity"), p.opacity);

  return {
    ...setSharedUniforms(gl, program),
    camRight: loc("uCamRight"),
    camUp: loc("uCamUp"),
  };
}

/**
 * Per-particle instance data: (x, z, phase, kind) and (speed, size, colorMix, spin), all hashed
 * so the field is identical on every load.
 */
export function buildParticles(count: number) {
  const p = config.particles;
  const lerp = (range: readonly [number, number], t: number) => range[0] + (range[1] - range[0]) * t;

  const data = new Float32Array(count * 8);
  for (let i = 0; i < count; i++) {
    const leaf = hash(i, 0, 11) < p.leafRatio ? 1 : 0;
    data.set(
      [
        (hash(i, 0, 12) * 2 - 1) * p.spreadX,
        lerp(p.zRange, hash(i, 0, 13)),
        hash(i, 0, 14),
        leaf,
        lerp(leaf ? p.speedLeaf : p.speedDrop, hash(i, 0, 15)),
        lerp(leaf ? p.sizeLeaf : p.sizeDrop, hash(i, 0, 16)),
        hash(i, 0, 17),
        hash(i, 0, 18),
      ],
      i * 8,
    );
  }
  return data;
}

function linkProgram(gl: WebGL2RenderingContext, vsSource: string, fsSource: string, label: string) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  const cleanup = () => {
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
  };

  if (!vs || !fs || !program) {
    if (isDev) console.error(`[PolygonOcean] ${label}: shader or program creation failed`);
    cleanup();
    return null;
  }

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    if (isDev) console.error(`[PolygonOcean] ${label} failed to link:\n${gl.getProgramInfoLog(program)}`);
    cleanup();
    return null;
  }
  return { program, shaders: [vs, fs] as [WebGLShader, WebGLShader] };
}

function destroyParticles(gl: WebGL2RenderingContext, res: ParticleResources) {
  gl.deleteVertexArray(res.vao);
  gl.deleteBuffer(res.quadBuffer);
  gl.deleteBuffer(res.instanceBuffer);
  gl.deleteProgram(res.program);
  gl.deleteShader(res.shaders[0]);
  gl.deleteShader(res.shaders[1]);
}

function createParticles(gl: WebGL2RenderingContext, count: number): ParticleResources | null {
  if (count <= 0) return null;
  const linked = linkProgram(gl, particleVertexShader, particleFragmentShader, "particle program");
  if (!linked) return null;

  const vao = gl.createVertexArray();
  const quadBuffer = gl.createBuffer();
  const instanceBuffer = gl.createBuffer();
  if (!vao || !quadBuffer || !instanceBuffer) {
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(quadBuffer);
    gl.deleteBuffer(instanceBuffer);
    gl.deleteProgram(linked.program);
    gl.deleteShader(linked.shaders[0]);
    gl.deleteShader(linked.shaders[1]);
    return null;
  }

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, instanceBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, buildParticles(count), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);
  gl.vertexAttribDivisor(1, 1);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
  gl.vertexAttribDivisor(2, 1);
  gl.bindVertexArray(null);

  gl.useProgram(linked.program);
  const uniforms = setParticleUniforms(gl, linked.program);

  return { ...linked, vao, quadBuffer, instanceBuffer, count, uniforms };
}

export function destroyResources(gl: WebGL2RenderingContext, res: OceanResources) {
  gl.deleteVertexArray(res.vao);
  gl.deleteBuffer(res.vertexBuffer);
  gl.deleteBuffer(res.indexBuffer);
  gl.deleteProgram(res.program);
  gl.deleteShader(res.shaders[0]);
  gl.deleteShader(res.shaders[1]);
  if (res.particles) destroyParticles(gl, res.particles);
}

/** Compiles, links, and uploads everything. Returns null (and cleans up) on any ocean failure. */
export function createResources(
  gl: WebGL2RenderingContext,
  segments: number,
  particleCount: number,
): OceanResources | null {
  const linked = linkProgram(gl, vertexShader, fragmentShader, "ocean program");
  if (!linked) return null;
  const { program, shaders } = linked;
  const vao = gl.createVertexArray();
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  if (!vao || !vertexBuffer || !indexBuffer) {
    if (isDev) console.error("[PolygonOcean] buffer creation failed");
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(program);
    gl.deleteShader(shaders[0]);
    gl.deleteShader(shaders[1]);
    return null;
  }

  const { vertices, indices } = buildGrid(segments);

  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
  gl.bindVertexArray(null);

  gl.useProgram(program);
  const uniforms = setOceanUniforms(gl, program);

  gl.enable(gl.DEPTH_TEST);
  // Particles are drawn after the ocean with straight alpha; the ocean ignores blending state.
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const [r, g, b] = hexToRgb(config.colors.base);
  gl.clearColor(r, g, b, 1);

  return {
    program,
    shaders,
    vao,
    vertexBuffer,
    indexBuffer,
    indexCount: indices.length,
    uniforms,
    particles: createParticles(gl, particleCount),
  };
}
