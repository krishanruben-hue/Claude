import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Sjekk at verdiene er ekte (ikke plassholdere fra .env.example)
const isReal = supabaseUrl &&
  supabaseKey &&
  !supabaseUrl.includes('xxxxxxxxxxx') &&
  !supabaseKey.endsWith('...') &&
  supabaseUrl.startsWith('https://');

if (!isReal) {
  console.warn('[DB] Supabase ikke konfigurert – kjorer i demo-modus med eksempeldata');
}

export const supabase = isReal ? createClient(supabaseUrl, supabaseKey) : null;
export const isMockMode = !supabase;
