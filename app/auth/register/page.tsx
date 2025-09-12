import { RegisterForm } from "@/components/auth/RegisterForm"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      
      <main className="flex-1 flex">
        {/* Left Column - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600">
          <div className="absolute inset-0 bg-black/20"></div>
          <Image
            src="/images/city-background.jpg"
            alt="City nightlife"
            fill
            className="object-cover mix-blend-overlay"
          />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="text-3xl font-bold bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent mb-2">
                Donde salimos?
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-balance">¡Únete a nosotros!</h1>

            <p className="text-xl mb-8 text-purple-100 text-pretty">
              Crea tu cuenta y descubre los mejores lugares para salir
            </p>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                <span className="text-lg">Descubre lugares increíbles</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                <span className="text-lg">Gestiona tu negocio</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                <span className="text-lg">Conecta con la comunidad</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <RegisterForm />
          </div>
        </div>
      </main>
    </div>
  )
}
