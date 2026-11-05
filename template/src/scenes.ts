// 場面の一覧。ここを編集して PV を組み立てる。page は capture で付けた名前。
export type SceneDef = {
  page: string;
  dur: number; // 場面の長さ（フレーム）
  cursors: number; // 1〜12
  cam: {s: [number, number]; y: [number, number]; x?: [number, number]};
  buildEnd: number; // 組み上げを終えるフレーム
  order?: 'y' | 'x' | 'center';
  caption?: {lines: string[]; sub?: string};
};

export const scenes: SceneDef[] = [
  {page: 'home', dur: 190, cursors: 12, cam: {s: [1.3, 1.3], y: [0, 330]}, buildEnd: 150, caption: {lines: ['Your headline', 'goes here.']}},
];

export const TITLE = 'Product name';
export const URL_TEXT = 'example.com';
export const TAGLINE = 'ひとこと説明をここに。';
