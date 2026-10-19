import { createClient } from "@supabase/supabase-js"
import fs from "node:fs"

const env = Object.fromEntries(
  fs.readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")] })
)
const sb = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_API_KEY)

const { data: auth, error: aerr } = await sb.auth.signInWithPassword({
  email: process.env.TEST_EMAIL,
  password: process.env.TEST_PASSWORD,
})
console.log("LOGIN:", aerr ? "ERROR " + aerr.message : "OK user=" + auth.user.id)
if (aerr) process.exit(1)

const list = await sb.from("viajes").select("id,nombre,creado_por,creado_en").order("creado_en", { ascending: false })
console.log("VIAJES existentes:", list.error ? "ERROR " + list.error.message : JSON.stringify(list.data, null, 2))

const ins = await sb.from("viajes").insert({
  nombre: "Verificación script",
  creado_por: auth.user.id,
  presupuesto_total: 2500,
  titulo_cabecero: "Prueba",
  subtitulo_cabecero: "Prueba",
  foto_portada: "/images/family-costa-brava.png",
  etiqueta_ubicacion: "Madrid, España",
}).select().single()
console.log("INSERT:", ins.error ? "ERROR " + JSON.stringify(ins.error) : "OK id=" + ins.data.id)

if (ins.data) {
  const del = await sb.from("viajes").delete().eq("id", ins.data.id)
  console.log("CLEANUP:", del.error ? "ERROR " + del.error.message : "OK (borrado)")
}
