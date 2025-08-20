"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, } from "@/components/ui/card";
import { UserPlus } from "lucide-react";
import { GoogleLogin, CredentialResponse, } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";


export default function LoginForm() {
  const { loginWithGoogleIdToken, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleSuccess = async (resp: CredentialResponse) => {
    try {
      if (!resp.credential) throw new Error("No se recibió el token de Google");
      await loginWithGoogleIdToken(resp.credential);

    } catch (e: any) {
      toast({ title: "Error", description: e?.message ?? "No se pudo iniciar sesión", variant: "destructive" });
    }
  
  };

  const handleCreateAccount = () => {
    router.push("/auth/register");
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
              <div className="space-y-3">
                <GoogleLogin
                  onSuccess={handleSuccess}
                  onError={() => toast({ title: "Error", description: "Google Login falló" })}
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