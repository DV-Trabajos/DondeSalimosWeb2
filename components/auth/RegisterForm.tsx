"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, User, Store, CheckCircle2, ArrowLeft } from "lucide-react"
import { registerWithGoogle } from "@/lib/firebase"
import { rolUsuarioService } from "@/services"
import type { RolUsuario } from "@/services"
import Link from "next/link"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [roles, setRoles] = useState<RolUsuario[]>([])
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loadingRoles, setLoadingRoles] = useState(true)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [userType, setUserType] = useState<"usuario" | "comercio">("usuario")
  const { toast } = useToast()
  const router = useRouter()

  // Cargar roles al montar el componente
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const rolesData = await rolUsuarioService.getAll()
        setRoles(rolesData.filter((rol) => rol.estado))
      } catch (error) {
        console.error("Error al cargar roles:", error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los roles de usuario",
          variant: "destructive",
        })
      } finally {
        setLoadingRoles(false)
      }
    }

    fetchRoles()
  }, [toast])

  // Función para obtener el ID del rol según el tipo de usuario seleccionado
  const getRolIdByType = (): number => {
    if (userType === "comercio") {
      const comercioRol = roles.find(
        (rol) =>
          rol.descripcion.toLowerCase().includes("comercio") ||
          rol.descripcion === "Usuario_Comercio" ||
          rol.descripcion === "Gerente",
      )
      return comercioRol?.iD_RolUsuario || 2
    } else {
      const usuarioRol = roles.find((rol) => rol.descripcion === "Usuario")
      return usuarioRol?.iD_RolUsuario || 1
    }
  }

  const handleGoogleRegister = async () => {
    setGoogleLoading(true)

    try {
      const rolId = getRolIdByType()
      const authResponse = await registerWithGoogle()

      if (authResponse) {
        if (authResponse.esNuevoUsuario) {
          setEmail(authResponse.usuario.email || "")
          setRegistrationComplete(true)
        } else {
          toast({
            title: "Información",
            description: "Ya tienes una cuenta. Redirigiendo al inicio de sesión.",
          })
          router.push("/auth/login")
        }
      }
    } catch (error: any) {
      console.error("Error al registrar con Google:", error)
      toast({
        title: "Error",
        description: error.message || "Error al registrar con Google",
        variant: "destructive",
      })
    } finally {
      setGoogleLoading(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 to-purple-50">
        <Card className="w-full max-w-md mx-auto shadow-xl">
          <CardHeader className="text-center pb-3">
            <div className="mx-auto mb-2 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <CardTitle className="text-lg">¡Registro Completado!</CardTitle>
            <CardDescription className="text-xs">Verifica tu correo electrónico para continuar</CardDescription>
          </CardHeader>
          <CardContent className="pb-3">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-xs">Registro exitoso</AlertTitle>
              <AlertDescription className="text-xs">
                Hemos enviado un correo de verificación a <strong>{email}</strong>.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex flex-col gap-1 pt-0">
            <Link href="/auth/login" className="w-full">
              <Button className="w-full bg-brand-gradient hover:opacity-90 h-8 text-xs">Ir a Iniciar Sesión</Button>
            </Link>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mt-1">
              <ArrowLeft className="h-3 w-3" />
              Volver al inicio
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
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
            <CardContent className="space-y-3 pb-2">
              <Tabs defaultValue="usuario" onValueChange={(value) => setUserType(value as "usuario" | "comercio")}>
                <TabsList className="grid w-full grid-cols-2 mb-2 h-7">
                  <TabsTrigger value="usuario" className="flex items-center gap-1 text-xs h-6">
                    <User className="h-3 w-3" />
                    Usuario
                  </TabsTrigger>
                  <TabsTrigger value="comercio" className="flex items-center gap-1 text-xs h-6">
                    <Store className="h-3 w-3" />
                    Comercio
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="usuario" className="space-y-2 mt-2">
                  <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700 text-center">Descubre y reserva en los mejores lugares</p>
                  </div>
                  <Button
                    variant="default"
                    className="w-full bg-brand-gradient hover:opacity-90 h-8"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loadingRoles}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        <span className="text-xs">Conectando...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="mr-1 h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          width="12px"
                          height="12px"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                        <span className="text-xs">Registrarse con Google</span>
                      </>
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="comercio" className="space-y-2 mt-2">
                  <div className="bg-purple-50 p-1.5 rounded-lg border border-purple-100">
                    <p className="text-xs text-purple-700 text-center">Promociona tu local y gestiona reservas</p>
                  </div>
                  <Button
                    variant="default"
                    className="w-full bg-brand-gradient hover:opacity-90 h-8"
                    onClick={handleGoogleRegister}
                    disabled={googleLoading || loadingRoles}
                  >
                    {googleLoading ? (
                      <>
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        <span className="text-xs">Conectando...</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="mr-1 h-3 w-3"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 48 48"
                          width="12px"
                          height="12px"
                        >
                          <path
                            fill="#FFC107"
                            d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                          <path
                            fill="#FF3D00"
                            d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                          />
                          <path
                            fill="#4CAF50"
                            d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                          />
                          <path
                            fill="#1976D2"
                            d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                          />
                        </svg>
                        <span className="text-xs">Registrarse con Google</span>
                      </>
                    )}
                  </Button>
                </TabsContent>
              </Tabs>
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