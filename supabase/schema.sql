-- ================================================================
--  UNHEVAL/CEPREVAL Prep App — Supabase Schema v1
--  Run this in: Supabase Dashboard → SQL Editor
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────
--  COURSES
-- ────────────────────────────────────────────────────────────
create table if not exists courses (
  id    uuid primary key default uuid_generate_v4(),
  name  text not null,
  slug  text not null unique,
  "order" integer not null default 0
);

-- ────────────────────────────────────────────────────────────
--  UNITS
-- ────────────────────────────────────────────────────────────
create table if not exists units (
  id         uuid primary key default uuid_generate_v4(),
  course_id  uuid not null references courses(id) on delete cascade,
  name       text not null,
  slug       text not null,
  "order"    integer not null default 0,
  unique(course_id, slug)
);

create index if not exists idx_units_course_id on units(course_id);

-- ────────────────────────────────────────────────────────────
--  TOPICS
-- ────────────────────────────────────────────────────────────
create table if not exists topics (
  id       uuid primary key default uuid_generate_v4(),
  unit_id  uuid not null references units(id) on delete cascade,
  name     text not null,
  slug     text not null,
  "order"  integer not null default 0,
  unique(unit_id, slug)
);

create index if not exists idx_topics_unit_id on topics(unit_id);

-- ────────────────────────────────────────────────────────────
--  QUESTIONS
-- ────────────────────────────────────────────────────────────
create table if not exists questions (
  id               uuid primary key default uuid_generate_v4(),
  course_id        uuid not null references courses(id) on delete cascade,
  unit_id          uuid not null references units(id) on delete cascade,
  topic_id         uuid not null references topics(id) on delete cascade,
  prompt_text      text not null,
  -- options_json format: {"A":"...","B":"...","C":"...","D":"...","E":"..."}
  options_json     jsonb not null,
  correct_option   char(1) not null check(correct_option in ('A','B','C','D','E')),
  -- explanation_json format: {"text":"...","error_comun":"...","verificacion":"..."}
  explanation_json jsonb not null default '{"text":"Pendiente de solucionario."}'::jsonb,
  difficulty       text not null default 'medium' check(difficulty in ('easy','medium','hard')),
  source_type      text not null default 'manual',
  source_ref       text,
  created_at       timestamptz not null default now()
);

create index if not exists idx_questions_topic_id   on questions(topic_id);
create index if not exists idx_questions_unit_id    on questions(unit_id);
create index if not exists idx_questions_course_id  on questions(course_id);

-- ────────────────────────────────────────────────────────────
--  ATTEMPTS
-- ────────────────────────────────────────────────────────────
create table if not exists attempts (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  question_id      uuid not null references questions(id) on delete cascade,
  selected_option  char(1) not null check(selected_option in ('A','B','C','D','E')),
  is_correct       boolean not null,
  time_ms          integer not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists idx_attempts_user_id      on attempts(user_id);
create index if not exists idx_attempts_question_id  on attempts(question_id);
create index if not exists idx_attempts_user_q       on attempts(user_id, question_id);

-- ────────────────────────────────────────────────────────────
--  MASTERY  (upserted after each attempt)
-- ────────────────────────────────────────────────────────────
create table if not exists mastery (
  user_id       uuid not null references auth.users(id) on delete cascade,
  topic_id      uuid not null references topics(id) on delete cascade,
  mastery_score numeric(5,4) not null default 0 check(mastery_score between 0 and 1),
  updated_at    timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create index if not exists idx_mastery_user_id on mastery(user_id);

-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────

-- Courses / Units / Topics: public read
alter table courses  enable row level security;
alter table units    enable row level security;
alter table topics   enable row level security;
alter table questions enable row level security;
alter table attempts enable row level security;
alter table mastery  enable row level security;

create policy "public_read_courses"   on courses   for select using (true);
create policy "public_read_units"     on units     for select using (true);
create policy "public_read_topics"    on topics    for select using (true);
create policy "public_read_questions" on questions for select using (true);

-- Attempts: user can read/insert only their own
create policy "own_attempts_select" on attempts for select
  using (auth.uid() = user_id);

create policy "own_attempts_insert" on attempts for insert
  with check (auth.uid() = user_id);

-- Mastery: user can read/upsert only their own
create policy "own_mastery_select" on mastery for select
  using (auth.uid() = user_id);

create policy "own_mastery_upsert" on mastery for insert
  with check (auth.uid() = user_id);

create policy "own_mastery_update" on mastery for update
  using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
--  HELPER FUNCTION — recalc mastery after attempt
-- ────────────────────────────────────────────────────────────
create or replace function recalc_mastery()
returns trigger language plpgsql security definer as $$
declare
  v_topic_id  uuid;
  v_score     numeric;
begin
  -- Get topic_id from question
  select topic_id into v_topic_id from questions where id = NEW.question_id;

  -- Score = correct / total (last 20 attempts for that topic)
  select
    coalesce(
      avg(case when a.is_correct then 1.0 else 0.0 end),
      0
    )
  into v_score
  from (
    select at2.is_correct
    from attempts at2
    join questions q2 on q2.id = at2.question_id
    where at2.user_id = NEW.user_id
      and q2.topic_id = v_topic_id
    order by at2.created_at desc
    limit 20
  ) a;

  insert into mastery (user_id, topic_id, mastery_score, updated_at)
  values (NEW.user_id, v_topic_id, v_score, now())
  on conflict (user_id, topic_id)
  do update set mastery_score = v_score, updated_at = now();

  return NEW;
end;
$$;

create trigger trg_recalc_mastery
  after insert on attempts
  for each row execute function recalc_mastery();
