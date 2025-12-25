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

        {/* Columns: Product / How it works / Trust / Company */}
        <div className="grid gap-6 sm:gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
          {/* Product */}
          <div>
            <h4 className={cn("mb-4 text-sm font-semibold", "text-text-primary")}>
              Product
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/product"
                  className={cn("text-sm min-h-[32px] flex items-center", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/product/evidence-ledger"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Evidence ledger
                </Link>
              </li>
              <li>
                <Link
                  href="/product/opportunity-ranking"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Opportunity ranking
                </Link>
              </li>
            </ul>
          </div>

          {/* How it works */}
          <div>
            <h4 className={cn("mb-4 text-sm font-semibold", "text-text-primary")}>
              How it works
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/how-plinth-thinks"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  How Plinth thinks
                </Link>
              </li>
              <li>
                <Link
                  href="/example"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Example
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works/collect"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Collect
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works/normalize"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Normalize
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works/rank"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Rank
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust */}
          <div>
            <h4 className={cn("mb-4 text-sm font-semibold", "text-text-primary")}>
              Trust
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/trust/citations"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Citations
                </Link>
              </li>
              <li>
                <Link
                  href="/trust/deterministic-scoring"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Deterministic scoring
                </Link>
              </li>
              <li>
                <Link
                  href="/trust/confidence"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Confidence
                </Link>
              </li>
              <li>
                <Link
                  href="/trust/security-privacy"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Security & privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className={cn("mb-4 text-sm font-semibold", "text-text-primary")}>
              Company
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link
                  href="/"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/trust"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  How Plinth Thinks
                </Link>
              </li>
              <li>
                <Link
                  href="/samples"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Example
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  FAQ
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
                  href="/login"
                  className={cn("text-sm", "text-text-secondary transition-colors hover:text-text-primary")}
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={cn("pt-6 sm:pt-8 border-t border-black/5")}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 text-center sm:text-left">
            <p className={cn("text-xs sm:text-sm", "text-text-muted")}>
              © {new Date().getFullYear()} Plinth · myplinth.com
            </p>
            <p className={cn("text-xs sm:text-sm", "text-text-muted")}>
              Built for VP+ Product, UX, and Strategy teams.
            </p>
            {/* Social links placeholder */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="#twitter"
                className={cn("text-xs sm:text-sm min-h-[44px] min-w-[44px] flex items-center justify-center", "text-text-secondary transition-colors hover:text-text-primary")}
              >
                Twitter
              </Link>
              <Link
                href="#linkedin"
                className={cn("text-xs sm:text-sm min-h-[44px] min-w-[44px] flex items-center justify-center", "text-text-secondary transition-colors hover:text-text-primary")}
              >
                LinkedIn
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

