"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { User, Store, ArrowLeft } from "lucide-react"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link"
import Image from "next/image"

export default function RegisterForm() {
  const { registerWithGoogleIdToken, isLoading } = useAuth();
  const { toast } = useToast();

  const handleGoogleRegister = async (resp: CredentialResponse) => {

    try {
      if (!resp.credential) throw new Error("No se recibió el token de Google");
      await registerWithGoogleIdToken(resp.credential);
      // Si el usuario ya existe, el contexto redirige a /auth/login con alert
    } catch (e: any) {
      if (e?.message !== "No se pudo conectar con el servidor") {
        toast({
          title: "Error",
          description: e?.message ?? "No se pudo registrar",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <div className="flex bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Columna Izquierda - Información */}
      <div className="hidden lg:block lg:w-1/2 bg-brand-gradient relative" style={{ maxHeight: "100vh" }}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/vibrant-bar-scene.png"
            alt="Escena de bar vibrante"
            fill
            className="object-cover opacity-30"
            style={{ objectPosition: "center 30%", maxHeight: "100vh" }}
          />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-8 py-6 h-full">
          <div className="mb-4">
            <Image src="/logo-donde-salimos.png" alt="¿Dónde Salimos?" width={40} height={40} className="mb-2" />
            <h1 className="text-2xl font-bold mb-2 text-white">¡Únete a nosotros!</h1>
            <p className="text-base text-pink-100 mb-4">Crea tu cuenta y descubre los mejores lugares para salir</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <User className="h-2.5 w-2.5" />
              </div>
              <span className="text-pink-100 text-xs">Descubre lugares increíbles</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                <Store className="h-2.5 w-2.5" />
              </div>
              <span className="text-pink-100 text-xs">Gestiona tu negocio</span>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">
          {/* Header móvil */}
          <div className="lg:hidden text-center mb-4">
            <Image
              src="/logo-donde-salimos.png"
              alt="¿Dónde Salimos?"
              width={30}
              height={30}
              className="mx-auto mb-2"
            />
            <h1 className="text-lg font-bold text-gray-900">¡Únete a nosotros!</h1>
            <p className="text-xs text-gray-600">Crea tu cuenta y comienza a explorar</p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-base">Crear Cuenta</CardTitle>
              <CardDescription className="text-xs">Elige el tipo de cuenta que necesitas</CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              <div className="space-y-3">
                <GoogleLogin
                  onSuccess={handleGoogleRegister}
                  onError={() => toast({ title: "Error", description: "Google Login falló" })}
                  /*useOneTap // opcional: activa el prompt One Tap*/
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-1 pt-0">
              <p className="text-center text-xs text-gray-600">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/auth/login" className="text-pink-600 hover:text-pink-700 font-medium">
                  Inicia sesión
                </Link>
              </p>
              <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
                <ArrowLeft className="h-3 w-3" />
                Volver al inicio
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}