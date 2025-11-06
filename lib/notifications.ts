// lib/notifications.ts
import { useToast } from "@/components/ui/use-toast"

export type NotificationType = 'success' | 'error' | 'info' | 'warning'

export interface NotificationConfig {
  title: string
  description: string
  duration?: number
}

// Mensajes predefinidos para diferentes acciones
export const NOTIFICATION_MESSAGES = {
  // USUARIOS
  usuarios: {
    created: {
      title: "✅ Usuario creado",
      description: "El usuario ha sido creado exitosamente",
    },
    updated: {
      title: "✅ Usuario actualizado",
      description: "Los cambios se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Usuario eliminado",
      description: "El usuario ha sido eliminado del sistema",
    },
    error: {
      create: {
        title: "❌ Error al crear usuario",
        description: "No se pudo crear el usuario. Por favor, intenta nuevamente",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el usuario",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la información del usuario",
      },
    },
  },

  // ROLES
  roles: {
    created: {
      title: "✅ Rol creado",
      description: "El rol ha sido creado exitosamente",
    },
    updated: {
      title: "✅ Rol actualizado",
      description: "Los cambios se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Rol eliminado",
      description: "El rol ha sido eliminado del sistema",
    },
    error: {
      create: {
        title: "❌ Error al crear rol",
        description: "No se pudo crear el rol. Por favor, intenta nuevamente",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el rol",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la información del rol",
      },
    },
  },

  // COMERCIOS
  comercio: {
    created: {
      title: "Comercio creado",
      description: "El comercio se ha registrado correctamente",
    },
    updated: {
      title: "Comercio actualizado",
      description: "Los cambios se han guardado correctamente",
    },
    deleted: {
      title: "Comercio eliminado",
      description: "El comercio se ha eliminado correctamente",
    },
    error: {
      create: {
        title: "Error al crear comercio",
        description: "No se pudo registrar el comercio",
      },
      update: {
        title: "Error al actualizar comercio",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "Error al eliminar comercio",
        description: "No se pudo eliminar el comercio",
      },
      load: {
        title: "Error al cargar comercios",
        description: "No se pudieron obtener los datos",
      },
    },
  },

  // TIPOS DE COMERCIO
  tiposComercios: {
    created: {
      title: "✅ Tipo de comercio creado",
      description: "El tipo de comercio ha sido creado exitosamente",
    },
    updated: {
      title: "✅ Tipo de comercio actualizado",
      description: "Los cambios se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Tipo de comercio eliminado",
      description: "El tipo de comercio ha sido eliminado del sistema",
    },
    error: {
      create: {
        title: "❌ Error al crear tipo de comercio",
        description: "No se pudo crear el tipo de comercio",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar el tipo de comercio",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la información del tipo de comercio",
      },
    },
  },

  // RESEÑAS
  resenias: {
    created: {
      title: "✅ Reseña publicada",
      description: "Tu reseña ha sido publicada exitosamente",
    },
    updated: {
      title: "✅ Reseña actualizada",
      description: "Los cambios se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Reseña eliminada",
      description: "La reseña ha sido eliminada",
    },
    error: {
      create: {
        title: "❌ Error al publicar reseña",
        description: "No se pudo publicar tu reseña. Intenta nuevamente",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar la reseña",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la reseña",
      },
    },
  },

  // RESERVAS
  reservas: {
    created: {
      title: "✅ Reserva confirmada",
      description: "Tu reserva ha sido confirmada exitosamente",
    },
    updated: {
      title: "✅ Reserva actualizada",
      description: "Los cambios en tu reserva se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Reserva cancelada",
      description: "Tu reserva ha sido cancelada",
    },
    error: {
      create: {
        title: "❌ Error al crear reserva",
        description: "No se pudo confirmar tu reserva. Intenta nuevamente",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios en la reserva",
      },
      delete: {
        title: "❌ Error al cancelar",
        description: "No se pudo cancelar la reserva",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la información de la reserva",
      },
    },
  },

  // PUBLICIDADES
  publicidades: {
    created: {
      title: "✅ Publicidad creada",
      description: "La publicidad ha sido creada exitosamente",
    },
    updated: {
      title: "✅ Publicidad actualizada",
      description: "Los cambios se guardaron correctamente",
    },
    deleted: {
      title: "🗑️ Publicidad eliminada",
      description: "La publicidad ha sido eliminada",
    },
    error: {
      create: {
        title: "❌ Error al crear publicidad",
        description: "No se pudo crear la publicidad",
      },
      update: {
        title: "❌ Error al actualizar",
        description: "No se pudieron guardar los cambios",
      },
      delete: {
        title: "❌ Error al eliminar",
        description: "No se pudo eliminar la publicidad",
      },
      load: {
        title: "❌ Error al cargar",
        description: "No se pudo cargar la información de la publicidad",
      },
    },
  },

  // PERFIL
  perfil: {
    updated: {
      title: "✅ Perfil actualizado",
      description: "Tus cambios se guardaron correctamente",
    },
    error: {
      update: {
        title: "❌ Error al actualizar perfil",
        description: "No se pudieron guardar los cambios en tu perfil",
      },
      load: {
        title: "❌ Error al cargar perfil",
        description: "No se pudo cargar tu información",
      },
    },
  },

  // VALIDACIONES
  validation: {
    form: {
      title: "⚠️ Revisa el formulario",
      description: "Por favor, corrige los errores antes de continuar",
    },
    required: {
      title: "⚠️ Campos requeridos",
      description: "Por favor, completa todos los campos obligatorios",
    },
  },

  // GENERALES
  general: {
    loading: {
      title: "⏳ Cargando...",
      description: "Por favor, espera un momento",
    },
    networkError: {
      title: "❌ Error de conexión",
      description: "No se pudo conectar con el servidor. Verifica tu conexión a internet",
    },
    unauthorized: {
      title: "❌ Sin autorización",
      description: "No tienes permisos para realizar esta acción",
    },
    notFound: {
      title: "❌ No encontrado",
      description: "El recurso solicitado no existe",
    },
  },
}

// Hook personalizado para notificaciones mejoradas
export function useNotifications() {
  const { toast } = useToast()

  const showSuccess = (config: NotificationConfig) => {
    toast({
      title: config.title,
      description: config.description,
      duration: config.duration || 3000,
      className: "bg-green-50 border-green-200",
    })
  }

  const showError = (config: NotificationConfig, error?: Error) => {
    const description = error 
      ? `${config.description}${error.message ? `: ${error.message}` : ''}`
      : config.description

    toast({
      title: config.title,
      description,
      duration: config.duration || 5000,
      variant: "destructive",
    })
  }

  const showWarning = (config: NotificationConfig) => {
    toast({
      title: config.title,
      description: config.description,
      duration: config.duration || 4000,
      className: "bg-yellow-50 border-yellow-200",
    })
  }

  const showInfo = (config: NotificationConfig) => {
    toast({
      title: config.title,
      description: config.description,
      duration: config.duration || 3000,
      className: "bg-blue-50 border-blue-200",
    })
  }

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  }
}
