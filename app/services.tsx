// Exportamos directamente las interfaces y servicios
// Tipos de datos basados en el DER
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
  telefono: string // Corregido de "telefeno" a "telefono"
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
}

// Exportamos la utilidad fetchWithErrorHandling
export const API_BASE_URL = "https://localhost:7283/api"

// Función para manejar errores en las peticiones fetch
export async function fetchWithErrorHandling(url: string, options: RequestInit = {}): Promise<any> {
  try {
    // Configuración por defecto para todas las peticiones
    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      ...options,
    }

    console.log(`Fetching: ${url}`)

    // Agregar timeout para evitar que la petición se quede colgada
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 segundos de timeout

    const response = await fetch(url, {
      ...defaultOptions,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = `Error ${response.status}`

      try {
        // Intentar parsear el error como JSON
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorText
      } catch {
        errorMessage = errorText || errorMessage
      }

      throw new Error(errorMessage)
    }

    // Si la respuesta está vacía, devolver null
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return null
    }

    // Devolver los datos como JSON
    return await response.json()
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("La solicitud ha excedido el tiempo de espera. Por favor, inténtalo de nuevo.")
    }

    console.error("Error en la petición:", error)
    throw error
  }
}

// Servicio para Usuarios
export const usuarioService = {
  getAll: async (): Promise<Usuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/listado`)
  },

  getById: async (id: number): Promise<Usuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/buscarIdUsuario/${id}`)
  },

  getByName: async (name: string): Promise<Usuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/buscarNombreUsuario/${name}`)
  },

  create: async (usuario: Omit<Usuario, "iD_Usuario" | "fechaCreacion">): Promise<Usuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/crear`, {
      method: "POST",
      body: JSON.stringify(usuario),
    })
  },

  update: async (id: number, usuario: Partial<Usuario>): Promise<Usuario> => {
    // Incluir el ID en el objeto que se envía
    const usuarioToSend = {
      ...usuario,
      iD_Usuario: id,
    }

    console.log(`Actualizando usuario ${id} con datos:`, usuarioToSend)

    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(usuarioToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando usuario con ID: ${id}`)
    return fetchWithErrorHandling(`${API_BASE_URL}/usuarios/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}

// Servicio para Roles de Usuario
export const rolUsuarioService = {
  getAll: async (): Promise<RolUsuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/listado`)
  },

  getById: async (id: number): Promise<RolUsuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/buscarIdRolUsuario/${id}`)
  },

  getByName: async (name: string): Promise<RolUsuario[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/buscarNombreRolUsuario/${name}`)
  },

  create: async (rol: Omit<RolUsuario, "iD_RolUsuario" | "fechaCreacion">): Promise<RolUsuario> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/crear`, {
      method: "POST",
      body: JSON.stringify(rol),
    })
  },

  update: async (id: number, rol: Partial<RolUsuario>): Promise<RolUsuario> => {
    // Incluir el ID en el objeto que se envía
    const rolToSend = {
      ...rol,
      iD_RolUsuario: id,
    }

    console.log(`Actualizando rol ${id} con datos:`, rolToSend)

    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(rolToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando rol con ID: ${id}`)
    return fetchWithErrorHandling(`${API_BASE_URL}/rolesUsuario/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}

// Servicio para Comercios
export const comercioService = {
  getAll: async (): Promise<Comercio[]> => {
    const comercios = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/listado`)

    // Si comercios es un array, procesarlo; de lo contrario, devolver un array vacío
    if (Array.isArray(comercios)) {
      // Agregar el nombre del tipo de comercio
      return comercios.map((comercio: Comercio) => ({
        ...comercio,
        tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
      }))
    }
    return []
  },

  getById: async (id: number): Promise<Comercio> => {
    const comercio = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/buscarIdComercio/${id}`)
    return {
      ...comercio,
      tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
    }
  },

  getByName: async (name: string): Promise<Comercio[]> => {
    const comercios = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/buscarNombreComercio/${name}`)

    if (Array.isArray(comercios)) {
      return comercios.map((comercio: Comercio) => ({
        ...comercio,
        tipoComercioNombre: comercio.iD_TipoComercio === 1 ? "Bar" : "Boliche",
      }))
    }
    return []
  },

  // Método para crear un comercio
  create: async (comercio: Omit<Comercio, "iD_Comercio" | "fechaCreacion">): Promise<Comercio> => {
    console.log("Enviando datos a la API:", comercio)

    // Asegurarse de que los campos numéricos sean números y eliminar campos innecesarios
    const comercioToSend = {
      nombre: comercio.nombre,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      generoMusical: comercio.generoMusical || "",
      tipoDocumento: comercio.tipoDocumento,
      nroDocumento: comercio.nroDocumento,
      direccion: comercio.direccion,
      correo: comercio.correo,
      telefono: comercio.telefono,
      estado: Boolean(comercio.estado),
      iD_TipoComercio: Number(comercio.iD_TipoComercio),
      iD_Usuario: Number(comercio.iD_Usuario),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/comercios/crear`, {
      method: "POST",
      body: JSON.stringify(comercioToSend),
    })
  },

  // Método para actualizar un comercio
  update: async (id: number, comercio: Partial<Comercio>): Promise<Comercio> => {
    // Asegurarse de que los campos numéricos sean números e incluir el ID
    const comercioToSend = {
      ...comercio,
      iD_Comercio: id,
      capacidad: Number(comercio.capacidad),
      mesas: Number(comercio.mesas),
      iD_TipoComercio: Number(comercio.iD_TipoComercio),
      iD_Usuario: Number(comercio.iD_Usuario),
      estado: Boolean(comercio.estado),
      // No modificamos fechaCreacion en actualizaciones
    }

    console.log(`Actualizando comercio ${id} con datos:`, comercioToSend)

    return fetchWithErrorHandling(`${API_BASE_URL}/comercios/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(comercioToSend),
    })
  },

  // Método para eliminar un comercio
  delete: async (id: number): Promise<void> => {
    console.log(`Eliminando comercio con ID: ${id}`)
    try {
      const response = await fetchWithErrorHandling(`${API_BASE_URL}/comercios/eliminar/${id}`, {
        method: "DELETE",
      })
      console.log("Respuesta de eliminación:", response)
      return response
    } catch (error) {
      console.error(`Error al eliminar comercio con ID ${id}:`, error)
      throw error
    }
  },
}

// Servicio para Tipos de Comercio
export const tipoComercioService = {
  getAll: async (): Promise<TipoComercio[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/listado`)
  },

  getById: async (id: number): Promise<TipoComercio> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/buscarIdTipoComercio/${id}`)
  },

  getByName: async (name: string): Promise<TipoComercio[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/buscarNombreTipoComercio/${name}`)
  },

  create: async (tipoComercio: Omit<TipoComercio, "iD_TipoComercio" | "fechaCreacion">): Promise<TipoComercio> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/crear`, {
      method: "POST",
      body: JSON.stringify(tipoComercio),
    })
  },

  update: async (id: number, tipoComercio: Partial<TipoComercio>): Promise<TipoComercio> => {
    // Incluir el ID en el objeto que se envía
    const tipoComercioToSend = {
      ...tipoComercio,
      iD_TipoComercio: id,
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(tipoComercioToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/tiposComercio/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}

// Servicio para Publicidades
export const publicidadService = {
  getAll: async (): Promise<Publicidad[]> => {
    const publicidades = await fetchWithErrorHandling(`${API_BASE_URL}/publicidades/listado`)

    if (Array.isArray(publicidades)) {
      // Cargar los nombres de los comercios para cada publicidad
      const comerciosPromises = publicidades.map((pub) =>
        comercioService
          .getById(pub.iD_Comercio)
          .then((comercio) => ({
            ...pub,
            comercioNombre: comercio.nombre,
          }))
          .catch(() => ({
            ...pub,
            comercioNombre: "Desconocido",
          })),
      )

      return Promise.all(comerciosPromises)
    }

    return []
  },

  getById: async (id: number): Promise<Publicidad> => {
    const publicidad = await fetchWithErrorHandling(`${API_BASE_URL}/publicidades/buscarIdPublicidad/${id}`)

    try {
      const comercio = await comercioService.getById(publicidad.iD_Comercio)
      return {
        ...publicidad,
        comercioNombre: comercio.nombre,
      }
    } catch {
      return {
        ...publicidad,
        comercioNombre: "Desconocido",
      }
    }
  },

  getByComercio: async (comercio: string): Promise<Publicidad[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/buscarNombreComercio/${comercio}`)
  },

  create: async (publicidad: Omit<Publicidad, "iD_Publicidad" | "fechaCreacion">): Promise<Publicidad> => {
    const publicidadToSend = {
      descripcion: publicidad.descripcion,
      visualizaciones: Number(publicidad.visualizaciones),
      tiempo: publicidad.tiempo,
      estado: Boolean(publicidad.estado),
      iD_Comercio: Number(publicidad.iD_Comercio),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/crear`, {
      method: "POST",
      body: JSON.stringify(publicidadToSend),
    })
  },

  update: async (id: number, publicidad: Partial<Publicidad>): Promise<Publicidad> => {
    const publicidadToSend = {
      ...publicidad,
      iD_Publicidad: id,
      visualizaciones: Number(publicidad.visualizaciones),
      iD_Comercio: Number(publicidad.iD_Comercio),
      estado: Boolean(publicidad.estado),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(publicidadToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/publicidades/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}

// Servicio para Reseñas
export const reseniaService = {
  getAll: async (): Promise<Resenia[]> => {
    const resenias = await fetchWithErrorHandling(`${API_BASE_URL}/resenias/listado`)

    if (Array.isArray(resenias)) {
      // Cargar los nombres de los comercios y usuarios para cada reseña
      const reseniaPromises = resenias.map(async (resenia) => {
        try {
          const [comercio, usuario] = await Promise.all([
            comercioService.getById(resenia.iD_Comercio),
            usuarioService.getById(resenia.iD_Usuario),
          ])

          return {
            ...resenia,
            comercioNombre: comercio.nombre,
            usuarioNombre: usuario.nombreUsuario,
          }
        } catch {
          return {
            ...resenia,
            comercioNombre: "Desconocido",
            usuarioNombre: "Desconocido",
          }
        }
      })

      return Promise.all(reseniaPromises)
    }

    return []
  },

  getById: async (id: number): Promise<Resenia> => {
    const resenia = await fetchWithErrorHandling(`${API_BASE_URL}/resenias/buscarIdResenia/${id}`)

    try {
      const [comercio, usuario] = await Promise.all([
        comercioService.getById(resenia.iD_Comercio),
        usuarioService.getById(resenia.iD_Usuario),
      ])

      return {
        ...resenia,
        comercioNombre: comercio.nombre,
        usuarioNombre: usuario.nombreUsuario,
      }
    } catch {
      return {
        ...resenia,
        comercioNombre: "Desconocido",
        usuarioNombre: "Desconocido",
      }
    }
  },

  getByComercio: async (comercio: string): Promise<Resenia[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/buscarNombreComercio/${comercio}`)
  },

  create: async (resenia: Omit<Resenia, "iD_Resenia" | "fechaCreacion">): Promise<Resenia> => {
    const reseniaToSend = {
      iD_Usuario: Number(resenia.iD_Usuario),
      iD_Comercio: Number(resenia.iD_Comercio),
      comentario: resenia.comentario,
      estado: Boolean(resenia.estado),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/crear`, {
      method: "POST",
      body: JSON.stringify(reseniaToSend),
    })
  },

  update: async (id: number, resenia: Partial<Resenia>): Promise<Resenia> => {
    const reseniaToSend = {
      ...resenia,
      iD_Resenia: id,
      iD_Usuario: Number(resenia.iD_Usuario),
      iD_Comercio: Number(resenia.iD_Comercio),
      estado: Boolean(resenia.estado),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(reseniaToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/resenias/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}

// Servicio para Reservas
export const reservaService = {
  getAll: async (): Promise<Reserva[]> => {
    const reservas = await fetchWithErrorHandling(`${API_BASE_URL}/reservas/listado`)

    if (Array.isArray(reservas)) {
      // Cargar los nombres de los comercios y usuarios para cada reserva
      const reservaPromises = reservas.map(async (reserva) => {
        try {
          const [comercio, usuario] = await Promise.all([
            comercioService.getById(reserva.iD_Comercio),
            usuarioService.getById(reserva.iD_Usuario),
          ])

          return {
            ...reserva,
            comercioNombre: comercio.nombre,
            usuarioNombre: usuario.nombreUsuario,
          }
        } catch {
          return {
            ...reserva,
            comercioNombre: "Desconocido",
            usuarioNombre: "Desconocido",
          }
        }
      })

      return Promise.all(reservaPromises)
    }

    return []
  },

  getById: async (id: number): Promise<Reserva> => {
    const reserva = await fetchWithErrorHandling(`${API_BASE_URL}/reservas/buscarIdReserva/${id}`)

    try {
      const [comercio, usuario] = await Promise.all([
        comercioService.getById(reserva.iD_Comercio),
        usuarioService.getById(reserva.iD_Usuario),
      ])

      return {
        ...reserva,
        comercioNombre: comercio.nombre,
        usuarioNombre: usuario.nombreUsuario,
      }
    } catch {
      return {
        ...reserva,
        comercioNombre: "Desconocido",
        usuarioNombre: "Desconocido",
      }
    }
  },

  getByComercio: async (comercio: string): Promise<Reserva[]> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/buscarNombreComercio/${comercio}`)
  },

  create: async (reserva: Omit<Reserva, "iD_Reserva" | "fechaCreacion">): Promise<Reserva> => {
    const reservaToSend = {
      iD_Usuario: Number(reserva.iD_Usuario),
      iD_Comercio: Number(reserva.iD_Comercio),
      fechaReserva: reserva.fechaReserva,
      tiempoTolerancia: reserva.tiempoTolerancia,
      comenzales: Number(reserva.comenzales),
      estado: Boolean(reserva.estado),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/crear`, {
      method: "POST",
      body: JSON.stringify(reservaToSend),
    })
  },

  update: async (id: number, reserva: Partial<Reserva>): Promise<Reserva> => {
    const reservaToSend = {
      ...reserva,
      iD_Reserva: id,
      iD_Usuario: Number(reserva.iD_Usuario),
      iD_Comercio: Number(reserva.iD_Comercio),
      comenzales: Number(reserva.comenzales),
      estado: Boolean(reserva.estado),
    }

    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/actualizar/${id}`, {
      method: "PUT",
      body: JSON.stringify(reservaToSend),
    })
  },

  delete: async (id: number): Promise<void> => {
    return fetchWithErrorHandling(`${API_BASE_URL}/reservas/eliminar/${id}`, {
      method: "DELETE",
    })
  },
}
