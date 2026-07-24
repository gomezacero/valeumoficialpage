-- ============================================================
-- VALEUM — schema aislado para la landing corporativa.
-- Proyecto Supabase: designflow-ai (qmezdqqzhoeuyeymavdv)
-- Convive con el resto del proyecto sin tocar nada existente.
-- ============================================================
create schema if not exists valeum_web;

comment on schema valeum_web is
  'Landing corporativa de Valeum (valeumoficialpage). Leads del formulario-filtro y reservas de Google Calendar. Escritura exclusiva desde las funciones serverless con service_role.';

-- ---------- leads ----------
create table if not exists valeum_web.leads (
  id            uuid primary key default gen_random_uuid(),
  created_at    timestamptz not null default now(),

  -- respuestas del formulario
  service       text not null check (service in ('performance','consulting','product','unsure')),
  stage         text not null check (stage in ('idea','operating','scaling')),
  budget        text not null check (budget in ('b1','b2','b3','b4')),
  business      text not null,
  name          text not null,
  email         text not null,
  company       text,
  country       text not null,

  -- decisión calculada en el servidor
  score         int  not null,
  matched       boolean not null,
  owner         text not null check (owner in ('jesus','harry')),
  calendar_url  text not null,

  -- estado de agendamiento
  booked        boolean not null default false,
  booked_at     timestamptz,

  -- metadatos
  lang          text not null default 'es',
  source        text not null default 'valeum-landing',
  user_agent    text,
  ip_hash       text,
  utm           jsonb
);

comment on table valeum_web.leads is 'Un registro por envío del formulario-filtro. score/matched/owner los decide siempre el backend, nunca el navegador.';
comment on column valeum_web.leads.ip_hash is 'Hash SHA-256 de la IP: permite limitar abuso sin almacenar el dato personal en claro.';

create index if not exists leads_email_idx      on valeum_web.leads (lower(email));
create index if not exists leads_created_at_idx on valeum_web.leads (created_at desc);
create index if not exists leads_ip_rate_idx    on valeum_web.leads (ip_hash, created_at desc);

-- ---------- bookings ----------
create table if not exists valeum_web.bookings (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  lead_id           uuid references valeum_web.leads(id) on delete set null,
  google_event_id   text not null unique,
  calendar_owner    text not null check (calendar_owner in ('jesus','harry')),
  attendee_email    text,
  attendee_name     text,
  starts_at         timestamptz,
  ends_at           timestamptz,
  status            text,
  notified          boolean not null default false,
  raw               jsonb
);

comment on table valeum_web.bookings is 'Reservas detectadas en los Appointment Schedules de Google. google_event_id es la clave de idempotencia del sync.';
comment on column valeum_web.bookings.notified is 'true una vez enviado el correo de aviso: evita reenviar en cada ejecución del cron.';
comment on column valeum_web.bookings.lead_id is 'null cuando la persona reservó con un email distinto al del formulario.';

create index if not exists bookings_lead_idx  on valeum_web.bookings (lead_id);
create index if not exists bookings_start_idx on valeum_web.bookings (starts_at desc);

-- ---------- estado del sync incremental ----------
create table if not exists valeum_web.calendar_sync_state (
  calendar_owner text primary key check (calendar_owner in ('jesus','harry')),
  sync_token     text,
  updated_at     timestamptz not null default now()
);

comment on table valeum_web.calendar_sync_state is 'syncToken de la Google Calendar API por calendario, para traer solo los cambios desde la última corrida.';

-- ---------- seguridad ----------
-- RLS activo y sin políticas: nadie accede salvo service_role, que la omite.
alter table valeum_web.leads               enable row level security;
alter table valeum_web.bookings            enable row level security;
alter table valeum_web.calendar_sync_state enable row level security;

-- Permisos exclusivos del backend. anon y authenticated no reciben USAGE,
-- así que el schema es invisible para cualquier cliente público.
grant usage on schema valeum_web to service_role;
grant all privileges on all tables in schema valeum_web to service_role;
alter default privileges in schema valeum_web grant all on tables to service_role;

-- ---------- exponer el schema en PostgREST ----------
-- Aditivo: conserva los schemas que ya estaban expuestos.
alter role authenticator set pgrst.db_schemas = 'public, graphql_public, valeum_web';
notify pgrst, 'reload config';
