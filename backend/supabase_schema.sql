-- ============================================================
-- TaskFlow — Schema para Supabase SQL Editor
-- Ejecutar en: Supabase Dashboard > SQL Editor > New Query
-- ============================================================

-- Extensión para UUID
create extension if not exists "pgcrypto";

-- ── Proyectos ──────────────────────────────────────────────
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  name        varchar(100) not null,
  description varchar(500),
  image_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Etiquetas ──────────────────────────────────────────────
create table if not exists labels (
  id         uuid primary key default gen_random_uuid(),
  name       varchar(50) not null unique,
  color      varchar(7)  not null default '#818cf8',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ── Tareas ─────────────────────────────────────────────────
create type task_status   as enum ('todo', 'in_progress', 'done');
create type task_priority as enum ('low', 'medium', 'high');

create table if not exists tasks (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references projects(id) on delete cascade,
  title       varchar(200) not null,
  description text,
  status      task_status   not null default 'todo',
  priority    task_priority not null default 'medium',
  due_date    date,
  hora_limite time          default '12:00:00',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── Tabla pivote Tarea ↔ Etiqueta ──────────────────────────
create table if not exists task_labels (
  task_id  uuid not null references tasks(id) on delete cascade,
  label_id uuid not null references labels(id) on delete cascade,
  primary key (task_id, label_id)
);

-- ── Índices ────────────────────────────────────────────────
create index if not exists idx_tasks_project_id  on tasks(project_id);
create index if not exists idx_tasks_due_date    on tasks(due_date);
create index if not exists idx_tasks_status      on tasks(status);
create index if not exists idx_task_labels_label on task_labels(label_id);

-- ── Trigger: auto-actualizar updated_at ───────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_projects_updated_at before update on projects
  for each row execute function set_updated_at();

create trigger trg_tasks_updated_at before update on tasks
  for each row execute function set_updated_at();

create trigger trg_labels_updated_at before update on labels
  for each row execute function set_updated_at();

-- ── RLS: habilitar (ajustar políticas según auth) ─────────
alter table projects    enable row level security;
alter table tasks       enable row level security;
alter table labels      enable row level security;
alter table task_labels enable row level security;

-- Política temporal: acceso total via service_role (backend)
create policy "service role all" on projects    for all using (true);
create policy "service role all" on tasks       for all using (true);
create policy "service role all" on labels      for all using (true);
create policy "service role all" on task_labels for all using (true);

-- ── Seed inicial ───────────────────────────────────────────
insert into labels (name, color) values
  ('Desarrollo', '#818cf8'),
  ('Diseño',     '#34d399'),
  ('Marketing',  '#fbbf24'),
  ('QA',         '#f87171'),
  ('DevOps',     '#06b6d4')
on conflict (name) do nothing;
