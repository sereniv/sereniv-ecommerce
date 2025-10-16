'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui'
import { FolderKanban, AlertCircle, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useUser } from '@/hooks/use-user'

const adminCards = [
  {
    title: 'Manage Products',
    description: 'View, edit, and manage all products',
    icon: FolderKanban,
    href: '/admin/products',
    iconColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
  },
]

function AdminPageSkeleton() {
  return (
    <div className="bg-white min-h-screen">
      {/* Header Skeleton */}
      <div className="bg-gray-50 py-12 border-b">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center space-y-3">
              <div className="h-10 w-64 mx-auto bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-96 max-w-full mx-auto bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </Container>
      </div>

      {/* Admin Cards Skeleton */}
      <div className="py-12">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card, index) => {
                const IconComponent = card.icon
                return (
                  <div
                    key={index}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${card.bgColor}`}>
                        <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-6 w-40 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="h-12 w-full bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                )
              })}
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}

function UnauthorizedAccess({ message }: { message: string }) {
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-6 bg-white shadow-lg border-2 border-gray-200 p-8 rounded-lg">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">{message}</p>
          </div>
        </div>
        <Button
          onClick={() => router.push('/')}
          className="w-full bg-gray-900 hover:bg-black text-white rounded-lg h-12 font-medium"
        >
          Return to Home
        </Button>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const { user, isLoading } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login')
      } else {
        setIsAdmin(user.role === 'ADMIN')
        setIsCheckingAuth(false)
      }
    }
  }, [user, isLoading, router])

  if (isLoading || isCheckingAuth) {
    return <AdminPageSkeleton />
  }

  if (!isAdmin) {
    return <UnauthorizedAccess message="You do not have permission to access the admin panel." />
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header Section */}
      <div className="py-12 border-b">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center space-y-3">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Welcome back, { user?.firstName + " " + user?.lastName || 'Admin'}. Manage your application settings and data.
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* Admin Cards Section */}
      <div className="py-12">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600">Select a section to manage</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {adminCards.map((card, index) => {
                const IconComponent = card.icon
                return (
                  <Link
                    key={index}
                    href={card.href}
                    className="group"
                  >
                    <Card className="border-2 border-gray-200 hover:border-gray-900 transition-all hover:shadow-lg h-full">
                      <CardHeader className="pb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${card.bgColor} group-hover:scale-110 transition-transform`}>
                            <IconComponent className={`h-6 w-6 ${card.iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg font-bold text-gray-900 mb-2 group-hover:text-gray-700">
                              {card.title}
                            </CardTitle>
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {card.description}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-gray-900 font-medium group-hover:text-gray-700">
                          <span>Go to section</span>
                          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </div>
        </Container>
      </div>

      {/* Stats Section (Optional - can be populated with real data) */}
      <div className="py-12 border-t">
        <Container>
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Total Products</div>
                <div className="text-3xl font-bold text-gray-900">--</div>
              </div>
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Active Products</div>
                <div className="text-3xl font-bold text-gray-900">--</div>
              </div>
              <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Featured Products</div>
                <div className="text-3xl font-bold text-gray-900">--</div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  )
}