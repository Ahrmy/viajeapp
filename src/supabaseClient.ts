import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseKey = import.meta.env.VITE_SUPABASE_API_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Faltan las variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_API_KEY en el archivo .env",
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
export default supabase;
