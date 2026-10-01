// GLSL ES 3.00 sources for the polygon ocean.

export const MAX_WAVES = 4;

export const vertexShader = /* glsl */ `#version 300 es
precision highp float;

// x, z: jittered grid position. noise: static per-vertex height seed and phase.
layout(location = 0) in vec2 aPosition;
layout(location = 1) in vec2 aNoise;

uniform mat4 uViewProj;
uniform float uTime;
uniform vec4 uWaves[${MAX_WAVES}];    // dir.x, dir.z, frequency, speed
uniform vec4 uWaveAmplitudes;          // one amplitude per wave
uniform float uHeightNoise;
uniform float uHeightNoiseDrift;

out vec3 vWorld;

void main() {
  vec2 p = aPosition;
  float h = 0.0;
  for (int i = 0; i < ${MAX_WAVES}; i++) {
    vec4 w = uWaves[i];
    h += uWaveAmplitudes[i] * sin(dot(w.xy, p) * w.z + uTime * w.w);
  }
  float breathe = 1.0 - uHeightNoiseDrift + uHeightNoiseDrift * sin(uTime * 0.3 + aNoise.y * 6.2831853);
  h += aNoise.x * uHeightNoise * breathe;

  vWorld = vec3(p.x, h, p.y);
  gl_Position = uViewProj * vec4(vWorld, 1.0);
}
`;

export const fragmentShader = /* glsl */ `#version 300 es
precision highp float;

in vec3 vWorld;

uniform vec3 uCameraPos;
uniform vec3 uLightDir;          // normalized, towards the light
uniform vec3 uBaseColor;         // page background = fog = vignette color
uniform vec3 uShadowColor;
uniform vec3 uHighlightColor;
uniform vec2 uShadeRange;        // lambert low/high
uniform vec2 uSpecular;          // strength, power
uniform vec2 uFog;               // near, far
uniform vec2 uResolution;
uniform vec2 uVignetteCenter;
uniform vec3 uVignette;          // inner, outer, strength

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

  vec3 color = mix(uShadowColor, uHighlightColor, shade) + uHighlightColor * spec;
  color = min(color, uHighlightColor * 1.05);

  float fog = smoothstep(uFog.x, uFog.y, dist);

  vec2 uv = gl_FragCoord.xy / uResolution - uVignetteCenter;
  uv.x *= uResolution.x / uResolution.y;
  float vig = smoothstep(uVignette.x, uVignette.y, length(uv)) * uVignette.z;

  color = mix(color, uBaseColor, max(fog, vig));
  outColor = vec4(color, 1.0);
}
`;
