"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchIcon, MapPinIcon, StarIcon, TrendingUpIcon, CalendarIcon, TagIcon, UsersIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { UserDropdown } from "@/components/auth/UserDropdown"

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <header className="w-full py-4 px-6 bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-donde-salimos.png"
              alt="Donde Salimos Logo"
              width={150}
              height={50}
              className="h-10 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              // Mostrar loading mientras verifica autenticación
              <div className="flex items-center gap-2">
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ) : isAuthenticated ? (
              // Usuario autenticado - mostrar dropdown
              <UserDropdown />
            ) : (
              // Usuario no autenticado - mostrar botones de login/registro
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-brand-pink text-brand-pink hover:bg-brand-pink/10">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-brand-gradient hover:opacity-90 transition-opacity">Registrarse</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-20 bg-brand-gradient text-white">
        <div className="container mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">Descubre los mejores lugares para salir</h1>
            <p className="text-lg md:text-xl opacity-90">
              Donde Salimos te ayuda a encontrar bares, boliches y restaurantes según tus preferencias, con
              recomendaciones basadas en opiniones reales y la mejor información para decidir dónde pasar tu tiempo.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                // Usuario autenticado - mostrar botón al dashboard
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-brand-pink hover:bg-gray-100">
                    Ir al Dashboard
                  </Button>
                </Link>
              ) : (
                // Usuario no autenticado - mostrar botones de registro/login
                <>
                  <Link href="/auth/register">
                    <Button size="lg" className="w-full sm:w-auto bg-white text-brand-pink hover:bg-gray-100">
                      Registrarme
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto border-white bg-transparent text-white hover:bg-white hover:text-brand-pink"
                    >
                      Iniciar Sesión
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <Image
              src="/vibrant-bar-scene.png"
              alt="Personas disfrutando en un bar"
              width={500}
              height={400}
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Para Usuarios */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-gradient">Beneficios para Usuarios</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <SearchIcon className="h-10 w-10 text-brand-pink mb-2" />
                <CardTitle>Encuentra tu lugar ideal</CardTitle>
                <CardDescription>
                  Filtra por tipo de gastronomía, música, ambiente o precios para encontrar exactamente lo que buscas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Accede a información detallada, horarios, promociones y eventos especiales de cada lugar.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <StarIcon className="h-10 w-10 text-brand-pink mb-2" />
                <CardTitle>Rankings y Opiniones</CardTitle>
                <CardDescription>
                  Descubre los lugares mejor valorados según las opiniones reales de otros usuarios.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Comparte tus experiencias y ayuda a otros a tomar mejores decisiones sobre dónde salir.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CalendarIcon className="h-10 w-10 text-brand-pink mb-2" />
                <CardTitle>Reservas Simplificadas</CardTitle>
                <CardDescription>
                  Reserva mesas directamente desde la plataforma sin llamadas telefónicas ni complicaciones.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Recibe confirmaciones inmediatas y gestiona todas tus reservas en un solo lugar.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Para Comercios */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-brand-gradient">Para Dueños de Bares y Boliches</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <MapPinIcon className="h-10 w-10 text-brand-purple mb-2" />
                <CardTitle>Mayor Visibilidad</CardTitle>
                <CardDescription>
                  Promociona tu local y destácate entre la competencia llegando a miles de potenciales clientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Actualiza tu perfil con fotos, descripciones, menús y toda la información relevante de tu local.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TrendingUpIcon className="h-10 w-10 text-brand-purple mb-2" />
                <CardTitle>Análisis y Métricas</CardTitle>
                <CardDescription>
                  Recibe datos y estadísticas sobre tu desempeño para tomar decisiones informadas.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Conoce las preferencias de tus clientes y optimiza tu oferta para aumentar tu competitividad.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <TagIcon className="h-10 w-10 text-brand-purple mb-2" />
                <CardTitle>Promociones y Publicidad</CardTitle>
                <CardDescription>
                  Crea promociones especiales y publicita eventos para atraer más clientes a tu local.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gestiona reservas, eventos especiales y fideliza a tus clientes con ofertas personalizadas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Características */}
      <section className="py-16 bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-14 text-brand-gradient">Características Principales</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="space-y-12">
              <div className="flex items-start gap-4">
                <div className="bg-brand-pink/10 dark:bg-brand-pink/20 p-3 rounded-lg">
                  <SearchIcon className="h-6 w-6 text-brand-pink dark:text-brand-light-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Búsqueda Avanzada</h3>
                  <p className="text-muted-foreground">
                    Encuentra lugares por ubicación, tipo de música, gastronomía, precios o ranking.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-pink/10 dark:bg-brand-pink/20 p-3 rounded-lg">
                  <StarIcon className="h-6 w-6 text-brand-pink dark:text-brand-light-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sistema de Valoraciones</h3>
                  <p className="text-muted-foreground">
                    Lee opiniones y calificaciones detalladas de otros usuarios sobre cada establecimiento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-pink/10 dark:bg-brand-pink/20 p-3 rounded-lg">
                  <CalendarIcon className="h-6 w-6 text-brand-pink dark:text-brand-light-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Reservas en Tiempo Real</h3>
                  <p className="text-muted-foreground">
                    Reserva mesas y eventos con confirmación inmediata sin salir de la plataforma.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-12">
              <div className="flex items-start gap-4">
                <div className="bg-brand-purple/10 dark:bg-brand-purple/20 p-3 rounded-lg">
                  <TagIcon className="h-6 w-6 text-brand-purple dark:text-brand-light-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Promociones Exclusivas</h3>
                  <p className="text-muted-foreground">
                    Accede a descuentos y promociones especiales disponibles solo para usuarios registrados.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-purple/10 dark:bg-brand-purple/20 p-3 rounded-lg">
                  <UsersIcon className="h-6 w-6 text-brand-purple dark:text-brand-light-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Comunidad Activa</h3>
                  <p className="text-muted-foreground">
                    Comparte experiencias, fotos y recomendaciones con otros miembros de la comunidad.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-brand-purple/10 dark:bg-brand-purple/20 p-3 rounded-lg">
                  <TrendingUpIcon className="h-6 w-6 text-brand-purple dark:text-brand-light-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Tendencias y Rankings</h3>
                  <p className="text-muted-foreground">
                    Descubre los lugares de moda y los mejor valorados en tu ciudad o zona preferida.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-brand-gradient text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            {isAuthenticated ? "¡Bienvenido de vuelta!" : "¿Listo para descubrir nuevos lugares?"}
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            {isAuthenticated
              ? "Explora nuevos lugares, gestiona tus reservas y descubre las mejores experiencias."
              : "Únete a nuestra comunidad y comienza a disfrutar de las mejores experiencias en bares, boliches y restaurantes."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto bg-white text-brand-pink hover:bg-gray-100">
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/register">
                  <Button size="lg" className="w-full sm:w-auto bg-white text-brand-pink hover:bg-gray-100">
                    Crear una cuenta
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto border-white bg-transparent text-white hover:bg-white hover:text-brand-pink"
                  >
                    Iniciar Sesión
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Image
                  src="/logo-donde-salimos.png"
                  alt="Donde Salimos Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
              </div>
              <p className="text-gray-300">
                Tu guía definitiva para descubrir los mejores lugares para salir en tu ciudad.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/landing" className="text-gray-300 hover:text-white">
                    Inicio
                  </Link>
                </li>
                {isAuthenticated ? (
                  <li>
                    <Link href="/dashboard" className="text-gray-300 hover:text-white">
                      Dashboard
                    </Link>
                  </li>
                ) : (
                  <>
                    <li>
                      <Link href="/auth/login" className="text-gray-300 hover:text-white">
                        Iniciar Sesión
                      </Link>
                    </li>
                    <li>
                      <Link href="/auth/register" className="text-gray-300 hover:text-white">
                        Registrarse
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-300 hover:text-white">
                    Soporte
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2">
                <li className="text-gray-300">info@dondesalimos.com</li>
                <li className="text-gray-300">+123 456 7890</li>
                <li className="text-gray-300">Ciudad, País</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 Donde Salimos. Todos los derechos reservados.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-400 hover:text-white">
                Términos
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Privacidad
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}