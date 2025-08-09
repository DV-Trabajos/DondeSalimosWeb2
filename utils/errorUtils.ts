// Tipos de errores que puede devolver la API
export interface ApiError {
  message: string
  type: "validation" | "duplicate" | "network" | "server" | "auth" | "unknown"
  field?: string
}

// Mapeo de errores específicos a mensajes amigables
const ERROR_MESSAGES: Record<string, ApiError> = {
  // Errores de duplicados
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
  "El nombre del comercio ya existe": {
    message: "Ya existe un comercio con este nombre. Por favor, elige otro.",
    type: "duplicate",
    field: "nombre",
  },

  // Errores de validación
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

  // Errores del servidor
  "Internal Server Error": {
    message: "Error interno del servidor. Por favor, inténtalo más tarde.",
    type: "server",
  },
  "Service Unavailable": {
    message: "El servicio no está disponible temporalmente.",
    type: "server",
  },

  // Errores de autorización
  Unauthorized: {
    message: "No tienes permisos para realizar esta acción.",
    type: "auth",
  },
  Forbidden: {
    message: "Acceso denegado.",
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
}

// Función para mapear errores de la API a mensajes amigables
export function mapApiError(errorMessage: string): ApiError {
  // Buscar coincidencia exacta
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage]
  }

  // Buscar coincidencias parciales para errores dinámicos
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (errorMessage.includes(key) || key.includes(errorMessage)) {
      return value
    }
  }

  // Detectar patrones comunes
  if (
    errorMessage.toLowerCase().includes("ya existe") ||
    errorMessage.toLowerCase().includes("already exists") ||
    errorMessage.toLowerCase().includes("ya está en uso")
  ) {
    return {
      message: "Este valor ya está en uso. Por favor, elige otro.",
      type: "duplicate",
    }
  }

  if (
    errorMessage.toLowerCase().includes("requerido") ||
    errorMessage.toLowerCase().includes("required") ||
    errorMessage.toLowerCase().includes("obligatorio")
  ) {
    return {
      message: "Por favor, completa todos los campos obligatorios.",
      type: "validation",
    }
  }

  if (errorMessage.toLowerCase().includes("timeout") || errorMessage.toLowerCase().includes("tiempo")) {
    return {
      message: "La operación tardó demasiado. Por favor, inténtalo de nuevo.",
      type: "network",
    }
  }

  // Error genérico
  return {
    message: errorMessage || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
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
