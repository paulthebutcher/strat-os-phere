export function SocialProof() {
  return (
    <section className="border-t border-border mx-auto max-w-5xl px-4 py-20 md:py-24">
      <div className="mx-auto max-w-3xl space-y-12">
        {/* Trusted by logos placeholder */}
        <div className="text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Trusted by
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex h-12 w-32 items-center justify-center border border-border bg-surface opacity-50"
              >
                <span className="text-xs text-muted-foreground">[Logo {i}]</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

