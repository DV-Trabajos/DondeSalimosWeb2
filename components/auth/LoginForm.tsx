"use client"

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"
import { ArrowLeft, Sparkles, TrendingUp, Users } from "lucide-react"
import { GoogleLogin, CredentialResponse, } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  const { loginWithGoogleIdToken, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSuccess = async (resp: CredentialResponse) => {
    try {
      if (!resp.credential) throw new Error("No se recibió el token de Google");
      await loginWithGoogleIdToken(resp.credential);

    } catch (e: any) {
      if (e?.message !== "No se pudo conectar con el servidor") {
        toast({ title: "Error", description: e?.message ?? "No se pudo iniciar sesión", variant: "destructive" });
      }
    }
  
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[55%] relative bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 overflow-hidden">
        {/* Imagen de fondo */}
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/city-background.jpg"
            alt="Ciudad nocturna"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-pink-900/40 to-transparent" />

        {/* Contenido */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Bienvenido
              <br />
              de vuelta
            </h1>
            <p className="text-xl text-white/90 max-w-md">
              Continúa descubriendo los mejores lugares y experiencias de tu ciudad
            </p>
          </div>

          {/* Beneficios */}
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <Sparkles className="w-8 h-8" />
              </div>
              <p className="font-semibold">Tus favoritos</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8" />
              </div>
              <p className="font-semibold">Recomendaciones</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <Users className="w-8 h-8" />
              </div>
              <p className="font-semibold">Comunidad</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Header móvil */}
          <div className="lg:hidden mb-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image src="/abstract-logo.png" alt="Logo" width={40} height={40} className="w-10 h-10" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Donde Salimos
              </span>
            </div>
          </div>

          {/* Formulario */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600 mb-8">Ingresa con tu cuenta de Google para continuar</p>

            {/* Botón de Google */}
            <GoogleLogin
              onSuccess={(resp) => handleSuccess(resp)}
              onError={() => {
                toast({ title: "Error", description: "Google Login falló" })
              }}
              text="continue_with"
              shape="rectangular"
              size="large"
            />

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">O</span>
              </div>
            </div>

            {/* Link a registro */}
            <Link href="/auth/register">
              <Button
                variant="outline"
                className="w-full h-12 border-2 border-pink-500 text-pink-600 hover:bg-pink-50 hover:text-pink-700 font-medium bg-transparent"
              >
                Crear una cuenta nueva
              </Button>
            </Link>

            {/* Términos */}
            <p className="text-xs text-gray-500 text-center mt-6">
              Al iniciar sesión, aceptas nuestros{" "}
              <Link href="/terms" className="text-pink-600 hover:underline">
                Términos de servicio
              </Link>{" "}
              y{" "}
              <Link href="/privacy" className="text-pink-600 hover:underline">
                Política de privacidad
              </Link>
            </p>
          </div>

          {/* Volver al inicio */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 mt-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  )
}