'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getApiUrl } from '@/lib/utils'
import { Mail, Lock, Shield, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginPageSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
      </div>
      
      <div className="max-w-md w-full">
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16" />
          
          <CardHeader className="space-y-4 text-center pb-8">
            <div className="h-8 w-48 bg-muted-foreground/10 rounded-lg mx-auto shimmer"></div>
            <div className="h-4 w-64 bg-muted-foreground/10 rounded mx-auto shimmer"></div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="h-12 w-full bg-muted-foreground/10 rounded-lg shimmer"></div>
              <div className="h-12 w-full bg-muted-foreground/10 rounded-lg shimmer"></div>
            </div>
            <div className="h-12 w-full bg-muted-foreground/10 rounded-lg shimmer"></div>
          </CardContent>
          
          <CardFooter className="border-t py-6">
            <div className="h-4 w-32 bg-muted-foreground/10 rounded mx-auto shimmer"></div>
          </CardFooter>
        </Card>
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
  )
}

function AdminLoginPageContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const emailParam = searchParams.get('email')
        const passwordParam = searchParams.get('password')

        if (emailParam && passwordParam) {
            setEmail(emailParam)
            setPassword(passwordParam)
            handleLogin(emailParam, passwordParam)
        }
    }, [searchParams])

    if (!mounted) {
        return <LoginPageSkeleton />
    }

    const handleLogin = async (emailValue: string, passwordValue: string) => {
        setIsLoading(true)
        setError('')

        try {
            const response = await fetch(getApiUrl('/admin/login'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailValue, password: passwordValue }),
            })

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(errorText || 'Invalid credentials')
            }

            // Add a small delay for better UX
            setTimeout(() => {
                router.push('/admin/entities')
            }, 500)
        } catch (error) {
            console.error('Login error:', error)
            setError(error instanceof Error ? error.message : 'Failed to login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await handleLogin(email, password)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-background to-orange-50/50 dark:from-gray-950 dark:via-background dark:to-gray-950/50 py-8 px-4 sm:px-6 lg:px-8">
            {/* Background Pattern */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#fed7aa_1px,transparent_1px),linear-gradient(to_bottom,#fed7aa_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] dark:bg-[linear-gradient(to_right,#431407_1px,transparent_1px),linear-gradient(to_bottom,#431407_1px,transparent_1px)]" />
            </div>
            
            {/* Animated background elements */}
            <div className="fixed top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-32 translate-x-32 transition-transform duration-1000 opacity-60 pointer-events-none" />
            <div className="fixed bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full translate-y-24 -translate-x-24 transition-transform duration-1000 opacity-60 pointer-events-none" />
            
            <div className="max-w-md w-full relative">
                <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md transition-all duration-700 hover:shadow-2xl hover:shadow-orange-500/20 dark:hover:shadow-orange-400/10 shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-300/5 opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
                    
                    {/* Animated background elements */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-transparent rounded-full -translate-y-16 translate-x-16 transition-transform duration-1000 group-hover:scale-150" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-400/10 to-transparent rounded-full translate-y-12 -translate-x-12 transition-transform duration-1000 group-hover:scale-150" />
                    
                    <CardHeader className="relative space-y-4 text-center pb-8">
                        <div className="flex justify-center mb-4">
                            <div className="relative p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/10 backdrop-blur-sm border border-orange-500/20 shadow-lg">
                                <Shield className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent" />
                            </div>
                        </div>
                        <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 dark:from-orange-400 dark:to-orange-300 bg-clip-text text-transparent">
                            Admin Login
                        </CardTitle>
                        <p className="text-center text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
                            Enter your credentials to access the admin dashboard
                        </p>
                    </CardHeader>
                    
                    <CardContent className="relative space-y-6">
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        className="pl-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                                        placeholder="Email address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400 transition-colors duration-200" />
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        required
                                        className="pl-12 pr-12 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-300"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-5 w-5 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200" />
                                        ) : (
                                            <Eye className="h-5 w-5 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors duration-200" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 rounded-lg p-3 backdrop-blur-sm">
                                    <p className="text-sm text-red-700 dark:text-red-300">
                                        {error}
                                    </p>
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={isLoading || !email || !password}
                                className="w-full h-12 text-base font-medium bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 border-0 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Signing in...
                                    </div>
                                ) : (
                                    'Sign in'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                    
                    <CardFooter className="relative flex justify-center border-t border-border/50 py-6 bg-gradient-to-br from-background/60 to-background/30 backdrop-blur-sm">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Secure admin access only
                        </p>
                    </CardFooter>
                </Card>
                
                {/* Additional Security Notice */}
                <div className="mt-6 text-center">
                    <p className="text-xs text-muted-foreground bg-card/50 backdrop-blur-sm rounded-lg px-4 py-2 border border-border/50">
                        This is a restricted area. All access attempts are logged and monitored.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function AdminLoginPage() {
    return (
        <Suspense fallback={<LoginPageSkeleton />}>
            <AdminLoginPageContent />
        </Suspense>
    )
}