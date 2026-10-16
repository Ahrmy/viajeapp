import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const envUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const envKey = import.meta.env.VITE_SUPABASE_API_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  envUrl && envKey && typeof envUrl === "string" && envUrl.startsWith("http")
);

if (!isSupabaseConfigured) {
  console.warn(
    "Aviso: Faltan las variables VITE_SUPABASE_URL o VITE_SUPABASE_API_KEY en el archivo .env. La interfaz se mostrará en modo de demostración."
  );
}

// Fallback placeholder to prevent runtime crash when .env is not yet configured
const supabaseUrl = isSupabaseConfigured
  ? envUrl!
  : "https://placeholder-project.supabase.co";

const supabaseKey = isSupabaseConfigured
  ? envKey!
  : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIn0.placeholder";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
export default supabase;
