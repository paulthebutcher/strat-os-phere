/**
 * Footer Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import Link from "next/link"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"

export function Footer() {
  return (
    <footer className={cn("border-t border-border-subtle", brand.surface.muted)}>
      <div className="mx-auto max-w-[1200px] px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className={cn("mb-4", brand.typeScale.subhead, "text-text-primary")}>
              Plinth
            </h3>
            <p className={cn("max-w-md", brand.typeScale.body, "text-text-secondary")}>
              A decision engine for senior Product/UX strategy. Turn competitor signals into decision-ready outputs.
            </p>
          </div>
          <div>
            <h4 className={cn("mb-6", brand.typeScale.label, "text-text-primary")}>
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#product"
                  className={cn(brand.typeScale.body, "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#outputs"
                  className={cn(brand.typeScale.body, "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Outputs
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className={cn(brand.typeScale.body, "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className={cn("mb-6", brand.typeScale.label, "text-text-primary")}>
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#privacy"
                  className={cn(brand.typeScale.body, "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className={cn(brand.typeScale.body, "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className={cn("mt-12 border-t border-border-subtle pt-8 text-center")}>
          <p className={cn(brand.typeScale.metadata)}>
            © {new Date().getFullYear()} Plinth · myplinth.com
          </p>
        </div>
      </div>
    </footer>
  )
}

