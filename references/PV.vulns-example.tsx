import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {BuildPage, FONT, COLORS} from './Build';
import home from './home.json';
import detail from './detail.json';
import stats from './stats.json';
import pkg from './pkg.json';
import scan from './scan.json';

export const DURATION = 840;
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const p01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const op = Math.min(p01(f, 0, 10), 1 - p01(f, dur - 10, dur));
  return <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>;
};

const Caption: React.FC<{lines: string[]; at: number; sub?: string}> = ({lines, at, sub}) => {
  const f = useCurrentFrame();
  return (
    <><div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: 'linear-gradient(transparent, #0b0b0c 85%)', zIndex: 40}} />
    <div style={{position: 'absolute', left: 90, bottom: 70, zIndex: 50, fontFamily: FONT, color: '#fff', textShadow: '0 4px 30px #000'}}>
      {lines.map((l, i) => {
        const p = p01(f, at + i * 5, at + 20 + i * 5);
        return <div key={l} style={{fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 10}px)`}}>{l}</div>;
      })}
      {sub && <div style={{fontSize: 28, color: '#a1a1aa', marginTop: 16, opacity: p01(f, at + 18, at + 36)}}>{sub}</div>}
    </div></>
  );
};

const Fade: React.FC<{from: number; children: React.ReactNode}> = ({from, children}) => {
  const f = useCurrentFrame();
  return <div style={{opacity: p01(f, from, from + 14) * (1 - p01(f, from + 82, from + 96))}}>{children}</div>;
};

const SOURCES = ['NVD', 'CISA KEV', 'EPSS', 'CVE.org', 'OSV', 'GitHub Advisories', 'JVN'];
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const conv = interpolate(f, [34, 70], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const typed = 'CVE-2021-44228'.slice(0, Math.floor(interpolate(f, [72, 100], [0, 14], clamp)));
  const l1 = p01(f, 4, 22), l2 = p01(f, 28, 46);
  return (
    <AbsoluteFill style={{fontFamily: FONT, color: '#fff'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 64, fontWeight: 700, letterSpacing: -2, opacity: l1 * (1 - conv), transform: `translateY(${(1 - l1) * 30}px)`, filter: `blur(${(1 - l1) * 10}px)`}}>脆弱性の情報は、散らばっている。</div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 150, textAlign: 'center', fontSize: 64, fontWeight: 700, letterSpacing: -2, opacity: l2 * p01(f, 60, 74), transform: `translateY(${(1 - l2) * 30}px)`}}>だから、ひとつの検索に。</div>
      {SOURCES.map((t, i) => {
        const ang = i * 2.4 + 0.6, r = 330 + (i % 3) * 90;
        const sx = 960 + Math.cos(ang) * r * 1.5 + Math.sin(f / 18 + i) * 14, sy = 560 + Math.sin(ang) * r * 0.9 + Math.cos(f / 15 + i) * 12;
        const x = sx + (960 - sx) * conv, y = Math.max(320, sy) + (560 - Math.max(320, sy)) * conv;
        const op = p01(f, 8 + i * 3, 22 + i * 3) * (1 - p01(f, 62, 72));
        return <div key={t} style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) scale(${1 - conv * 0.5})`, opacity: op, padding: '12px 24px', borderRadius: 999, border: `1.5px solid ${COLORS[i]}`, background: `${COLORS[i]}1a`, fontSize: 28, fontWeight: 600, whiteSpace: 'nowrap'}}>{t}</div>;
      })}
      <div style={{position: 'absolute', left: 960, top: 560, transform: `translate(-50%,-50%) scale(${0.85 + p01(f, 60, 90) * 0.15})`, width: 760, height: 84, borderRadius: 999, border: '1.5px solid #3f3f46', background: '#141416', opacity: p01(f, 58, 74), display: 'flex', alignItems: 'center', padding: '0 36px', fontSize: 34, color: '#e4e4e7', fontFamily: 'ui-monospace, monospace'}}>
        <span style={{color: '#71717a', marginRight: 18}}>⌕</span>{typed}<span style={{opacity: Math.floor(f / 8) % 2, color: '#3b82f6'}}>|</span>
      </div>
      <div style={{position: 'absolute', left: 960, top: 700, transform: `translate(-50%,-50%) scale(${1 - 0.08 * Math.max(0, 1 - Math.abs(f - 108) / 3)})`, opacity: p01(f, 94, 104), padding: '14px 34px', borderRadius: 999, background: '#f5f5f5', color: '#111', fontSize: 28, fontWeight: 600}}>Build now</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = p01(f, 0, 22), b = p01(f, 10, 32), c = p01(f, 22, 44);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, color: '#fff', background: '#0b0b0c'}}>
      <div style={{display: 'flex', gap: 10, marginBottom: 36}}>
        {COLORS.map((c2, i) => <div key={c2} style={{width: 10, height: 10, borderRadius: 10, background: c2, opacity: a, transform: `translateY(${Math.sin((f + i * 3) / 5) * 5}px)`}} />)}
      </div>
      <div style={{fontSize: 120, fontWeight: 700, letterSpacing: -4, opacity: a, transform: `translateY(${(1 - a) * 30}px)`, filter: `blur(${(1 - a) * 12}px)`}}>Vulnerability.DB</div>
      <div style={{fontSize: 32, color: '#a1a1aa', marginTop: 22, opacity: b}}>CVE / CVSS / EPSS / CISA KEV。ひとつの検索で。</div>
      <div style={{fontSize: 30, marginTop: 48, padding: '14px 32px', borderRadius: 999, border: '1px solid #3f3f46', opacity: c}}>vulns.lapius7.com</div>
    </AbsoluteFill>
  );
};

const Tag: React.FC<{n: string}> = ({n}) => (
  <div style={{position: 'absolute', left: 90, top: 60, zIndex: 50, fontFamily: 'ui-monospace, monospace', fontSize: 20, color: '#71717a', letterSpacing: 2}}>{n} / 05</div>
);

export const PV: React.FC = () => (
  <AbsoluteFill style={{background: '#0b0b0c', fontFamily: FONT}}>
    <Sequence from={0} durationInFrames={120}><Scene dur={120}><Intro /></Scene></Sequence>
    <Sequence from={110} durationInFrames={190}>
      <Scene dur={190}>
        <BuildPage img="home.png" data={home} dur={190} cursors={12} cam={{s: [1.3, 1.3], y: [0, 330]}} buildStart={4} buildEnd={150} />
        <Tag n="01" /><Caption lines={['Search every', 'vulnerability.']} at={70} />
      </Scene>
    </Sequence>
    <Sequence from={290} durationInFrames={140}>
      <Scene dur={140}>
        <BuildPage img="detail.png" data={detail} dur={140} cursors={12} cam={{s: [1.1, 1.5], y: [0, 330], x: [-160, 90]}} buildStart={4} buildEnd={104} />
        <Tag n="02" /><Caption lines={['Know what', 'to fix first.']} at={46} sub="CVSS・EPSS・KEV を1ページに" />
      </Scene>
    </Sequence>
    <Sequence from={420} durationInFrames={130}>
      <Scene dur={130}>
        <BuildPage img="stats.png" data={stats} dur={130} cursors={12} cam={{s: [1.4, 1.2], y: [0, 760]}} buildStart={4} buildEnd={98} />
        <Tag n="03" /><Caption lines={['Watch the', 'whole landscape.']} at={50} />
      </Scene>
    </Sequence>
    <Sequence from={540} durationInFrames={100}>
      <Scene dur={100}>
        <BuildPage img="pkg.png" data={pkg} dur={100} cursors={10} cam={{s: [1.9, 1.35], y: [0, 40]}} buildStart={4} buildEnd={62} />
        <Tag n="04" /><Caption lines={['Find any', 'package.']} at={36} />
      </Scene>
    </Sequence>
    <Sequence from={630} durationInFrames={100}>
      <Scene dur={100}>
        <BuildPage img="scan.png" data={scan} dur={100} cursors={10} cam={{s: [1.3, 1.7], y: [0, 60], x: [100, -60]}} buildStart={4} buildEnd={62} />
        <Tag n="05" /><Caption lines={['Check your', 'dependencies.']} at={36} sub="ファイルはブラウザ内で解析。送るのはパッケージ名とバージョンだけ" />
      </Scene>
    </Sequence>
    <Sequence from={720}><Outro /></Sequence>
  </AbsoluteFill>
);
