-- Esquema académico del Portal Restauradores de la Memoria.
-- La aplicación conectada usa la tabla KV administrada por Figma Make.
-- Este archivo documenta la estructura relacional solicitada por el docente
-- y puede ejecutarse en el SQL Editor de Supabase si el equipo necesita tablas físicas.

create extension if not exists "pgcrypto";

create table if not exists visitantes (
  id uuid primary key default gen_random_uuid(),
  sesion_anonima text not null,
  pagina text,
  dispositivo text,
  fecha_visita timestamptz not null default now()
);

create table if not exists eventos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  fecha date,
  lugar text,
  tipo text,
  imagen_url text,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists actividades (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid references eventos(id) on delete set null,
  titulo text not null,
  descripcion text,
  curso text,
  responsable text,
  fecha date,
  tipo text,
  created_at timestamptz not null default now()
);

create table if not exists objetos_museo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  historia text,
  categoria text,
  periodo text,
  procedencia text,
  estado_conservacion text,
  modelo_3d_url text,
  imagen_portada_url text,
  fotografias jsonb not null default '[]'::jsonb,
  creditos text,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists exposiciones (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  tema text,
  fecha_apertura date,
  portada_url text,
  recorrido_url text,
  objetos_ids jsonb not null default '[]'::jsonb,
  publicada boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists evidencias (
  id uuid primary key default gen_random_uuid(),
  actividad_id uuid references actividades(id) on delete set null,
  evento_id uuid references eventos(id) on delete set null,
  tipo_archivo text not null,
  archivo_url text not null,
  descripcion text,
  autor text,
  fecha date,
  creditos text,
  created_at timestamptz not null default now()
);

create table if not exists aliados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  logo_url text,
  sitio_web text,
  tipo_apoyo text,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reconocimientos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  entidad text,
  fecha date,
  descripcion text,
  imagen_url text,
  fuente_url text,
  publicado boolean not null default false,
  created_at timestamptz not null default now()
);

-- Evita exponer datos directamente. El portal consulta mediante la Edge Function.
alter table visitantes enable row level security;
alter table eventos enable row level security;
alter table actividades enable row level security;
alter table objetos_museo enable row level security;
alter table exposiciones enable row level security;
alter table evidencias enable row level security;
alter table aliados enable row level security;
alter table reconocimientos enable row level security;
