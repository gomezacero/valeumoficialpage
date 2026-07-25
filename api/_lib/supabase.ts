/* ============================================================
   VALEUM — CLIENTE SUPABASE (service_role, solo servidor)
   Apunta al schema aislado valeum_web del proyecto designflow-ai.
   ============================================================ */
import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "./env.js";

function makeClient() {
  return createClient(requireEnv("SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    db: { schema: "valeum_web" },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** El tipo se infiere de la propia llamada para conservar el schema valeum_web. */
export type ValeumClient = ReturnType<typeof makeClient>;

let client: ValeumClient | null = null;

export function getSupabase(): ValeumClient {
  if (!client) client = makeClient();
  return client;
}

export interface LeadRow {
  id: string;
  created_at: string;
  service: string;
  stage: string;
  budget: string;
  business: string;
  name: string;
  email: string;
  company: string | null;
  country: string;
  score: number;
  matched: boolean;
  owner: string;
  calendar_url: string;
  booked: boolean;
  booked_at: string | null;
  lang: string;
  source: string;
}
