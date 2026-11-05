import React from 'react';
import {AbsoluteFill, Easing, Sequence, interpolate, useCurrentFrame} from 'remotion';
import {BuildPage, FONT, COLORS, PageData} from './Build';
import {pages} from './data';
import {scenes, TITLE, URL_TEXT, TAGLINE} from './scenes';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ease = Easing.bezier(0.22, 1, 0.36, 1);
const p01 = (f: number, a: number, b: number) => interpolate(f, [a, b], [0, 1], {...clamp, easing: ease});

const INTRO = 120; // 点の列と「Build now」
const OVERLAP = 10;
const OUTRO = 120;
const starts: number[] = [];
let acc = INTRO - OVERLAP;
for (const s of scenes) { starts.push(acc); acc += s.dur - OVERLAP; }
export const DURATION = acc + OVERLAP + OUTRO - OVERLAP;

const Scene: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: Math.min(p01(f, 0, 10), 1 - p01(f, dur - 10, dur))}}>{children}</AbsoluteFill>;
};

const Caption: React.FC<{lines: string[]; sub?: string; at: number}> = ({lines, sub, at}) => {
  const f = useCurrentFrame();
  return (
    <>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 520, background: 'linear-gradient(transparent, #0b0b0c 85%)', zIndex: 40}} />
      <div style={{position: 'absolute', left: 90, bottom: 70, zIndex: 50, fontFamily: FONT, color: '#fff'}}>
        {lines.map((l, i) => {
          const p = p01(f, at + i * 5, at + 20 + i * 5);
          return <div key={l} style={{fontSize: 76, fontWeight: 700, letterSpacing: -3, lineHeight: 1.02, opacity: p, transform: `translateY(${(1 - p) * 40}px)`, filter: `blur(${(1 - p) * 10}px)`}}>{l}</div>;
        })}
        {sub && <div style={{fontSize: 28, color: '#a1a1aa', marginTop: 16, opacity: p01(f, at + 18, at + 36)}}>{sub}</div>}
      </div>
    </>
  );
};

// 小さな点の列と「Build now」ボタン。ボタンが押されて組み上げが始まる。
const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const op = p01(f, 0, 14);
  const press = interpolate(f, [88, 92, 98], [1, 0.92, 1], clamp);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, color: '#fff'}}>
      <div style={{position: 'absolute', top: 420, fontSize: 20, color: '#a1a1aa', opacity: op}}>{COLORS.length} subagents</div>
      <div style={{position: 'absolute', top: 470, display: 'flex', gap: 10, opacity: op}}>
        {COLORS.map((c, i) => <div key={c} style={{width: 8, height: 8, borderRadius: 8, background: c, transform: `translateY(${Math.sin((f + i * 4) / 5) * 4}px)`}} />)}
      </div>
      <div style={{padding: '14px 34px', borderRadius: 999, background: '#f5f5f5', color: '#111', fontSize: 28, fontWeight: 600, transform: `scale(${press})`, opacity: op, marginTop: 120}}>Build now</div>
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const a = p01(f, 0, 22), b = p01(f, 10, 32), c = p01(f, 22, 44);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', fontFamily: FONT, color: '#fff', background: '#0b0b0c'}}>
      <div style={{fontSize: 120, fontWeight: 700, letterSpacing: -4, opacity: a, transform: `translateY(${(1 - a) * 30}px)`}}>{TITLE}</div>
      <div style={{fontSize: 32, color: '#a1a1aa', marginTop: 22, opacity: b}}>{TAGLINE}</div>
      <div style={{fontSize: 30, marginTop: 48, padding: '14px 32px', borderRadius: 999, border: '1px solid #3f3f46', opacity: c}}>{URL_TEXT}</div>
    </AbsoluteFill>
  );
};

export const PV: React.FC = () => (
  <AbsoluteFill style={{background: '#0b0b0c', fontFamily: FONT}}>
    <Sequence from={0} durationInFrames={INTRO}><Scene dur={INTRO}><Intro /></Scene></Sequence>
    {scenes.map((s, i) => {
      const d = pages[s.page] as {data: PageData; img: string};
      return (
        <Sequence key={s.page + i} from={starts[i]} durationInFrames={s.dur}>
          <Scene dur={s.dur}>
            <BuildPage img={d.img} data={d.data} dur={s.dur} cursors={s.cursors} cam={s.cam} buildStart={4} buildEnd={s.buildEnd} order={s.order} />
            {s.caption && <Caption lines={s.caption.lines} sub={s.caption.sub} at={Math.round(s.buildEnd * 0.4)} />}
          </Scene>
        </Sequence>
      );
    })}
    <Sequence from={DURATION - OUTRO}><Outro /></Sequence>
  </AbsoluteFill>
);
