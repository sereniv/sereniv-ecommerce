'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Building, Shield, Users, Database, Loader2, Link } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'


function AdminPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header Skeleton */}
          <div className="text-center space-y-4">
            <div className="h-12 w-64 bg-muted-foreground/10 rounded-lg mx-auto shimmer"></div>
            <div className="h-6 w-96 bg-muted-foreground/10 rounded mx-auto shimmer"></div>
          </div>

          {/* Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Array(4).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-muted-foreground/10 rounded-xl shimmer"></div>
                    <div className="space-y-2">
                      <div className="h-6 w-32 bg-muted-foreground/10 rounded shimmer"></div>
                      <div className="h-4 w-48 bg-muted-foreground/10 rounded shimmer"></div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-10 w-full bg-muted-foreground/10 rounded-lg shimmer"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <style jsx global>{`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          
          .shimmer {
            background: linear-gradient(90deg, var(--shimmer-start, rgba(0,0,0,0.05)) 25%, var(--shimmer-mid, rgba(0,0,0,0.07)) 50%, var(--shimmer-end, rgba(0,0,0,0.05)) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
          }
          
          .dark .shimmer {
            --shimmer-start: hsl(0 0% 4%);
            --shimmer-mid: hsl(0 0% 7%);
            --shimmer-end: hsl(0 0% 4%);
          }
        `}</style>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const adminEmail = localStorage.getItem('adminEmail')
      const adminPassword = localStorage.getItem('adminPassword')

      if (adminEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL && 
          adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
        setIsAuthenticated(true)
        // Don't redirect immediately, show the dashboard
      } else {
        router.push('/admin/login')
        return
      }
      
      setTimeout(() => {
        setIsLoading(false)
      }, 1000) // Show loading for better UX
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return <AdminPageSkeleton />
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  const adminCards = [
    {
      title: 'Manage Entities',
      description: 'View, edit, and manage all entities in the system',
      icon: Database,
      href: '/admin/entities',
      color: 'from-blue-500/20 to-blue-600/10',
      iconColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Manage Pages',
      description: 'Edit and update website pages content',
      icon: Building,
      href: '/admin/pages',
      color: 'from-green-500/20 to-green-600/10',
      iconColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Create Entity',
      description: 'Add new entities to the system',
      icon: Users,
      href: '/admin/create-entity',
      color: 'from-purple-500/20 to-purple-600/10',
      iconColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'System Settings',
      description: 'Configure system settings and preferences',
      icon: Shield,
      href: '/admin/settings',
      color: 'from-orange-500/20 to-orange-600/10',
      iconColor: 'text-orange-600 dark:text-orange-400'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto space-y-8 sm:space-y-12">
          {/* Header Section */}
          <div className="text-center space-y-4 sm:space-y-6">
            <div className="relative">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 opacity-60 pointer-events-none" />
            </div>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Manage your organization's Bitcoin treasury data and system settings
            </p>
          </div>

          {/* Admin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 sm:gap-8">
            {adminCards.map((card, index) => {
              const IconComponent = card.icon
              return (
                <Card key={index} className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 transition-opacity duration-700 group-hover:opacity-100`} />
                  
                  {/* Animated background elements */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-12 translate-x-12 transition-transform duration-1000 group-hover:scale-150" />
                  <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full translate-y-8 -translate-x-8 transition-transform duration-1000 group-hover:scale-150" />
                  
                  <CardHeader className="relative pb-4">
                    <div className="flex items-start gap-4">
                      <div className={`relative p-3 rounded-xl bg-gradient-to-br ${card.color} backdrop-blur-sm border border-border/50 transition-transform duration-500 group-hover:scale-110`}>
                        <IconComponent className={`h-6 w-6 sm:h-7 sm:w-7 ${card.iconColor} transition-colors duration-300`} />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                          {card.title}
                        </CardTitle>
                        <p className="text-sm sm:text-base text-muted-foreground mt-2 group-hover:text-foreground/80 transition-colors duration-300">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative pt-0">
                    <Button 
                      asChild 
                      className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      <Link href={card.href}>
                        Access {card.title}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Stats */}
          <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-300/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            
            <CardHeader className="relative text-center">
              <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                System Status
              </CardTitle>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl sm:text-4xl font-bold text-green-600 dark:text-green-400">
                    ●
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">System Online</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-foreground">
                    24/7
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Monitoring Active</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400">
                    99.9%
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}