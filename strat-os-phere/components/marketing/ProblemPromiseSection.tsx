/**
 * Problem → Plinth's Unique Promise Section
 * 
 * A concise problem + solution statement showing the gap other tools leave
 * and what Plinth uniquely delivers.
 */
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"

export function ProblemPromiseSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="text-center space-y-3 sm:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight lg:whitespace-nowrap">
              Decisions that matter shouldn't feel like guesswork.
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-text-secondary max-w-3xl mx-auto line-clamp-3 sm:line-clamp-none">
              Most teams generate ideas or summaries. Plinth turns them into defensible calls backed by evidence you can point to — in minutes, not meetings.
            </p>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

