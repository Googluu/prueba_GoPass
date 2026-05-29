-- ============================================================
-- TaskFlow — Habilitar RLS en todas las tablas
-- Ejecutar en: Supabase > SQL Editor > New Query
--
-- IMPORTANTE: El backend usa service_role_key, que en Supabase
-- BYPASEA RLS automáticamente. No se necesitan políticas extra.
-- RLS solo afecta a clientes que usen la anon_key directamente.
-- ============================================================

-- Habilitar Row Level Security
alter table public.projects    enable row level security;
alter table public.tasks       enable row level security;
alter table public.labels      enable row level security;
alter table public.task_labels enable row level security;

-- Confirmar que quedó habilitado
select
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in ('projects', 'tasks', 'labels', 'task_labels')
order by tablename;
