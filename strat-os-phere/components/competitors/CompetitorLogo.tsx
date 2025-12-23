'use client'

import { useState, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'

interface CompetitorLogoProps {
  domain?: string
  website?: string
  name: string
  size?: number
  className?: string
}

// In-memory cache to track logo load status per domain
// Map<domain, 'ok' | 'failed'>
const logoCache = new Map<string, 'ok' | 'failed'>()

// Get domain from website URL or use provided domain
function getDomain(website?: string, domain?: string): string | null {
  if (domain) {
    return domain.toLowerCase().replace(/^www\./, '')
  }
  if (website) {
    try {
      const url = new URL(website.startsWith('http') ? website : `https://${website}`)
      return url.hostname.replace(/^www\./, '').toLowerCase()
    } catch {
      return null
    }
  }
  return null
}

// Generate initials from company name
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase()
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase()
}

// Generate logo URLs in priority order
function getLogoUrls(domain: string): string[] {
  return [
    `https://logo.clearbit.com/${domain}`,
    `https://www.google.com/s2/favicons?domain=${domain}&sz=128`,
  ]
}

export function CompetitorLogo({
  domain: domainProp,
  website,
  name,
  size = 32,
  className,
}: CompetitorLogoProps) {
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [hasError, setHasError] = useState(false)
  const [logoUrls, setLogoUrls] = useState<string[]>([])

  const normalizedDomain = useMemo(() => getDomain(website, domainProp), [website, domainProp])
  const cachedStatus = normalizedDomain ? logoCache.get(normalizedDomain) : null

  // Initialize logo URLs based on domain
  useEffect(() => {
    if (!normalizedDomain) {
      setHasError(true)
      return
    }

    // If we know this domain failed, skip trying
    if (cachedStatus === 'failed') {
      setHasError(true)
      return
    }

    const urls = getLogoUrls(normalizedDomain)
    setLogoUrls(urls)
    setCurrentUrlIndex(0)
    setHasError(false)
  }, [normalizedDomain, cachedStatus])

  const handleError = () => {
    if (!normalizedDomain) {
      return
    }

    // Try next URL if available
    if (currentUrlIndex < logoUrls.length - 1) {
      setCurrentUrlIndex(currentUrlIndex + 1)
    } else {
      // All URLs failed - mark in cache and show fallback
      logoCache.set(normalizedDomain, 'failed')
      setHasError(true)
    }
  }

  const handleLoad = () => {
    if (normalizedDomain) {
      logoCache.set(normalizedDomain, 'ok')
    }
  }

  // Show fallback (initials avatar) if no domain or all URLs failed
  if (!normalizedDomain || hasError) {
    const initials = getInitials(name)
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium flex-shrink-0',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.4 }}
      >
        {initials}
      </div>
    )
  }

  const currentUrl = logoUrls[currentUrlIndex]
  if (!currentUrl) {
    return null
  }

  return (
    <img
      src={currentUrl}
      alt={`${name} logo`}
      className={cn('rounded flex-shrink-0', className)}
      style={{ width: size, height: size }}
      onError={handleError}
      onLoad={handleLoad}
      referrerPolicy="no-referrer"
      loading="lazy"
    />
  )
}

