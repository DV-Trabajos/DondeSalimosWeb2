export interface Usuario {
  iD_Usuario: number
  nombreUsuario: string
  correo: string
  telefono: string
  iD_RolUsuario: number
  uid: string
  estado: boolean
  fechaCreacion: string
  rolUsuario?: RolUsuario // Para almacenar la información del rol
}

export interface RolUsuario {
  iD_RolUsuario: number
  descripcion: string
  estado: boolean
  fechaCreacion: string
}

export interface Comercio {
  iD_Comercio: number
  nombre: string
  capacidad: number
  mesas: number
  generoMusical: string
  tipoDocumento: string
  nroDocumento: string
  direccion: string
  correo: string
  telefono: string
  estado: boolean
  fechaCreacion: string
  iD_TipoComercio: number
  iD_Usuario: number
  tipoComercioNombre?: string // Campo calculado
}

export interface TipoComercio {
  iD_TipoComercio: number
  descripcion: string
  estado: boolean
  fechaCreacion: string
}

// Nuevas interfaces para las APIs adicionales
export interface Publicidad {
  iD_Publicidad: number
  descripcion: string
  visualizaciones: number
  tiempo: string // Timestamp
  estado: boolean
  fechaCreacion: string
  iD_Comercio: number
  comercioNombre?: string // Campo calculado
}

export interface Resenia {
  iD_Resenia: number
  iD_Usuario: number
  iD_Comercio: number
  comentario: string
  estado: boolean
  fechaCreacion: string
  usuarioNombre?: string // Campo calculado
  comercioNombre?: string // Campo calculado
}

export interface Reserva {
  iD_Reserva: number
  iD_Usuario: number
  iD_Comercio: number
  fechaReserva: string // DateTime
  tiempoTolerancia: string // Time
  comenzales: number
  estado: boolean
  fechaCreacion: string
  usuarioNombre?: string // Campo calculado
  comercioNombre?: string // Campo calculado
  reserva: string // Agregar este campo
}