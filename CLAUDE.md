# CLAUDE.md

このファイルはClaude Codeが自動で読み込むプロジェクト設定です。

---

## プロジェクト概要

オカルトペディア（Next.js製）に、心霊体験談投稿機能を追加する。

詳細仕様は以下を参照すること。

```
docs/experiences-spec.md
```

---

## 実装前に必ず確認すること

- 既存のNext.js構成・CSS設計・データ管理方法を確認してから実装する
- 既存サイトのデザインを壊さないこと
- 新規機能は以下のディレクトリに分離すること

```
components/experiences/
lib/experiences/
app/experiences/
app/admin/experiences/
```

---

## 絶対に守るルール

### コメント操作はDB関数経由のみ

コメントのステータスを直接updateしてはいけない。

```sql
-- NG
update experience_comments set status = 'hidden' where id = '...';

-- OK
select update_experience_comment_status('comment_uuid', 'hidden');
```

コメント新規作成も直接insertではなく関数を使う。

```sql
-- OK
select create_experience_comment(...);
```

### 管理操作はサーバー側のみ

管理画面からのDB操作はクライアントから直接行わない。
必ずNext.js Route Handler経由でSupabase Service Role Keyを使う。
Service Role KeyはクライアントのJSに露出させない。

### rate_limitsの判定クエリ

必ず `window_start` で有効期間を絞ること。

```sql
-- NG（全件カウントしてしまう）
select count(*) from rate_limits where ip_hash = p_ip_hash and action_type = 'comment';

-- OK
select count(*) from rate_limits
where ip_hash = p_ip_hash
  and action_type = 'comment'
  and window_start >= now() - interval '10 minutes';
```

---

## MVPスコープ（今回実装する範囲）

```
/experiences              一覧ページ
/experiences/new          投稿ページ
/experiences/[storyNo]-[slug]  詳細ページ
/admin/experiences        投稿管理
/admin/experience-reports 通報管理
コメント・いいね・通報機能
既存スポット記事との連携
```

画像投稿・メール認証・会員機能はPhase2のため実装しない。