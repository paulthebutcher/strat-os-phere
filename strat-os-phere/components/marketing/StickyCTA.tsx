"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export function StickyCTA() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past 400px (past hero)
      setIsVisible(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-opacity duration-300 opacity-100">
      <Link href="/new">
        <Button
          size="lg"
          className={cn(
            "shadow-lg hover:shadow-xl transition-all",
            "rounded-full px-6 py-3",
            "flex items-center gap-2"
          )}
        >
          Try Plinth
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

