/**
 * Footer Section
 * 
 * Design tokens used:
 * - surface-muted: Footer background
 * - border-subtle: Border color for separation
 * - text-text-secondary: Link colors
 * - text-text-primary: Heading and hover states
 * 
 * Enhanced with better spacing, text sizing, and link grouping.
 */
import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="mb-4 text-xl font-semibold text-text-primary">
              Plinth
            </h3>
            <p className="max-w-md text-base leading-relaxed text-text-secondary">
              A strategy workspace for finding unfair advantage.
            </p>
          </div>
          <div>
            <h4 className="mb-6 text-base font-semibold text-text-primary">
              Product
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#product"
                  className="text-base text-text-secondary transition-colors hover:text-text-primary"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#outputs"
                  className="text-base text-text-secondary transition-colors hover:text-text-primary"
                >
                  Outputs
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-base text-text-secondary transition-colors hover:text-text-primary"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 text-base font-semibold text-text-primary">
              Legal
            </h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="#privacy"
                  className="text-base text-text-secondary transition-colors hover:text-text-primary"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-base text-text-secondary transition-colors hover:text-text-primary"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 border-t border-border-subtle pt-8 text-center">
          <p className="text-sm text-text-muted">
            © {new Date().getFullYear()} Plinth · myplinth.com
          </p>
        </div>
      </div>
    </footer>
  )
}

