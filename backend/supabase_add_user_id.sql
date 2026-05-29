-- ============================================================
-- TaskFlow — Aislamiento de datos por usuario
-- Ejecutar en: Supabase > SQL Editor > New Query
-- ============================================================

-- 1. Añadir columna user_id a projects (referencia a auth.users)
alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- 2. Índice para búsquedas por usuario
create index if not exists idx_projects_user_id on public.projects(user_id);

-- 3. RLS policies — defensa en profundidad
--    (el backend usa service_role que bypasea RLS, pero esto protege acceso directo)
drop policy if exists "Users can view own projects"   on public.projects;
drop policy if exists "Users can create own projects" on public.projects;
drop policy if exists "Users can update own projects" on public.projects;
drop policy if exists "Users can delete own projects" on public.projects;

create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

create policy "Users can create own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- 4. Las tareas se aíslan automáticamente porque pertenecen a proyectos
--    que ya están filtrados por usuario. Política adicional de defensa:
drop policy if exists "Users can view own tasks" on public.tasks;
create policy "Users can view own tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- 5. Trigger: propagar user_id del usuario autenticado automáticamente en inserts
--    (por si alguien accede via anon key desde el cliente directo)
create or replace function public.set_project_user_id()
returns trigger language plpgsql security definer as $$
begin
  if new.user_id is null then
    new.user_id = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_project_user_id on public.projects;
create trigger trg_set_project_user_id
  before insert on public.projects
  for each row execute function public.set_project_user_id();

-- 6. Verificar resultado
select tablename, rowsecurity
from pg_tables
where schemaname = 'public' and tablename in ('projects', 'tasks', 'labels', 'task_labels');
