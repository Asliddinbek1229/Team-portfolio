// Lenta shaderi (template asosida). Butun ekranli bitta uchburchak chiziladi,
// fon, kartalar, egilish va rang ajralishi fragment shaderda hisoblanadi.

export const VERT = `attribute vec2 aPos; varying vec2 vUv; void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`

export const FRAG = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform float uDpr;
uniform sampler2D uAtlas; uniform vec2 uGrid; uniform float uN;
uniform float uOffset; uniform float uS; uniform float uGap; uniform float uLabH; uniform float uRad;
uniform float uVert; uniform float uA0; uniform float uC0; uniform float uLo; uniform float uHi; uniform float uStride; uniform vec4 uFade;
uniform float uShrink; uniform float uTime; uniform float uIntro; uniform float uWob;
uniform float uE0; uniform float uMag; uniform float uLift; uniform float uVMag; uniform float uBendAmt;
uniform vec3 uCube; uniform vec3 uLabel; uniform vec3 uTint; uniform float uTintAmt;
uniform float uHover; uniform float uHoverT; uniform float uSeed; uniform float uLight;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float sdBox(vec2 p, vec2 b, float r){ vec2 q = abs(p) - b + r; return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r; }
float eOut(float x){ return 1.0 - pow(1.0 - x, 3.0); }
float eInOut(float x){ return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) * 0.5; }
float oval(vec2 uv, vec2 c, vec2 r, float fall){ return pow(clamp(1.0 - length((uv - c) / r), 0.0, 1.0), fall); }

vec3 bg(vec2 p){
  vec2 uv = p / uRes;
  float t = uTime;
  vec2 w = uv + 0.03 * vec2(sin(uv.y * 3.1 + t * 0.23), cos(uv.x * 2.6 - t * 0.19));
  vec3 col = mix(vec3(0.052, 0.048, 0.068), vec3(0.026, 0.025, 0.034), uv.y);
  vec3 ultra = vec3(0.16, 0.23, 1.0), violet = vec3(0.50, 0.22, 0.95), teal = vec3(0.0, 0.66, 0.60);
  vec3 plum = vec3(0.66, 0.13, 0.46), ember = vec3(0.90, 0.36, 0.10);
  vec3 top = mix(mix(ultra, violet, 0.5 + 0.5 * sin(t * 0.11)), teal, (0.5 + 0.5 * sin(t * 0.07 + 1.7)) * 0.55);
  top = mix(top, uTint, uTintAmt * 0.55);
  col += top * oval(w, vec2(0.5 + 0.1 * sin(t * 0.13), -0.06), vec2(1.0, 0.46), 1.6) * 0.46;
  col += mix(plum, ember, 0.5 + 0.5 * sin(t * 0.09 + 0.6)) * oval(w, vec2(0.12 + 0.07 * sin(t * 0.15), 1.1), vec2(0.62, 0.46), 1.8) * 0.3;
  col += mix(teal, ultra, 0.5 + 0.5 * sin(t * 0.12 + 2.4)) * oval(w, vec2(0.9 + 0.05 * cos(t * 0.11), 1.06), vec2(0.56, 0.44), 1.8) * 0.26;
  col += mix(uTint, top, 0.3) * oval(w, vec2(0.5, 0.5), vec2(0.42, 0.3), 2.2) * 0.07 * uTintAmt;
  if (uLight < 0.001) return col;
  // yorug' mavzu: qog'ozsimon och fon, xuddi shu harakatlanuvchi ranglar — pastel tusda
  vec3 lc = mix(vec3(0.972, 0.968, 0.955), vec3(0.94, 0.937, 0.925), uv.y);
  lc = mix(lc, mix(top, vec3(1.0), 0.35), oval(w, vec2(0.5 + 0.1 * sin(t * 0.13), -0.06), vec2(1.0, 0.46), 1.6) * 0.2);
  lc = mix(lc, mix(mix(plum, ember, 0.5 + 0.5 * sin(t * 0.09 + 0.6)), vec3(1.0), 0.4), oval(w, vec2(0.12 + 0.07 * sin(t * 0.15), 1.1), vec2(0.62, 0.46), 1.8) * 0.16);
  lc = mix(lc, mix(mix(teal, ultra, 0.5 + 0.5 * sin(t * 0.12 + 2.4)), vec3(1.0), 0.4), oval(w, vec2(0.9 + 0.05 * cos(t * 0.11), 1.06), vec2(0.56, 0.44), 1.8) * 0.15);
  lc = mix(lc, mix(uTint, vec3(1.0), 0.4), oval(w, vec2(0.5, 0.5), vec2(0.42, 0.3), 2.2) * 0.06 * uTintAmt);
  return mix(col, lc, uLight);
}

vec4 strip(vec2 p){
  bool vert = uVert > 0.5;
  float A = vert ? p.y : p.x;
  float X = vert ? p.x : p.y;
  float s = A - uA0 + uOffset;
  float k = floor(s / uStride + 0.5);
  float local = s - k * uStride - (vert ? uLabH * 0.5 : 0.0);
  float ord = k + 4.0;
  float e1 = clamp((uIntro - 0.1 - ord * 0.05) / 0.7, 0.0, 1.0);
  if (e1 <= 0.0) return vec4(0.0);
  float e2 = clamp((uIntro - 0.45 - ord * 0.06) / 1.3, 0.0, 1.0);
  float grow = eInOut(e2);
  bool hov = abs(k - uHover) < 0.5;
  float hT = hov ? uHoverT : 0.0;
  float sz = uS * (1.0 - 0.07 * uShrink) * (1.0 + 0.025 * hT);
  float h = mix(min(16.0, sz), sz, grow);
  float cc = uC0 + (1.0 - eOut(e1)) * (vert ? uRes.x * 0.9 : uRes.y * 0.7) + sin(s * 0.0042 + uTime * 0.85) * uWob;
  vec2 c = vert ? vec2(X - cc, local) : vec2(local, X - cc);
  float slot = mod(k, uN);
  float ci = mod(slot, uGrid.x);
  float ri = floor(slot / uGrid.x + 0.001);
  vec4 col = vec4(0.0);
  float inside = clamp(0.5 - sdBox(c, vec2(sz, h) * 0.5, min(uRad, h * 0.5)), 0.0, 1.0);
  if (inside > 0.0) {
    vec2 iuv = vec2(c.x / sz + 0.5, c.y / sz + 0.5);
    vec2 auv = vec2((ci + clamp(iuv.x, 0.002, 0.998)) / uGrid.x, (ri + (64.0 + clamp(iuv.y * 512.0, 1.0, 511.0)) / 576.0) / uGrid.y);
    vec3 img = texture2D(uAtlas, auv).rgb;
    vec2 cell = floor(clamp(iuv, 0.0, 0.999) * 10.0);
    float rp = clamp((uIntro - 1.15 - ord * 0.07) / 0.6, 0.0, 1.0);
    float cover = 1.0;
    cover = mix(cover, step(hash(cell + slot * 7.13), 0.75), step(0.2, rp));
    cover = mix(cover, step(hash(cell + 3.1 + slot), 0.5), step(0.4, rp));
    cover = mix(cover, step(hash(cell + 9.7 - slot), 0.25), step(0.6, rp));
    cover = mix(cover, 0.0, step(0.8, rp));
    img = mix(img, mix(vec3(0.11, 0.105, 0.13), vec3(0.86, 0.855, 0.84), uLight), cover);
    if (hT > 0.001) {
      vec2 cc = min(cell, 9.0 - cell);
      float dc = max(cc.x, cc.y);
      float hv = hash(cell * 1.7 + 17.0 + slot + uSeed);
      float pick = step(dc, 2.0) * step(hv, 0.52);
      float st = dc / 2.0 * 0.32 + hv * 0.5;
      float a = smoothstep(st, st + 0.24, hT) * 0.78 * pick;
      img = clamp((img - 0.5) * (1.0 + 0.1 * hT) + 0.5 + 0.03 * hT, 0.0, 1.0);
      img = mix(img, uCube, a);
    }
    col = vec4(img * inside, inside);
  }
  float ly = c.y + h * 0.5 + uLabH;
  if (ly >= 0.0 && ly < uLabH && abs(c.x) < sz * 0.5) {
    vec2 luv = vec2(c.x / sz + 0.5, ly / uLabH);
    vec2 auv2 = vec2((ci + clamp(luv.x, 0.004, 0.996)) / uGrid.x, (ri + clamp(luv.y * 64.0, 1.5, 58.0) / 576.0) / uGrid.y);
    float a = texture2D(uAtlas, auv2).a * smoothstep(0.55, 1.0, grow);
    col = vec4(uLabel * a, a) + col * (1.0 - a);
  }
  return col;
}
vec2 bendMap(vec2 p, out float t, out float sg){
  bool vert = uVert > 0.5;
  vec2 q = vert ? p.yx : p;
  float hw = q.x < uA0 ? uA0 - uLo : uHi - uA0;
  float u = (q.x - uA0) / hw;
  float a = abs(u);
  sg = u < 0.0 ? -1.0 : 1.0;
  float vy = (q.y - uC0) / uS;
  float e0 = max(0.2, uE0 - 0.1 * vy * vy);
  t = smoothstep(e0, 1.0, a) * uBendAmt;
  float span = max(1.0 - e0, 0.001);
  float ex = max(a - e0, 0.0) * uBendAmt;
  float aq = a - uMag * ex * ex / (2.0 * span);
  float cl = uC0 - sg * uLift * t * t;
  vec2 r = vec2(uA0 + sg * aq * hw, uC0 + (q.y - cl) / (1.0 + uVMag * t));
  return vert ? r.yx : r;
}

void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uRes;
  vec3 col;
  vec3 base = bg(p);
  vec4 s;
  float t, sg;
  vec2 q = bendMap(p, t, sg);
  if (t < 0.002) {
    s = strip(q); col = s.rgb + base * (1.0 - s.a);
  } else {
    vec2 dd = vec2(sg * 18.0, -sg * 6.0) * t * t;
    if (uVert > 0.5) dd = dd.yx;
    vec3 acc = vec3(0.0); vec3 ws = vec3(0.0); float al = 0.0;
    for (int i = 0; i < 7; i++) {
      float k = float(i) / 6.0;
      vec3 w = vec3(exp(-pow(k / 0.38, 2.0)), exp(-pow((k - 0.5) / 0.38, 2.0)), exp(-pow((k - 1.0) / 0.38, 2.0)));
      s = strip(q + dd * (k - 0.5));
      acc += (s.rgb + base * (1.0 - s.a)) * w; ws += w; al += s.a;
    }
    col = acc / ws;
    al /= 7.0;
    float hl = smoothstep(0.03, 0.2, t) * (1.0 - smoothstep(0.2, 0.5, t));
    col = mix(col, col * (1.0 - 0.3 * t * t) + vec3(0.08) * hl, al);
  }
  col = mix(base, col, smoothstep(uFade.x, uFade.y, p.y) * (1.0 - smoothstep(uFade.z, uFade.w, p.y)));
  col += (hash(p * uDpr + fract(uTime) * 61.0) - 0.5) * mix(0.022, 0.012, uLight);
  gl_FragColor = vec4(col, 1.0);
}`
