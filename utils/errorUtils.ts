// Tipos de errores que puede devolver la API
export interface ApiError {
  message: string
  type: "validation" | "duplicate" | "network" | "server" | "auth" | "unknown"
  field?: string
}

// Mapeo de errores específicos a mensajes amigables
const ERROR_MESSAGES: Record<string, ApiError> = {
  // Errores de duplicados - USUARIOS
  "El nombre de usuario ya está en uso": {
    message: "Este nombre de usuario ya está registrado. Por favor, elige otro.",
    type: "duplicate",
    field: "nombreUsuario",
  },
  "El correo electrónico ya está registrado": {
    message: "Ya existe una cuenta con este correo electrónico.",
    type: "duplicate",
    field: "correo",
  },
  
  // Errores de duplicados - COMERCIOS
  "El nombre del comercio ya existe": {
    message: "Ya existe un comercio con este nombre. Por favor, elige otro.",
    type: "duplicate",
    field: "nombre",
  },
  "El correo del comercio ya está registrado": {
    message: "Ya existe un comercio con este correo electrónico.",
    type: "duplicate",
    field: "correo",
  },
  "El número de documento ya está registrado": {
    message: "Ya existe un comercio con este número de documento.",
    type: "duplicate",
    field: "nroDocumento",
  },
  "El teléfono del comercio ya está registrado": {
    message: "Ya existe un comercio con este número de teléfono.",
    type: "duplicate",
    field: "telefono",
  },

  // Errores de validación - COMERCIOS
  "El nombre del comercio es obligatorio": {
    message: "Debes ingresar un nombre para el comercio.",
    type: "validation",
    field: "nombre",
  },
  "La dirección es obligatoria": {
    message: "Debes ingresar una dirección para el comercio.",
    type: "validation",
    field: "direccion",
  },
  "Debes seleccionar un tipo de comercio": {
    message: "Por favor, selecciona un tipo de comercio.",
    type: "validation",
    field: "iD_TipoComercio",
  },
  "Debes seleccionar un usuario responsable": {
    message: "Por favor, asigna un usuario responsable para el comercio.",
    type: "validation",
    field: "iD_Usuario",
  },
  "La capacidad debe ser mayor a 0": {
    message: "La capacidad del comercio debe ser al menos 1 persona.",
    type: "validation",
    field: "capacidad",
  },

  // Errores de validación generales
  "The Uid field is required": {
    message: "Error de autenticación. Por favor, inicia sesión nuevamente.",
    type: "auth",
  },
  "El campo Correo es requerido": {
    message: "El correo electrónico es obligatorio.",
    type: "validation",
    field: "correo",
  },
  "El campo NombreUsuario es requerido": {
    message: "El nombre de usuario es obligatorio.",
    type: "validation",
    field: "nombreUsuario",
  },

  // Errores de red
  "Failed to fetch": {
    message: "No se pudo conectar con el servidor. Verifica tu conexión a internet.",
    type: "network",
  },
  "Network error": {
    message: "Error de conexión. Por favor, inténtalo de nuevo.",
    type: "network",
  },
  "NetworkError": {
    message: "Error de red. Verifica tu conexión a internet.",
    type: "network",
  },

  // Errores del servidor
  "Internal Server Error": {
    message: "Error interno del servidor. Por favor, inténtalo más tarde.",
    type: "server",
  },
  "Service Unavailable": {
    message: "El servicio no está disponible temporalmente.",
    type: "server",
  },
  "500": {
    message: "Error del servidor. Por favor, inténtalo más tarde.",
    type: "server",
  },

  // Errores de autorización
  "Unauthorized": {
    message: "No tienes permisos para realizar esta acción.",
    type: "auth",
  },
  "Forbidden": {
    message: "Acceso denegado.",
    type: "auth",
  },
  "401": {
    message: "Sesión expirada. Por favor, inicia sesión nuevamente.",
    type: "auth",
  },
  "403": {
    message: "No tienes permisos para realizar esta acción.",
    type: "auth",
  },

  // Errores de no encontrado
  "Usuario no encontrado": {
    message: "El usuario solicitado no existe.",
    type: "validation",
  },
  "Comercio no encontrado": {
    message: "El comercio solicitado no existe.",
    type: "validation",
  },
  "404": {
    message: "No se encontró el recurso solicitado.",
    type: "validation",
  },

  // Errores de relación
  "No se puede eliminar el comercio porque tiene reservas asociadas": {
    message: "Este comercio tiene reservas activas y no puede ser eliminado.",
    type: "validation",
  },
  "No se puede eliminar el comercio porque tiene reseñas asociadas": {
    message: "Este comercio tiene reseñas y no puede ser eliminado.",
    type: "validation",
  },
}

// Función para mapear errores de la API a mensajes amigables
export function mapApiError(errorMessage: string): ApiError {
  // Limpiar el mensaje de error
  const cleanMessage = errorMessage.trim()

  // Buscar coincidencia exacta
  if (ERROR_MESSAGES[cleanMessage]) {
    return ERROR_MESSAGES[cleanMessage]
  }

  // Buscar coincidencias parciales para errores dinámicos
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (cleanMessage.includes(key) || key.includes(cleanMessage)) {
      return value
    }
  }

  // Detectar patrones comunes
  if (
    cleanMessage.toLowerCase().includes("ya existe") ||
    cleanMessage.toLowerCase().includes("already exists") ||
    cleanMessage.toLowerCase().includes("ya está en uso") ||
    cleanMessage.toLowerCase().includes("duplicado")
  ) {
    return {
      message: "Este valor ya está en uso. Por favor, elige otro.",
      type: "duplicate",
    }
  }

  if (
    cleanMessage.toLowerCase().includes("requerido") ||
    cleanMessage.toLowerCase().includes("required") ||
    cleanMessage.toLowerCase().includes("obligatorio") ||
    cleanMessage.toLowerCase().includes("is required")
  ) {
    return {
      message: "Por favor, completa todos los campos obligatorios.",
      type: "validation",
    }
  }

  if (
    cleanMessage.toLowerCase().includes("timeout") || 
    cleanMessage.toLowerCase().includes("tiempo") ||
    cleanMessage.toLowerCase().includes("timed out")
  ) {
    return {
      message: "La operación tardó demasiado. Por favor, inténtalo de nuevo.",
      type: "network",
    }
  }

  if (
    cleanMessage.toLowerCase().includes("no se puede eliminar") ||
    cleanMessage.toLowerCase().includes("cannot delete") ||
    cleanMessage.toLowerCase().includes("asociad")
  ) {
    return {
      message: "No se puede eliminar porque tiene información relacionada.",
      type: "validation",
    }
  }

  // Detectar códigos de error HTTP
  if (/^[45]\d{2}$/.test(cleanMessage)) {
    const code = cleanMessage
    if (ERROR_MESSAGES[code]) {
      return ERROR_MESSAGES[code]
    }
  }

  // Error genérico
  return {
    message: cleanMessage || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
    type: "unknown",
  }
}

// Función para obtener el icono según el tipo de error
export function getErrorIcon(type: ApiError["type"]): string {
  switch (type) {
    case "validation":
      return "⚠️"
    case "duplicate":
      return "🔄"
    case "network":
      return "🌐"
    case "server":
      return "🔧"
    case "auth":
      return "🔒"
    default:
      return "❌"
  }
}

// Función para obtener el color del toast según el tipo de error
export function getErrorVariant(type: ApiError["type"]): "destructive" | "default" {
  switch (type) {
    case "network":
    case "server":
      return "default" // Menos alarmante para errores técnicos
    default:
      return "destructive"
  }
}

// Función auxiliar para extraer mensaje de error de diferentes formatos
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  
  if (typeof error === "string") {
    return error
  }
  
  if (typeof error === "object" && error !== null) {
    // Intentar extraer el mensaje de diferentes estructuras
    const err = error as any
    return err.message || err.error || err.mensaje || err.Mensaje || "Error desconocido"
  }
  
  return "Error desconocido"
}