-- ============================================================
-- App de viajes en familia — Esquema completo para Supabase (v4)
-- Idempotente: se puede ejecutar múltiples veces sin errores.
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ---------- 1. Tipos enumerados (seguros si ya existen) ----------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'rol_miembro') THEN
    CREATE TYPE rol_miembro AS ENUM ('owner', 'editor', 'viewer');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_gasto') THEN
    CREATE TYPE estado_gasto AS ENUM ('pendiente', 'aprobado', 'rechazado');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_transporte') THEN
    CREATE TYPE tipo_transporte AS ENUM ('avion', 'tren', 'bus', 'coche', 'ferry', 'otro');
  END IF;
END $$;

-- ---------- 2. Tablas principales ----------

-- Viajes
CREATE TABLE IF NOT EXISTS viajes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             text NOT NULL,
  fecha_inicio       date,
  fecha_fin          date,
  num_viajeros       integer NOT NULL DEFAULT 1 CHECK (num_viajeros > 0),
  presupuesto_total  numeric(12,2) NOT NULL DEFAULT 0 CHECK (presupuesto_total >= 0),
  foto_portada       text,
  titulo_cabecero    text,
  subtitulo_cabecero text,
  etiqueta_ubicacion text,
  creado_por         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creado_en          timestamptz NOT NULL DEFAULT now()
);

-- Migraciones seguras para columnas añadidas recientemente
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS num_viajeros integer NOT NULL DEFAULT 1 CHECK (num_viajeros > 0);
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS fecha_inicio date;
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS fecha_fin date;
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS foto_portada text;
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS titulo_cabecero text;
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS subtitulo_cabecero text;
ALTER TABLE viajes ADD COLUMN IF NOT EXISTS etiqueta_ubicacion text;

-- Miembros del viaje (permisos de colaboración)
CREATE TABLE IF NOT EXISTS viaje_miembros (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id    uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  rol         rol_miembro NOT NULL DEFAULT 'viewer',
  invitado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viaje_id, user_id)
);

-- Migraciones seguras para miembros e invitaciones
ALTER TABLE viaje_miembros ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE viaje_miembros ADD COLUMN IF NOT EXISTS nombre text;
ALTER TABLE viaje_miembros ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE viaje_miembros ADD COLUMN IF NOT EXISTS estado text NOT NULL DEFAULT 'activo' CHECK (estado IN ('activo', 'pendiente'));
ALTER TABLE viaje_miembros ALTER COLUMN user_id DROP NOT NULL;

-- Ciudades destino (eje del itinerario)
CREATE TABLE IF NOT EXISTS ciudades (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id           uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  nombre             text NOT NULL,
  dias               integer NOT NULL DEFAULT 1 CHECK (dias > 0),
  orden              integer NOT NULL DEFAULT 0,
  foto               text,
  titulo_cabecero    text,
  subtitulo_cabecero text,
  creado_en          timestamptz NOT NULL DEFAULT now()
);

-- Migraciones seguras para ciudades
ALTER TABLE ciudades ADD COLUMN IF NOT EXISTS foto text;
ALTER TABLE ciudades ADD COLUMN IF NOT EXISTS titulo_cabecero text;
ALTER TABLE ciudades ADD COLUMN IF NOT EXISTS subtitulo_cabecero text;

-- Actividades (qué hacer en cada ciudad)
CREATE TABLE IF NOT EXISTS actividades (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id       uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  titulo          text NOT NULL,
  fecha           date,
  costo_estimado  numeric(12,2) DEFAULT 0,
  creado_en       timestamptz NOT NULL DEFAULT now()
);

-- Hoteles posibles por ciudad
CREATE TABLE IF NOT EXISTS hoteles (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id        uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  nombre           text NOT NULL,
  noches           integer DEFAULT 1,
  costo            numeric(12,2) DEFAULT 0,
  reservado        boolean NOT NULL DEFAULT false,
  estado_seleccion text NOT NULL DEFAULT 'sin_nada' CHECK (estado_seleccion IN ('preferido', 'elegido', 'sin_nada')),
  enlace_reserva   text,
  direccion        text,
  estrellas        text,
  foto             text,
  detalles         text,
  notas            text,
  creado_en        timestamptz NOT NULL DEFAULT now()
);

-- Migraciones seguras para hoteles
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS estado_seleccion text NOT NULL DEFAULT 'sin_nada' CHECK (estado_seleccion IN ('preferido', 'elegido', 'sin_nada'));
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS enlace_reserva text;
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS direccion text;
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS estrellas text;
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS foto text;
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS detalles text;
ALTER TABLE hoteles ADD COLUMN IF NOT EXISTS notas text;

-- Transportes hacia cada ciudad
CREATE TABLE IF NOT EXISTS transportes (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id        uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  tipo             tipo_transporte NOT NULL DEFAULT 'otro',
  origen           text,
  destino          text,
  fecha_hora       timestamptz,
  costo            numeric(12,2) DEFAULT 0,
  reservado        boolean NOT NULL DEFAULT false,
  estado_seleccion text NOT NULL DEFAULT 'sin_nada' CHECK (estado_seleccion IN ('preferido', 'elegido', 'sin_nada')),
  nombre_linea     text,
  duracion         text,
  hora_salida      text,
  hora_llegada     text,
  notas            text,
  enlace_compra    text,
  creado_en        timestamptz NOT NULL DEFAULT now()
);

-- Migraciones seguras para transportes
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS estado_seleccion text NOT NULL DEFAULT 'sin_nada' CHECK (estado_seleccion IN ('preferido', 'elegido', 'sin_nada'));
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS nombre_linea text;
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS duracion text;
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS hora_salida text;
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS hora_llegada text;
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS notas text;
ALTER TABLE transportes ADD COLUMN IF NOT EXISTS enlace_compra text;

-- Tareas a dos niveles: del viaje (ciudad_id NULL) o de una ciudad
CREATE TABLE IF NOT EXISTS tareas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id    uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  ciudad_id   uuid REFERENCES ciudades(id) ON DELETE CASCADE,
  titulo      text NOT NULL,
  asignado_a  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estado      text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'hecha')),
  vencimiento date,
  creado_en   timestamptz NOT NULL DEFAULT now()
);

-- Validación de coherencia de tareas
CREATE OR REPLACE FUNCTION validar_tarea_coherente()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.ciudad_id IS NOT NULL
     AND (SELECT viaje_id FROM ciudades WHERE id = NEW.ciudad_id) IS DISTINCT FROM NEW.viaje_id THEN
    RAISE EXCEPTION 'La ciudad % no pertenece al viaje %', NEW.ciudad_id, NEW.viaje_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validar_tarea ON tareas;
CREATE TRIGGER trg_validar_tarea
  BEFORE INSERT OR UPDATE OF viaje_id, ciudad_id ON tareas
  FOR EACH ROW EXECUTE FUNCTION validar_tarea_coherente();

-- Gastos (presupuesto). Solo los aprobados suman a la barra.
CREATE TABLE IF NOT EXISTS gastos (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id                 uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  categoria                text NOT NULL DEFAULT 'otros',
  titulo                   text,
  monto                    numeric(12,2) NOT NULL CHECK (monto > 0),
  pagado_por               uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estado                   estado_gasto NOT NULL DEFAULT 'pendiente',
  referencia_transporte_id uuid REFERENCES transportes(id) ON DELETE SET NULL,
  referencia_hotel_id      uuid REFERENCES hoteles(id) ON DELETE SET NULL,
  referencia_actividad_id  uuid REFERENCES actividades(id) ON DELETE SET NULL,
  creado_en                timestamptz NOT NULL DEFAULT now()
);

-- ---------- 3. Índices ----------
CREATE INDEX IF NOT EXISTS idx_viaje_miembros_user ON viaje_miembros(user_id);
CREATE INDEX IF NOT EXISTS idx_viaje_miembros_viaje ON viaje_miembros(viaje_id);
CREATE INDEX IF NOT EXISTS idx_ciudades_viaje ON ciudades(viaje_id);
CREATE INDEX IF NOT EXISTS idx_actividades_ciudad ON actividades(ciudad_id);
CREATE INDEX IF NOT EXISTS idx_hoteles_ciudad ON hoteles(ciudad_id);
CREATE INDEX IF NOT EXISTS idx_transportes_ciudad ON transportes(ciudad_id);
CREATE INDEX IF NOT EXISTS idx_tareas_viaje ON tareas(viaje_id);
CREATE INDEX IF NOT EXISTS idx_tareas_ciudad ON tareas(ciudad_id);
CREATE INDEX IF NOT EXISTS idx_gastos_viaje ON gastos(viaje_id);

-- ---------- 4. Funciones compartidas para RLS ----------
CREATE OR REPLACE FUNCTION es_miembro(viaje uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viaje AND m.user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION viaje_de_ciudad(ciudad uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT viaje_id FROM ciudades WHERE id = ciudad;
$$;

-- ---------- 5. RLS: activación ----------
ALTER TABLE viajes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE viaje_miembros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciudades        ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoteles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos          ENABLE ROW LEVEL SECURITY;

-- ---------- 6. RLS: políticas seguras (DROP IF EXISTS + CREATE) ----------

-- Viajes
DROP POLICY IF EXISTS "ver viaje si soy miembro" ON viajes;
CREATE POLICY "ver viaje si soy miembro"
  ON viajes FOR SELECT USING (es_miembro(id) OR creado_por = auth.uid());

DROP POLICY IF EXISTS "crear viaje (soy el creador)" ON viajes;
CREATE POLICY "crear viaje (soy el creador)"
  ON viajes FOR INSERT
  WITH CHECK (creado_por = auth.uid());

DROP POLICY IF EXISTS "editar viaje si soy owner o editor" ON viajes;
CREATE POLICY "editar viaje si soy owner o editor"
  ON viajes FOR UPDATE
  USING (es_miembro(id))
  WITH CHECK (es_miembro(id));

DROP POLICY IF EXISTS "borrar viaje solo owner" ON viajes;
CREATE POLICY "borrar viaje solo owner"
  ON viajes FOR DELETE
  USING (
    creado_por = auth.uid()
    OR EXISTS (
      SELECT 1 FROM viaje_miembros m
      WHERE m.viaje_id = viajes.id AND m.user_id = auth.uid() AND m.rol = 'owner'
    )
  );

-- Miembros
DROP POLICY IF EXISTS "ver miembros del viaje" ON viaje_miembros;
CREATE POLICY "ver miembros del viaje"
  ON viaje_miembros FOR SELECT
  USING (es_miembro(viaje_id) OR user_id = auth.uid());

DROP POLICY IF EXISTS "invitar miembros (solo owner)" ON viaje_miembros;
CREATE POLICY "invitar miembros (solo owner)"
  ON viaje_miembros FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM viaje_miembros m
      WHERE m.viaje_id = viaje_miembros.viaje_id
        AND m.user_id = auth.uid() AND m.rol = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM viajes v
      WHERE v.id = viaje_miembros.viaje_id
        AND v.creado_por = auth.uid()
    )
  );

DROP POLICY IF EXISTS "actualizar rol (solo owner)" ON viaje_miembros;
CREATE POLICY "actualizar rol (solo owner)"
  ON viaje_miembros FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM viaje_miembros m
      WHERE m.viaje_id = viaje_miembros.viaje_id
        AND m.user_id = auth.uid() AND m.rol = 'owner'
    )
    OR
    EXISTS (
      SELECT 1 FROM viajes v
      WHERE v.id = viaje_miembros.viaje_id
        AND v.creado_por = auth.uid()
    )
  );

DROP POLICY IF EXISTS "salir del viaje (auto-eliminación) o owner" ON viaje_miembros;
CREATE POLICY "salir del viaje (auto-eliminación) o owner"
  ON viaje_miembros FOR DELETE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viaje_miembros.viaje_id
      AND m.user_id = auth.uid() AND m.rol = 'owner'
  ));

-- Ciudades
DROP POLICY IF EXISTS "ver ciudades" ON ciudades;
CREATE POLICY "ver ciudades" ON ciudades
  FOR SELECT USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "crear ciudades (owner/editor)" ON ciudades;
CREATE POLICY "crear ciudades (owner/editor)" ON ciudades
  FOR INSERT WITH CHECK (es_miembro(viaje_id));

DROP POLICY IF EXISTS "editar ciudades (owner/editor)" ON ciudades;
CREATE POLICY "editar ciudades (owner/editor)" ON ciudades
  FOR UPDATE USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "borrar ciudades (owner/editor)" ON ciudades;
CREATE POLICY "borrar ciudades (owner/editor)" ON ciudades
  FOR DELETE USING (es_miembro(viaje_id));

-- Actividades
DROP POLICY IF EXISTS "ver actividades" ON actividades;
CREATE POLICY "ver actividades" ON actividades
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "crear actividades" ON actividades;
CREATE POLICY "crear actividades" ON actividades
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "editar actividades" ON actividades;
CREATE POLICY "editar actividades" ON actividades
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "borrar actividades" ON actividades;
CREATE POLICY "borrar actividades" ON actividades
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

-- Hoteles
DROP POLICY IF EXISTS "ver hoteles" ON hoteles;
CREATE POLICY "ver hoteles" ON hoteles
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "crear hoteles" ON hoteles;
CREATE POLICY "crear hoteles" ON hoteles
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "editar hoteles" ON hoteles;
CREATE POLICY "editar hoteles" ON hoteles
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "borrar hoteles" ON hoteles;
CREATE POLICY "borrar hoteles" ON hoteles
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

-- Transportes
DROP POLICY IF EXISTS "ver transportes" ON transportes;
CREATE POLICY "ver transportes" ON transportes
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "crear transportes" ON transportes;
CREATE POLICY "crear transportes" ON transportes
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "editar transportes" ON transportes;
CREATE POLICY "editar transportes" ON transportes
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

DROP POLICY IF EXISTS "borrar transportes" ON transportes;
CREATE POLICY "borrar transportes" ON transportes
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

-- Tareas
DROP POLICY IF EXISTS "ver tareas" ON tareas;
CREATE POLICY "ver tareas" ON tareas
  FOR SELECT USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "crear tareas" ON tareas;
CREATE POLICY "crear tareas" ON tareas
  FOR INSERT WITH CHECK (es_miembro(viaje_id));

DROP POLICY IF EXISTS "editar tareas" ON tareas;
CREATE POLICY "editar tareas" ON tareas
  FOR UPDATE USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "borrar tareas" ON tareas;
CREATE POLICY "borrar tareas" ON tareas
  FOR DELETE USING (es_miembro(viaje_id));

-- Gastos
DROP POLICY IF EXISTS "ver gastos" ON gastos;
CREATE POLICY "ver gastos" ON gastos
  FOR SELECT USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "crear gastos" ON gastos;
CREATE POLICY "crear gastos" ON gastos
  FOR INSERT WITH CHECK (es_miembro(viaje_id));

DROP POLICY IF EXISTS "editar gastos (aprobar/rechazar)" ON gastos;
CREATE POLICY "editar gastos (aprobar/rechazar)" ON gastos
  FOR UPDATE USING (es_miembro(viaje_id));

DROP POLICY IF EXISTS "borrar gastos" ON gastos;
CREATE POLICY "borrar gastos" ON gastos
  FOR DELETE USING (es_miembro(viaje_id));

-- ---------- 7. Vista para la barra de presupuesto ----------
CREATE OR REPLACE VIEW presupuesto_resumen
WITH (security_invoker = true) AS
SELECT
  v.id                AS viaje_id,
  v.nombre            AS viaje_nombre,
  v.presupuesto_total,
  COALESCE(SUM(g.monto) FILTER (WHERE g.estado = 'aprobado'), 0)   AS gastado,
  COALESCE(SUM(g.monto) FILTER (WHERE g.estado = 'pendiente'), 0)  AS pendiente,
  v.presupuesto_total
    - COALESCE(SUM(g.monto) FILTER (WHERE g.estado = 'aprobado'), 0) AS disponible,
  ROUND(
    LEAST(
      COALESCE(SUM(g.monto) FILTER (WHERE g.estado = 'aprobado'), 0)
      / NULLIF(v.presupuesto_total, 0) * 100, 100
    ), 2
  ) AS porcentaje_gastado
FROM viajes v
LEFT JOIN gastos g ON g.viaje_id = v.id
GROUP BY v.id, v.nombre, v.presupuesto_total;

-- ---------- 8. Triggers automáticos ----------

-- Administrador (owner) automático al crear viaje
CREATE OR REPLACE FUNCTION asignar_owner_viaje()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email text;
  v_nombre text;
BEGIN
  SELECT email, coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1))
  INTO v_email, v_nombre
  FROM auth.users
  WHERE id = NEW.creado_por;

  INSERT INTO viaje_miembros (viaje_id, user_id, email, nombre, rol, estado)
  VALUES (NEW.id, NEW.creado_por, v_email, coalesce(v_nombre, 'Administrador'), 'owner', 'activo')
  ON CONFLICT (viaje_id, user_id)
  DO UPDATE SET
    rol = 'owner',
    email = coalesce(EXCLUDED.email, viaje_miembros.email),
    nombre = coalesce(EXCLUDED.nombre, viaje_miembros.nombre);

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_asignar_owner ON viajes;
CREATE TRIGGER trg_asignar_owner
  AFTER INSERT ON viajes
  FOR EACH ROW EXECUTE FUNCTION asignar_owner_viaje();

-- Sumar costo de transporte como gasto automático al reservar
CREATE OR REPLACE FUNCTION crear_gasto_desde_transporte()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reservado = true AND OLD.reservado = false THEN
    INSERT INTO gastos (viaje_id, categoria, titulo, monto, estado, referencia_transporte_id)
    VALUES (
      (SELECT viaje_id FROM ciudades WHERE id = NEW.ciudad_id),
      'transporte',
      'Transporte a ' || (SELECT nombre FROM ciudades WHERE id = NEW.ciudad_id),
      NEW.costo,
      'aprobado',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gasto_transporte ON transportes;
CREATE TRIGGER trg_gasto_transporte
  AFTER UPDATE ON transportes
  FOR EACH ROW EXECUTE FUNCTION crear_gasto_desde_transporte();

-- Sumar costo de hotel como gasto automático al reservar
CREATE OR REPLACE FUNCTION crear_gasto_desde_hotel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.reservado = true AND OLD.reservado = false THEN
    INSERT INTO gastos (viaje_id, categoria, titulo, monto, estado, referencia_hotel_id)
    VALUES (
      (SELECT viaje_id FROM ciudades WHERE id = NEW.ciudad_id),
      'alojamiento',
      'Hotel: ' || NEW.nombre,
      NEW.costo,
      'aprobado',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_gasto_hotel ON hoteles;
CREATE TRIGGER trg_gasto_hotel
  AFTER UPDATE ON hoteles
  FOR EACH ROW EXECUTE FUNCTION crear_gasto_desde_hotel();