"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, RefreshCw } from "lucide-react"
import { mapApiError, getErrorIcon, type ApiError } from "@/utils/errorUtils"

interface ErrorAlertProps {
  error: string | Error | null
  onDismiss?: () => void
  onRetry?: () => void
  className?: string
}

export function ErrorAlert({ error, onDismiss, onRetry, className }: ErrorAlertProps) {
  if (!error) return null

  const errorMessage = error instanceof Error ? error.message : error
  const mappedError: ApiError = mapApiError(errorMessage)
  const icon = getErrorIcon(mappedError.type)

  return (
    <Alert variant="destructive" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-2">
          <span className="text-lg">{icon}</span>
          <div className="flex-1">
            <AlertTitle className="text-sm font-medium">{getErrorTitle(mappedError.type)}</AlertTitle>
            <AlertDescription className="text-sm mt-1">{mappedError.message}</AlertDescription>

            {/* Mostrar sugerencias según el tipo de error */}
            {mappedError.type === "duplicate" && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Sugerencia: Intenta con una variación del nombre o agrega números.
              </p>
            )}

            {mappedError.type === "network" && (
              <p className="text-xs text-muted-foreground mt-2">
                💡 Sugerencia: Verifica tu conexión a internet y vuelve a intentar.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {onRetry && mappedError.type === "network" && (
            <Button variant="outline" size="sm" onClick={onRetry} className="h-6 px-2 text-xs">
              <RefreshCw className="h-3 w-3 mr-1" />
              Reintentar
            </Button>
          )}

          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 w-6 p-0">
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </Alert>
  )
}

function getErrorTitle(type: ApiError["type"]): string {
  switch (type) {
    case "validation":
      return "Error de Validación"
    case "duplicate":
      return "Valor Duplicado"
    case "network":
      return "Error de Conexión"
    case "server":
      return "Error del Servidor"
    case "auth":
      return "Error de Autenticación"
    default:
      return "Error"
  }
}
