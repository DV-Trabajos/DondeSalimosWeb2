"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { resetPassword } from "@/lib/firebase"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Error",
        description: "Por favor, ingresa tu correo electrónico",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await resetPassword(email)
      setEmailSent(true)
      toast({
        title: "Correo enviado",
        description: "Se ha enviado un correo para restablecer tu contraseña",
      })
    } catch (error: any) {
      console.error("Error al enviar correo de restablecimiento:", error)
      toast({
        title: "Error",
        description: error.message || "Error al enviar correo de restablecimiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Recuperar Contraseña</CardTitle>
        <CardDescription>
          Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
        </CardDescription>
      </CardHeader>
      <CardContent>
        {emailSent ? (
          <div className="text-center space-y-4">
            <p className="text-green-600">
              Hemos enviado un correo a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
            </p>
            <p>Revisa tu bandeja de entrada y sigue las instrucciones del correo.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        {emailSent ? (
          <div className="w-full space-y-2">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full">Volver al inicio de sesión</Button>
            </Link>
          </div>
        ) : (
          <div className="w-full space-y-2">
            <Button className="w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar correo de recuperación"
              )}
            </Button>
            <div className="flex justify-center">
              <Link href="/auth/login" className="text-sm text-primary hover:underline">
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
