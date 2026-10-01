// Raw WebGL2 setup for the polygon ocean: shader compile/link, jittered grid mesh, uniforms.

import { config, hexToRgb } from "./config";
import { fragmentShader, MAX_WAVES, vertexShader } from "./shaders";

const isDev = process.env.NODE_ENV !== "production";

export type OceanUniforms = {
  viewProj: WebGLUniformLocation | null;
  time: WebGLUniformLocation | null;
  cameraPos: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
};

export type OceanResources = {
  program: WebGLProgram;
  shaders: [WebGLShader, WebGLShader];
  vao: WebGLVertexArrayObject;
  vertexBuffer: WebGLBuffer;
  indexBuffer: WebGLBuffer;
  indexCount: number;
  uniforms: OceanUniforms;
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

function setStaticUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const loc = (name: string) => {
    const l = gl.getUniformLocation(program, name);
    if (!l && isDev) console.warn(`[PolygonOcean] uniform ${name} not found`);
    return l;
  };

  const waves = new Float32Array(MAX_WAVES * 4);
  const amplitudes = new Float32Array(4);
  config.waves.list.slice(0, MAX_WAVES).forEach((w, i) => {
    const len = Math.hypot(w.dir[0], w.dir[1]) || 1;
    waves.set([w.dir[0] / len, w.dir[1] / len, w.frequency, w.speed], i * 4);
    amplitudes[i] = w.amplitude;
  });

  const [lx, ly, lz] = config.light.direction;
  const lLen = Math.hypot(lx, ly, lz) || 1;

  gl.uniform4fv(loc("uWaves"), waves);
  gl.uniform4fv(loc("uWaveAmplitudes"), amplitudes);
  gl.uniform1f(loc("uHeightNoise"), config.grid.heightNoise);
  gl.uniform1f(loc("uHeightNoiseDrift"), config.grid.heightNoiseDrift);
  gl.uniform3f(loc("uLightDir"), lx / lLen, ly / lLen, lz / lLen);
  gl.uniform3fv(loc("uBaseColor"), hexToRgb(config.colors.base));
  gl.uniform3fv(loc("uShadowColor"), hexToRgb(config.colors.shadow));
  gl.uniform3fv(loc("uHighlightColor"), hexToRgb(config.colors.highlight));
  gl.uniform2f(loc("uShadeRange"), config.light.shadeLow, config.light.shadeHigh);
  gl.uniform2f(loc("uSpecular"), config.light.specularStrength, config.light.specularPower);
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

export function destroyResources(gl: WebGL2RenderingContext, res: OceanResources) {
  gl.deleteVertexArray(res.vao);
  gl.deleteBuffer(res.vertexBuffer);
  gl.deleteBuffer(res.indexBuffer);
  gl.deleteProgram(res.program);
  gl.deleteShader(res.shaders[0]);
  gl.deleteShader(res.shaders[1]);
}

/** Compiles, links, and uploads everything. Returns null (and cleans up) on any failure. */
export function createResources(gl: WebGL2RenderingContext, segments: number): OceanResources | null {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertexShader);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  const vao = gl.createVertexArray();
  const vertexBuffer = gl.createBuffer();
  const indexBuffer = gl.createBuffer();

  const fail = (reason: string) => {
    if (isDev) console.error(`[PolygonOcean] ${reason}`);
    gl.deleteVertexArray(vao);
    gl.deleteBuffer(vertexBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteProgram(program);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return null;
  };

  if (!vs || !fs) return fail("shader creation failed");
  if (!program) return fail("createProgram returned null");
  if (!vao || !vertexBuffer || !indexBuffer) return fail("buffer creation failed");

  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return fail(`program failed to link:\n${gl.getProgramInfoLog(program)}`);
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
  const uniforms = setStaticUniforms(gl, program);

  gl.enable(gl.DEPTH_TEST);
  const [r, g, b] = hexToRgb(config.colors.base);
  gl.clearColor(r, g, b, 1);

  return {
    program,
    shaders: [vs, fs],
    vao,
    vertexBuffer,
    indexBuffer,
    indexCount: indices.length,
    uniforms,
  };
}
