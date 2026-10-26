import { supabase, isSupabaseConfigured } from "@/supabaseClient";
import type {
  Viaje,
  ViajeInsert,
  ViajeUpdate,
  Ciudad,
  CiudadInsert,
  CiudadUpdate,
  Tarea,
  TareaInsert,
  TareaUpdate,
  Gasto,
  GastoInsert,
  GastoUpdate,
  Actividad,
  Hotel,
  HotelInsert,
  HotelUpdate,
  EstadoSeleccionHotel,
  Transporte,
  TransporteInsert,
  TransporteUpdate,
  EstadoSeleccionTransporte,
  RolMiembro,
  EstadoMiembro,
  TripMember,
} from "@/types/database";

// ============================================================
// Datos iniciales de demostración (fallback offline o sin login)
// ============================================================
export const DEMO_TRIP_ID = "demo-portugal-2026";

// Portada por defecto cuando el usuario no sube ninguna imagen
export const DEFAULT_COVER_IMAGE = "/images/default-cover.jpg";

// Foto por defecto para nuevos lugares / ciudades del itinerario
export const DEFAULT_DESTINATION_IMAGE = "/images/default-destination.jpg";

// Foto por defecto para alojamientos / hoteles
export const DEFAULT_HOTEL_IMAGE = "/images/default-hotel.jpg";

// Bucket de Supabase Storage para las portadas de los viajes
export const COVER_BUCKET = "portadas";
export const MAX_COVER_SIZE_MB = 5;

export const DEMO_TRIPS: Viaje[] = [
  {
    id: DEMO_TRIP_ID,
    nombre: "Portugal en familia",
    fecha_inicio: "2026-11-06",
    fecha_fin: "2026-11-13",
    num_viajeros: 4,
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
    fecha_inicio: "2027-07-12",
    fecha_fin: "2027-07-19",
    num_viajeros: 4,
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
    fecha_inicio: "2026-12-02",
    fecha_fin: "2026-12-05",
    num_viajeros: 2,
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
  // Ciudades para Portugal en familia
  {
    id: "demo-lisboa",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Lisboa",
    dias: 3,
    orden: 0,
    foto: "/images/destino-lisboa.png",
    titulo_cabecero: "Tres días al ritmo de Lisboa.",
    subtitulo_cabecero: "Miradores, azulejos y tiempo para disfrutar juntos en familia.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-sintra",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Sintra",
    dias: 1,
    orden: 1,
    foto: "/images/destino-sintra.png",
    titulo_cabecero: "Un día mágico entre palacios y bosques.",
    subtitulo_cabecero: "Castillos de ensueño, niebla mística y senderos verdes.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-oporto",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Oporto",
    dias: 3,
    orden: 2,
    foto: "/images/destino-oporto.png",
    titulo_cabecero: "Tres días junto a la ribera del Duero.",
    subtitulo_cabecero: "Puentes de hierro, tranvías históricos y bodegas centenarias.",
    creado_en: new Date().toISOString(),
  },
  // Ciudades para Un verano en Menorca
  {
    id: "demo-ciutadella",
    viaje_id: "demo-menorca-2026",
    nombre: "Ciutadella",
    dias: 4,
    orden: 0,
    foto: "/images/family-costa-brava.png",
    titulo_cabecero: "Cuatro días en el corazón de Menorca.",
    subtitulo_cabecero: "Calles de piedra dorada, puerto antiguo y calas vírgenes.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-fornells",
    viaje_id: "demo-menorca-2026",
    nombre: "Fornells",
    dias: 3,
    orden: 1,
    foto: "/images/family-costa-brava.png",
    titulo_cabecero: "Tres días de calma marinera y bahías cristalinas.",
    subtitulo_cabecero: "Pueblo blanco de pescadores, veleros y caldereta frente al mar.",
    creado_en: new Date().toISOString(),
  },
  // Ciudades para Escapada a los Pirineos
  {
    id: "demo-benasque",
    viaje_id: "demo-pirineos-2026",
    nombre: "Valle de Benasque",
    dias: 2,
    orden: 0,
    foto: "/images/costa-brava.jpg",
    titulo_cabecero: "Dos días rodeados de tresmiles y cascadas.",
    subtitulo_cabecero: "Aire puro, bosques frondosos y refugios de alta montaña.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "demo-torla",
    viaje_id: "demo-pirineos-2026",
    nombre: "Torla-Ordesa",
    dias: 2,
    orden: 1,
    foto: "/images/costa-brava.jpg",
    titulo_cabecero: "Dos días en el cañón de Ordesa.",
    subtitulo_cabecero: "Hayedos majestuosos, paredes de roca y sendas inolvidables.",
    creado_en: new Date().toISOString(),
  },
];

// Almacén mutable en memoria para persistencia local durante la sesión
let localCities: Ciudad[] = [...DEMO_CITIES];

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
  // Tareas para Un verano en Menorca
  {
    id: "task-menorca-1",
    viaje_id: "demo-menorca-2026",
    ciudad_id: "demo-ciutadella",
    titulo: "Reservar paseo en barco por calas vírgenes",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-07-13",
    creado_en: new Date().toISOString(),
  },
  {
    id: "task-menorca-2",
    viaje_id: "demo-menorca-2026",
    ciudad_id: "demo-fornells",
    titulo: "Degustar caldereta de langosta en Fornells",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-07-16",
    creado_en: new Date().toISOString(),
  },
  // Tareas para Escapada a los Pirineos
  {
    id: "task-pirineos-1",
    viaje_id: "demo-pirineos-2026",
    ciudad_id: "demo-torla",
    titulo: "Ruta de la cascada Cola de Caballo (Ordesa)",
    asignado_a: null,
    estado: "pendiente",
    vencimiento: "2026-04-03",
    creado_en: new Date().toISOString(),
  },
];

let localTasks: Tarea[] = [...DEMO_TASKS];

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
  // Gastos para Un verano en Menorca
  {
    id: "exp-menorca-1",
    viaje_id: "demo-menorca-2026",
    categoria: "alojamiento",
    titulo: "Alojamiento en Ciutadella",
    monto: 1100,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
  // Gastos para Pirineos
  {
    id: "exp-pirineos-1",
    viaje_id: "demo-pirineos-2026",
    categoria: "alojamiento",
    titulo: "Refugio en Ordesa",
    monto: 540,
    pagado_por: null,
    estado: "aprobado",
    referencia_transporte_id: null,
    referencia_hotel_id: null,
    referencia_actividad_id: null,
    creado_en: new Date().toISOString(),
  },
];

let localExpenses: Gasto[] = [...DEMO_EXPENSES];

export const DEMO_TRANSPORTS: Transporte[] = [
  {
    id: "trans-lisboa-1",
    ciudad_id: "demo-lisboa",
    tipo: "tren",
    nombre_linea: "Comboios de Portugal · Intercidades",
    origen: "Faro",
    destino: "Lisboa Oriente",
    hora_salida: "08:22",
    hora_llegada: "11:46",
    duracion: "3 h 24 min",
    costo: 94,
    reservado: true,
    estado_seleccion: "preferido",
    notas: "2.ª clase · Directo · Asientos familiares",
    enlace_compra: "https://www.cp.pt/passageiros/pt/comprar-bilhetes",
    fecha_hora: "2026-11-06T08:22:00Z",
    creado_en: new Date().toISOString(),
  },
  {
    id: "trans-lisboa-2",
    ciudad_id: "demo-lisboa",
    tipo: "bus",
    nombre_linea: "Rede Expressos · Directo",
    origen: "Faro Terminal",
    destino: "Lisboa Sete Rios",
    hora_salida: "09:00",
    hora_llegada: "12:15",
    duracion: "3 h 15 min",
    costo: 78,
    reservado: false,
    estado_seleccion: "sin_nada",
    notas: "Wi-Fi a bordo y equipaje incluido",
    enlace_compra: "https://www.rede-expressos.pt/",
    fecha_hora: "2026-11-06T09:00:00Z",
    creado_en: new Date().toISOString(),
  },
  {
    id: "trans-sintra-1",
    ciudad_id: "demo-sintra",
    tipo: "tren",
    nombre_linea: "CP Urbanos de Lisboa · Línea Sintra",
    origen: "Lisboa Rossio",
    destino: "Sintra",
    hora_salida: "10:11",
    hora_llegada: "10:51",
    duracion: "40 min",
    costo: 18,
    reservado: true,
    estado_seleccion: "elegido",
    notas: "Pase Viva Viagem · Salidas cada 20 min",
    enlace_compra: "https://www.cp.pt/passageiros/pt",
    fecha_hora: "2026-11-09T10:11:00Z",
    creado_en: new Date().toISOString(),
  },
  {
    id: "trans-oporto-1",
    ciudad_id: "demo-oporto",
    tipo: "tren",
    nombre_linea: "Alfa Pendular · Primera Clase",
    origen: "Lisboa Santa Apolónia",
    destino: "Porto Campanhã",
    hora_salida: "11:00",
    hora_llegada: "13:58",
    duracion: "2 h 58 min",
    costo: 132,
    reservado: false,
    estado_seleccion: "preferido",
    notas: "Alta velocidad con cafetería a bordo",
    enlace_compra: "https://www.cp.pt/passageiros/pt/comprar-bilhetes",
    fecha_hora: "2026-11-10T11:00:00Z",
    creado_en: new Date().toISOString(),
  },
];

let localTransports: Transporte[] = [...DEMO_TRANSPORTS];

export const DEMO_HOTELS: Hotel[] = [
  {
    id: "hotel-pessoa",
    ciudad_id: "demo-lisboa",
    nombre: "Lisboa Pessoa Hotel",
    direccion: "Chiado · A 6 min de Rossio",
    estrellas: "4 estrellas · Piscina interior",
    detalles: "2 hab. dobles · Desayuno incluido",
    noches: 3,
    costo: 810,
    reservado: true,
    estado_seleccion: "elegido",
    enlace_reserva: "https://www.lisboapessoahotel.com/",
    foto: "/images/hotel-pessoa.png",
    notas: "Excelente ubicación para recorrer Chiado y Bairro Alto caminando.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "hotel-mystory",
    ciudad_id: "demo-lisboa",
    nombre: "My Story Hotel Rossio",
    direccion: "Baixa · Frente a la plaza de Rossio",
    estrellas: "3 estrellas · Ubicación céntrica",
    detalles: "2 hab. dobles · Recepción 24 h",
    noches: 3,
    costo: 660,
    reservado: false,
    estado_seleccion: "preferido",
    enlace_reserva: "https://www.mystoryhotels.com/",
    foto: "/images/hotel-mystory.png",
    notas: "Muy cerca de la estación de tren de Rossio para ir a Sintra.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "hotel-jam",
    ciudad_id: "demo-lisboa",
    nombre: "JAM Lisbon",
    direccion: "Santos · Junto al Museo de Arte Antiguo",
    estrellas: "3 estrellas · Terraza y piscina",
    detalles: "Habitaciones familiares · Parking de pago",
    noches: 3,
    costo: 570,
    reservado: false,
    estado_seleccion: "sin_nada",
    enlace_reserva: "https://www.jamhotels.com/",
    foto: "/images/hotel-jam.png",
    notas: "Diseño moderno, terraza en la azotea y vistas al río Tajo.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "hotel-sintra-1",
    ciudad_id: "demo-sintra",
    nombre: "Sintra Boutique Hotel",
    direccion: "Centro histórico de Sintra",
    estrellas: "4 estrellas · Vistas a la sierra",
    detalles: "Habitación familiar · Desayuno de la huerta",
    noches: 1,
    costo: 210,
    reservado: true,
    estado_seleccion: "elegido",
    enlace_reserva: "https://www.sintraboutiquehotel.com/",
    foto: "/images/hotel-pessoa.png",
    notas: "A 5 minutos a pie del Palacio Nacional de Sintra.",
    creado_en: new Date().toISOString(),
  },
  {
    id: "hotel-porto-1",
    ciudad_id: "demo-porto",
    nombre: "PortoBay Flores",
    direccion: "Rua das Flores · Ribeira",
    estrellas: "5 estrellas · Spa & Piscina cubierta",
    detalles: "2 habitaciones Deluxe · Desayuno buffet",
    noches: 3,
    costo: 720,
    reservado: true,
    estado_seleccion: "elegido",
    enlace_reserva: "https://www.portobay.com/",
    foto: "/images/hotel-mystory.png",
    notas: "En la calle peatonal más bonita de Oporto.",
    creado_en: new Date().toISOString(),
  },
];

let localHotels: Hotel[] = [...DEMO_HOTELS];
let localActivities: Actividad[] = [];

export const DEMO_MEMBERS: TripMember[] = [
  {
    id: "demo-member-1",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Clara López",
    email: "clara.lopez@ejemplo.com",
    rol: "owner",
    estado: "activo",
    invitado_en: "2026-01-15T10:00:00Z",
  },
  {
    id: "demo-member-2",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Pablo Morales",
    email: "pablo.m@ejemplo.com",
    rol: "editor",
    estado: "activo",
    invitado_en: "2026-01-16T11:30:00Z",
  },
  {
    id: "demo-member-3",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Lucía Martín",
    email: "lucia.martin@ejemplo.com",
    rol: "viewer",
    estado: "activo",
    invitado_en: "2026-01-17T09:15:00Z",
  },
  {
    id: "demo-member-4",
    viaje_id: DEMO_TRIP_ID,
    nombre: "Nico Morales",
    email: "nico.m@ejemplo.com",
    rol: "viewer",
    estado: "pendiente",
    invitado_en: "2026-01-18T16:20:00Z",
  },
  // Menorca
  {
    id: "demo-member-5",
    viaje_id: "demo-menorca-2026",
    nombre: "Clara López",
    email: "clara.lopez@ejemplo.com",
    rol: "owner",
    estado: "activo",
    invitado_en: "2026-02-01T10:00:00Z",
  },
  {
    id: "demo-member-6",
    viaje_id: "demo-menorca-2026",
    nombre: "Pablo Morales",
    email: "pablo.m@ejemplo.com",
    rol: "editor",
    estado: "activo",
    invitado_en: "2026-02-02T11:00:00Z",
  },
  // Pirineos
  {
    id: "demo-member-7",
    viaje_id: "demo-pirineos-2026",
    nombre: "Clara López",
    email: "clara.lopez@ejemplo.com",
    rol: "owner",
    estado: "activo",
    invitado_en: "2026-02-10T09:00:00Z",
  },
  {
    id: "demo-member-8",
    viaje_id: "demo-pirineos-2026",
    nombre: "Pablo Morales",
    email: "pablo.m@ejemplo.com",
    rol: "editor",
    estado: "activo",
    invitado_en: "2026-02-10T09:30:00Z",
  },
];

let localMembers: TripMember[] = [...DEMO_MEMBERS];

// ============================================================
// SERVICIOS CRUD CONECTADOS A SUPABASE
// ============================================================

export const tripService = {
  /**
   * Sube una imagen de portada a Supabase Storage y devuelve su URL pública.
   * Ruta: portadas/<user_id>/<uuid>.<ext> (las políticas exigen la carpeta del usuario).
   */
  async uploadCoverImage(
    file: File,
  ): Promise<{ url: string | null; error?: string }> {
    if (!file.type.startsWith("image/")) {
      return { url: null, error: "El archivo debe ser una imagen." };
    }
    if (file.size > MAX_COVER_SIZE_MB * 1024 * 1024) {
      return {
        url: null,
        error: `La imagen no puede superar ${MAX_COVER_SIZE_MB} MB.`,
      };
    }

    if (!isSupabaseConfigured) {
      // Modo demo: vista previa local (no persiste al recargar)
      return { url: URL.createObjectURL(file) };
    }

    try {
      const { data: auth } = await supabase.auth.getUser();
      const userId = auth.user?.id;
      if (!userId) {
        return { url: null, error: "Inicia sesión para subir una imagen." };
      }

      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;

      const { error } = await supabase.storage
        .from(COVER_BUCKET)
        .upload(path, file, {
          cacheControl: "31536000",
          contentType: file.type,
          upsert: false,
        });

      if (error) {
        console.error("Error subiendo portada:", error.message);
        return { url: null, error: error.message };
      }

      const { data } = supabase.storage.from(COVER_BUCKET).getPublicUrl(path);
      return { url: data.publicUrl };
    } catch (err: unknown) {
      return {
        url: null,
        error: err instanceof Error ? err.message : "Error al subir la imagen",
      };
    }
  },
  /**
   * Reclama y asocia cualquier invitación pendiente que coincida con el email del usuario actual.
   */
  async claimPendingInvitations(
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<number> {
    if (!userEmail || !userEmail.includes("@")) return 0;
    const cleanEmail = userEmail.trim().toLowerCase();

    // 1. Reclamar en memoria para modo demo / local
    let localCount = 0;
    localMembers = localMembers.map((m) => {
      if (
        (m.email.toLowerCase() === cleanEmail || m.user_id === userId) &&
        (m.estado === "pendiente" || !m.user_id)
      ) {
        localCount++;
        return {
          ...m,
          user_id: userId,
          nombre: userName || m.nombre,
          estado: "activo",
        };
      }
      return m;
    });

    if (!isSupabaseConfigured) {
      return localCount;
    }

    // 2. Intentar llamar al procedimiento RPC 'asociar_invitaciones'
    try {
      const { data: rpcCount, error: rpcError } = await supabase.rpc(
        "asociar_invitaciones"
      );
      if (!rpcError && typeof rpcCount === "number" && rpcCount > 0) {
        return rpcCount;
      }
    } catch {
      // Continuar con el fallback directo
    }

    // 3. Fallback directo: actualizar filas pendientes en viaje_miembros por email o user_id
    try {
      const { data, error } = await supabase
        .from("viaje_miembros")
        .update({
          user_id: userId,
          nombre: userName || undefined,
          estado: "activo",
        })
        .or(`email.ilike.${cleanEmail},user_id.eq.${userId}`)
        .select("id");

      if (!error && data) {
        return data.length;
      }
    } catch (err) {
      console.warn("Aviso al vincular invitaciones en viaje_miembros:", err);
    }

    return 0;
  },

  /**
   * Obtiene todos los viajes del usuario actual desde Supabase.
   * Asocia previamente cualquier invitación pendiente que coincida con el email del usuario.
   */
  async getTrips(
    userId?: string,
    userEmail?: string,
    userName?: string
  ): Promise<{ data: Viaje[]; isRealtime: boolean; error?: string }> {
    if (!isSupabaseConfigured || !userId) {
      return { data: DEMO_TRIPS, isRealtime: false };
    }

    if (userEmail) {
      try {
        await this.claimPendingInvitations(userId, userEmail, userName);
      } catch (claimErr) {
        console.warn("Aviso al vincular invitaciones previas a getTrips:", claimErr);
      }
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
   * Crea un nuevo viaje en Supabase y asigna al usuario creador como Administrador (owner)
   */
  async createTrip(
    trip: ViajeInsert,
    creatorInfo?: { name?: string; email?: string }
  ): Promise<{ data: Viaje | null; error?: string }> {
    if (!isSupabaseConfigured) {
      const demoNew: Viaje = {
        id: `trip-${Date.now()}`,
        nombre: trip.nombre,
        fecha_inicio: trip.fecha_inicio ?? null,
        fecha_fin: trip.fecha_fin ?? null,
        num_viajeros: trip.num_viajeros ?? 1,
        presupuesto_total: trip.presupuesto_total ?? 0,
        foto_portada: trip.foto_portada ?? null,
        titulo_cabecero: trip.titulo_cabecero ?? null,
        subtitulo_cabecero: trip.subtitulo_cabecero ?? null,
        etiqueta_ubicacion: trip.etiqueta_ubicacion ?? null,
        creado_por: trip.creado_por || "demo-user",
        creado_en: new Date().toISOString(),
      };

      // Asignar al creador del viaje como Administrador (owner)
      const creatorMember: TripMember = {
        id: `member-${demoNew.id}-owner`,
        viaje_id: demoNew.id,
        user_id: trip.creado_por,
        nombre: creatorInfo?.name || "Administrador",
        email: creatorInfo?.email || "usuario@ejemplo.com",
        rol: "owner",
        estado: "activo",
        invitado_en: new Date().toISOString(),
      };
      localMembers.push(creatorMember);

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

      // El usuario creador queda registrado como Administrador (owner) del viaje
      if (data && trip.creado_por) {
        try {
          await supabase.from("viaje_miembros").upsert(
            {
              viaje_id: data.id,
              user_id: trip.creado_por,
              nombre: creatorInfo?.name || "Administrador",
              email: creatorInfo?.email || "",
              rol: "owner",
              estado: "activo",
            },
            { onConflict: "viaje_id,user_id" }
          );
        } catch (memberErr) {
          console.warn("Aviso al registrar al creador como Administrador:", memberErr);
        }
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
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      return { success: true };
    }

    try {
      const { data, error } = await supabase
        .from("viajes")
        .delete()
        .eq("id", tripId)
        .select("id");
      if (error) return { success: false, error: error.message };
      if (!data || data.length === 0) {
        return {
          success: false,
          error: "No tienes permiso para eliminar este viaje (solo el owner puede).",
        };
      }
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
      return localCities
        .filter((c) => c.viaje_id === tripId)
        .sort((a, b) => a.orden - b.orden);
    }

    try {
      const { data, error } = await supabase
        .from("ciudades")
        .select("*")
        .eq("viaje_id", tripId)
        .order("orden", { ascending: true });

      if (error || !data) {
        console.warn("Error cargando ciudades:", error?.message);
        return [];
      }

      return data;
    } catch {
      return [];
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
      const existingInTrip = localCities.filter(
        (c) => c.viaje_id === city.viaje_id,
      );
      const demoCity: Ciudad = {
        id: `city-${Date.now()}`,
        viaje_id: city.viaje_id,
        nombre: city.nombre,
        dias: city.dias ?? 1,
        orden: city.orden ?? existingInTrip.length,
        foto: city.foto ?? DEFAULT_DESTINATION_IMAGE,
        titulo_cabecero: city.titulo_cabecero ?? null,
        subtitulo_cabecero: city.subtitulo_cabecero ?? null,
        creado_en: new Date().toISOString(),
      };
      localCities.push(demoCity);
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
   * Actualiza datos de una ciudad (días, foto, cabecero, nombre)
   */
  /**
   * Obtiene los datos de una ciudad por su ID
   */
  async getCity(cityId: string): Promise<Ciudad | null> {
    if (
      !isSupabaseConfigured ||
      cityId.startsWith("demo-") ||
      cityId.startsWith("city-")
    ) {
      const found = localCities.find((c) => c.id === cityId);
      return found || null;
    }

    try {
      const { data, error } = await supabase
        .from("ciudades")
        .select("*")
        .eq("id", cityId)
        .single();

      if (error || !data) return null;
      return data;
    } catch {
      return null;
    }
  },

  async updateCity(
    cityId: string,
    updates: CiudadUpdate,
  ): Promise<{ success: boolean; error?: string }> {
    if (
      !isSupabaseConfigured ||
      cityId.startsWith("demo-") ||
      cityId.startsWith("city-")
    ) {
      localCities = localCities.map((c) =>
        c.id === cityId ? { ...c, ...updates } : c,
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("ciudades")
        .update(updates)
        .eq("id", cityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar ciudad",
      };
    }
  },

  /**
   * Elimina una ciudad de un viaje
   */
  async deleteCity(
    cityId: string,
  ): Promise<{ success: boolean; error?: string }> {
    if (
      !isSupabaseConfigured ||
      cityId.startsWith("demo-") ||
      cityId.startsWith("city-")
    ) {
      localCities = localCities.filter((c) => c.id !== cityId);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("ciudades")
        .delete()
        .eq("id", cityId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar ciudad",
      };
    }
  },

  /**
   * Reordena las ciudades de un viaje según la lista ordenada de IDs
   */
  async reorderCities(
    tripId: string,
    orderedCityIds: string[]
  ): Promise<{ success: boolean; error?: string }> {
    if (
      !isSupabaseConfigured ||
      tripId.startsWith("demo-") ||
      tripId.startsWith("trip-")
    ) {
      localCities = localCities.map((c) => {
        if (c.viaje_id === tripId) {
          const idx = orderedCityIds.indexOf(c.id);
          if (idx !== -1) {
            return { ...c, orden: idx };
          }
        }
        return c;
      });
      return { success: true };
    }

    try {
      const updates = orderedCityIds.map((cityId, index) =>
        supabase
          .from("ciudades")
          .update({ orden: index })
          .eq("id", cityId)
      );
      await Promise.all(updates);
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error:
          err instanceof Error
            ? err.message
            : "Error al reordenar ciudades",
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
      return localTasks.filter((t) => t.viaje_id === tripId);
    }

    try {
      const { data, error } = await supabase
        .from("tareas")
        .select("*")
        .eq("viaje_id", tripId)
        .order("creado_en", { ascending: true });

      if (error || !data) {
        console.warn("Error cargando tareas:", error?.message);
        return [];
      }

      return data;
    } catch {
      return [];
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
      localTasks.push(demoTask);
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
      localTasks = localTasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t,
      );
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
      return localExpenses.filter((g) => g.viaje_id === tripId);
    }

    try {
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .eq("viaje_id", tripId)
        .order("creado_en", { ascending: false });

      if (error || !data) {
        console.warn("Error cargando gastos:", error?.message);
        return [];
      }

      return data;
    } catch {
      return [];
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
      localExpenses.push(demoExp);
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
      localExpenses = localExpenses.map((g) =>
        g.id === expenseId ? { ...g, ...updates } : g,
      );
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
      localExpenses = localExpenses.filter((g) => g.id !== expenseId);
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
        activities: localActivities.filter((a) => a.ciudad_id === cityId),
        hotels: localHotels.filter((h) => h.ciudad_id === cityId),
        transports: localTransports.filter((t) => t.ciudad_id === cityId),
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
      return {
        activities: [],
        hotels: [],
        transports: localTransports.filter((t) => t.ciudad_id === cityId),
      };
    }
  },

  /**
   * Obtiene todos los transportes de una ciudad
   */
  async getTransports(cityId: string): Promise<Transporte[]> {
    if (!isSupabaseConfigured || cityId.startsWith("demo-")) {
      return localTransports
        .filter((t) => t.ciudad_id === cityId)
        .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from("transportes")
        .select("*")
        .eq("ciudad_id", cityId)
        .order("creado_en", { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return localTransports.filter((t) => t.ciudad_id === cityId);
    }
  },

  /**
   * Añade una opción de transporte a una ciudad
   */
  async createTransport(
    transport: TransporteInsert
  ): Promise<{ data: Transporte | null; error?: string }> {
    if (!isSupabaseConfigured || transport.ciudad_id.startsWith("demo-")) {
      const demoTransport: Transporte = {
        id: `trans-${Date.now()}`,
        ciudad_id: transport.ciudad_id,
        tipo: transport.tipo ?? "otro",
        nombre_linea: transport.nombre_linea ?? null,
        origen: transport.origen ?? null,
        destino: transport.destino ?? null,
        fecha_hora: transport.fecha_hora ?? null,
        costo: transport.costo ?? 0,
        reservado: transport.reservado ?? (transport.estado_seleccion === "elegido"),
        estado_seleccion: transport.estado_seleccion ?? "sin_nada",
        duracion: transport.duracion ?? null,
        hora_salida: transport.hora_salida ?? null,
        hora_llegada: transport.hora_llegada ?? null,
        notas: transport.notas ?? null,
        enlace_compra: transport.enlace_compra ?? null,
        creado_en: new Date().toISOString(),
      };
      localTransports.push(demoTransport);
      return { data: demoTransport };
    }

    try {
      const { data, error } = await supabase
        .from("transportes")
        .insert({
          ciudad_id: transport.ciudad_id,
          tipo: transport.tipo ?? "otro",
          nombre_linea: transport.nombre_linea ?? null,
          origen: transport.origen ?? null,
          destino: transport.destino ?? null,
          fecha_hora: transport.fecha_hora ?? null,
          costo: transport.costo ?? 0,
          reservado: transport.reservado ?? (transport.estado_seleccion === "elegido"),
          estado_seleccion: transport.estado_seleccion ?? "sin_nada",
          duracion: transport.duracion ?? null,
          hora_salida: transport.hora_salida ?? null,
          hora_llegada: transport.hora_llegada ?? null,
          notas: transport.notas ?? null,
          enlace_compra: transport.enlace_compra ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al guardar transporte",
      };
    }
  },

  /**
   * Actualiza una opción de transporte
   */
  async updateTransport(
    id: string,
    updates: TransporteUpdate
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || id.startsWith("trans-")) {
      localTransports = localTransports.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("transportes")
        .update(updates)
        .eq("id", id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar transporte",
      };
    }
  },

  /**
   * Elimina una opción de transporte
   */
  async deleteTransport(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || id.startsWith("trans-")) {
      localTransports = localTransports.filter((t) => t.id !== id);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("transportes")
        .delete()
        .eq("id", id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar transporte",
      };
    }
  },

  /**
   * Cambia el estado de selección de un transporte ('preferido' | 'elegido' | 'sin_nada')
   */
  async setTransportSelection(
    _cityId: string,
    transportId: string,
    selection: EstadoSeleccionTransporte
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateTransport(transportId, {
      estado_seleccion: selection,
      reservado: selection === "elegido",
    });
  },

  /**
   * Obtiene todos los alojamientos/hoteles de una ciudad
   */
  async getHotels(cityId: string): Promise<Hotel[]> {
    if (!isSupabaseConfigured || cityId.startsWith("demo-")) {
      return localHotels
        .filter((h) => h.ciudad_id === cityId)
        .sort((a, b) => new Date(a.creado_en).getTime() - new Date(b.creado_en).getTime());
    }

    try {
      const { data, error } = await supabase
        .from("hoteles")
        .select("*")
        .eq("ciudad_id", cityId)
        .order("creado_en", { ascending: true });

      if (error || !data) return [];
      return data;
    } catch {
      return localHotels.filter((h) => h.ciudad_id === cityId);
    }
  },

  /**
   * Añade una opción de alojamiento/hotel a una ciudad
   */
  async createHotel(
    hotel: HotelInsert
  ): Promise<{ data: Hotel | null; error?: string }> {
    if (!isSupabaseConfigured || hotel.ciudad_id.startsWith("demo-")) {
      const demoHotel: Hotel = {
        id: `hotel-${Date.now()}`,
        ciudad_id: hotel.ciudad_id,
        nombre: hotel.nombre,
        noches: hotel.noches ?? 1,
        costo: hotel.costo ?? 0,
        reservado: hotel.reservado ?? (hotel.estado_seleccion === "elegido"),
        estado_seleccion: hotel.estado_seleccion ?? "sin_nada",
        enlace_reserva: hotel.enlace_reserva ?? null,
        direccion: hotel.direccion ?? null,
        estrellas: hotel.estrellas ?? null,
        foto: hotel.foto || DEFAULT_HOTEL_IMAGE,
        detalles: hotel.detalles ?? null,
        notas: hotel.notas ?? null,
        creado_en: new Date().toISOString(),
      };
      localHotels.push(demoHotel);
      return { data: demoHotel };
    }

    try {
      const { data, error } = await supabase
        .from("hoteles")
        .insert({
          ciudad_id: hotel.ciudad_id,
          nombre: hotel.nombre,
          noches: hotel.noches ?? 1,
          costo: hotel.costo ?? 0,
          reservado: hotel.reservado ?? (hotel.estado_seleccion === "elegido"),
          estado_seleccion: hotel.estado_seleccion ?? "sin_nada",
          enlace_reserva: hotel.enlace_reserva ?? null,
          direccion: hotel.direccion ?? null,
          estrellas: hotel.estrellas ?? null,
          foto: hotel.foto || DEFAULT_HOTEL_IMAGE,
          detalles: hotel.detalles ?? null,
          notas: hotel.notas ?? null,
        })
        .select()
        .single();

      if (error) return { data: null, error: error.message };
      return { data };
    } catch (err: unknown) {
      return {
        data: null,
        error: err instanceof Error ? err.message : "Error al guardar alojamiento",
      };
    }
  },

  /**
   * Actualiza una opción de alojamiento/hotel
   */
  async updateHotel(
    id: string,
    updates: HotelUpdate
  ): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || id.startsWith("hotel-")) {
      localHotels = localHotels.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("hoteles")
        .update(updates)
        .eq("id", id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar alojamiento",
      };
    }
  },

  /**
   * Elimina una opción de alojamiento/hotel
   */
  async deleteHotel(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || id.startsWith("hotel-")) {
      localHotels = localHotels.filter((h) => h.id !== id);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("hoteles")
        .delete()
        .eq("id", id);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar alojamiento",
      };
    }
  },

  /**
   * Cambia el estado de selección de un hotel ('preferido' | 'elegido' | 'sin_nada')
   */
  async setHotelSelection(
    _cityId: string,
    hotelId: string,
    selection: EstadoSeleccionHotel
  ): Promise<{ success: boolean; error?: string }> {
    return this.updateHotel(hotelId, {
      estado_seleccion: selection,
      reservado: selection === "elegido",
    });
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
      localActivities.push(demoAct);
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
   * Elimina una actividad
   */
  async deleteActivity(id: string): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured || id.startsWith("act-") || id.startsWith("demo-")) {
      localActivities = localActivities.filter((a) => a.id !== id);
      return { success: true };
    }

    try {
      const { error } = await supabase.from("actividades").delete().eq("id", id);
      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar actividad",
      };
    }
  },

  /**
   * Obtiene todos los miembros e invitados de un viaje
   * Garantiza que el creador del viaje siempre figure como Administrador (owner)
   * y asocia automáticamente al usuario actual si fue invitado por email.
   */
  async getMembers(
    viajeId: string,
    currentUserId?: string,
    currentUserInfo?: { name?: string; email?: string }
  ): Promise<TripMember[]> {
    const isDemo =
      !isSupabaseConfigured ||
      viajeId.startsWith("demo-") ||
      viajeId.startsWith("trip-") ||
      viajeId === "portugal" ||
      viajeId === "menorca" ||
      viajeId === "pirineos";

    if (isDemo) {
      const normalizedId =
        viajeId === "portugal"
          ? DEMO_TRIP_ID
          : viajeId === "menorca"
          ? "demo-menorca-2026"
          : viajeId === "pirineos"
          ? "demo-pirineos-2026"
          : viajeId;

      const found = localMembers.filter(
        (m) => m.viaje_id === viajeId || m.viaje_id === normalizedId
      );
      if (found.length > 0) {
        return [...found];
      }

      // Administrador por defecto si es un viaje demo recién creado
      return [
        {
          id: `member-${viajeId}-owner`,
          viaje_id: viajeId,
          user_id: currentUserId,
          nombre: currentUserInfo?.name || "Administrador",
          email: currentUserInfo?.email || "usuario@ejemplo.com",
          rol: "owner",
          estado: "activo",
          invitado_en: new Date().toISOString(),
        },
      ];
    }

    try {
      let rawMembers: Array<{
        id: string;
        viaje_id: string;
        user_id?: string | null;
        email?: string | null;
        nombre?: string | null;
        rol?: string | null;
        estado?: string | null;
        invitado_en?: string;
        avatar_url?: string | null;
      }> = [];

      // 1. Intentar primero con RPC seguro 'get_viaje_miembros' (resuelve nombres y emails reales de auth.users sin problemas de RLS)
      try {
        const { data: rpcData, error: rpcErr } = await supabase.rpc(
          "get_viaje_miembros",
          { p_viaje_id: viajeId }
        );
        if (!rpcErr && Array.isArray(rpcData) && rpcData.length > 0) {
          rawMembers = rpcData;
        }
      } catch {
        // Fallback a select directo
      }

      // 2. Si RPC no arrojó resultados o falló, consultar directamente la tabla viaje_miembros
      if (rawMembers.length === 0) {
        const { data, error } = await supabase
          .from("viaje_miembros")
          .select("*")
          .eq("viaje_id", viajeId)
          .order("invitado_en", { ascending: true });

        if (!error && data) {
          rawMembers = data;
        } else if (error) {
          console.warn("Aviso cargando viaje_miembros:", error.message);
        }
      }

      const members: TripMember[] = rawMembers.map((d) => {
        const isCurrent = d.user_id === currentUserId;
        const realName =
          d.nombre && d.nombre !== "Viajero" && d.nombre !== "Administrador"
            ? d.nombre
            : isCurrent && currentUserInfo?.name
            ? currentUserInfo.name
            : d.nombre || d.email?.split("@")[0] || "Viajero";

        const realEmail =
          d.email && !d.email.includes("ejemplo.com")
            ? d.email
            : isCurrent && currentUserInfo?.email
            ? currentUserInfo.email
            : d.email || "";

        return {
          id: d.id,
          viaje_id: d.viaje_id,
          user_id: d.user_id,
          nombre: realName,
          email: realEmail,
          rol: (d.rol as RolMiembro) || "viewer",
          estado: (d.estado as EstadoMiembro) || "activo",
          invitado_en: d.invitado_en || new Date().toISOString(),
          avatar_url: d.avatar_url,
        };
      });

      // 3. Auto-activación: Si el usuario actual está en la lista (por ID o por email) y está 'pendiente', activarlo inmediatamente
      if (currentUserId || currentUserInfo?.email) {
        const cleanCurrentEmail = currentUserInfo?.email?.trim().toLowerCase();
        const pendingMember = members.find(
          (m) =>
            (m.user_id === currentUserId ||
              (cleanCurrentEmail && m.email && m.email.toLowerCase() === cleanCurrentEmail)) &&
            (m.estado === "pendiente" || !m.user_id)
        );

        if (pendingMember) {
          pendingMember.user_id = currentUserId || pendingMember.user_id;
          if (
            currentUserInfo?.name &&
            (!pendingMember.nombre ||
              pendingMember.nombre === "Viajero" ||
              pendingMember.nombre === pendingMember.email?.split("@")[0])
          ) {
            pendingMember.nombre = currentUserInfo.name;
          }
          pendingMember.estado = "activo";

          // Persistir en segundo plano en Supabase
          Promise.resolve(
            supabase
              .from("viaje_miembros")
              .update({
                user_id: currentUserId,
                nombre: pendingMember.nombre,
                estado: "activo",
              })
              .eq("id", pendingMember.id)
          ).catch((err) => {
            console.warn("Aviso al auto-activar membresía:", err);
          });
        }
      }

      // 4. Si el usuario actual es el Administrador (owner) y su fila no tenía correo, actualizarlo
      const ownerMember = members.find((m) => m.rol === "owner");
      if (ownerMember && currentUserId && ownerMember.user_id === currentUserId) {
        if (
          currentUserInfo?.email &&
          (!ownerMember.email || ownerMember.email.includes("ejemplo.com"))
        ) {
          ownerMember.email = currentUserInfo.email;
          if (currentUserInfo.name) ownerMember.nombre = currentUserInfo.name;
          Promise.resolve(
            supabase
              .from("viaje_miembros")
              .update({
                email: currentUserInfo.email,
                nombre: ownerMember.nombre,
              })
              .eq("id", ownerMember.id)
          ).catch(() => {});
        }
      }

      // 5. Si no hay un Administrador (owner) registrado aún, buscamos al creador del viaje
      const hasOwner = members.some((m) => m.rol === "owner");
      if (!hasOwner) {
        const { data: tripData } = await supabase
          .from("viajes")
          .select("creado_por")
          .eq("id", viajeId)
          .maybeSingle();

        const creatorId = tripData?.creado_por || currentUserId;
        if (creatorId) {
          const isCurrent = creatorId === currentUserId;
          const ownerEmail =
            isCurrent && currentUserInfo?.email
              ? currentUserInfo.email
              : "";

          const syntheticOwner: TripMember = {
            id: `member-${viajeId}-owner`,
            viaje_id: viajeId,
            user_id: creatorId,
            nombre:
              isCurrent && currentUserInfo?.name
                ? currentUserInfo.name
                : "Administrador",
            email: ownerEmail || (isCurrent ? currentUserInfo?.email || "" : ""),
            rol: "owner",
            estado: "activo",
            invitado_en: new Date().toISOString(),
          };

          // Persistir en segundo plano si tenemos datos válidos
          const upsertPayload = {
            viaje_id: viajeId,
            user_id: creatorId,
            nombre: syntheticOwner.nombre,
            rol: "owner" as RolMiembro,
            estado: "activo" as EstadoMiembro,
            ...(ownerEmail ? { email: ownerEmail } : {}),
          };

          Promise.resolve(
            supabase.from("viaje_miembros").upsert(upsertPayload, {
              onConflict: "viaje_id,user_id",
            })
          ).catch(() => {});

          members.unshift(syntheticOwner);
        }
      }

      return members;
    } catch {
      return [];
    }
  },

  /**
   * Invita a un nuevo miembro o acompañante a un viaje
   */
  async inviteMember(
    viajeId: string,
    email: string,
    nombre?: string,
    role: RolMiembro = "viewer",
  ): Promise<{ success: boolean; data?: TripMember; error?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      return { success: false, error: "Introduce un correo electrónico válido." };
    }

    const cleanNombre =
      (nombre && nombre.trim()) ||
      cleanEmail
        .split("@")[0]
        .replace(/[._-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());

    const isDemo =
      !isSupabaseConfigured ||
      viajeId.startsWith("demo-") ||
      viajeId.startsWith("trip-") ||
      viajeId === "portugal" ||
      viajeId === "menorca" ||
      viajeId === "pirineos";

    const normalizedId =
      viajeId === "portugal"
        ? DEMO_TRIP_ID
        : viajeId === "menorca"
        ? "demo-menorca-2026"
        : viajeId === "pirineos"
        ? "demo-pirineos-2026"
        : viajeId;

    if (isDemo) {
      const existing = localMembers.find(
        (m) =>
          (m.viaje_id === viajeId || m.viaje_id === normalizedId) &&
          m.email.toLowerCase() === cleanEmail,
      );
      if (existing) {
        return {
          success: false,
          error: "Este correo ya forma parte de los invitados o miembros de este viaje.",
        };
      }

      const newMember: TripMember = {
        id: `member-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        viaje_id: viajeId,
        nombre: cleanNombre,
        email: cleanEmail,
        rol: role,
        estado: "pendiente",
        invitado_en: new Date().toISOString(),
      };

      localMembers.push(newMember);
      return { success: true, data: newMember };
    }

    try {
      // 1. Evitar duplicar invitación si ya existe en este viaje en Supabase
      const { data: existing } = await supabase
        .from("viaje_miembros")
        .select("id, email, user_id")
        .eq("viaje_id", viajeId)
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (existing) {
        return {
          success: false,
          error: "Este correo ya forma parte de los invitados o miembros de este viaje.",
        };
      }

      // 2. Intentar llamar al RPC 'invitar_miembro_viaje' si está disponible
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc(
          "invitar_miembro_viaje",
          {
            p_viaje_id: viajeId,
            p_email: cleanEmail,
            p_nombre: cleanNombre,
            p_rol: role,
          }
        );

        if (!rpcError && rpcData) {
          const row = (rpcData as unknown) as {
            id: string;
            viaje_id: string;
            user_id?: string | null;
            nombre: string;
            email: string;
            rol: RolMiembro;
            estado: EstadoMiembro;
            invitado_en: string;
            avatar_url?: string | null;
          };
          return {
            success: true,
            data: {
              id: row.id,
              viaje_id: row.viaje_id,
              user_id: row.user_id,
              nombre: row.nombre || cleanNombre,
              email: row.email || cleanEmail,
              rol: row.rol || role,
              estado: row.estado || "pendiente",
              invitado_en: row.invitado_en || new Date().toISOString(),
              avatar_url: row.avatar_url,
            },
          };
        }
      } catch {
        // Fallback a inserción directa
      }

      // 3. Fallback: inserción directa en viaje_miembros
      const { data, error } = await supabase
        .from("viaje_miembros")
        .insert({
          viaje_id: viajeId,
          email: cleanEmail,
          nombre: cleanNombre,
          rol: role,
          estado: "pendiente",
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return {
        success: true,
        data: {
          id: data.id,
          viaje_id: data.viaje_id,
          user_id: data.user_id,
          nombre: data.nombre || cleanNombre,
          email: data.email || cleanEmail,
          rol: (data.rol as RolMiembro) || role,
          estado: (data.estado as EstadoMiembro) || "pendiente",
          invitado_en: data.invitado_en,
          avatar_url: data.avatar_url,
        },
      };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al invitar miembro",
      };
    }
  },

  /**
   * Actualiza el rol de un miembro o invitado (editor, viewer, etc.)
   */
  async updateMemberRole(
    viajeId: string,
    memberId: string,
    role: RolMiembro,
  ): Promise<{ success: boolean; error?: string }> {
    const isDemo =
      !isSupabaseConfigured ||
      viajeId.startsWith("demo-") ||
      viajeId.startsWith("trip-") ||
      viajeId === "portugal" ||
      viajeId === "menorca" ||
      viajeId === "pirineos";

    if (isDemo) {
      localMembers = localMembers.map((m) =>
        m.id === memberId ? { ...m, rol: role } : m,
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("viaje_miembros")
        .update({ rol: role })
        .eq("id", memberId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al actualizar rol",
      };
    }
  },

  /**
   * Elimina un miembro o cancela su invitación
   */
  async removeMember(
    viajeId: string,
    memberId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const isDemo =
      !isSupabaseConfigured ||
      viajeId.startsWith("demo-") ||
      viajeId.startsWith("trip-") ||
      viajeId === "portugal" ||
      viajeId === "menorca" ||
      viajeId === "pirineos";

    if (isDemo) {
      localMembers = localMembers.filter((m) => m.id !== memberId);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("viaje_miembros")
        .delete()
        .eq("id", memberId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al eliminar miembro",
      };
    }
  },

  /**
   * Reenvía la invitación por correo a un miembro pendiente
   */
  async resendInvite(
    viajeId: string,
    memberId: string,
  ): Promise<{ success: boolean; error?: string }> {
    const isDemo =
      !isSupabaseConfigured ||
      viajeId.startsWith("demo-") ||
      viajeId.startsWith("trip-") ||
      viajeId === "portugal" ||
      viajeId === "menorca" ||
      viajeId === "pirineos";

    const now = new Date().toISOString();

    if (isDemo) {
      localMembers = localMembers.map((m) =>
        m.id === memberId ? { ...m, invitado_en: now } : m
      );
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from("viaje_miembros")
        .update({
          invitado_en: now,
        })
        .eq("id", memberId);

      if (error) return { success: false, error: error.message };
      return { success: true };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Error al reenviar invitación",
      };
    }
  },

  /**
   * Puebla un viaje completo inicial en la base de datos de Supabase para el usuario actual.
   * Muy útil cuando un usuario nuevo entra y su cuenta no tiene viajes guardados aún.
   */
  async seedInitialTrip(
    userId: string,
    creatorInfo?: { name?: string; email?: string }
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

      // Asignar al creador como Administrador (owner) del viaje
      try {
        await supabase.from("viaje_miembros").upsert(
          {
            viaje_id: tripId,
            user_id: userId,
            nombre: creatorInfo?.name || "Administrador",
            email: creatorInfo?.email || "",
            rol: "owner",
            estado: "activo",
          },
          { onConflict: "viaje_id,user_id" }
        );
      } catch (mErr) {
        console.warn("Aviso al vincular Administrador en seedInitialTrip:", mErr);
      }

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
