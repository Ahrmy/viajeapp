import { supabase, isSupabaseConfigured } from "@/supabaseClient";
import type {
  Viaje,
  ViajeInsert,
  ViajeUpdate,
  Ciudad,
  CiudadInsert,
  Tarea,
  TareaInsert,
  TareaUpdate,
  Gasto,
  GastoInsert,
  GastoUpdate,
  Actividad,
  Hotel,
  Transporte,
  RolMiembro,
} from "@/types/database";

// ============================================================
// Datos iniciales de demostración (fallback offline o sin login)
// ============================================================
export const DEMO_TRIP_ID = "demo-portugal-2026";

export const DEMO_TRIPS: Viaje[] = [
  {
    id: DEMO_TRIP_ID,
    nombre: "Portugal en familia",
    fecha_inicio: "2026-11-06",
    fecha_fin: "2026-11-13",
    presupuesto_total: 3200,
    foto_portada: "/images/lisboa-panoramica.png",
    titulo_cabecero: "Hay viajes que ya se sienten cerca.",
    subtitulo_cabecero:
      "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.",
    etiqueta_ubicacion: "Lisboa, Portugal",
    creado_por: "demo-user",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-menorca-2026",
    nombre: "Un verano en Menorca",
    fecha_inicio: "2026-07-12",
    fecha_fin: "2026-07-19",
    presupuesto_total: 2800,
    foto_portada: "/images/family-costa-brava.png",
    titulo_cabecero: "Calas turquesas y brisa mediterránea.",
    subtitulo_cabecero: "Ciutadella, Fornells y senderos mágicos en familia.",
    etiqueta_ubicacion: "Menorca, España",
    creado_por: "demo-user",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-pirineos-2026",
    nombre: "Escapada a los Pirineos",
    fecha_inicio: "2026-04-02",
    fecha_fin: "2026-04-05",
    presupuesto_total: 1500,
    foto_portada: "/images/costa-brava.jpg",
    titulo_cabecero: "Naturaleza viva y aire puro de montaña.",
    subtitulo_cabecero: "Senderos verdes, valles y refugios inolvidables.",
    etiqueta_ubicacion: "Pirineos, España",
    creado_por: "demo-user",
    creado_en: new Date().toISOString(),
  },
];

export const DEMO_CITIES: Ciudad[] = [
  {
    id: "demo-lisboa",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Lisboa",
    dias: 3,
    orden: 0,
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-sintra",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Sintra",
    dias: 1,
    orden: 1,
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-oporto",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Oporto",
    dias: 3,
    orden: 2,
    creado_en: new Date().toISOString(),
  },
];

export const DEMO_TASKS: Tarea[] = [
  {
    id: "task-1",
    viaje_id: DEMO_TRIP_ID,
    ciudad_id: "demo-sintra",
    titulo: "Reservar entradas al Palacio da Pena",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-10-23",
    creado_en: new Date().toISOString(),
  },
  {
    id: "task-2",
    viaje_id: DEMO_TRIP_ID,
    ciudad_id: "demo-sintra",
    titulo: "Elegir alojamiento en Sintra",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-10-25",
    creado_en: new Date().toISOString(),
  },
  {
    id: "task-3",
    viaje_id: DEMO_TRIP_ID,
    ciudad_id: "demo-oporto",
    titulo: "Organizar el paseo por el Duero",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-10-28",
    creado_en: new Date().toISOString(),
  },
];

export const DEMO_EXPENSES: Gasto[] = [
  {
    id: "exp-1",
    viaje_id: DEMO_TRIP_ID,
    categoria: "alojamiento",
    titulo: "Lisboa Pessoa Hotel",
    monto: 810,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  {
    id: "exp-2",
    viaje_id: DEMO_TRIP_ID,
    categoria: "alojamiento",
    titulo: "Tres noches en Oporto",
    monto: 720,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  {
    id: "exp-3",
    viaje_id: DEMO_TRIP_ID,
    categoria: "transporte",
    titulo: "Tren Faro → Lisboa",
    monto: 94,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  {
    id: "exp-4",
    viaje_id: DEMO_TRIP_ID,
    categoria: "actividades",
    titulo: "Descubrir Lisboa juntos",
    monto: 216,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  {
    id: "exp-5",
    viaje_id: DEMO_TRIP_ID,
    categoria: "actividades",
    titulo: "Palacio da Pena, Sintra",
    monto: 80,
    pagado_por: null,
    estado: "pendiente",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  {
    id: "exp-6",
    viaje_id: DEMO_TRIP_ID,
    categoria: "comida",
    titulo: "Sabores de Portugal",
    monto: 600,
    pagado_por: null,
    estado: "pendiente",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
];

// ============================================================
// SERVICIOS CRUD CONECTADOS A SUPABASE
// ============================================================

export const tripService = {
  /**
   * Obtiene todos los viajes del usuario actual desde Supabase.
   */
  async getTrips(
    userId?: string,
  ): Promise<{ data: Viaje[]; isRealtime: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: DEMO_TRIPS, isRealtime: false };
    }

    try {
      const { data, error } = await supabase
        .from("viajes")
        .select("*")
        .order("creado_en", { ascending: false });

      if (error) {
        console.warn("Error cargando viajes desde Supabase:", error.message);
        return { data: DEMO_TRIPS, isRealtime: false, error: error.message };
      }

      if (!data || data.length === 0) {
        return { data: [], isRealtime: true };
      }

      return { data, isRealtime: true };
    } catch (err: unknown) {
      console.warn("Excepción cargando viajes:", err);
      return {
        data: DEMO_TRIPS,
        isRealtime: false,
        error: err instanceof Error ? err.message : "Error desconocido",
      };
    }
  },

  /**
   * Crea un nuevo viaje en Supabase
   */
  async createTrip(
    trip: ViajeInsert,
  ): Promise<{ data: Viaje | null; error?: string }> {
    if (!isSupabaseConfigured) {
      const demoNew: Viaje = {
        id: `trip-${Date.now()}`,
        nombre: trip.nombre,
        fecha_inicio: trip.fecha_inicio ?? null,
        fecha_fin: trip.fecha_fin ?? null,
        presupuesto_total: trip.presupuesto_total ?? 0,
        foto_portada: trip.foto_portada ?? null,
        titulo_cabecero: trip.titulo_cabecero ?? null,
        subtitulo_cabecero: trip.subtitulo_cabecero ?? null,
        etiqueta_ubicacion: trip.etiqueta_ubicacion ?? null,
        creado_por: trip.creado_por || "demo-user",
        creado_en: new Date().toISOString(),
      };
      return { data: demoNew };
    }

    try {
      const { data, error } = await supabase
        .from("viajes")
        .insert(trip)
        .select()
        .single();

      if (error) {
        console.error("Error creando viaje:", error.message);
        return { data: null, error: error.message };
      }

      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al crear viaje",
      };
    }
  },

  /**
   * Actualiza datos de un viaje (cabecero, fechas, nombre, presupuesto)
   */
  async updateTrip(
    tripId: string,
    updates: ViajeUpdate,
  ): Promise<{ success: boolean; error?: string }> {
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("viajes")
        .update(updates)
        .eq("id", tripId);

      if (error) {
        console.error("Error actualizando viaje:", error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar viaje",
      };
    }
  },

  /**
   * Elimina un viaje
   */
  async deleteTrip(
    tripId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || tripId.startsWith("demo-")) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from("viajes").delete().eq("id", tripId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar viaje",
      };
    }
  },

  /**
   * Carga las ciudades asociadas a un viaje
   */
  async getCities(tripId: string): Promise<Ciudad[]> {
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      return DEMO_CITIES;
    }

    try {
      const { data, error } = await supabase
        .from("ciudades")
        .select("*")
        .eq("viaje_id", tripId)
        .order("orden", { ascending: true });

      if (error || !data) {
        console.warn("Error cargando ciudades:", error?.message);
        return DEMO_CITIES;
      }

      return data;
    } catch {
      return DEMO_CITIES;
    }
  },

  /**
   * Añade una ciudad a un viaje
   */
  async createCity(
    city: CiudadInsert,
  ): Promise<{ data: Ciudad | null; error?: string }> {
    if (
      !isSupabaseConfigured ||
      city.viaje_id.startsWith("demo-") ||
      city.viaje_id.startsWith("trip-")
    ) {
      const demoCity: Ciudad = {
        id: `city-${Date.now()}`,
        viaje_id: city.viaje_id,
        nombre: city.nombre,
        dias: city.dias ?? 1,
        orden: city.orden ?? 0,
        creado_en: new Date().toISOString(),
      };
      return { data: demoCity };
    }

    try {
      const { data, error } = await supabase
        .from("ciudades")
        .insert(city)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al guardar ciudad",
      };
    }
  },

  /**
   * Carga las tareas de un viaje
   */
  async getTasks(tripId: string): Promise<Tarea[]> {
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      return DEMO_TASKS;
    }

    try {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("viaje_id", tripId)
        .order("creado_en", { ascending: true });

      if (error || !data) {
        console.warn("Error cargando tareas:", error?.message);
        return DEMO_TASKS;
      }

      return data;
    } catch {
      return DEMO_TASKS;
    }
  },

  /**
   * Crea una nueva tarea
   */
  async createTask(
    task: TareaInsert,
  ): Promise<{ data: Tarea | null; error?: string }> {
    if (
      !isSupabaseConfigured ||
      task.viaje_id.startsWith("demo-") ||
      task.viaje_id.startsWith("trip-")
    ) {
      const demoTask: Tarea = {
        id: `task-${Date.now()}`,
        viaje_id: task.viaje_id,
        ciudad_id: task.ciudad_id ?? null,
        titulo: task.titulo,
        asignado_a: task.asignado_a ?? null,
        estado: task.estado ?? "pendiente",
        vencimiento: task.vencimiento ?? null,
        creado_en: new Date().toISOString(),
      };
      return { data: demoTask };
    }

    try {
      const { data, error } = await supabase
        .from("tareas")
        .insert(task)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al crear tarea",
      };
    }
  },

  /**
   * Actualiza el estado o detalle de una tarea
   */
  async updateTask(
    taskId: string,
    updates: TareaUpdate,
  ): Promise<{ success: boolean; error?: string }> {
    if (
      !isSupabaseConfigured ||
      taskId.startsWith("task-") ||
      taskId.startsWith("demo-")
    ) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("tareas")
        .update(updates)
        .eq("id", taskId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error actualizando tarea",
      };
    }
  },

  /**
   * Carga los gastos de un viaje
   */
  async getExpenses(tripId: string): Promise<Gasto[]> {
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      return DEMO_EXPENSES;
    }

    try {
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .eq("viaje_id", tripId)
        .order("creado_en", { ascending: false });

      if (error || !data) {
        console.warn("Error cargando gastos:", error?.message);
        return DEMO_EXPENSES;
      }

      return data;
    } catch {
      return DEMO_EXPENSES;
    }
  },

  /**
   * Crea un nuevo gasto en la base de datos
   */
  async createExpense(
    expense: GastoInsert,
  ): Promise<{ data: Gasto | null; error?: string }> {
    if (
      !isSupabaseConfigured ||
      expense.viaje_id.startsWith("demo-") ||
      expense.viaje_id.startsWith("trip-")
    ) {
      const demoExp: Gasto = {
        id: `exp-${Date.now()}`,
        viaje_id: expense.viaje_id,
        categoria: expense.categoria ?? "otros",
        titulo: expense.titulo ?? null,
        monto: expense.monto,
        pagado_por: expense.pagado_por ?? null,
        estado: expense.estado ?? "pendiente",
        referencia_transporte_id: expense.referencia_transporte_id ?? null,
        referencia_hotel_id: expense.referencia_hotel_id ?? null,
        referencia_actividad_id: expense.referencia_actividad_id ?? null,
        creado_en: new Date().toISOString(),
      };
      return { data: demoExp };
    }

    try {
      const { data, error } = await supabase
        .from("gastos")
        .insert(expense)
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al registrar gasto",
      };
    }
  },

  /**
   * Actualiza un gasto (por ejemplo, cambiar de pendiente a aprobado)
   */
  async updateExpense(
    expenseId: string,
    updates: GastoUpdate,
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || expenseId.startsWith("exp-")) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("gastos")
        .update(updates)
        .eq("id", expenseId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error actualizando gasto",
      };
    }
  },

  /**
   * Elimina un gasto
   */
  async deleteExpense(
    expenseId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || expenseId.startsWith("exp-")) {
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("gastos")
        .delete()
        .eq("id", expenseId);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar gasto",
      };
    }
  },

  /**
   * Obtiene detalles completos de una ciudad (actividades, hoteles y transportes)
   */
  async getCityDetails(cityId: string): Promise<{
    activities: Actividad[];
    hotels: Hotel[];
    transports: Transporte[];
  }> {
    if (!isSupabaseConfigured || cityId.startsWith("demo-")) {
      return {
        activities: [],
        hotels: [],
        transports: [],
      };
    }

    try {
      const [actRes, hotRes, trRes] = await Promise.all([
        supabase
          .from("actividades")
          .select("*")
          .eq("ciudad_id", cityId)
          .order("creado_en", { ascending: true }),
        supabase
          .from("hoteles")
          .select("*")
          .eq("ciudad_id", cityId)
          .order("creado_en", { ascending: true }),
        supabase
          .from("transportes")
          .select("*")
          .eq("ciudad_id", cityId)
          .order("creado_en", { ascending: true }),
      ]);

      return {
        activities: actRes.data ?? [],
        hotels: hotRes.data ?? [],
        transports: trRes.data ?? [],
      };
    } catch {
      return { activities: [], hotels: [], transports: [] };
    }
  },

  /**
   * Añade una actividad a una ciudad
   */
  async createActivity(activity: {
    ciudad_id: string;
    titulo: string;
    fecha?: string | null;
    costo_estimado?: number | null;
  }): Promise<{ data: Actividad | null; error?: string }> {
    if (!isSupabaseConfigured || activity.ciudad_id.startsWith("demo-")) {
      const demoAct: Actividad = {
        id: `act-${Date.now()}`,
        ciudad_id: activity.ciudad_id,
        titulo: activity.titulo,
        fecha: activity.fecha ?? null,
        costo_estimado: activity.costo_estimado ?? 0,
        creado_en: new Date().toISOString(),
      };
      return { data: demoAct };
    }

    try {
      const { data, error } = await supabase
        .from("actividades")
        .insert({
          ciudad_id: activity.ciudad_id,
          titulo: activity.titulo,
          fecha: activity.fecha ?? null,
          costo_estimado: activity.costo_estimado ?? 0,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error:
          err instanceof Error ? err.message : "Error al guardar actividad",
      };
    }
  },

  /**
   * Invita a un miembro a un viaje
   */
  async inviteMember(
    viajeId: string,
    targetUserId: string,
    role: RolMiembro = "viewer",
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || viajeId.startsWith("demo-")) {
      return { success: true };
    }

    try {
      const { error } = await supabase.from("viaje_miembros").insert({
        viaje_id: viajeId,
        user_id: targetUserId,
        rol: role,
      });

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al invitar miembro",
      };
    }
  },

  /**
   * Puebla un viaje completo inicial en la base de datos de Supabase para el usuario actual.
   * Muy útil cuando un usuario nuevo entra y su cuenta no tiene viajes guardados aún.
   */
  async seedInitialTrip(
    userId: string,
  ): Promise<{ data: Viaje | null; error?: string }> {
    if (!isSupabaseConfigured) {
      return { data: DEMO_TRIPS[0] };
    }

    try {
      // 1. Insertar el viaje principal
      const { data: newTrip, error: tripErr } = await supabase
        .from("viajes")
        .insert({
          nombre: "Portugal en familia",
          fecha_inicio: "2026-11-06",
          fecha_fin: "2026-11-13",
          presupuesto_total: 3200,
          foto_portada: "/images/lisboa-panoramica.png",
          titulo_cabecero: "Hay viajes que ya se sienten cerca.",
          subtitulo_cabecero:
            "Lisboa, Sintra y Oporto. Un camino para disfrutar juntos.",
          etiqueta_ubicacion: "Lisboa, Portugal",
          creado_por: userId,
        })
        .select()
        .single();

      if (tripErr || !newTrip) {
        return {
          data: null,
          error: tripErr?.message || "No se pudo crear el viaje",
        };
      }

      const tripId = newTrip.id;

      // 2. Insertar las 3 ciudades
      const { data: cities, error: citiesErr } = await supabase
        .from("ciudades")
        .insert([
          { viaje_id: tripId, nombre: "Lisboa", dias: 3, orden: 0 },
          { viaje_id: tripId, nombre: "Sintra", dias: 1, orden: 1 },
          { viaje_id: tripId, nombre: "Oporto", dias: 3, orden: 2 },
        ])
        .select();

      if (citiesErr || !cities) {
        console.warn("Aviso insertando ciudades:", citiesErr?.message);
        return { data: newTrip };
      }

      const lisboaCity = (cities as Ciudad[]).find(
        (c) => c.nombre === "Lisboa",
      );
      const sintraCity = (cities as Ciudad[]).find(
        (c) => c.nombre === "Sintra",
      );
      const oportoCity = (cities as Ciudad[]).find(
        (c) => c.nombre === "Oporto",
      );

      // 3. Insertar actividades si hay ciudades
      if (lisboaCity) {
        await supabase.from("actividades").insert([
          {
            ciudad_id: lisboaCity.id,
            titulo: "Paseo en tranvía 28 y Miradouro Santa Luzia",
            fecha: "2026-11-06",
            costo_estimado: 24,
          },
          {
            ciudad_id: lisboaCity.id,
            titulo: "Oceanário de Lisboa en familia",
            fecha: "2026-11-07",
            costo_estimado: 88,
          },
          {
            ciudad_id: lisboaCity.id,
            titulo: "Monasterio de los Jerónimos y Pastéis de Belém",
            fecha: "2026-11-08",
            costo_estimado: 48,
          },
          {
            ciudad_id: lisboaCity.id,
            titulo: "Atardecer junto al Tajo en Doca de Santo Amaro",
            fecha: "2026-11-08",
            costo_estimado: 35,
          },
        ]);

        await supabase.from("hoteles").insert([
          {
            ciudad_id: lisboaCity.id,
            nombre: "Lisboa Pessoa Hotel",
            noches: 3,
            costo: 810,
            reservado: true,
          },
          {
            ciudad_id: lisboaCity.id,
            nombre: "My Story Hotel Tejo",
            noches: 3,
            costo: 680,
            reservado: false,
          },
        ]);

        await supabase
          .from("transportes")
          .insert([
            {
              ciudad_id: lisboaCity.id,
              tipo: "tren",
              origen: "Faro",
              destino: "Lisboa",
              costo: 94,
              reservado: true,
            },
          ]);
      }

      // 4. Insertar tareas del viaje y de ciudades
      await supabase.from("tareas").insert([
        {
          viaje_id: tripId,
          ciudad_id: sintraCity?.id ?? null,
          titulo: "Reservar entradas al Palacio da Pena",
          vencimiento: "2026-10-23",
          estado: "pendiente",
        },
        {
          viaje_id: tripId,
          ciudad_id: sintraCity?.id ?? null,
          titulo: "Elegir alojamiento en Sintra",
          vencimiento: "2026-10-25",
          estado: "pendiente",
        },
        {
          viaje_id: tripId,
          ciudad_id: oportoCity?.id ?? null,
          titulo: "Organizar el paseo por el Duero",
          vencimiento: "2026-10-28",
          estado: "pendiente",
        },
      ]);

      // 5. Insertar gastos iniciales
      await supabase.from("gastos").insert([
        {
          viaje_id: tripId,
          categoria: "alojamiento",
          titulo: "Lisboa Pessoa Hotel",
          monto: 810,
          estado: "aprobado",
        },
        {
          viaje_id: tripId,
          categoria: "alojamiento",
          titulo: "Tres noches en Oporto",
          monto: 720,
          estado: "aprobado",
        },
        {
          viaje_id: tripId,
          categoria: "transporte",
          titulo: "Tren Faro → Lisboa",
          monto: 94,
          estado: "aprobado",
        },
        {
          viaje_id: tripId,
          categoria: "actividades",
          titulo: "Descubrir Lisboa juntos",
          monto: 216,
          estado: "aprobado",
        },
        {
          viaje_id: tripId,
          categoria: "actividades",
          titulo: "Palacio da Pena, Sintra",
          monto: 80,
          estado: "pendiente",
        },
        {
          viaje_id: tripId,
          categoria: "comida",
          titulo: "Sabores de Portugal",
          monto: 600,
          estado: "pendiente",
        },
      ]);

      return { data: newTrip };
    } catch (err: unknown) {
      return {
        data: null,
        error:
          err instanceof Error ? err.message : "Error sembrando viaje inicial",
      };
    }
  },
};
