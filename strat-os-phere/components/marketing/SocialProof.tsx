/**
 * Social Proof Section
 * 
 * Design tokens used:
 * - panel: Card styling for testimonials
 * - surface-muted: Logo placeholder background
 * - accent-primary: Avatar placeholder background
 * 
 * Enhanced with avatar placeholders and improved testimonial card styling.
 */
export function SocialProof() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Trusted by logos placeholder */}
        <div className="mb-20 text-center">
          <p className="mb-10 text-sm font-semibold uppercase tracking-wider text-text-muted md:text-base">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex h-16 w-40 items-center justify-center rounded-lg border border-border-subtle bg-surface-muted opacity-60 transition-opacity hover:opacity-100"
              >
                <span className="text-xs font-medium text-text-muted">[Logo {i}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials placeholder */}
        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="panel p-8 transition-shadow hover:shadow-md">
              <p className="mb-6 text-base leading-relaxed text-text-secondary md:text-lg">
                "[Testimonial {i} placeholder: Short quote from a customer about their experience with Plinth]"
              </p>
              <div className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-primary/10">
                  <span className="text-sm font-semibold text-accent-primary">
                    {String.fromCharCode(64 + i)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary md:text-base">
                    [Name {i}]
                  </p>
                  <p className="text-xs text-text-muted md:text-sm">
                    [Title {i}], [Company {i}]
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

