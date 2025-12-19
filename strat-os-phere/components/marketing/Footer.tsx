import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <h3 className="mb-2 text-base font-semibold text-text-primary">
              Plinth
            </h3>
            <p className="text-sm text-text-secondary">
              A strategy workspace for finding unfair advantage.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Product
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#product"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="#outputs"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Outputs
                </Link>
              </li>
              <li>
                <Link
                  href="#how-it-works"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  How it works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-semibold text-text-primary">
              Legal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#privacy"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="#terms"
                  className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-border-subtle pt-8 text-center">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} Plinth · myplinth.com
          </p>
        </div>
      </div>
    </footer>
  )
}

