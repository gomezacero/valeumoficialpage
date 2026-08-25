-- ============================================================
-- VALEUM — Embudo del formulario
-- Un registro por visitante que interactúa con el formulario,
-- para saber cuántos lo empiezan y en qué pregunta lo abandonan.
-- ============================================================
create table if not exists valeum_web.form_progress (
  session_id   uuid primary key,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  max_step     int  not null default 0,
  completed    boolean not null default false,
  lang         text,
  referrer     text,
  user_agent   text,
  ip_hash      text
);

comment on table valeum_web.form_progress is
  'Embudo del formulario-filtro. max_step: 0=vio la sección, 2-5=respondió esa pregunta, 6=envió. Permite distinguir falta de tráfico de abandono, y en qué pregunta se cae la gente.';

create index if not exists form_progress_created_idx on valeum_web.form_progress (created_at desc);
create index if not exists form_progress_step_idx    on valeum_web.form_progress (max_step);

alter table valeum_web.form_progress enable row level security;
grant all privileges on valeum_web.form_progress to service_role;

-- Avanza el progreso sin retroceder nunca.
create or replace function valeum_web.record_progress(
  p_session uuid, p_step int, p_lang text default null,
  p_referrer text default null, p_user_agent text default null, p_ip_hash text default null
) returns void
language plpgsql security definer set search_path = valeum_web, pg_temp as $$
begin
  insert into valeum_web.form_progress (session_id, max_step, lang, referrer, user_agent, ip_hash)
  values (p_session, p_step, p_lang, p_referrer, p_user_agent, p_ip_hash)
  on conflict (session_id) do update
    set max_step  = greatest(form_progress.max_step, excluded.max_step),
        completed = form_progress.completed or excluded.max_step >= 6,
        updated_at = now();
end;
$$;

grant execute on function valeum_web.record_progress(uuid, int, text, text, text, text) to service_role;

create or replace view valeum_web.funnel as
select
  count(*)                              as vieron_el_formulario,
  count(*) filter (where max_step >= 2) as respondieron_q1_servicio,
  count(*) filter (where max_step >= 3) as respondieron_q2_etapa,
  count(*) filter (where max_step >= 4) as respondieron_q3_presupuesto,
  count(*) filter (where max_step >= 5) as respondieron_q4_negocio,
  count(*) filter (where completed)     as enviaron,
  round(100.0 * count(*) filter (where completed) / nullif(count(*), 0), 1) as tasa_conversion_pct
from valeum_web.form_progress;

grant select on valeum_web.funnel to service_role;
