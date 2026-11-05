# 調整メモ

## 長さの決め方

- 組み上げは要素の数に比例する。要素が多いページは `buildEnd` を長くする。
- 1場面は 130〜190 フレーム（30fps）が目安。場面どうしは10フレーム重ねる。
- カーソルが少ないほど1つずつの動きが見える。多いほど群れらしくなる。

## 場面ごとの変え方

動きは全場面で同じにし、次の3つだけを変える。

- `cam`: 拡大率とスクロール量
- `cursors`: カーソルの数
- `order`: `y` `x` `center`

## Remotion の Chrome が動かないとき

同梱のブラウザが起動しない環境では、Playwright の chrome-headless-shell を使う。

```sh
REMOTION_BROWSER=$HOME/.cache/ms-playwright/chromium_headless_shell-<版>/chrome-headless-shell-linux64/chrome-headless-shell pnpm render
```

`remotion.config.ts` は `swangle` の GL を指定している。

## 音を付ける

ffmpeg で合成の環境音を作って重ねる。

```sh
ffmpeg -f lavfi -i "aevalsrc=0.05*sin(2*PI*110*t)+0.04*sin(2*PI*165*t)+0.03*sin(2*PI*220*t):d=30" -af "afade=t=in:d=2,afade=t=out:st=28:d=2" out/pad.m4a
ffmpeg -i out/pv.mp4 -i out/pad.m4a -c:v copy -c:a aac -shortest out/pv-audio.mp4
```

長さは動画に合わせて直す。

## 撮影の注意

- ダークテーマで撮る。テーマの保存先が `localStorage` の `theme` 以外なら `scripts/capture.mjs` を直す。
- 要素の座標は表示範囲に入るものだけを取る。縦に長いページは `--max-height` で撮る高さを決める。
