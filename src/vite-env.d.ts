/// <reference types="vite/client" />

/**
 * El sitio no consume variables de entorno en el navegador: toda la
 * configuración sensible (Supabase, SMTP, Google) vive en las funciones
 * serverless de /api y nunca se expone al cliente.
 */
