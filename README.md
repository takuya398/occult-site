# occult-site

## Setup / Development

- VS Codeで occult-site フォルダを開いていることを確認（左のエクスプローラーに .gitignore / README.md が見えている状態）。
- ターミナルを開く（VS Code メニュー：ターミナル → 新しいターミナル）。
- Node.js と npm が使えるか確認する。

```bash
node -v
npm -v
```

- どちらも数字が出ればOK。出ない場合は Node.js（LTS）をインストールして再起動。
- Next.js をリポジトリ直下に生成（"." が重要）。

```bash
npm create next-app@latest .
```

- 実行時の設定（おすすめ）。
  - TypeScript → Yes
  - ESLint → Yes
  - Tailwind CSS → Yes
  - src/ directory → Yes
  - App Router → Yes
  - Import alias (@/*) → Yes
- 既存ファイルの上書き確認が出た場合、.gitignore / LICENSE / README.md があるだけなら基本OK。
- 依存関係が自動で入らない/エラーが出た場合は手動でインストール。

```bash
npm install
```

- 起動（ローカル確認）。

```bash
npm run dev
```

- ブラウザで http://localhost:3000 を開き、Next.jsのトップ画面が表示されれば成功。

- よくあるエラーと対処。
  - npm が認識されない（例：'npm' is not recognized...）
    - 対処：Node.js（LTS）をインストール → PC再起動 → node -v 再確認
  - 権限エラー（WindowsのPowerShell）
    - 対処：VS Codeターミナルを PowerShell → Command Prompt に変更、または管理者権限でVS Code起動
  - ポート3000が使用中（例：Port 3000 is in use）
    - 対処：Yで別ポートにする（例：3001）。その場合：http://localhost:3001

- 生成後にできているべきもの（確認）。
  - package.json
  - next.config.*（バージョンで異なる）
  - src/（Yesにした場合）
  - app/（App Router）
  - node_modules/（インストール後）

- 動作確認できたらコミットして push。

```bash
git add .
git commit -m "init Next.js app"
git push
```
