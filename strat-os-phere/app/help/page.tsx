import Link from 'next/link'
import type { Metadata } from 'next'
import { Collapsible } from '@/components/ui/collapsible'
import { createPageMetadata } from '@/lib/seo/metadata'

export async function generateMetadata(): Promise<Metadata> {
  return createPageMetadata({
    title: "Help — Plinth",
    description: "Get help with Plinth: getting started, how evidence works, common issues, and debug utilities.",
    path: "/help",
    ogVariant: "default",
    robots: {
      index: false,
      follow: false,
    },
    canonical: false,
  });
}

export default async function HelpPage() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-3xl flex-col gap-8 py-12">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-foreground">Help</h1>
          <p className="text-sm text-muted-foreground">
            Quick reference for using Plinth and troubleshooting common issues.
          </p>
        </header>

        {/* Getting Started */}
        <section id="getting-started" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">Getting started</h2>
          <div className="panel p-6 space-y-3">
            <ol className="space-y-2 text-sm text-foreground list-decimal list-inside">
              <li><span className="font-medium">Create a project</span> — Name your competitive analysis project</li>
              <li><span className="font-medium">Add competitors</span> — Add 3–7 competitors with public website text</li>
              <li><span className="font-medium">Generate analysis</span> — Plinth analyzes signals and generates insights</li>
              <li><span className="font-medium">Review opportunities</span> — Explore strategic bets, opportunities, and scorecard</li>
            </ol>
          </div>
        </section>

        {/* What Plinth Does */}
        <section id="what-plinth-does" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">What Plinth does</h2>
          <div className="panel p-6 space-y-3">
            <ul className="space-y-2 text-sm text-foreground list-disc list-inside">
              <li>Analyzes publicly available information from competitors (marketing sites, pricing, changelogs, docs, reviews)</li>
              <li>Identifies customer jobs to be done and where current solutions fall short</li>
              <li>Generates defensible opportunities ranked by impact, effort, and competitive moat</li>
              <li>Creates strategic bets with explicit tradeoffs and falsifiable experiments</li>
              <li>Evaluates competitors on key criteria that matter to buyers</li>
            </ul>
          </div>
        </section>

        {/* Competitors Section Anchor */}
        <div id="competitors" className="scroll-mt-4"></div>

        {/* How Evidence Works */}
        <section id="evidence" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">How evidence works</h2>
          <div className="panel p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Public sources used</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Marketing websites (homepage, pricing, trust pages)</li>
                <li>Product changelogs and release notes</li>
                <li>Documentation and help centers</li>
                <li>Public reviews and testimonials</li>
                <li>Job postings and hiring signals</li>
                <li>Status pages and public communications</li>
              </ul>
            </div>
            <div className="space-y-2 pt-3 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Recency window</h3>
              <p className="text-sm text-muted-foreground">
                Insights are derived from publicly available information from the past 90 days. Signals updated recently are weighted higher in confidence scores.
              </p>
            </div>
          </div>
        </section>

        {/* Results Section Anchor */}
        <div id="results" className="scroll-mt-4"></div>

        {/* Privacy Guardrails */}
        <section id="privacy" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">Privacy guardrails</h2>
          <div className="panel p-6">
            <p className="text-sm text-foreground">
              <span className="font-semibold">Don't paste confidential information.</span> Plinth analyzes publicly available information only. Do not paste internal documents, private roadmaps, or confidential data into competitor evidence fields.
            </p>
          </div>
        </section>

        {/* Common Issues & Fixes */}
        <section id="common-issues" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">Common issues & fixes</h2>
          <div className="panel p-6 space-y-4">
            <Collapsible title="Magic link sends you to wrong domain" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  This usually happens when the magic link was generated on a different domain (e.g., localhost vs production). 
                </p>
                <p className="font-medium text-foreground">Fix:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Request a new magic link from the correct domain</li>
                  <li>Check that you're accessing Plinth from the expected URL</li>
                  <li>Clear browser cookies if the issue persists</li>
                </ul>
              </div>
            </Collapsible>

            <Collapsible title="Login loops / code exchange failed" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Authentication code exchange can fail due to expired links, network issues, or browser cookie problems.
                </p>
                <p className="font-medium text-foreground">Fix:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Request a fresh magic link (they expire after a short time)</li>
                  <li>Check your browser's cookie settings and allow cookies for this site</li>
                  <li>Try a different browser or incognito mode</li>
                  <li>Check the <Link href="/api/whoami" className="text-primary underline hover:text-primary/80">auth debug endpoint</Link> to verify your session</li>
                </ul>
              </div>
            </Collapsible>

            <Collapsible title="Generate evidence errors" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Evidence generation can fail if the source URL is inaccessible, requires authentication, or returns unexpected content.
                </p>
                <p className="font-medium text-foreground">Fix:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Verify the URL is publicly accessible (no login required)</li>
                  <li>Check that the URL returns HTML content (not a redirect or error page)</li>
                  <li>Try pasting the content directly instead of using URL extraction</li>
                  <li>Ensure the URL uses HTTPS and is not blocked by CORS</li>
                </ul>
              </div>
            </Collapsible>

            <Collapsible title="No results after generation" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  Results may not appear if generation was interrupted, validation failed, or there was insufficient evidence.
                </p>
                <p className="font-medium text-foreground">Fix:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check that you have at least 3 competitors with evidence added</li>
                  <li>Review the error message in the analysis progress view</li>
                  <li>Try regenerating the analysis</li>
                  <li>Verify competitor evidence is complete and valid</li>
                </ul>
              </div>
            </Collapsible>

            <Collapsible title="Staging vs production confusion" defaultOpen={false}>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  It's easy to confuse staging and production environments, especially with magic links.
                </p>
                <p className="font-medium text-foreground">Fix:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Check the URL in your browser — production URLs typically don't include "staging" or "preview"</li>
                  <li>Verify the domain matches your expected environment</li>
                  <li>Check the <Link href="/api/debug/origin" className="text-primary underline hover:text-primary/80">origin debug endpoint</Link> to see computed origin</li>
                  <li>Use different browsers or profiles for staging vs production to avoid confusion</li>
                </ul>
              </div>
            </Collapsible>
          </div>
        </section>

        {/* Debug Utilities */}
        <section id="debug" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">Debug utilities</h2>
          <div className="panel p-6 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">API endpoints</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/api/whoami" className="text-primary underline hover:text-primary/80" target="_blank">
                    /api/whoami
                  </Link>
                  {' '}— Check authentication state and user ID
                </li>
                <li>
                  <Link href="/api/debug/origin" className="text-primary underline hover:text-primary/80" target="_blank">
                    /api/debug/origin
                  </Link>
                  {' '}— Inspect origin computation and request headers
                </li>
              </ul>
            </div>
            <div className="space-y-2 pt-3 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Logs</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li><span className="font-medium text-foreground">Vercel logs:</span> Available in your Vercel dashboard under the project's "Logs" tab</li>
                <li><span className="font-medium text-foreground">Supabase auth logs:</span> Available in your Supabase dashboard under Authentication → Logs</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact / Feedback */}
        <section id="contact" className="space-y-4 scroll-mt-4">
          <h2 className="text-lg font-semibold text-foreground">Contact & feedback</h2>
          <div className="panel p-6">
            <p className="text-sm text-muted-foreground">
              Questions, issues, or feedback?{' '}
              <a 
                href="mailto:feedback@plinth.com" 
                className="text-primary underline hover:text-primary/80"
              >
                Email feedback@plinth.com
              </a>
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}

