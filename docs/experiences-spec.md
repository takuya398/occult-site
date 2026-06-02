# オカルトペディア｜心霊体験談投稿機能 実装仕様書（完成版）

> 本仕様書は5枚の仕様書を統合した最終版である。
> 実装時は本仕様書のみを参照すること。

---

## 目次

1. [機能概要](#1-機能概要)
2. [作成するページ](#2-作成するページ)
3. [ページ仕様](#3-ページ仕様)
4. [DB設計（最終版）](#4-db設計最終版)
5. [DB関数（最終版）](#5-db関数最終版)
6. [バリデーション](#6-バリデーション)
7. [セキュリティ・荒らし対策](#7-セキュリティ荒らし対策)
8. [SEO仕様](#8-seo仕様)
9. [OGP仕様](#9-ogp仕様)
10. [既存心霊スポット記事との連携](#10-既存心霊スポット記事との連携)
11. [スラグ生成ルール](#11-スラグ生成ルール)
12. [レート制限](#12-レート制限)
13. [デザイン方針](#13-デザイン方針)
14. [MVPスコープ](#14-mvpスコープ)
15. [実装上の注意](#15-実装上の注意)
16. [完了条件](#16-完了条件)

---

## 1. 機能概要

オカルトペディア内に、ユーザーが心霊体験談を投稿できる機能を追加する。

既存の心霊スポット記事と連携し、以下を実現する。

- ユーザー投稿によるオリジナルコンテンツ増加
- 心霊スポット記事の滞在時間向上
- 「場所名 + 体験談」「都道府県 + 心霊体験」などのSEO流入強化
- 掲示板風の見た目によるオカルトサイトらしい雰囲気の演出
- コメント・いいね・通報による最低限のコミュニティ機能

### 採用する形

「心霊体験談1件ごとに個別URLを持つ記事型UGC」

ただし、表示デザインは5ch風・掲示板風にする。

```
No.000123：名無しの体験者：2026/06/02(火) 22:14:08
東京都｜旧吹上トンネル｜怖さ ★★★★★

本文...
```

---

## 2. 作成するページ

```
/experiences                    心霊体験談一覧ページ
/experiences/new                心霊体験談投稿ページ
/experiences/[storyNo]-[slug]   心霊体験談詳細ページ
/admin/experiences              管理者用：投稿管理ページ
/admin/experience-reports       管理者用：通報管理ページ
```

既存のNext.js `app` ディレクトリ構成に合わせて実装すること。

---

## 3. ページ仕様

### 3-1. 心霊体験談一覧ページ `/experiences`

#### ページ上部

```
心霊体験談
読者から寄せられた実際の不思議な体験談を掲載しています。
あなたの体験も投稿できます。

[体験談を投稿する]
```

#### 並び替えタブ

```
新しい順 / 古い順 / 怖かった順 / 評価順
```

URL形式：

```
/experiences?sort=new
/experiences?sort=old
/experiences?sort=scary
/experiences?sort=popular
```

#### フィルター

```
都道府県 / 怖さレベル / 画像あり
```

URL形式：

```
/experiences?prefecture=tokyo
/experiences?scare=5
/experiences?hasImage=1
```

複合条件も許可する。

```
/experiences?prefecture=tokyo&sort=scary&page=2
```

#### 一覧カード表示

```
No.000123：名無しの体験者：2026/06/02(火) 22:14:08
東京都｜旧吹上トンネル｜怖さ ★★★★★

旧吹上トンネルで見た白い女性

夏の深夜、友人3人で旧吹上トンネルへ行ったときの話です...

コメント 12件　👻 怖かった 27
```

#### 一覧カードの仕様

- タイトルをクリックすると詳細ページへ遷移
- 本文は120文字程度で省略
- 投稿番号を必ず表示
- 日付を必ず表示
- 名前を必ず表示
- 都道府県を表示
- 場所名がある場合は表示
- 怖さレベルを星で表示
- コメント数を表示（`status = 'published'` のみ）
- いいね数は「👻 怖かった」で表示

#### ページネーション

ページング方式。1ページあたり20件。

```
/experiences
/experiences?page=2
/experiences?page=3
```

canonical はそれぞれ自分自身とする。

---

### 3-2. 心霊体験談投稿ページ `/experiences/new`

#### フォーム項目

| 項目 | 必須 | 内容 |
|------|------|------|
| タイトル | 必須 | 8〜80文字 |
| 投稿者名 | 任意 | 未入力の場合「名無しの体験者」 |
| 都道府県 | 必須 | 47都道府県 + 不明 + 海外 |
| 場所名 | 任意 | 旧吹上トンネル、廃病院、神社など |
| 体験ジャンル | 必須 | 幽霊目撃・金縛り・怪音・心霊写真・夢・その他 |
| 怖さレベル | 必須 | 1〜5 |
| 本文 | 必須 | 120〜8000文字 |
| 関連スポット | 任意 | 既存の心霊スポット記事と紐付けできる場合のみ |
| 利用規約同意 | 必須 | チェックボックス |

画像投稿はMVPでは実装しない。Phase2で追加できるようDB設計のみ用意する。

#### 本文入力欄の上に表示するガイド

```
投稿のコツ

・いつ頃の体験か
・どこで起きたのか
・誰といたのか
・何が起きたのか
・その後どうなったのか

実名、住所、電話番号、個人を特定できる情報は書かないでください。
私有地への侵入をすすめる内容は禁止です。
```

#### 投稿後の状態

投稿は `status = 'pending` になる。

管理画面で承認後に公開。

投稿後に表示するメッセージ：

```
投稿ありがとうございます。
内容を確認後、問題がなければ公開されます。
```

---

### 3-3. 心霊体験談詳細ページ `/experiences/[storyNo]-[slug]`

URL例：

```
/experiences/000123-old-fukiage-tunnel-white-woman
```

#### URL解決

URLの主キーは `story_no` とする。

`slug` はSEO・可読性のための補助要素。

ページ取得時は `story_no` を優先してDB検索する。

`slug` が現在の正規slugと不一致の場合は、正規URLへ301リダイレクトする。

#### 表示形式

```
No.000123：名無しの体験者：2026/06/02(火) 22:14:08
東京都｜旧吹上トンネル｜怖さ ★★★★★

旧吹上トンネルで見た白い女性

（本文）

👻 怖かった 27　コメント 12件　通報
```

#### いいねボタン

```
👻 怖かった
```

クリックすると数値が増える。

重複防止：同一 `guest_key` または同一 `user_id` では1回のみ有効。

処理順序：

```
1. experience_reactions に insert を試みる
2. unique制約に違反した場合は like_count を更新しない
3. insert 成功時のみ like_count を +1
```

重複時のメッセージ：

```
すでに「怖かった」を押しています。
```

または、UI上でボタンを押下済み状態にして再クリックしても何も起きないようにする。

---

### 3-4. コメント機能

体験談詳細ページ下部にコメント欄を設置する。

#### コメント表示形式

```
No.1：名無し：2026/06/02(火) 22:20:15

自分も去年行きました。
入口付近で女の笑い声みたいなの聞きました。

👻 怖かった 11　返信　通報
```

#### 返信コメント

返信時は本文先頭に自動で以下を入れる。

```
>>1
```

例：

```
No.2：名無し：2026/06/02(火) 22:24:37

>>1
それってトンネルの中央あたりですか？
```

#### コメント入力欄

| 項目 | 必須 | 内容 |
|------|------|------|
| 名前 | 任意 | 未入力で「名無し」 |
| コメント本文 | 必須 | 10〜1000文字 |

#### コメント並び替え

```
新しい順 / 古い順 / 評価順
```

初期表示は「古い順」。

#### コメント番号の仕様

- コメント番号は体験談ごとに `No.1` から採番する
- 別の体験談でもまた `No.1` から始まる
- `status = 'deleted'` のコメントはNo.を表示したまま本文を非表示にする

#### 削除・非表示コメントの表示

`hidden` の場合：

```
No.12：このコメントは運営により非表示になりました。
```

`deleted` の場合：

```
No.12：このコメントは削除されました。
```

コメント番号は消さない。返信アンカー `>>12` の整合性を保つため。

---

### 3-5. 通報機能

投稿とコメント両方に「通報」リンクを設置する。

#### 通報理由の選択肢

```
個人情報が含まれている
誹謗中傷
スパム・宣伝
著作権侵害
危険行為・不法侵入を助長している
性的・暴力的な内容
その他
```

#### 通報フォーム

```
通報理由（選択）
補足内容（任意）
[送信]
```

送信後メッセージ：

```
通報を受け付けました。
運営が内容を確認します。
```

重複通報時のメッセージ：

```
この投稿はすでに通報済みです。
運営が内容を確認します。
```

重複通報時は `report_count` を増やさない。

#### 自動処理

同一投稿または同一コメントに通報が3件以上入った場合、管理画面で目立つようにする。

MVPでは自動非公開はしない。将来的に対応できるよう `report_count` を保持する。

---

### 3-6. 管理画面 `/admin/experiences`

#### 認証

既存の管理者認証がある場合はそれに準じる。

既存認証がない場合は、`middleware.ts` でBasic認証を実装する。

```
環境変数：
ADMIN_BASIC_USER
ADMIN_BASIC_PASSWORD
```

管理操作は必ずサーバー側（Route Handler）から Supabase Service Role Key を使って実行する。

Service Role Key はクライアントに露出させない。

#### 投稿一覧表示項目

```
No. / タイトル / 投稿者名 / 都道府県 / 場所名 / 怖さ / ステータス / 投稿日 / コメント数 / いいね数 / 通報数
```

#### ステータス

```
pending / published / rejected / hidden / deleted
```

#### 操作

```
詳細を見る / 公開する / 非公開にする / 却下する / 削除する
```

物理削除ではなく、原則 soft delete（`status = 'deleted'`）にする。

#### コメントステータス変更の注意

コメントのステータス変更は、必ず `update_experience_comment_status()` DB関数を経由すること。

直接 `update experience_comments set status = ...` を実行してはいけない。

---

### 3-7. 通報管理ページ `/admin/experience-reports`

#### 表示項目

```
通報ID / 対象種別 / 対象No. / 通報理由 / 補足内容 / 通報日時 / 対応状況
```

#### 対応状況

```
open（未対応）/ reviewing（確認中）/ resolved（対応済み）/ rejected（却下）
```

---

## 4. DB設計（最終版）

Supabase / PostgreSQL を想定する。

### experiences テーブル

```sql
create table experiences (
  id uuid primary key default gen_random_uuid(),

  story_no bigserial unique not null,

  slug text not null,
  title text not null,
  body text not null,

  display_name text not null default '名無しの体験者',

  prefecture text not null,
  place_name text,
  genre text not null,

  scare_level int not null check (scare_level between 1 and 5),

  related_spot_slug text,

  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected', 'hidden', 'deleted')),

  like_count int not null default 0,
  comment_count int not null default 0,  -- published コメントのみカウント
  report_count int not null default 0,

  ip_hash text,
  user_agent_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);
```

### experience_comments テーブル

```sql
create table experience_comments (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null references experiences(id) on delete cascade,

  comment_no int not null,  -- 体験談ごとに1から採番

  parent_comment_id uuid references experience_comments(id) on delete set null,

  body text not null,
  display_name text not null default '名無し',

  status text not null default 'published'
    check (status in ('pending', 'published', 'hidden', 'deleted')),

  like_count int not null default 0,
  report_count int not null default 0,

  ip_hash text,
  user_agent_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (experience_id, comment_no)
);
```

### experience_reactions テーブル

```sql
create table experience_reactions (
  id uuid primary key default gen_random_uuid(),

  target_type text not null check (target_type in ('experience', 'comment')),
  target_id uuid not null,

  reaction_type text not null default 'scary',

  user_id uuid,
  guest_key text,

  ip_hash text,
  user_agent_hash text,

  created_at timestamptz not null default now()
);

-- ゲストの重複いいね防止
create unique index unique_guest_reaction
on experience_reactions(target_type, target_id, guest_key)
where guest_key is not null;

-- ログインユーザーの重複いいね防止
create unique index unique_user_reaction
on experience_reactions(target_type, target_id, user_id)
where user_id is not null;
```

### experience_reports テーブル

```sql
create table experience_reports (
  id uuid primary key default gen_random_uuid(),

  target_type text not null check (target_type in ('experience', 'comment')),
  target_id uuid not null,

  reason text not null,
  detail text,

  status text not null default 'open'
    check (status in ('open', 'reviewing', 'resolved', 'rejected')),

  guest_key text,
  ip_hash text,
  user_agent_hash text,

  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- ゲストの重複通報防止
create unique index unique_guest_report
on experience_reports(target_type, target_id, guest_key)
where guest_key is not null;

-- IP単位の重複通報防止（guest_keyなしの場合）
create unique index unique_ip_report
on experience_reports(target_type, target_id, ip_hash)
where guest_key is null and ip_hash is not null;
```

### rate_limits テーブル

レコード積み上げ方式。`count` カラムは持たない。

```sql
create table rate_limits (
  id uuid primary key default gen_random_uuid(),

  action_type text not null,

  ip_hash text not null,
  user_agent_hash text,
  guest_key text,

  window_start timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

### experience_assets テーブル（Phase2用）

MVPでは作成のみ。

```sql
create table experience_assets (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid references experiences(id) on delete cascade,
  storage_path text not null,
  mime_type text,
  size_bytes int,
  width int,
  height int,
  moderation_status text not null default 'pending',
  created_at timestamptz not null default now()
);
```

### experience_slug_redirects テーブル（Phase2用）

MVPでは作成のみ。

```sql
create table experience_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  old_slug text not null,
  new_slug text not null,
  created_at timestamptz not null default now()
);
```

### updated_at 自動更新トリガー

```sql
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_experiences_updated_at
before update on experiences
for each row execute function set_updated_at();

create trigger trg_experience_comments_updated_at
before update on experience_comments
for each row execute function set_updated_at();

create trigger trg_rate_limits_updated_at
before update on rate_limits
for each row execute function set_updated_at();
```

---

## 5. DB関数（最終版）

### コメント作成関数

`comment_no` を体験談ごとに採番し、`comment_count` を更新する。

`status` はアプリ側で判定して渡す。

```sql
create or replace function create_experience_comment(
  p_experience_id uuid,
  p_body text,
  p_display_name text,
  p_parent_comment_id uuid,
  p_status text,
  p_ip_hash text,
  p_user_agent_hash text
)
returns experience_comments
language plpgsql
as $$
declare
  next_no int;
  new_comment experience_comments;
begin
  if p_status not in ('pending', 'published', 'hidden', 'deleted') then
    raise exception 'invalid comment status';
  end if;

  -- 対象の体験談行をロックし、同時コメント投稿による採番競合を防ぐ
  perform 1
  from experiences
  where id = p_experience_id
  for update;

  select coalesce(max(comment_no), 0) + 1
  into next_no
  from experience_comments
  where experience_id = p_experience_id;

  insert into experience_comments (
    experience_id,
    comment_no,
    body,
    display_name,
    parent_comment_id,
    status,
    ip_hash,
    user_agent_hash
  )
  values (
    p_experience_id,
    next_no,
    p_body,
    coalesce(nullif(p_display_name, ''), '名無し'),
    p_parent_comment_id,
    p_status,
    p_ip_hash,
    p_user_agent_hash
  )
  returning * into new_comment;

  -- published のコメントだけ comment_count に加算する
  if p_status = 'published' then
    update experiences
    set comment_count = comment_count + 1,
        updated_at = now()
    where id = p_experience_id;
  else
    update experiences
    set updated_at = now()
    where id = p_experience_id;
  end if;

  return new_comment;
end;
$$;
```

### コメントステータス変更関数

コメントのステータス変更は必ずこの関数を使うこと。

直接 `update experience_comments set status = ...` を実行してはいけない。

```sql
create or replace function update_experience_comment_status(
  p_comment_id uuid,
  p_new_status text
)
returns experience_comments
language plpgsql
as $$
declare
  old_comment experience_comments;
  updated_comment experience_comments;
  delta int := 0;
begin
  if p_new_status not in ('pending', 'published', 'hidden', 'deleted') then
    raise exception 'invalid comment status';
  end if;

  -- 対象コメントをロックして変更前ステータスを取得
  select *
  into old_comment
  from experience_comments
  where id = p_comment_id
  for update;

  if not found then
    raise exception 'comment not found';
  end if;

  -- published への遷移なら +1
  if old_comment.status <> 'published' and p_new_status = 'published' then
    delta := 1;
  end if;

  -- published から非公開系への遷移なら -1
  if old_comment.status = 'published' and p_new_status <> 'published' then
    delta := -1;
  end if;

  update experience_comments
  set status = p_new_status,
      updated_at = now()
  where id = p_comment_id
  returning * into updated_comment;

  if delta <> 0 then
    update experiences
    set comment_count = greatest(comment_count + delta, 0),
        updated_at = now()
    where id = old_comment.experience_id;
  else
    update experiences
    set updated_at = now()
    where id = old_comment.experience_id;
  end if;

  return updated_comment;
end;
$$;
```

#### comment_count の更新ルール（参考）

```
pending   → published  : +1
hidden    → published  : +1
deleted   → published  : +1

published → pending    : -1
published → hidden     : -1
published → deleted    : -1

pending   → hidden     : 増減なし
pending   → deleted    : 増減なし
hidden    → deleted    : 増減なし
deleted   → hidden     : 増減なし
```

`comment_count` は `greatest(..., 0)` によりマイナスにならない。

---

## 6. バリデーション

### 投稿タイトル

- 必須
- 8〜80文字
- HTML不可

### 投稿本文

- 必須
- 120〜8000文字
- HTML不可
- scriptタグなどは完全除去
- URLは最大2件まで許可（3件以上で `pending`、5件以上で拒否）

### コメント本文

- 必須
- 10〜1000文字
- HTML不可
- URL含む場合は `pending`（コメントのURL原則禁止）

### 名前

- 任意
- 1〜24文字
- 未入力の場合は「名無し」または「名無しの体験者」
- HTML不可

### related_spot_slug のバリデーション

投稿フォームで `related_spot_slug` が渡された場合、アプリ側で既存スポット一覧に存在するか確認する。

```
存在するslug：保存
存在しないslug：null にする
```

---

## 7. セキュリティ・荒らし対策

### 1. HTMLサニタイズ

投稿本文・コメント本文・名前・場所名・タイトルにHTMLを許可しない。

### 2. レート制限

レコード積み上げ方式で実装。Next.js Route Handler 側で処理する。

判定クエリは必ず `window_start` で有効期間を絞ること。

```
心霊体験談投稿：同一IP hashで1時間に3件まで
コメント投稿：同一IP hashで10分に5件まで
いいね：同一対象に1回まで
通報：同一対象に1回まで / 同一IP hashで1時間に10件まで
```

判定例（コメント）：

```sql
select count(*)
from rate_limits
where action_type = 'comment'
  and ip_hash = p_ip_hash
  and window_start >= now() - interval '10 minutes';
```

古いレコードはMVPでは削除しない。Phase2で `pg_cron` による定期削除を追加する。

### 3. URLスパム制御

本文のURLが条件を超えた場合のステータス：

```
URL 0〜2件：通常フロー
URL 3〜4件：pending
URL 5件以上：投稿拒否
```

コメント：

```
URL 0件：通常フロー
URL 1件以上：pending
```

### 4. NGワード検知

以下を検知して `pending` にする。

```
電話番号
メールアドレス
住所らしき文字列
殺害予告系ワード
過度な性的ワード
スパムURL
```

### 5. IPの扱い

IPアドレスはそのまま保存しない。必ずハッシュ化して保存する。

---

## 8. SEO仕様

### 詳細ページ title

```
{タイトル}｜{都道府県}の心霊体験談｜オカルトペディア
```

例：

```
旧吹上トンネルで見た白い女性｜東京都の心霊体験談｜オカルトペディア
```

### meta description

```
{都道府県}・{場所名}で投稿された心霊体験談。「{本文冒頭80文字}...」
```

場所名がない場合：

```
{都道府県}で投稿された心霊体験談。「{本文冒頭80文字}...」
```

### canonical

詳細ページ・一覧ページとも自分自身を canonical にする。

### noindex

以下は noindex にする。

```
status が pending / hidden / rejected の詳細ページ
/admin/* 全ページ
通報ページ
```

### 構造化データ（JSON-LD）

詳細ページに以下を入れる。

```
タイプ：DiscussionForumPosting

必須項目：
headline
datePublished
author.name
text
url
comment
interactionStatistic
```

---

## 9. OGP仕様

### og:title

```
{タイトル}｜{都道府県}の心霊体験談｜オカルトペディア
```

### og:description

```
{都道府県}・{場所名}で投稿された心霊体験談。「{本文冒頭80文字}...」
```

場所名がない場合：

```
{都道府県}で投稿された心霊体験談。「{本文冒頭80文字}...」
```

### og:image

MVPでは共通OGP画像を使用する。

```
/public/og/experience-default.jpg
```

Phase2で画像投稿に対応した場合、投稿画像の1枚目をOGPに使用してもよい。

### twitter:card

```
summary_large_image
```

---

## 10. 既存心霊スポット記事との連携

### スポット記事下のCTA

既存の `/spots/[slug]` 記事末尾付近に以下を追加する。

```
この場所で不思議な体験をしましたか？
[あなたの体験談を投稿する]
```

リンク先：

```
/experiences/new?spot={slug}
```

投稿フォームで `spot` クエリがある場合、関連スポットとして自動入力する。

### スポット記事下の関連体験談

スポット記事下に関連体験談を最大5件表示する。

```
この場所の体験談

No.000123：旧吹上トンネルで見た白い女性
No.000118：トンネル内で聞こえた足音
```

取得条件：

```sql
experiences.related_spot_slug = spot.slug
AND status = 'published'
```

### related_spot_slug の整合性

既存の心霊スポット記事がMarkdown/MDX/静的データで管理されている場合、DB外部キーは張らない。

アプリ側で既存スポット一覧に存在するか確認し、存在しない場合は `null` にする。

---

## 11. スラグ生成ルール

### URL形式

```
/experiences/{story_no}-{slug}
```

例：

```
/experiences/000123-old-fukiage-tunnel-white-woman
```

### URLの主キー

URLの主キーは `story_no` とする。`slug` はSEO補助扱い。

`slug` が正規slugと不一致の場合は、正規URLへ301リダイレクトする。

### スラグ生成優先順位

```
1. 場所名 + タイトル
2. 場所名のみ
3. タイトルのみ
4. fallback：experience-{story_no}
```

### ライブラリ

`wanakana` を使用する。

変換精度よりも安定した fallback を優先する。

### スラグ文字ルール

```
小文字化
半角英数字とハイフンのみ許可
スペースはハイフンに変換
連続ハイフンは1つに統合
先頭・末尾のハイフンは削除
最大80文字
HTML・記号・絵文字は除去
```

### 変換不能時の fallback

正規化後のslugが3文字未満の場合：

```
experience-{story_no}
```

例：

```
/experiences/000123-experience-000123
```

### slug の変更方針

- MVPでは公開時の slug を固定する
- Phase2で slug 変更 + 301リダイレクト対応（`experience_slug_redirects` テーブル使用）

### story_no の飛び番

`story_no` は投稿作成時点で採番する。

`pending` 後に `rejected` や `deleted` になった場合も番号は消費される。これは仕様として許容する。

公開一覧には `published` の投稿のみ表示するため、No. が飛び番になることがある。

---

## 12. レート制限

### 実装場所

Next.js Route Handler / Server Action 側で実装する。

対象エンドポイント：

```
POST /api/experiences
POST /api/experience-comments
POST /api/experience-reactions
POST /api/experience-reports
```

### 保存先

Supabase の `rate_limits` テーブルに保存する。

MVPでは Redis・Vercel KV は使わない。

### 制限ルール

```
心霊体験談投稿：同一IP hashで1時間に3件まで
コメント投稿：同一IP hashで10分に5件まで
いいね：同一対象に1回まで
通報：同一対象に1回まで / 同一IP hashで1時間に10件まで
```

### 古いレコードの扱い

MVPでは削除しない。判定時に `window_start` で有効期間内のみ参照する。

Phase2で以下を追加する：

```sql
delete from rate_limits
where window_start < now() - interval '7 days';
```

---

## 13. デザイン方針

オカルトペディアの既存デザインに合わせる。

体験談部分は掲示板風にする。

### 色

```
背景：既存の暗色系に合わせる
投稿No.：薄いグレー
名前：緑系またはアクセントカラー
日付：薄いグレー
本文：読みやすい白系
いいね：👻アイコン付き
```

### ディレクトリ構成

```
components/experiences/
lib/experiences/
app/experiences/
app/admin/experiences/
```

---

## 14. MVPスコープ

### MVPで実装するもの

```
/experiences 一覧（ページング・フィルター・並び替え）
/experiences/new 投稿フォーム
/experiences/[storyNo]-[slug] 詳細ページ
コメント投稿・表示
体験談ごとのコメントNo.
👻 怖かったボタン（ゲスト重複防止）
通報機能
管理画面Basic認証または既存認証
投稿承認・非公開・却下
コメントステータス変更（DB関数経由）
既存スポット記事下の投稿CTA
related_spot_slug のアプリ側バリデーション
SEO meta・canonical・noindex
OGP（共通画像）
JSON-LD 構造化データ
ページング
updated_at トリガー
レート制限（Route Handler + Supabase）
URLスパム制御
NGワード検知
IPハッシュ化保存
```

### Phase2 以降

```
画像投稿
slug変更時の301リダイレクト
メール認証
ユーザー会員機能・プロフィール
ランキングページ
AI自動要約・AIモデレーション
高度なスパム検知（Turnstile・WAF等）
rate_limits の pg_cron 定期削除
deleted_at カラム追加
地名辞書による高精度スラグ生成
```

---

## 15. 実装上の注意

### 必ずDB関数を使うこと

| 処理 | 使用する関数 |
|------|-------------|
| コメント新規作成 | `create_experience_comment()` |
| コメントステータス変更 | `update_experience_comment_status()` |

コメントに対して直接 `update experience_comments set status = ...` を実行してはいけない。

### comment_count の定義

`experiences.comment_count` は `status = 'published'` のコメント数のみをカウントする。

`pending` / `hidden` / `deleted` はカウントしない。

### soft delete の方針

`status = 'deleted'` + `updated_at` で管理する。

MVPでは `deleted_at` カラムは追加しない。

### ゲストいいねの重複防止

MVPではシークレットモード・VPN・別端末等での回避は許容する。

通常利用における連打防止・同一ブラウザ重複防止を目的とする。

### 管理操作のサーバー処理

管理画面からのDB操作は、クライアントから直接行わない。

必ずNext.js Route Handler 経由で Supabase Service Role Key を使う。

---

## 16. 完了条件

以下を満たしたら完了。

```
ユーザーが心霊体験談を投稿できる
投稿後は pending になる
管理画面から公開できる
公開後、一覧ページに表示される
詳細ページが生成される
詳細ページでコメントできる
コメントにNo.と日付が表示される（体験談ごとにNo.1から）
投稿とコメントに「👻 怖かった」が押せる
重複いいねは like_count に反映されない
投稿とコメントを通報できる
重複通報は report_count に反映されない
管理画面で通報一覧を確認できる
既存の心霊スポット記事下に「体験談を投稿する」導線が出る
関連スポットがある投稿はスポット記事下にも表示される
pending / hidden / rejected は noindex になる
HTMLやscriptが投稿できない
IPはhash化して保存される
コメントのステータス変更時に comment_count が正しく増減する
```
