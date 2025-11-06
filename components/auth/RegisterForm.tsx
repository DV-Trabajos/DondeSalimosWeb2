"use client"

import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { User, Store, ArrowLeft, Sparkles, TrendingUp, Users } from "lucide-react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useAuth } from "@/contexts/AuthContext"
import Link from "next/link"
import Image from "next/image"

export default function RegisterForm() {
  const { registerWithGoogleIdToken, isLoading } = useAuth()
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<number | null>(null)
  const [initiatingRole, setInitiatingRole] = useState<number | null>(null)

  const handleGoogleRegister = async (resp: CredentialResponse, role: number) => {
    try {
      if (!resp.credential) throw new Error("No se recibió el token de Google")
      await registerWithGoogleIdToken(resp.credential, role)
    } catch (e: any) {
      if (e?.message !== "No se pudo conectar con el servidor") {
        toast({
          title: "Error",
          description: e?.message ?? "No se pudo registrar",
          variant: "destructive",
        })
      }
    } finally {
      setInitiatingRole(null)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700">
        <Image
          src="/images/city-background.jpg"
          alt="Ciudad nocturna"
          fill
          className="object-cover mix-blend-overlay opacity-40"
        />

        <div className="relative z-10 p-16 flex flex-col justify-between text-white h-full">
          <div>
            <h1 className="text-6xl font-bold mb-6 leading-tight">
              Descubre la
              <br />
              <span className="text-pink-200">noche perfecta</span>
            </h1>
            <p className="text-2xl text-white/90 mb-16 max-w-lg leading-relaxed">
              Únete a la comunidad que está transformando la forma de salir y disfrutar
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg">Lugares únicos</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg">Crece tu negocio</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-semibold text-lg">Comunidad activa</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <Link href="/landing" className="inline-flex items-center gap-3 mb-8">
              <Image src="/abstract-logo.png" alt="Logo" width={48} height={48} className="rounded-lg" />
              <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Donde Salimos
              </span>
            </Link>
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ¡Únete ahora!
            </h1>
            <p className="text-muted-foreground text-lg">Descubre la noche perfecta</p>
          </div>

          <div className="space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold mb-3">Crear cuenta</h2>
              <p className="text-muted-foreground">Elige cómo quieres unirte</p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInitiatingRole(1)}
                  disabled={isLoading}
                  className="w-full p-6 rounded-2xl border-2 border-pink-200 hover:border-pink-400 bg-gradient-to-br from-pink-50 to-white hover:shadow-lg hover:shadow-pink-100 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-pink-600 text-white group-hover:scale-110 transition-transform">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">Usuario</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        Descubre lugares increíbles y guarda tus favoritos
                      </p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-pink-600">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Registrarse con Google
                      </div>
                    </div>
                  </div>
                </button>

                {initiatingRole === 1 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl">
                    <GoogleLogin
                      onSuccess={(resp) => handleGoogleRegister(resp, 16)}
                      onError={() => {
                        toast({ title: "Error", description: "Google Login falló" })
                        setInitiatingRole(null)
                      }}
                      text="continue_with"
                      shape="rectangular"
                      size="large"
                    />
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setInitiatingRole(3)}
                  disabled={isLoading}
                  className="w-full p-6 rounded-2xl border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-white hover:shadow-lg hover:shadow-purple-100 transition-all duration-200 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-purple-600 text-white group-hover:scale-110 transition-transform">
                      <Store className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1 text-gray-900">Comercio</h3>
                      <p className="text-sm text-muted-foreground mb-3">Promociona tu negocio y atrae más clientes</p>
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path
                            fill="currentColor"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="currentColor"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="currentColor"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        Registrarse con Google
                      </div>
                    </div>
                  </div>
                </button>

                {initiatingRole === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-2xl">
                    <GoogleLogin
                      onSuccess={(resp) => handleGoogleRegister(resp, 3)}
                      onError={() => {
                        toast({ title: "Error", description: "Google Login falló" })
                        setInitiatingRole(null)
                      }}
                      text="continue_with"
                      shape="rectangular"
                      size="large"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Footer mejorado */}
            <div className="space-y-4 pt-6 border-t">
              <div className="text-sm text-center text-muted-foreground">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/auth/login"
                  className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                >
                  Inicia sesión
                </Link>
              </div>

              <Link
                href="/landing"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}