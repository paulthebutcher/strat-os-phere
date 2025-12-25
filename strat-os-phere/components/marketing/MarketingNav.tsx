"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/Logo"

export function MarketingNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (href: string) => {
    if (href.startsWith("#")) {
      // For hash links, we can't easily detect active state without scroll position
      // So we'll just use hover states
      return false
    }
    return pathname === href
  }

  return (
    <nav 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 w-full pointer-events-none",
        "transition-all duration-200 ease-out"
      )}
    >
      <div 
        className={cn(
          "pointer-events-auto w-full",
          "flex h-16 items-center justify-center",
          "border-b transition-all duration-200 ease-out",
          isScrolled
            ? "bg-white/98 backdrop-blur-md border-border-subtle shadow-sm"
            : "bg-white/80 backdrop-blur-sm border-transparent"
        )}
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand Lockup - Improved spacing and sizing */}
          <Link 
            href="/" 
            className="hover:opacity-80 transition-opacity"
          >
            <Logo
              variant="lockup"
              size="md"
              priority
              showText={true}
              href={undefined}
              gap="gap-2.5"
              fontWeight="font-bold"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 md:flex">
            {/* Optional: Value hint pill */}
            <span className="hidden lg:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-text-secondary bg-surface-muted/60">
              Evidence-backed decisions
            </span>

            {/* Sign in as quiet text link */}
            <Link 
              href="/login"
              className="text-sm font-medium text-text-secondary hover:text-foreground underline-offset-4 hover:underline transition-colors duration-150"
            >
              Sign in
            </Link>

            {/* Try Plinth - Primary CTA */}
            <Link href="/new">
              <Button
                variant="brand"
                size="default"
                className="shadow-sm hover:shadow-md transition-all duration-200"
              >
                Try Plinth
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 -mr-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 text-text-primary" />
            ) : (
              <Menu className="h-5 w-5 text-text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div 
          className={cn(
            "md:hidden pointer-events-auto w-full",
            "bg-white/98 backdrop-blur-md border-b border-border-subtle shadow-sm",
            "transition-all duration-200 ease-out"
          )}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col gap-2">
            <Link
              href="/login"
              className="px-3 py-2.5 min-h-[44px] flex items-center text-sm font-medium text-text-secondary hover:text-foreground hover:bg-muted transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign in
            </Link>
            <Link href="/new" className="px-3 py-2" onClick={() => setMobileMenuOpen(false)}>
              <Button 
                variant="brand" 
                size="default" 
                className="w-full min-h-[44px] shadow-sm hover:shadow-md transition-all"
              >
                Try Plinth
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}

