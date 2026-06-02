-- ============================================================
-- オカルトペディア 心霊体験談投稿機能 DB マイグレーション
-- Supabase SQL Editor で実行してください
-- ============================================================

-- ── experiences テーブル ──────────────────────────────────────

create table if not exists experiences (
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
  comment_count int not null default 0,
  report_count int not null default 0,

  ip_hash text,
  user_agent_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

-- ── experience_comments テーブル ────────────────────────────

create table if not exists experience_comments (
  id uuid primary key default gen_random_uuid(),

  experience_id uuid not null references experiences(id) on delete cascade,

  comment_no int not null,

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

-- ── experience_reactions テーブル ───────────────────────────

create table if not exists experience_reactions (
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

create unique index if not exists unique_guest_reaction
on experience_reactions(target_type, target_id, guest_key)
where guest_key is not null;

create unique index if not exists unique_user_reaction
on experience_reactions(target_type, target_id, user_id)
where user_id is not null;

-- ── experience_reports テーブル ─────────────────────────────

create table if not exists experience_reports (
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

create unique index if not exists unique_guest_report
on experience_reports(target_type, target_id, guest_key)
where guest_key is not null;

create unique index if not exists unique_ip_report
on experience_reports(target_type, target_id, ip_hash)
where guest_key is null and ip_hash is not null;

-- ── rate_limits テーブル ─────────────────────────────────────

create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),

  action_type text not null,

  ip_hash text not null,
  user_agent_hash text,
  guest_key text,

  window_start timestamptz not null default now(),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── experience_assets テーブル（Phase2用・今は空テーブルのみ）──

create table if not exists experience_assets (
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

-- ── experience_slug_redirects テーブル（Phase2用）────────────

create table if not exists experience_slug_redirects (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences(id) on delete cascade,
  old_slug text not null,
  new_slug text not null,
  created_at timestamptz not null default now()
);

-- ── updated_at 自動更新トリガー ──────────────────────────────

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_experiences_updated_at on experiences;
create trigger trg_experiences_updated_at
before update on experiences
for each row execute function set_updated_at();

drop trigger if exists trg_experience_comments_updated_at on experience_comments;
create trigger trg_experience_comments_updated_at
before update on experience_comments
for each row execute function set_updated_at();

drop trigger if exists trg_rate_limits_updated_at on rate_limits;
create trigger trg_rate_limits_updated_at
before update on rate_limits
for each row execute function set_updated_at();

-- ── コメント作成関数 ─────────────────────────────────────────

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

-- ── コメントステータス変更関数 ──────────────────────────────

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

  select *
  into old_comment
  from experience_comments
  where id = p_comment_id
  for update;

  if not found then
    raise exception 'comment not found';
  end if;

  if old_comment.status <> 'published' and p_new_status = 'published' then
    delta := 1;
  end if;

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

-- ── RLS（Row Level Security）設定 ───────────────────────────
-- anon ユーザーは published のみ読み取り可能
-- 書き込みは anon も可（投稿・コメント・いいね・通報）
-- 管理操作は service_role key 経由で RLS をスキップ

alter table experiences enable row level security;
alter table experience_comments enable row level security;
alter table experience_reactions enable row level security;
alter table experience_reports enable row level security;
alter table rate_limits enable row level security;

-- experiences: published のみ読み取り可
drop policy if exists "experiences_select_published" on experiences;
create policy "experiences_select_published"
on experiences for select
to anon, authenticated
using (status = 'published');

-- experiences: anon は insert のみ
drop policy if exists "experiences_insert_anon" on experiences;
create policy "experiences_insert_anon"
on experiences for insert
to anon, authenticated
with check (true);

-- experience_comments: published のみ読み取り可
drop policy if exists "comments_select_published" on experience_comments;
create policy "comments_select_published"
on experience_comments for select
to anon, authenticated
using (status = 'published');

-- experience_comments: anon は insert のみ
drop policy if exists "comments_insert_anon" on experience_comments;
create policy "comments_insert_anon"
on experience_comments for insert
to anon, authenticated
with check (true);

-- experience_reactions: 全件 select（いいね数表示用）
drop policy if exists "reactions_select_all" on experience_reactions;
create policy "reactions_select_all"
on experience_reactions for select
to anon, authenticated
using (true);

-- experience_reactions: insert のみ
drop policy if exists "reactions_insert_anon" on experience_reactions;
create policy "reactions_insert_anon"
on experience_reactions for insert
to anon, authenticated
with check (true);

-- experience_reports: anon は insert のみ
drop policy if exists "reports_insert_anon" on experience_reports;
create policy "reports_insert_anon"
on experience_reports for insert
to anon, authenticated
with check (true);

-- rate_limits: anon は select + insert
drop policy if exists "rate_limits_select" on rate_limits;
create policy "rate_limits_select"
on rate_limits for select
to anon, authenticated
using (true);

drop policy if exists "rate_limits_insert" on rate_limits;
create policy "rate_limits_insert"
on rate_limits for insert
to anon, authenticated
with check (true);
