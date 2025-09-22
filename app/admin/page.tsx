'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui'
import { FolderKanban, AlertCircle } from 'lucide-react'
import Link from 'next/link'

const adminCards = [
  {
    title: 'Manage Products',
    description: 'View, edit, and manage all products',
    icon: FolderKanban,
    href: '/admin/products',
    iconColor: 'text-gray-600',
  },
]

function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-16">
        <div className="mx-auto space-y-16">
          {/* Header Section Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-8 w-64 mx-auto bg-gray-200 rounded animate-pulse"></div>
            <div className="h-5 w-96 max-w-full mx-auto bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Admin Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {adminCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                      <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                  <div className="mt-4 h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                </div>
              )
            })}
          </div>
        </div>
      </Container>

      {/* Custom Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

function UnauthorizedAccess({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div
        className="max-w-md w-full space-y-6 bg-white shadow-sm border border-gray-200 p-6 rounded-lg"
      >
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="h-6 w-6" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        </div>
        <p className="text-gray-600">{message}</p>
        <Button
          onClick={() => router.push('/')}
          className="w-full bg-gray-900 hover:bg-black text-white rounded-full px-8 py-3"
        >
          Return to Home
        </Button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  // const { user, isLoading } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // useEffect(() => {
  //   if (!isLoading) {
  //     if (!user) {
  //       router.push('/login')
  //     } else {
  //       setIsAdmin(user.role === 'ADMIN')
  //       setIsCheckingAuth(false)
  //     }
  //   }
  // }, [user, isLoading, router])

  // if (isLoading || isCheckingAuth) {
  //   return <AdminPageSkeleton />
  // }

  if (!isAdmin) {
    return <UnauthorizedAccess message="You do not have permission to access the admin panel." />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Container className="py-16">
        <div className="mx-auto space-y-16">
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-light tracking-tighter text-gray-900">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Welcome back, manage your application settings and data.
            </p>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {adminCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <div
                  key={index}
                  className="group p-6 rounded-lg bg-white shadow-sm hover:shadow-lg transition-shadow border border-gray-200"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gray-100 border border-gray-200">
                        <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button
                      asChild
                      className="w-full bg-gray-900 hover:bg-black text-white rounded-full px-8 py-3"
                    >
                      <Link href={card.href}>{card.title}</Link>
                    </Button>
                  </CardContent>
                </div>
              )
            })}
          </div>
        </div>
      </Container>
    </div>
  )
}