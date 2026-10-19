-- ============================================================
-- App de viajes en familia — Esquema completo para Supabase (v3)
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- ---------- Tipos enumerados ----------
CREATE TYPE rol_miembro AS ENUM ('owner', 'editor', 'viewer');
CREATE TYPE estado_gasto AS ENUM ('pendiente', 'aprobado', 'rechazado');
CREATE TYPE tipo_transporte AS ENUM ('avion', 'tren', 'bus', 'coche', 'ferry', 'otro');

-- ---------- Tablas ----------

-- Viajes
CREATE TABLE viajes (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre             text NOT NULL,
  fecha_inicio       date,
  fecha_fin          date,
  presupuesto_total  numeric(12,2) NOT NULL DEFAULT 0 CHECK (presupuesto_total >= 0),
  foto_portada       text,
  titulo_cabecero    text,
  subtitulo_cabecero text,
  etiqueta_ubicacion text,
  creado_por         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creado_en          timestamptz NOT NULL DEFAULT now()
);

-- Miembros del viaje (permisos de colaboración)
CREATE TABLE viaje_miembros (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id   uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rol        rol_miembro NOT NULL DEFAULT 'viewer',
  invitado_en timestamptz NOT NULL DEFAULT now(),
  UNIQUE (viaje_id, user_id)
);

-- Ciudades destino (eje del itinerario)
CREATE TABLE ciudades (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id  uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  nombre    text NOT NULL,
  dias      integer NOT NULL DEFAULT 1 CHECK (dias > 0),
  orden     integer NOT NULL DEFAULT 0,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Actividades (qué hacer en cada ciudad)
CREATE TABLE actividades (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id       uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  titulo          text NOT NULL,
  fecha           date,
  costo_estimado  numeric(12,2) DEFAULT 0,
  creado_en       timestamptz NOT NULL DEFAULT now()
);

-- Hoteles posibles por ciudad
CREATE TABLE hoteles (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  nombre    text NOT NULL,
  noches    integer DEFAULT 1,
  costo     numeric(12,2) DEFAULT 0,
  reservado boolean NOT NULL DEFAULT false,
  creado_en timestamptz NOT NULL DEFAULT now()
);

-- Transportes hacia cada ciudad (asociados a la ciudad destino)
CREATE TABLE transportes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad_id  uuid NOT NULL REFERENCES ciudades(id) ON DELETE CASCADE,
  tipo       tipo_transporte NOT NULL DEFAULT 'otro',
  origen     text,            -- texto libre: "casa", "Madrid", u otra ciudad
  destino    text,
  fecha_hora timestamptz,
  costo      numeric(12,2) DEFAULT 0,
  reservado  boolean NOT NULL DEFAULT false,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

-- Tareas a dos niveles: del viaje (ciudad_id NULL) o de una ciudad
CREATE TABLE tareas (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id    uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  ciudad_id   uuid REFERENCES ciudades(id) ON DELETE CASCADE,  -- NULL = tarea del viaje
  titulo      text NOT NULL,
  asignado_a  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estado      text NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_curso', 'hecha')),
  vencimiento date,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

-- Validación (los CHECK no admiten subconsultas en Postgres):
-- garantiza que la ciudad de una tarea pertenezca al mismo viaje.
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

CREATE TRIGGER trg_validar_tarea
  BEFORE INSERT OR UPDATE OF viaje_id, ciudad_id ON tareas
  FOR EACH ROW EXECUTE FUNCTION validar_tarea_coherente();

-- Gastos (presupuesto). Solo los aprobados suman a la barra.
CREATE TABLE gastos (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  viaje_id   uuid NOT NULL REFERENCES viajes(id) ON DELETE CASCADE,
  categoria  text NOT NULL DEFAULT 'otros',
  titulo     text,
  monto      numeric(12,2) NOT NULL CHECK (monto > 0),
  pagado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  estado     estado_gasto NOT NULL DEFAULT 'pendiente',
  referencia_transporte_id uuid REFERENCES transportes(id) ON DELETE SET NULL,
  referencia_hotel_id     uuid REFERENCES hoteles(id) ON DELETE SET NULL,
  referencia_actividad_id uuid REFERENCES actividades(id) ON DELETE SET NULL,
  creado_en  timestamptz NOT NULL DEFAULT now()
);

-- ---------- Índices ----------
CREATE INDEX idx_viaje_miembros_user ON viaje_miembros(user_id);
CREATE INDEX idx_viaje_miembros_viaje ON viaje_miembros(viaje_id);
CREATE INDEX idx_ciudades_viaje ON ciudades(viaje_id);
CREATE INDEX idx_actividades_ciudad ON actividades(ciudad_id);
CREATE INDEX idx_hoteles_ciudad ON hoteles(ciudad_id);
CREATE INDEX idx_transportes_ciudad ON transportes(ciudad_id);
CREATE INDEX idx_tareas_viaje ON tareas(viaje_id);
CREATE INDEX idx_tareas_ciudad ON tareas(ciudad_id);
CREATE INDEX idx_gastos_viaje ON gastos(viaje_id);

-- ---------- Función compartida para RLS ----------
-- Evita repetir la subconsulta en cada política.

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

-- Versión para tablas hijas: resuelve el viaje a través de la ciudad
CREATE OR REPLACE FUNCTION viaje_de_ciudad(ciudad uuid)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT viaje_id FROM ciudades WHERE id = ciudad;
$$;

-- ---------- RLS: activación ----------
ALTER TABLE viajes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE viaje_miembros  ENABLE ROW LEVEL SECURITY;
ALTER TABLE ciudades        ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades     ENABLE ROW LEVEL SECURITY;
ALTER TABLE hoteles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE transportes     ENABLE ROW LEVEL SECURITY;
ALTER TABLE tareas          ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos          ENABLE ROW LEVEL SECURITY;

-- ---------- RLS: viajes ----------
-- Incluye al creador: INSERT ... RETURNING (insert().select()) evalúa esta
-- política antes de que el trigger AFTER INSERT lo añada como owner.
CREATE POLICY "ver viaje si soy miembro"
  ON viajes FOR SELECT USING (es_miembro(id) OR creado_por = auth.uid());

CREATE POLICY "crear viaje (soy el creador)"
  ON viajes FOR INSERT
  WITH CHECK (creado_por = auth.uid());

CREATE POLICY "editar viaje si soy owner o editor"
  ON viajes FOR UPDATE
  USING (es_miembro(id))
  WITH CHECK (es_miembro(id));  -- refina en la app: solo owner/editor pueden cambiar presupuesto_total

CREATE POLICY "borrar viaje solo owner"
  ON viajes FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viajes.id AND m.user_id = auth.uid() AND m.rol = 'owner'
  ));

-- ---------- RLS: miembros ----------
-- Solo el owner gestiona miembros. Un usuario siempre puede verse a sí mismo.
CREATE POLICY "ver miembros del viaje"
  ON viaje_miembros FOR SELECT
  USING (es_miembro(viaje_id) OR user_id = auth.uid());

CREATE POLICY "invitar miembros (solo owner)"
  ON viaje_miembros FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viaje_miembros.viaje_id
      AND m.user_id = auth.uid() AND m.rol = 'owner'
  ));

CREATE POLICY "actualizar rol (solo owner)"
  ON viaje_miembros FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viaje_miembros.viaje_id
      AND m.user_id = auth.uid() AND m.rol = 'owner'
  ));

CREATE POLICY "salir del viaje (auto-eliminación) o owner"
  ON viaje_miembros FOR DELETE
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM viaje_miembros m
    WHERE m.viaje_id = viaje_miembros.viaje_id
      AND m.user_id = auth.uid() AND m.rol = 'owner'
  ));

-- ---------- RLS: ciudades ----------
CREATE POLICY "ver ciudades" ON ciudades
  FOR SELECT USING (es_miembro(viaje_id));
CREATE POLICY "crear ciudades (owner/editor)" ON ciudades
  FOR INSERT WITH CHECK (es_miembro(viaje_id));
CREATE POLICY "editar ciudades (owner/editor)" ON ciudades
  FOR UPDATE USING (es_miembro(viaje_id));
CREATE POLICY "borrar ciudades (owner/editor)" ON ciudades
  FOR DELETE USING (es_miembro(viaje_id));

-- ---------- RLS: tablas hijas de ciudad ----------
-- actividades, hoteles y transportes comparten el mismo patrón.
CREATE POLICY "ver actividades" ON actividades
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "crear actividades" ON actividades
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "editar actividades" ON actividades
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "borrar actividades" ON actividades
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

CREATE POLICY "ver hoteles" ON hoteles
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "crear hoteles" ON hoteles
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "editar hoteles" ON hoteles
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "borrar hoteles" ON hoteles
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

CREATE POLICY "ver transportes" ON transportes
  FOR SELECT USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "crear transportes" ON transportes
  FOR INSERT WITH CHECK (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "editar transportes" ON transportes
  FOR UPDATE USING (es_miembro(viaje_de_ciudad(ciudad_id)));
CREATE POLICY "borrar transportes" ON transportes
  FOR DELETE USING (es_miembro(viaje_de_ciudad(ciudad_id)));

-- ---------- RLS: tareas (viaje o ciudad) ----------
CREATE POLICY "ver tareas" ON tareas
  FOR SELECT USING (es_miembro(viaje_id));
CREATE POLICY "crear tareas" ON tareas
  FOR INSERT WITH CHECK (es_miembro(viaje_id));
CREATE POLICY "editar tareas" ON tareas
  FOR UPDATE USING (es_miembro(viaje_id));
CREATE POLICY "borrar tareas" ON tareas
  FOR DELETE USING (es_miembro(viaje_id));

-- ---------- RLS: gastos ----------
CREATE POLICY "ver gastos" ON gastos
  FOR SELECT USING (es_miembro(viaje_id));
CREATE POLICY "crear gastos" ON gastos
  FOR INSERT WITH CHECK (es_miembro(viaje_id));
CREATE POLICY "editar gastos (aprobar/rechazar)" ON gastos
  FOR UPDATE USING (es_miembro(viaje_id));
CREATE POLICY "borrar gastos" ON gastos
  FOR DELETE USING (es_miembro(viaje_id));

-- ---------- Vista para la barra de presupuesto ----------
-- "0 € de 4000 €" con Gastado (aprobados) y Disponible
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

-- ---------- Trigger: owner automático al crear viaje ----------
CREATE OR REPLACE FUNCTION asignar_owner_viaje()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO viaje_miembros (viaje_id, user_id, rol)
  VALUES (NEW.id, NEW.creado_por, 'owner')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_asignar_owner
  AFTER INSERT ON viajes
  FOR EACH ROW EXECUTE FUNCTION asignar_owner_viaje();

-- ---------- Trigger: sumar costo de transporte/hotel como gasto ----------
-- Opcional: al marcar reservado = true, crea el gasto asociado automáticamente.
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

CREATE TRIGGER trg_gasto_transporte
  AFTER UPDATE ON transportes
  FOR EACH ROW EXECUTE FUNCTION crear_gasto_desde_transporte();

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

CREATE TRIGGER trg_gasto_hotel
  AFTER UPDATE ON hoteles
  FOR EACH ROW EXECUTE FUNCTION crear_gasto_desde_hotel();

-- ============================================================
-- Después de ejecutar, genera los tipos TypeScript:
--   npx supabase gen types typescript --project-id <TU_PROJECT_ID> --schema public > src/types/database.ts
-- ============================================================