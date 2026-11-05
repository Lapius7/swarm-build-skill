import {Config} from '@remotion/cli/config';

// Remotion 同梱の Chrome が動かない環境では、環境変数で手元のブラウザを指定する。
// 例: REMOTION_BROWSER=$HOME/.cache/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-linux64/chrome-headless-shell
if (process.env.REMOTION_BROWSER) {
  Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
}
Config.setChromiumOpenGlRenderer('swangle');
