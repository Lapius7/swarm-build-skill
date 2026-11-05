// 使い方: node scripts/stills.mjs  （場面ごとに「組み上げ中」「組み上がり直後」「終わり際」の静止画を out/stills/ に書く）
// 動画を再生できない環境でも、途中で全体が出る・背景が崩れるなどの不具合を目で確かめるためのもの。
import {execFileSync} from 'child_process';
import fs from 'fs';
const src = fs.readFileSync('src/scenes.ts', 'utf8');
const scenes = [...src.matchAll(/dur:\s*(\d+).*?buildEnd:\s*(\d+)/g)].map(m => ({dur: +m[1], end: +m[2]}));
const OVERLAP = 18, VIEW = 70, INTRO = 120;
fs.mkdirSync('out/stills', {recursive: true});
let acc = INTRO - OVERLAP;
scenes.forEach((s, i) => {
  const dur = Math.max(s.dur, s.end + VIEW);
  const marks = {mid: Math.round(s.end * 0.5), done: s.end + 15, tail: dur - 24};
  for (const [k, f] of Object.entries(marks)) {
    const frame = acc + f;
    execFileSync('pnpm', ['exec', 'remotion', 'still', 'src/index.ts', 'PV', `out/stills/s${i + 1}-${k}.png`, `--frame=${frame}`], {stdio: 'inherit'});
  }
  acc += dur - OVERLAP;
});
console.log('out/stills/ を開いて確かめる');
