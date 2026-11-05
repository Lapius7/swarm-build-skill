import React, {useMemo} from 'react';
import {Easing, interpolate, staticFile, useCurrentFrame} from 'remotion';

export const FONT = 'Inter, "Noto Sans CJK JP", system-ui, sans-serif';
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const p01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

export const COLORS = ['#3b82f6', '#a855f7', '#14b8a6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4', '#eab308', '#8b5cf6', '#f97316', '#84cc16'];
const NAMES = ['layout', 'type', 'table', 'chart', 'color', 'a11y', 'copy', 'data', 'nav', 'motion', 'icons', 'api'];

export type PageData = {w: number; h: number; boxes: {x: number; y: number; w: number; h: number; rad?: number}[]};
type Cam = {s: [number, number]; y: [number, number]; x?: [number, number]};

type Job = {i: number; c: number; t: number; d: number; T: number; pop: boolean; b: PageData['boxes'][number]};

const hash = (n: number) => { const x = Math.sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };

export const BuildPage: React.FC<{img: string; data: PageData; dur: number; cursors?: number; cam: Cam; buildStart?: number; buildEnd?: number; fit?: number; order?: 'y' | 'x' | 'center'; outline?: 'box' | 'dashed' | 'underline'; mode?: 'swarm' | 'slide' | 'wipe' | 'flip' | 'assemble'}> = ({img, data, dur, cursors = 12, cam, buildStart = 6, buildEnd, fit = 1, mode = 'swarm', order = 'y', outline = 'box'}) => {
  const f = useCurrentFrame();
  const end = buildEnd ?? dur - 40;
  const {jobs, done} = useMemo(() => {
    const sorted = [...data.boxes].sort((a, b) => mode === 'assemble' ? hash(a.x * 7 + a.y) - hash(b.x * 7 + b.y) : order === 'x' ? Math.round(a.x / 300) - Math.round(b.x / 300) || a.y - b.y || a.x - b.x : order === 'center' ? Math.hypot(a.x + a.w / 2 - data.w / 2, a.y + a.h / 2 - 300) - Math.hypot(b.x + b.w / 2 - data.w / 2, b.y + b.h / 2 - 300) : a.y - b.y || a.x - b.x);
    // k: 1つの要素にかける時間の倍率。全要素が buildEnd までに終わる最大の k を探す
    const plan = (k: number) => {
      const gap = (end - buildStart - 30) / Math.max(1, sorted.length);
      const free = Array(Math.max(1, cursors)).fill(buildStart);
      const d = Math.max(5, Math.round(13 * k));
      let last = 0;
      const list: Job[] = sorted.map((b, i) => {
        let c = 0;
        for (let q = 1; q < free.length; q++) if (free[q] < free[c]) c = q;
        const pop = b.w < 56 && b.h < 56;
        const T = pop ? 4 : Math.max(3, Math.round(Math.min(16, Math.max(5, b.w / 22)) * k));
        const t = Math.max(buildStart + i * gap * 0.9, free[c]);
        free[c] = t + d + T + 4;
        last = Math.max(last, t + d + T + 8);
        return {i, c, t, d, T, pop, b};
      });
      return {jobs: list, done: last};
    };
    let r = plan(1);
    for (const k of [0.85, 0.7, 0.6, 0.5, 0.42, 0.34, 0.28]) { if (r.done <= end) break; r = plan(k); }
    return r;
  }, [data, cursors, end, buildStart, mode, order]);

  const s = interpolate(f, [0, dur], cam.s, {...clamp, easing: Easing.inOut(Easing.cubic)});
  const ty = interpolate(f, [0, Math.max(done, 1)], cam.y, {...clamp, easing: Easing.inOut(Easing.cubic)});
  const tx = (1920 - data.w * s * fit) / 2 + (cam.x ? interpolate(f, [0, dur], cam.x, clamp) : 0);
  const baseOp = p01(f, done, done + 16);

  const cursorEls = Array.from({length: cursors}, (_, c) => {
    const mine = jobs.filter(j => j.c === c);
    if (!mine.length) return null;
    const start0: [number, number] = [hash(c + 3) > 0.5 ? data.w + 200 : -200, hash(c + 7) * data.h * 0.4];
    let pos = start0, op = 0, k = -1;
    for (let q = 0; q < mine.length; q++) if (f >= mine[q].t - 12) k = q;
    if (k >= 0) {
      const j = mine[k];
      const prev: [number, number] = k === 0 ? start0 : [mine[k - 1].b.x + mine[k - 1].b.w, mine[k - 1].b.y + mine[k - 1].b.h];
      const trav = p01(f, j.t - 12, j.t);
      const draw = p01(f, j.t, j.t + j.d);
      const from: [number, number] = [j.b.x, j.b.y];
      const wob = Math.sin((f + c * 9) / 4) * 5;
      const a: [number, number] = [prev[0] + (from[0] - prev[0]) * trav, prev[1] + (from[1] - prev[1]) * trav];
      const typeP = j.pop ? 1 : p01(f, j.t + j.d, j.t + j.d + j.T);
      const bx2 = j.b.x + j.b.w - (1 - typeP) * j.b.w * (f >= j.t + j.d ? 1 : 0);
      pos = [a[0] + (j.b.x + j.b.w - a[0]) * draw + wob * (1 - draw), a[1] + (j.b.y + j.b.h - a[1]) * draw - wob * (1 - draw)];
      if (f >= j.t + j.d) pos = [j.b.x + j.b.w * typeP, j.b.y + j.b.h * 0.8];
      op = Math.min(1, p01(f, mine[0].t - 12, mine[0].t - 4));
      const last = mine[mine.length - 1];
      if (k === mine.length - 1 && f > last.t + last.d + last.T + 4) {
        const idle = f - (last.t + last.d + last.T + 4);
        pos = [pos[0] + idle * 1.2, pos[1] - idle * 0.8];
        op *= 1 - p01(f, last.t + last.d + last.T + 4, last.t + last.d + last.T + 18);
      }
    }
    return op > 0.01 ? <Cursor key={c} x={pos[0]} y={pos[1]} color={COLORS[c % 12]} label={NAMES[c % 12]} op={op} inv={1 / s} /> : null;
  });

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: data.w, height: data.h, transformOrigin: '0 0', transform: `translate(${tx}px, ${-ty * s * fit}px) scale(${s * fit})`, background: '#0b0b0c'}}>
      <div style={{position: 'absolute', inset: 0, backgroundImage: `url(${staticFile(img)})`, backgroundSize: `${data.w}px ${data.h}px`, opacity: baseOp}} />
      {jobs.map(j => {
        if (f < j.t) return null;
        const pad = 3;
        const bx = j.b.x - pad, by = j.b.y - pad, bw = j.b.w + pad * 2, bh = j.b.h + pad * 2;
        const img2 = {backgroundImage: `url(${staticFile(img)})`, backgroundSize: `${data.w}px ${data.h}px`, backgroundPosition: `${-bx}px ${-by}px`};
        const col = COLORS[j.c % 12];
        if (mode === 'swarm') {
          const draw = p01(f, j.t, j.t + j.d);
          const typeP = j.pop ? p01(f, j.t + 8, j.t + 14) : p01(f, j.t + j.d, j.t + j.d + j.T);
          const steps = Math.max(2, Math.round(j.b.w / 9));
          const typed = j.pop ? typeP : Math.floor(typeP * steps) / steps;
          const boxFade = 1 - p01(f, j.t + j.d + j.T, j.t + j.d + j.T + 8);
          const popS = j.pop ? interpolate(typeP, [0, 0.6, 1], [0, 1.25, 1], clamp) : 1;
          return (
            <React.Fragment key={j.i}>
              <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, ...img2, borderRadius: j.b.rad || 0, clipPath: j.pop ? undefined : `inset(0 ${(1 - typed) * 100}% 0 0 round ${j.b.rad || 0}px)`, opacity: j.pop ? Math.min(1, typeP * 2) : typed > 0 ? 1 : 0, transform: `scale(${popS})`}} />
              {!j.pop && typed > 0 && typed < 1 && <div style={{position: 'absolute', left: bx + bw * typed, top: by, width: 2 / s, height: bh, background: col}} />}
              <div style={{position: 'absolute', left: bx, top: by, width: bw * draw, height: bh * draw, border: `${1.5 / s}px solid ${col}`, background: `${col}14`, opacity: boxFade, borderRadius: 3}} />
            </React.Fragment>
          );
        }
        if (mode === 'slide') {
          const p = p01(f, j.t, j.t + 22);
          const side = j.b.x + j.b.w / 2 < data.w / 2 ? -1 : 1;
          return <div key={j.i} style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, ...img2, opacity: p, transform: `translateX(${side * 160 * (1 - p)}px)`, filter: `blur(${(1 - p) * 8}px)`}} />;
        }
        if (mode === 'wipe') {
          const p = interpolate(f, [j.t, j.t + 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
          return (
            <React.Fragment key={j.i}>
              <div style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, ...img2, clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`}} />
              <div style={{position: 'absolute', left: bx + bw * p - 1, top: by, width: 2 / s, height: bh, background: '#22c55e', boxShadow: '0 0 12px #22c55e', opacity: p < 1 ? 1 : 0}} />
            </React.Fragment>
          );
        }
        if (mode === 'flip') {
          const p = p01(f, j.t, j.t + 26);
          return <div key={j.i} style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, ...img2, opacity: Math.min(1, p * 2), transformOrigin: '50% 0', transform: `perspective(900px) rotateX(${(1 - p) * -85}deg) translateY(${(1 - p) * 30}px)`}} />;
        }
        const p = interpolate(f, [j.t, j.t + 26], [0, 1], {...clamp, easing: Easing.out(Easing.back(1.4))});
        const rx = (hash(j.i) - 0.5) * 1400, ry = (hash(j.i + 4) - 0.5) * 900, rr = (hash(j.i + 2) - 0.5) * 70;
        return <div key={j.i} style={{position: 'absolute', left: bx, top: by, width: bw, height: bh, ...img2, opacity: Math.min(1, p * 3), transform: `translate(${rx * (1 - p)}px, ${ry * (1 - p)}px) rotate(${rr * (1 - p)}deg) scale(${0.5 + p * 0.5})`}} />;
      })}
      {cursorEls}
    </div>
  );
};

const Cursor: React.FC<{x: number; y: number; color: string; label: string; op: number; inv: number}> = ({x, y, color, label, op, inv}) => (
  <div style={{position: 'absolute', left: x, top: y, zIndex: 20, opacity: op, transform: `scale(${inv * 1.15})`, transformOrigin: '0 0'}}>
    <svg width="24" height="24" viewBox="0 0 24 24" style={{display: 'block', filter: 'drop-shadow(0 2px 3px #0008)'}}><path d="M3 2l7 19 3-8 8-3z" fill={color} stroke="#000" strokeOpacity={0.5} strokeWidth="1" strokeLinejoin="round" /></svg>
    <span style={{position: 'absolute', left: 20, top: 20, background: color, color: '#fff', fontSize: 12, fontWeight: 600, padding: '2px 7px', borderRadius: 5, whiteSpace: 'nowrap', fontFamily: FONT}}>{label}</span>
  </div>
);
