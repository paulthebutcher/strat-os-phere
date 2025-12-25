/**
 * Footer Section
 * 
 * Enhanced multi-column footer with Product, How it works, Trust, and Company sections.
 * Includes security/privacy links, positioning line, and social links.
 */
import Link from "next/link"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/Logo"

export function Footer() {
  return (
    <footer className={cn("border-t border-black/5 bg-slate-50/60")}>
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20">
        {/* Top: Logo + positioning */}
        <div className="mb-8 sm:mb-12">
          <div className={cn("mb-3 sm:mb-4", brand.typeScale.subhead, "text-text-primary")}>
            <Logo variant="lockup" size="md" />
          </div>
          <p className={cn("max-w-md text-sm sm:text-base", "text-text-secondary")}>
            Built for senior Product, UX, and Strategy teams. Turn competitor signals into decision-ready outputs.
          </p>
        </div>

        {/* Links: Privacy, Terms, Contact */}
        <div className="mb-8 sm:mb-12">
          <ul className="flex flex-wrap gap-4 sm:gap-6">
            <li>
              <Link
                href="/privacy"
                className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
              >
                Privacy
              </Link>
            </li>
            <li>
              <Link
                href="/terms"
                className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
              >
                Terms
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
              >
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Bottom bar */}
        <div className={cn("pt-6 sm:pt-8 border-t border-black/5")}>
          <p className={cn("text-xs sm:text-sm text-center", "text-text-muted")}>
            © {new Date().getFullYear()} Plinth
          </p>
        </div>
      </div>
    </footer>
  )
}

