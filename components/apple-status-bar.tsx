"use client"

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export function AppleStatusBar() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const updateStatusBar = () => {
      document.querySelectorAll('meta[name="apple-mobile-web-app-status-bar-style"]').forEach(tag => tag.remove())
      document.querySelectorAll('meta[name="theme-color"]').forEach(tag => tag.remove())

      const bodyStyles = getComputedStyle(document.body)
      const backgroundColor = bodyStyles.backgroundColor

      const htmlElement = document.documentElement
      const isDarkClass = htmlElement.classList.contains('dark')
      const isDarkTheme = resolvedTheme === 'dark' || theme === 'dark'
      const isDarkComputed = backgroundColor.includes('rgb') && 
                            backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/) &&
                            parseInt(backgroundColor.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/)?.[1] || '255') < 50

      const isDarkMode = isDarkClass || isDarkTheme || isDarkComputed

      const statusBarMeta = document.createElement('meta')
      statusBarMeta.name = 'apple-mobile-web-app-status-bar-style'
      
      const themeColorMeta = document.createElement('meta')
      themeColorMeta.name = 'theme-color'

      if (isDarkMode) {
        statusBarMeta.content = '#242b2f'
        themeColorMeta.content = '#242b2f'
      } else {
        statusBarMeta.content = '#ffffff'
        themeColorMeta.content = '#ffffff'
      }

      document.head.appendChild(statusBarMeta)
      document.head.appendChild(themeColorMeta)

    }

    setTimeout(updateStatusBar, 100)

    const observer = new MutationObserver(() => {
      setTimeout(updateStatusBar, 100)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style']
    })

    return () => observer.disconnect()
  }, [theme, resolvedTheme, mounted])

  return null
} 