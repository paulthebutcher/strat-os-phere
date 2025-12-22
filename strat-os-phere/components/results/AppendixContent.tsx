'use client'

import { SectionCard } from '@/components/results/SectionCard'
import { CopySectionButton } from '@/components/results/CopySectionButton'
import {
  formatProfilesToMarkdown,
  formatThemesToMarkdown,
  formatPositioningToMarkdown,
  formatJtbdToMarkdown,
  type NormalizedProfilesArtifact,
  type NormalizedSynthesisArtifact,
  type NormalizedJtbdArtifact,
} from '@/lib/results/normalizeArtifacts'

interface AppendixContentProps {
  projectId: string
  normalized: {
    profiles?: NormalizedProfilesArtifact | null
    synthesis?: NormalizedSynthesisArtifact | null
    jtbd?: NormalizedJtbdArtifact | null
  }
}

export function AppendixContent({ projectId, normalized }: AppendixContentProps) {
  const { profiles, synthesis, jtbd } = normalized

  const hasAnyContent = Boolean(profiles || synthesis || jtbd)

  if (!hasAnyContent) {
    return (
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Appendix</h1>
          <p className="text-sm text-muted-foreground">
            Additional analysis artifacts will appear here after analysis is generated.
          </p>
        </div>
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-2 text-center mx-auto">
            <h2 className="text-lg font-semibold text-foreground">
              No appendix content yet
            </h2>
            <p className="text-sm text-muted-foreground">
              Jobs, themes, profiles, and positioning will appear here once analysis is complete.
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Appendix</h1>
        <p className="text-sm text-muted-foreground">
          Additional analysis artifacts including jobs, themes, profiles, and positioning.
        </p>
      </div>

      {jtbd?.content && (
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Jobs to Be Done</h2>
            <CopySectionButton
              content={formatJtbdToMarkdown(jtbd.content)}
              label="Copy"
            />
          </div>
          <div className="space-y-4">
            {jtbd.content.jobs?.map((job, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{job.job_statement}</h3>
                <div className="space-y-2 text-sm text-foreground">
                  <p><span className="font-medium">Context:</span> {job.context}</p>
                  <p><span className="font-medium">Who:</span> {job.who}</p>
                  {job.desired_outcomes && job.desired_outcomes.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Desired Outcomes
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.desired_outcomes.map((outcome, oIndex) => (
                          <li key={oIndex}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {job.constraints && job.constraints.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Constraints
                      </h4>
                      <ul className="list-disc list-inside space-y-1">
                        {job.constraints.map((constraint, cIndex) => (
                          <li key={cIndex}>{constraint}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {synthesis?.synthesis && (
        <>
          {synthesis.synthesis.themes && (
            <SectionCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Themes</h2>
                <CopySectionButton
                  content={formatThemesToMarkdown(synthesis.synthesis)}
                  label="Copy"
                />
              </div>
              <div className="space-y-3 text-sm text-foreground">
                {synthesis.synthesis.themes.map((theme, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-1">{theme.theme}</h3>
                    <p className="text-muted-foreground">{theme.description}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {synthesis.synthesis.positioning_map_text && (
            <SectionCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Positioning</h2>
                <CopySectionButton
                  content={formatPositioningToMarkdown(synthesis.synthesis)}
                  label="Copy"
                />
              </div>
              <div className="text-sm text-foreground space-y-3">
                <div>
                  <p className="font-medium mb-2">
                    Axes: {synthesis.synthesis.positioning_map_text.axis_x} (x) · {synthesis.synthesis.positioning_map_text.axis_y} (y)
                  </p>
                </div>
                {synthesis.synthesis.positioning_map_text.quadrants?.map((quadrant, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-1">{quadrant.name}</h3>
                    <p className="text-muted-foreground mb-1">{quadrant.notes}</p>
                    {quadrant.competitors && quadrant.competitors.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Competitors: {quadrant.competitors.join(', ')}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </>
      )}

      {profiles?.snapshots && profiles.snapshots.length > 0 && (
        <SectionCard>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Competitor Profiles</h2>
            <CopySectionButton
              content={formatProfilesToMarkdown(profiles.snapshots)}
              label="Copy"
            />
          </div>
          <div className="space-y-4">
            {profiles.snapshots.map((profile, index) => (
              <div key={index} className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{profile.competitor_name}</h3>
                {profile.positioning_one_liner && (
                  <p className="text-sm text-foreground leading-relaxed">{profile.positioning_one_liner}</p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </section>
  )
}

