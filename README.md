# Valeum — Sitio oficial

Landing corporativa de Valeum: HTML estático servido por Vercel + funciones serverless para el pipeline de leads y agendamiento.

## Stack

- **Front-end:** HTML + CSS + TypeScript vanilla, empaquetado con Vite. Sin frameworks: el bundle son ~15 KB de JS gzip.
- **API:** Vercel Functions (Node) en `api/`.
- **Base de datos:** Supabase (proyecto `designflow-ai`, schema aislado `valeum_web`).
- **Correo:** SMTP de Google Workspace vía Nodemailer.
- **Agendamiento:** Google Appointment Schedules + Google Calendar API para detectar las reservas.

## Estructura

```
index.html                     Markup completo del sitio
src/
  main.ts                      Bootstrap
  styles.css                   Todos los estilos
  modules/
    dom.ts                     Helpers ($, $$, esc, reduceMotion)
    i18n.ts                    Diccionario ES/EN/PT y cambio de idioma
    ui.ts                      Nav, reveals, contadores, FAQ, marquee, parallax
    form.ts                    Formulario-filtro de 5 pasos
    calendar.ts                Bloque de agenda
api/
  lead.ts                      POST — recibe el formulario
  calendar/sync.ts             GET/POST — detecta reservas nuevas
  _lib/
    scoring.ts                 Puntaje, umbral y asignación por servicio
    supabase.ts                Cliente service_role sobre valeum_web
    mailer.ts                  Transporte SMTP
    templates.ts               Plantillas HTML de los correos
    google.ts                  Autenticación y lectura de Calendar API
    env.ts                     Lectura de variables de entorno
supabase/migrations/           SQL del schema valeum_web
.github/workflows/             Cron de sincronización de calendarios
```

## Cómo funciona el formulario

1. El visitante responde 5 pasos: qué busca, etapa, facturación, descripción del negocio y datos de contacto.
2. El navegador envía **solo las respuestas crudas** a `POST /api/lead`.
3. El servidor calcula el puntaje (`servicio + etapa + presupuesto`, umbral 3), decide si califica y asigna el calendario:
   - **Jesús** → consultoría y marketing performance
   - **Harry** → software a medida y quienes aún no lo tienen claro
4. Guarda el lead en `valeum_web.leads` y envía un correo al responsable asignado.
5. Responde `{ matched, calendarUrl }`; si califica, la web desbloquea la agenda con ese calendario.

El puntaje y la asignación viven en el servidor a propósito: desde el navegador no se pueden alterar.

## Cómo funciona el aviso de agendamiento

Un cron de GitHub Actions llama cada 15 minutos a `/api/calendar/sync`, que lee ambos calendarios de forma incremental (`syncToken`), detecta reservas nuevas, las cruza **por email** con los leads de los últimos 90 días y envía un correo con todas las respuestas del formulario más la fecha de la reunión.

Es idempotente: `google_event_id` es único y cada reserva se notifica una sola vez.

> **Limitación conocida:** Google Appointment Schedules no permite pre-rellenar campos por URL, así que el cruce se hace por correo. Si alguien reserva con un email distinto al del formulario no habrá match. Para esos casos, configura `BOOKING_TITLE_MATCH` con un fragmento del título de la reserva (por ejemplo `llamada valeum`) y el aviso se enviará igual, marcado como *reserva sin lead asociado*. Sin esa variable, esas reuniones se ignoran para no notificar las reuniones internas del calendario.

## Desarrollo

```bash
npm install
```

```bash
npm run dev
```

`npm run dev` levanta solo el front (Vite, puerto 3000). Si la API no responde, el formulario degrada de forma controlada: muestra la agenda con un calendario de respaldo para no perder al lead y registra el error en consola.

Para probar las funciones serverless en local hace falta la CLI de Vercel:

```bash
npx vercel dev
```

Otros comandos:

```bash
npm run lint
```

```bash
npm run build
```

## Variables de entorno

Todas son **server-side** — ninguna lleva prefijo `VITE_`. Ver [.env.example](.env.example) para la lista completa: Supabase, SMTP, correos y calendarios de Jesús y Harry, cuenta de servicio de Google y `SYNC_SECRET`.

En GitHub hay que configurar además dos secretos para el cron: `VALEUM_SYNC_URL` y `VALEUM_SYNC_SECRET`.

## Base de datos

Schema `valeum_web` con tres tablas: `leads`, `bookings` y `calendar_sync_state`. Tienen RLS activo **sin políticas**, así que solo el backend (con `service_role`) puede leer o escribir; los roles `anon` y `authenticated` ni siquiera tienen `USAGE` sobre el schema.
