-- Ejecutar en Supabase > SQL Editor.
-- Corrige: "new row violates row-level security policy for table viajes"
-- al crear un viaje con insert().select(). El trigger que añade al owner es
-- AFTER INSERT, así que la política SELECT debe permitir ver al creador.

DROP POLICY IF EXISTS "ver viaje si soy miembro" ON viajes;

CREATE POLICY "ver viaje si soy miembro"
  ON viajes FOR SELECT
  USING (es_miembro(id) OR creado_por = auth.uid());
