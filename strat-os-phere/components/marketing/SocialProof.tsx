export function SocialProof() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-20">
      <div className="mx-auto max-w-4xl">
        {/* Trusted by logos placeholder */}
        <div className="mb-16 text-center">
          <p className="mb-8 text-sm font-medium uppercase tracking-wide text-text-muted">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex h-12 w-32 items-center justify-center rounded-md border border-border-subtle bg-surface-muted"
              >
                <span className="text-xs text-text-muted">[Logo {i}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials placeholder */}
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="panel p-6">
              <p className="mb-4 text-sm text-text-secondary leading-relaxed">
                "[Testimonial {i} placeholder: Short quote from a customer about their experience with Plinth]"
              </p>
              <div className="mt-4">
                <p className="text-sm font-semibold text-text-primary">
                  [Name {i}]
                </p>
                <p className="text-xs text-text-muted">
                  [Title {i}], [Company {i}]
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

