// GLSL ES 3.00 sources for the polygon ocean and the red particles falling into it.

export const MAX_WAVES = 4;

/** Shared by both vertex shaders so particles know where the water surface is. */
const waveHeight = /* glsl */ `
uniform vec4 uWaves[${MAX_WAVES}];    // dir.x, dir.z, frequency, speed
uniform vec4 uWaveAmplitudes;          // one amplitude per wave

float waveHeight(vec2 p, float t) {
  float h = 0.0;
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    vec4 w = uWaves[i];
    h += uWaveAmplitudes[i] * sin(dot(w.xy, p) * w.z + t * w.w);
  }
  return h;
}
`;

/** Shared fog + vignette fade so particles sit in the same atmosphere as the ocean. */
const atmosphere = /* glsl */ `
uniform vec2 uFog;               // near, far
uniform vec2 uResolution;
uniform vec2 uVignetteCenter;
uniform vec3 uVignette;          // inner, outer, strength

float atmosphere(float dist) {
  float fog = smoothstep(uFog.x, uFog.y, dist);
  vec2 uv = gl_FragCoord.xy / uResolution - uVignetteCenter;
  uv.x *= uResolution.x / uResolution.y;
  float vig = smoothstep(uVignette.x, uVignette.y, length(uv)) * uVignette.z;
  return max(fog, vig);
}
`;

export const vertexShader = /* glsl */ `#version 300 es
precision highp float;

// x, z: jittered grid position. noise: static per-vertex height seed and phase.
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aNoise;

uniform mat4 uViewProj;
uniform float uTime;
uniform float uHeightNoise;
uniform float uHeightNoiseDrift;
${waveHeight}
out vec3 vWorld;

void main() {
  vec2 p = aPosition;
  float h = waveHeight(p, uTime);
  float breathe = 1.0 - uHeightNoiseDrift + uHeightNoiseDrift * sin(uTime * 0.3 + aNoise.y * 6.2831853);
  h += aNoise.x * uHeightNoise * breathe;

  vWorld = vec3(p.x, h, p.y);
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}
`;

export const fragmentShader = /* glsl */ `#version 300 es
precision highp float;

in vec3 vWorld;

uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uLightDir;          // normalized, towards the light
uniform vec3 uBaseColor;         // page background = fog = vignette color
uniform vec3 uShadowColor;
uniform vec3 uHighlightColor;
uniform vec3 uReflectionColor;
uniform vec4 uReflection;        // specularTint, patchTint, patchScale, patchSpeed
uniform vec2 uShadeRange;        // lambert low/high
uniform vec2 uSpecular;          // strength, power
${atmosphere}
out vec4 outColor;

void main() {
  // Flat face normal from screen-space derivatives of the displaced position.
  vec3 n = normalize(cross(dFdx(vWorld), dFdy(vWorld)));
  if (n.y < 0.0) n = -n;

  vec3 toCamera = uCameraPos - vWorld;
  float dist = length(toCamera);
  vec3 v = toCamera / dist;

  float lambert = max(dot(n, uLightDir), 0.0);
  float shade = smoothstep(uShadeRange.x, uShadeRange.y, lambert);
  float spec = pow(max(dot(n, normalize(uLightDir + v)), 0.0), uSpecular.y) * uSpecular.x;

  // Slowly drifting patches where the water catches the red of the falling particles.
  vec2 q = vWorld.xz * uReflection.z;
  float t = uTime * uReflection.w;
  float field = sin(q.x + t) * sin(q.y * 1.3 - t * 0.8) + 0.6 * sin((q.x - q.y) * 0.7 + t * 1.4);
  float glow = smoothstep(0.2, 1.2, field);

  vec3 lit = mix(uHighlightColor, uReflectionColor * 0.7, glow * uReflection.y);
  vec3 glint = mix(uHighlightColor, uReflectionColor, uReflection.x);
  vec3 color = mix(uShadowColor, lit, shade) + glint * spec * (0.7 + 0.6 * glow);
  color = min(color, max(uHighlightColor, uReflectionColor * 0.75) * 1.05);

  color = mix(color, uBaseColor, atmosphere(dist));
  outColor = vec4(color, 1.0);
}
`;

export const particleVertexShader = /* glsl */ `#version 300 es
precision highp float;

layout(location = 0) in vec2 aCorner;   // unit quad corner, -1..1
layout(location = 1) in vec4 aSeedA;    // x, z, phase, kind (1 = leaf, 0 = drop)
layout(location = 2) in vec4 aSeedB;    // fall speed, size, color mix, spin

uniform mat4 uViewProj;
uniform float uTime;
uniform vec3 uCameraPos;
uniform vec3 uCamRight;
uniform vec3 uCamUp;
uniform float uHeight;
uniform float uSway;
uniform float uSurfaceFade;
${waveHeight}
out vec2 vUv;
out float vAlpha;
out float vKind;
out float vColorMix;
out float vDist;

void main() {
  float phase = aSeedA.z;
  float leaf = aSeedA.w;
  float speed = aSeedB.x;
  float size = aSeedB.y;
  float spin = aSeedB.z * 2.0 - 1.0;

  // Each particle loops from uHeight down to just below the water, offset by its phase.
  float span = uHeight + 1.5;
  float life = fract(phase + uTime * speed / span);
  float y = uHeight - life * span;

  // Leaves drift side to side as they fall; drops fall straight.
  vec2 xz = aSeedA.xy;
  xz.x += leaf * uSway * sin(uTime * 0.9 + phase * 19.0);
  xz.y += leaf * uSway * 0.5 * cos(uTime * 0.7 + phase * 13.0);

  float surface = waveHeight(xz, uTime);
  float alpha = smoothstep(surface, surface + uSurfaceFade, y) * smoothstep(0.0, 0.08, life);

  vec2 corner = aCorner;
  if (leaf > 0.5) {
    // Tumble: spin in the view plane and fake a flip by squashing one axis.
    float a = uTime * spin * 1.6 + phase * 6.2831853;
    float flip = max(abs(cos(uTime * (0.8 + abs(spin)) + phase * 9.0)), 0.25);
    corner.x *= flip;
    corner = mat2(cos(a), sin(a), -sin(a), cos(a)) * corner;
  } else {
    corner *= vec2(0.3, 2.4);   // thin vertical streak
  }

  vec3 world = vec3(xz.x, y, xz.y) + (uCamRight * corner.x + uCamUp * corner.y) * size;

  vUv = aCorner;
  vAlpha = alpha;
  vKind = leaf;
  vColorMix = aSeedB.z;
  vDist = length(uCameraPos - world);
  gl_Position = uViewProj * vec4(world, 1.0);
}
`;

export const particleFragmentShader = /* glsl */ `#version 300 es
precision highp float;

in vec2 vUv;
in float vAlpha;
in float vKind;
in float vColorMix;
in float vDist;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uOpacity;
${atmosphere}
out vec4 outColor;

void main() {
  vec3 color = mix(uColorA, uColorB, vColorMix);
  float shape;

  if (vKind > 0.5) {
    // Pointed leaf along y with a darker midrib.
    float halfWidth = 0.55 * (1.0 - vUv.y * vUv.y);
    shape = 1.0 - smoothstep(-0.1, 0.03, abs(vUv.x) - halfWidth);
    float rib = 1.0 - smoothstep(0.0, 0.08, abs(vUv.x));
    color *= 1.0 - 0.35 * rib;
  } else {
    // Drop: bright head at the bottom, tail fading upward.
    float across = 1.0 - smoothstep(0.2, 1.0, abs(vUv.x));
    float along = (1.0 - smoothstep(-1.0, 1.0, vUv.y)) * smoothstep(-1.0, -0.8, vUv.y);
    shape = across * along;
  }

  float alpha = shape * vAlpha * uOpacity * (1.0 - atmosphere(vDist));
  if (alpha < 0.004) discard;
  outColor = vec4(color, alpha);
}
`;
