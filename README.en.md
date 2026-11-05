# swarm-build-skill

[日本語](README.md) | English

A Claude Code skill that makes videos with [Remotion](https://www.remotion.dev/) in which multi-coloured cursors swarm over a real web page, draw a box around each element, type its text inside, and build the page up piece by piece. The effect is called **Swarm Build**.

## How it looks

1. A cursor draws a box around an element.
2. Text is typed inside the box.
3. The box fades, leaving the element.
4. Small elements (under 56px) pop in with a scale overshoot.
5. Cursors that finish wander around and fade out.

## Install

```sh
curl -fsSL https://raw.githubusercontent.com/Lapius7/swarm-build-skill/main/install.sh | bash
```

This clones the repo to `~/.claude/skills/swarm-build`. Run it again to update. Requires `git` (uses `gh` if present).

Then ask Claude Code, for example: "Make a Swarm Build promo video for this site."

## Use it by hand

```sh
cp -r template ~/projects/my-pv && cd ~/projects/my-pv
pnpm install
node scripts/capture.mjs home=https://example.com/   # screenshot + element boxes
pnpm studio                                          # preview
pnpm render                                          # out/pv.mp4
```

Capture needs Chromium: it looks in the Playwright cache, or set `CHROME_PATH`. If Remotion's own Chrome will not start, set `REMOTION_BROWSER`.

Edit `template/src/scenes.ts` to arrange scenes. See `references/scenes.example.ts`.

## BuildPage props

| Prop | Meaning |
|---|---|
| `img`, `data` | Screenshot and its element-box JSON |
| `dur` | Scene length in frames |
| `cursors` | Number of cursors (max 12) |
| `cam` | `s` scale, `y` scroll, `x` shift; each is a `[start, end]` pair |
| `buildStart`, `buildEnd` | Frames where building starts and ends |
| `order` | `y` (top-down), `x` (left columns first), `center` (outward) |
| `outline` | `box`, `dashed`, `underline` |

## Verified

The template type-checks, and capture and still rendering work end to end. Playback of the rendered mp4 has not been checked.

## Notes

`SKILL.md` is written in Japanese. Only capture pages you own or have permission to record.

## License

MIT
