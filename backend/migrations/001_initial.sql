-- Day One — initial schema (run in Supabase SQL Editor)
create extension if not exists vector;

-- ── Core tables ────────────────────────────────────────────────
create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz default now()
);

create table users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  avatar_url text,
  org_id     uuid references organizations(id),
  created_at timestamptz default now()
);

create table repositories (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  full_name   text not null,            -- owner/repo
  github_url  text,
  github_id   bigint unique,
  description text,
  is_private  boolean default false,    -- MVP: public only
  indexed     boolean default false,
  indexed_at  timestamptz,
  created_at  timestamptz default now()
);

create table indexing_jobs (
  id          uuid primary key default gen_random_uuid(),
  repo_id     uuid not null references repositories(id) on delete cascade,
  status      text not null default 'pending',  -- pending|running|done|failed
  progress    int  not null default 0,          -- 0-100
  error       text,
  started_at  timestamptz default now(),
  finished_at timestamptz
);

create table repo_chunks (
  id         uuid primary key default gen_random_uuid(),
  repo_id    uuid not null references repositories(id) on delete cascade,
  file_path  text not null,
  content    text not null,
  embedding  vector(384),
  metadata   jsonb default '{}',
  created_at timestamptz default now()
);
create index on repo_chunks using hnsw (embedding vector_cosine_ops);

create table chat_messages (
  id         uuid primary key default gen_random_uuid(),
  repo_id    uuid not null references repositories(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  mode       text not null default 'ask',   -- ask|onboard
  role       text not null,                 -- user|assistant
  content    text not null,
  sources    jsonb default '[]',
  created_at timestamptz default now()
);

-- ── auth.users → public.users + personal org (trigger) ────────
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare new_org_id uuid;
begin
  insert into organizations (name)
  values (coalesce(new.raw_user_meta_data->>'user_name', new.email, 'personal'))
  returning id into new_org_id;

  insert into users (id, email, avatar_url, org_id)
  values (new.id, new.email, new.raw_user_meta_data->>'avatar_url', new_org_id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── RLS (protects direct frontend→Supabase reads only;
--        FastAPI uses service-role key which BYPASSES RLS) ─────
alter table organizations enable row level security;
alter table users         enable row level security;
alter table repositories  enable row level security;
alter table indexing_jobs enable row level security;
alter table repo_chunks   enable row level security;
alter table chat_messages enable row level security;

create policy "read own user" on users
  for select to authenticated using (id = auth.uid());

create policy "read own org" on organizations
  for select to authenticated
  using (id in (select org_id from users where id = auth.uid()));

create policy "read own org repos" on repositories
  for select to authenticated
  using (org_id in (select org_id from users where id = auth.uid()));

create policy "read own org jobs" on indexing_jobs
  for select to authenticated
  using (repo_id in (
    select r.id from repositories r
    join users u on u.org_id = r.org_id
    where u.id = auth.uid()
  ));
-- repo_chunks / chat_messages: no policies → no direct frontend access. Intentional.

-- ── Realtime: stream indexing_jobs updates to the frontend ────
alter publication supabase_realtime add table indexing_jobs;
