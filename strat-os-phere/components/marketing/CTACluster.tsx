/**
 * CTACluster
 * 
 * Reusable CTA button cluster with primary and secondary actions.
 * Mobile-responsive: full-width buttons on mobile, inline on desktop.
 * Ensures minimum tap target size (44px).
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface CTAClusterProps {
  primary: {
    label: string
    href: string
  }
  secondary?: {
    label: string
    href: string
  }
  className?: string
  align?: "left" | "center" | "right"
}

export function CTACluster({
  primary,
  secondary,
  className,
  align = "center",
}: CTAClusterProps) {
  const alignClasses = {
    left: "items-start",
    center: "items-center",
    right: "items-end",
  }

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row gap-3 sm:gap-4",
        alignClasses[align],
        className
      )}
    >
      <Link href={primary.href} className="w-full sm:w-auto">
        <Button size="lg" variant="brand" className="w-full sm:w-auto min-h-[44px]">
          {primary.label}
        </Button>
      </Link>
      {secondary && (
        <Link href={secondary.href} className="w-full sm:w-auto">
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto min-h-[44px]"
          >
            {secondary.label}
          </Button>
        </Link>
      )}
    </div>
  )
}

