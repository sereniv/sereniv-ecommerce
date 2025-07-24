"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className={cn(
        "relative h-10 w-10 sm:h-11 sm:w-11 rounded-xl border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/50 dark:to-orange-900/30 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 touch-manipulation",
        "hover:from-orange-100 hover:to-orange-200/50 dark:hover:from-orange-900/70 dark:hover:to-orange-800/40",
        "focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-background"
      )}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 text-orange-600 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 text-orange-400 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
} 