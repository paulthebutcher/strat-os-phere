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
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Built for experienced strategists
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Designed to support VP+ decision-making workflows. Plinth gives you the clarity and defensibility you need to make hard calls with confidence.
        </p>
        <div className="mt-12">
          <div className="panel inline-block p-6 border-2 border-border-subtle">
            <p className="text-sm font-semibold uppercase tracking-wider text-text-muted md:text-base">
              Early access
            </p>
            <p className="mt-2 text-base text-text-secondary md:text-lg">
              Currently in early access. Built for Product/UX strategy professionals who need decision-ready outputs.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

