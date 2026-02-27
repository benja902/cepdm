-- ================================================================
--  SCHEMA FASE 2 — Tutor Engine
--  Run AFTER schema.sql (Fase 1)
--  Execute in: Supabase Dashboard → SQL Editor
-- ================================================================

-- ────────────────────────────────────────────────────────────
--  1. LEARNING KITS  (teoría + métodos por topic)
-- ────────────────────────────────────────────────────────────
create table if not exists learning_kits (
  id                    uuid primary key default gen_random_uuid(),
  topic_id              uuid not null references topics(id) on delete cascade,
  summary_json          jsonb not null default '{"bullets":[],"notes":[]}',
  methods_json          jsonb not null default '{"methods":[]}',
  common_mistakes_json  jsonb not null default '{"mistakes":[]}',
  verification_json     jsonb not null default '{"checks":[]}',
  created_at            timestamptz default now()
);

-- one kit per topic
create unique index if not exists learning_kits_topic_unique on learning_kits(topic_id);

-- ────────────────────────────────────────────────────────────
--  2. SOLUTION TEMPLATES  (plantillas de plantilla por curso)
-- ────────────────────────────────────────────────────────────
create table if not exists solution_templates (
  id                    uuid primary key default gen_random_uuid(),
  course_id             uuid not null references courses(id) on delete cascade,
  name                  text not null,
  slug                  text unique not null,
  schema_json           jsonb not null default '{"steps":[]}',
  min_requirements_json jsonb not null default '{"min_text_blocks":2,"requires_math":false,"requires_error_common":true,"requires_verification":true}',
  created_at            timestamptz default now()
);

create index if not exists solution_templates_course_idx on solution_templates(course_id);

-- ────────────────────────────────────────────────────────────
--  3. QUESTION SOLUTION META
-- ────────────────────────────────────────────────────────────
create table if not exists question_solution_meta (
  question_id   uuid primary key references questions(id) on delete cascade,
  template_id   uuid references solution_templates(id) on delete set null,
  skill_tags    text[] not null default '{}',
  trap_tags     text[] not null default '{}',
  difficulty    int,
  updated_at    timestamptz default now()
);

create index if not exists qsm_template_idx on question_solution_meta(template_id);

-- ────────────────────────────────────────────────────────────
--  4. ALTER questions: add separate error_common + verification
--     (explanation_json.blocks is now the standard blocks format)
-- ────────────────────────────────────────────────────────────
alter table questions
  add column if not exists error_common  text,
  add column if not exists verification  text;

-- ────────────────────────────────────────────────────────────
--  RLS
-- ────────────────────────────────────────────────────────────
alter table learning_kits          enable row level security;
alter table solution_templates     enable row level security;
alter table question_solution_meta enable row level security;

-- Authenticated users can read everything
create policy "auth_read_kits" on learning_kits
  for select using (auth.role() = 'authenticated');

create policy "auth_read_templates" on solution_templates
  for select using (auth.role() = 'authenticated');

create policy "auth_read_meta" on question_solution_meta
  for select using (auth.role() = 'authenticated');

-- Admin write (user_metadata.role = 'admin')
create policy "admin_all_kits" on learning_kits
  for all using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin_all_templates" on solution_templates
  for all using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

create policy "admin_all_meta" on question_solution_meta
  for all using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Admin can update questions (explanation + new fields)
create policy "admin_update_questions" on questions
  for update using ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- ────────────────────────────────────────────────────────────
--  HOW TO SET ADMIN ROLE ON A USER
--  Run this in Supabase SQL editor, replacing the email:
--
--  update auth.users
--  set raw_user_meta_data = raw_user_meta_data || '{"role":"admin"}'
--  where email = 'tu@email.com';
-- ────────────────────────────────────────────────────────────
