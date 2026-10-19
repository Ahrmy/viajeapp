-- Ejecutar en Supabase > SQL Editor.
-- Bucket público para las portadas de los viajes.
-- Cada usuario solo puede subir/editar/borrar dentro de su carpeta <user_id>/.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portadas',
  'portadas',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portadas: lectura pública" ON storage.objects;
CREATE POLICY "portadas: lectura pública"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portadas');

DROP POLICY IF EXISTS "portadas: subir en mi carpeta" ON storage.objects;
CREATE POLICY "portadas: subir en mi carpeta"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'portadas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "portadas: actualizar mis archivos" ON storage.objects;
CREATE POLICY "portadas: actualizar mis archivos"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'portadas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "portadas: borrar mis archivos" ON storage.objects;
CREATE POLICY "portadas: borrar mis archivos"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'portadas'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
