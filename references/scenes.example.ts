// template/src/scenes.ts の記入例。ページごとにカメラ、カーソル数、順番だけを変え、動きそのものは変えない。
import type {SceneDef} from '../template/src/scenes';

export const scenes: SceneDef[] = [
  // 1. トップ: 12本で上から組み上げ、ゆっくり下へ
  {page: 'home', dur: 190, cursors: 12, cam: {s: [1.3, 1.3], y: [0, 330]}, buildEnd: 150, order: 'y',
   caption: {lines: ['Find it', 'in seconds.']}},
  // 2. 詳細: 少ないカーソルで、中央から外へ
  {page: 'detail', dur: 150, cursors: 7, cam: {s: [1.25, 1.4], y: [0, 120]}, buildEnd: 115, order: 'center',
   caption: {lines: ['Every detail,', 'one page.']}},
  // 3. 統計: 左の列から。グラフは下地が先に見える
  {page: 'stats', dur: 150, cursors: 9, cam: {s: [1.2, 1.2], y: [0, 200]}, buildEnd: 120, order: 'x'},
];
