export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type RolMiembro = "owner" | "editor" | "viewer"
export type EstadoGasto = "pendiente" | "aprobado" | "rechazado"
export type TipoTransporte = "avion" | "tren" | "bus" | "coche" | "ferry" | "otro"
export type EstadoTarea = "pendiente" | "en_curso" | "hecha"
export type EstadoSeleccionTransporte = "preferido" | "elegido" | "sin_nada"
export type EstadoSeleccionHotel = "preferido" | "elegido" | "sin_nada"

export interface Database {
  public: {
    Tables: {
      viajes: {
        Row: {
          id: string
          nombre: string
          fecha_inicio: string | null
          fecha_fin: string | null
          num_viajeros?: number | null
          presupuesto_total: number
          foto_portada: string | null
          titulo_cabecero: string | null
          subtitulo_cabecero: string | null
          etiqueta_ubicacion: string | null
          creado_por: string
          creado_en: string
        }
        Insert: {
          id?: string
          nombre: string
          fecha_inicio?: string | null
          fecha_fin?: string | null
          num_viajeros?: number | null
          presupuesto_total?: number
          foto_portada?: string | null
          titulo_cabecero?: string | null
          subtitulo_cabecero?: string | null
          etiqueta_ubicacion?: string | null
          creado_por?: string
          creado_en?: string
        }
        Update: {
          id?: string
          nombre?: string
          fecha_inicio?: string | null
          fecha_fin?: string | null
          num_viajeros?: number | null
          presupuesto_total?: number
          foto_portada?: string | null
          titulo_cabecero?: string | null
          subtitulo_cabecero?: string | null
          etiqueta_ubicacion?: string | null
          creado_por?: string
          creado_en?: string
        }
        Relationships: []
      }
      viaje_miembros: {
        Row: {
          id: string
          viaje_id: string
          user_id: string
          rol: RolMiembro
          invitado_en: string
        }
        Insert: {
          id?: string
          viaje_id: string
          user_id: string
          rol?: RolMiembro
          invitado_en?: string
        }
        Update: {
          id?: string
          viaje_id?: string
          user_id?: string
          rol?: RolMiembro
          invitado_en?: string
        }
        Relationships: []
      }
      ciudades: {
        Row: {
          id: string
          viaje_id: string
          nombre: string
          dias: number
          orden: number
          foto?: string | null
          titulo_cabecero?: string | null
          subtitulo_cabecero?: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          viaje_id: string
          nombre: string
          dias?: number
          orden?: number
          foto?: string | null
          titulo_cabecero?: string | null
          subtitulo_cabecero?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          viaje_id?: string
          nombre?: string
          dias?: number
          orden?: number
          foto?: string | null
          titulo_cabecero?: string | null
          subtitulo_cabecero?: string | null
          creado_en?: string
        }
        Relationships: []
      }
      actividades: {
        Row: {
          id: string
          ciudad_id: string
          titulo: string
          fecha: string | null
          costo_estimado: number | null
          creado_en: string
        }
        Insert: {
          id?: string
          ciudad_id: string
          titulo: string
          fecha?: string | null
          costo_estimado?: number | null
          creado_en?: string
        }
        Update: {
          id?: string
          ciudad_id?: string
          titulo?: string
          fecha?: string | null
          costo_estimado?: number | null
          creado_en?: string
        }
        Relationships: []
      }
      hoteles: {
        Row: {
          id: string
          ciudad_id: string
          nombre: string
          noches: number | null
          costo: number | null
          reservado: boolean
          estado_seleccion: EstadoSeleccionHotel
          enlace_reserva?: string | null
          direccion?: string | null
          estrellas?: string | null
          foto?: string | null
          detalles?: string | null
          notas?: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          ciudad_id: string
          nombre: string
          noches?: number | null
          costo?: number | null
          reservado?: boolean
          estado_seleccion?: EstadoSeleccionHotel
          enlace_reserva?: string | null
          direccion?: string | null
          estrellas?: string | null
          foto?: string | null
          detalles?: string | null
          notas?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          ciudad_id?: string
          nombre?: string
          noches?: number | null
          costo?: number | null
          reservado?: boolean
          estado_seleccion?: EstadoSeleccionHotel
          enlace_reserva?: string | null
          direccion?: string | null
          estrellas?: string | null
          foto?: string | null
          detalles?: string | null
          notas?: string | null
          creado_en?: string
        }
        Relationships: []
      }
      transportes: {
        Row: {
          id: string
          ciudad_id: string
          tipo: TipoTransporte
          origen: string | null
          destino: string | null
          fecha_hora: string | null
          costo: number | null
          reservado: boolean
          estado_seleccion: EstadoSeleccionTransporte
          nombre_linea?: string | null
          duracion?: string | null
          hora_salida?: string | null
          hora_llegada?: string | null
          notas?: string | null
          enlace_compra?: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          ciudad_id: string
          tipo?: TipoTransporte
          origen?: string | null
          destino?: string | null
          fecha_hora?: string | null
          costo?: number | null
          reservado?: boolean
          estado_seleccion?: EstadoSeleccionTransporte
          nombre_linea?: string | null
          duracion?: string | null
          hora_salida?: string | null
          hora_llegada?: string | null
          notas?: string | null
          enlace_compra?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          ciudad_id?: string
          tipo?: TipoTransporte
          origen?: string | null
          destino?: string | null
          fecha_hora?: string | null
          costo?: number | null
          reservado?: boolean
          estado_seleccion?: EstadoSeleccionTransporte
          nombre_linea?: string | null
          duracion?: string | null
          hora_salida?: string | null
          hora_llegada?: string | null
          notas?: string | null
          enlace_compra?: string | null
          creado_en?: string
        }
        Relationships: []
      }
      tareas: {
        Row: {
          id: string
          viaje_id: string
          ciudad_id: string | null
          titulo: string
          asignado_a: string | null
          estado: EstadoTarea
          vencimiento: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          viaje_id: string
          ciudad_id?: string | null
          titulo: string
          asignado_a?: string | null
          estado?: EstadoTarea
          vencimiento?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          viaje_id?: string
          ciudad_id?: string | null
          titulo?: string
          asignado_a?: string | null
          estado?: EstadoTarea
          vencimiento?: string | null
          creado_en?: string
        }
        Relationships: []
      }
      gastos: {
        Row: {
          id: string
          viaje_id: string
          categoria: string
          titulo: string | null
          monto: number
          pagado_por: string | null
          estado: EstadoGasto
          referencia_transporte_id: string | null
          referencia_hotel_id: string | null
          referencia_actividad_id: string | null
          creado_en: string
        }
        Insert: {
          id?: string
          viaje_id: string
          categoria?: string
          titulo?: string | null
          monto: number
          pagado_por?: string | null
          estado?: EstadoGasto
          referencia_transporte_id?: string | null
          referencia_hotel_id?: string | null
          referencia_actividad_id?: string | null
          creado_en?: string
        }
        Update: {
          id?: string
          viaje_id?: string
          categoria?: string
          titulo?: string | null
          monto?: number
          pagado_por?: string | null
          estado?: EstadoGasto
          referencia_transporte_id?: string | null
          referencia_hotel_id?: string | null
          referencia_actividad_id?: string | null
          creado_en?: string
        }
        Relationships: []
      }
    }
    Views: {
      presupuesto_resumen: {
        Row: {
          viaje_id: string
          viaje_nombre: string
          presupuesto_total: number
          gastado: number
          pendiente: number
          disponible: number
          porcentaje_gastado: number
        }
        Relationships: []
      }
    }
    Functions: {
      es_miembro: {
        Args: { viaje: string }
        Returns: boolean
      }
      viaje_de_ciudad: {
        Args: { ciudad: string }
        Returns: string
      }
    }
    Enums: {
      rol_miembro: RolMiembro
      estado_gasto: EstadoGasto
      tipo_transporte: TipoTransporte
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Aliases de conveniencia para la aplicación
export type Viaje = Database["public"]["Tables"]["viajes"]["Row"]
export type ViajeInsert = Database["public"]["Tables"]["viajes"]["Insert"]
export type ViajeUpdate = Database["public"]["Tables"]["viajes"]["Update"]

export type Ciudad = Database["public"]["Tables"]["ciudades"]["Row"]
export type CiudadInsert = Database["public"]["Tables"]["ciudades"]["Insert"]
export type CiudadUpdate = Database["public"]["Tables"]["ciudades"]["Update"]

export type Tarea = Database["public"]["Tables"]["tareas"]["Row"]
export type TareaInsert = Database["public"]["Tables"]["tareas"]["Insert"]
export type TareaUpdate = Database["public"]["Tables"]["tareas"]["Update"]

export type Gasto = Database["public"]["Tables"]["gastos"]["Row"]
export type GastoInsert = Database["public"]["Tables"]["gastos"]["Insert"]
export type GastoUpdate = Database["public"]["Tables"]["gastos"]["Update"]

export type ViajeMiembro = Database["public"]["Tables"]["viaje_miembros"]["Row"]
export type Actividad = Database["public"]["Tables"]["actividades"]["Row"]
export type Hotel = Database["public"]["Tables"]["hoteles"]["Row"]
export type HotelInsert = Database["public"]["Tables"]["hoteles"]["Insert"]
export type HotelUpdate = Database["public"]["Tables"]["hoteles"]["Update"]
export type Transporte = Database["public"]["Tables"]["transportes"]["Row"]
export type TransporteInsert = Database["public"]["Tables"]["transportes"]["Insert"]
export type TransporteUpdate = Database["public"]["Tables"]["transportes"]["Update"]
export type PresupuestoResumen = Database["public"]["Views"]["presupuesto_resumen"]["Row"]
