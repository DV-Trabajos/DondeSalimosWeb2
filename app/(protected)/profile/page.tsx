"use client"

import { ProfileForm } from "@/components/auth/ProfileForm"
import { useAuth } from "@/contexts/AuthContext"
import { Loader2 } from "lucide-react"

export default function ProfilePage() {
  const { isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>
      <ProfileForm />
    </div>
  )
}
