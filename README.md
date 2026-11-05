# swarm-build-skill

色違いのカーソルが群れで動き、ページの実物に枠を描いて文字を打ち込みながら組み上げていく動画を、[Remotion](https://www.remotion.dev/) で作る Claude Code 用スキルです。この演出を**スウォームビルド**と呼びます。

## できること

- Web ページを撮影し、要素の座標を取って、組み上がる動画にする
- カーソルの数、カメラ、組み上がる順番を場面ごとに変える
- 動かせるテンプレートと撮影スクリプトを含む

## 動きの流れ

1. カーソルが要素に枠を描く
2. 枠の中に文字が打たれる
3. 枠が消え、要素だけが残る
4. 小さな要素は拡大してポンと出る
5. 担当を終えたカーソルは画面をうろついて薄れる

## 構成

| パス | 内容 |
|---|---|
| `SKILL.md` | スキル本体（演出の決まりと手順） |
| `template/` | そのまま動く Remotion プロジェクト |
| `template/src/Build.tsx` | 演出のエンジン（`BuildPage`） |
| `template/src/scenes.ts` | 場面の一覧。ここを編集する |
| `template/scripts/capture.mjs` | 画面を撮り、要素の座標を出す |
| `references/tuning.md` | 長さ、音、ブラウザの調整メモ |
| `references/PV.vulns-example.tsx` | 実際の PV で使った構成の例 |

## 導入

次の1行で `~/.claude/skills/swarm-build` に入ります。再実行すると更新します。Private の間は、`gh` にログインしている必要があります。

```sh
gh api repos/Lapius7/swarm-build-skill/contents/install.sh -H 'Accept: application/vnd.github.raw' | bash
```

公開したあとは、`curl -fsSL https://raw.githubusercontent.com/Lapius7/swarm-build-skill/main/install.sh | bash` でも入ります。

Claude Code で「このサイトのスウォームビルドのPVを作って」のように頼むと、スキルが使われます。

## 手で使う

```sh
cp -r template ~/projects/my-pv && cd ~/projects/my-pv
pnpm install
node scripts/capture.mjs home=https://example.com/
pnpm studio   # プレビュー
pnpm render   # out/pv.mp4
```

撮影には Chromium が要ります。Playwright で入れたものを自動で探し、見つからなければ `CHROME_PATH` で指定します。

## BuildPage の引数

| 引数 | 役割 |
|---|---|
| `img`、`data` | 撮った画像と座標の JSON |
| `dur` | 場面の長さ（フレーム） |
| `cursors` | カーソルの数（12まで） |
| `cam` | `s` 拡大率、`y` スクロール量、`x` 横のずれ。開始と終了の2値 |
| `buildStart`、`buildEnd` | 組み上げの開始と終了のフレーム |
| `order` | `y`、`x`、`center` |
| `outline` | `box`、`dashed`、`underline` |

## 動作確認の範囲

- `template/` の型検査（`tsc`）は通ります。
- テンプレートで撮影から静止画の書き出しまで通しました（`capture.mjs` で撮影、`remotion still` で組み上げ中の場面を表示）。動画（mp4）の再生は確かめていません。

## 注意

撮る相手は自分のサイトか撮影を許可されたものに限ります。

## ライセンス

MIT
