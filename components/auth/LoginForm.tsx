"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Info, UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { GoogleLogin, CredentialResponse, } from "@react-oauth/google";

type AuthErrorType =
  | "ACCOUNT_NOT_FOUND"
  | "NETWORK_ERROR"
  | "SERVER_ERROR"
  | "INVALID_CREDENTIALS"
  | "UNKNOWN";

interface AuthError {
  type: AuthErrorType;
  message: string;
}

export function LoginForm() {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const { toast } = useToast();
  const { login } = useAuth();
  const router = useRouter();

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setAuthError(null);
    setGoogleLoading(true);

    try {
      const credential = response.credential;
      const apiUrl = "https://localhost:7283/api/usuarios/iniciarSesionConGoogle"

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken: credential }),
      });

      const authResponse = await res.json();

      /*console.log("Respuesta de la API:", {
            status: authResponse.status,
            statusText: authResponse.statusText,
          })*/

      if (!res.ok) {
        throw new Error(authResponse.Mensaje || "Auth failed");
      }

      console.log("USUARIO: " , authResponse.usuario);

      // Login en contexto y toast
      login(authResponse.usuario);
      toast({
        title: "¡Bienvenido!",
        description: "Sesión iniciada correctamente",
      });

      console.log("ANTES DE ENTRAR AL PUSH DASHBOARD", router);

      router.push("/landing"); //("/dashboard");
    } catch (err: any) {
      console.error("Google login error:", err);
      const genericError: AuthError = {
        type: "UNKNOWN",
        message:
          err.message ||
          "Ocurrió un error inesperado al iniciar sesión. Inténtalo de nuevo.",
      };
      setAuthError(genericError);
      toast({
        title: "Error",
        description: genericError.message,
        variant: "destructive",
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    const err: AuthError = {
      type: "NETWORK_ERROR",
      message:
        "No se pudo conectar con Google. Verifica tu conexión e inténtalo de nuevo.",
    };
    setAuthError(err);
    toast({
      title: "Error de conexión",
      description: err.message,
      variant: "destructive",
    });
  };

  const handleCreateAccount = () => {
    router.push("/auth/register");
  };

  const getErrorIcon = (type: AuthErrorType) => {
    switch (type) {
      case "ACCOUNT_NOT_FOUND":
        return <UserPlus className="h-4 w-4" />;
      case "NETWORK_ERROR":
      case "SERVER_ERROR":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getErrorVariant = (
    type: AuthErrorType
  ): "default" | "destructive" => {
    switch (type) {
      case "ACCOUNT_NOT_FOUND":
        return "default";
      case "NETWORK_ERROR":
      case "SERVER_ERROR":
      case "INVALID_CREDENTIALS":
        return "destructive";
      default:
        return "default";
    }
  };

  return (
    <div className="flex bg-white">
      {/* ... columna izquierda inalterada ... */}

      {/* Columna derecha */}
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
            <h1 className="text-lg font-bold text-gray-900">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-gray-600">
              Ingresa con tu cuenta de Google
            </p>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="space-y-1 pb-3">
              <CardTitle className="text-lg font-bold text-center">
                Iniciar Sesión
              </CardTitle>
              <CardDescription className="text-center text-xs">
                Ingresa con tu cuenta de Google para acceder al sistema
              </CardDescription>
            </CardHeader>

            <CardContent className="pb-3">
              {authError && (
                <Alert
                  variant={getErrorVariant(authError.type)}
                  className="mb-3"
                >
                  {getErrorIcon(authError.type)}
                  <AlertDescription className="ml-2 text-xs">
                    {authError.message}
                    {authError.type === "ACCOUNT_NOT_FOUND" && (
                      <div className="mt-2">
                        <Button
                          onClick={handleCreateAccount}
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs bg-transparent"
                        >
                          <UserPlus className="mr-1 h-3 w-3" />
                          Crear cuenta nueva
                        </Button>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-3">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  /*useOneTap // opcional: activa el prompt One Tap*/
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground text-[10px]">
                      O
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-brand-pink text-brand-pink hover:bg-brand-pink hover:text-white h-8 text-xs bg-transparent"
                  onClick={handleCreateAccount}
                >
                  <UserPlus className="mr-1 h-3 w-3" />
                  Crear una cuenta nueva
                </Button>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-1 pt-0">
              <div className="text-center text-[10px] text-muted-foreground">
                Al iniciar sesión, aceptas nuestros{" "}
                <Link
                  href="#"
                  className="underline underline-offset-2 hover:text-brand-pink"
                >
                  Términos de servicio
                </Link>{" "}
                y{" "}
                <Link
                  href="#"
                  className="underline underline-offset-2 hover:text-brand-pink"
                >
                  Política de privacidad
                </Link>
                .
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}