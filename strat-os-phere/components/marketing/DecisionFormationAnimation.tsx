/**
 * DecisionFormationAnimation
 * 
 * Guided animation showing how a decision takes shape:
 * Hunch → Evidence → Confidence → Recommendation
 * 
 * Single loop (~6-7 seconds), auto-plays once on desktop.
 * Shows static final frame on mobile.
 * Respects prefers-reduced-motion.
 */
"use client"

import { useEffect, useState, useRef } from "react"
import { ConfidencePill } from "./ConfidencePill"
import { Badge } from "@/components/ui/badge"
import { durations, easing, prefersReducedMotion } from "@/lib/motion/tokens"
import Link from "next/link"

interface EvidenceChip {
  sourceType: string
  domain: string
}

const EVIDENCE_CHIPS: EvidenceChip[] = [
  { sourceType: "Pricing page", domain: "competitor.com" },
  { sourceType: "Docs", domain: "competitor.com/docs" },
  { sourceType: "Review excerpt", domain: "reviewsite.com" },
  { sourceType: "Changelog note", domain: "competitor.com/changelog" },
  { sourceType: "Blog post", domain: "competitor.com/blog" },
  { sourceType: "Case study", domain: "competitor.com/cases" },
]

const HUNCH_TEXT = "Teams struggle with on-call handoffs."
const RECOMMENDATION_TITLE = "Add structured handoff workflows"
const RECOMMENDATION_CONFIDENCE: "exploratory" | "directional" | "investment_ready" = "directional"

// Animation timing (milliseconds)
const FRAME_1_END = 1500 // Hunch
const FRAME_2_START = 1500
const FRAME_2_END = 3500 // Evidence
const FRAME_3_START = 3500
const FRAME_3_END = 5000 // Confidence
const FRAME_4_START = 5000
const FRAME_4_END = 7000 // Final artifact
const TOTAL_DURATION = FRAME_4_END

type AnimationFrame = "hunch" | "evidence" | "confidence" | "final"

export function DecisionFormationAnimation() {
  const [currentFrame, setCurrentFrame] = useState<AnimationFrame>("hunch")
  const [hasPlayed, setHasPlayed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const timeoutRefs = useRef<NodeJS.Timeout[]>([])
  const reduceMotionRef = useRef(false)

  const clearAllTimeouts = () => {
    timeoutRefs.current.forEach((timeout) => clearTimeout(timeout))
    timeoutRefs.current = []
  }

  const runAnimation = () => {
    clearAllTimeouts()
    setCurrentFrame("hunch")

    // Frame 1: Hunch (0-1.5s)
    timeoutRefs.current.push(
      setTimeout(() => {
        setCurrentFrame("evidence")
      }, FRAME_2_START)
    )

    // Frame 2: Evidence (1.5-3.5s)
    timeoutRefs.current.push(
      setTimeout(() => {
        setCurrentFrame("confidence")
      }, FRAME_3_START)
    )

    // Frame 3: Confidence (3.5-5s)
    timeoutRefs.current.push(
      setTimeout(() => {
        setCurrentFrame("final")
      }, FRAME_4_START)
    )

    // Animation complete (5-7s)
    timeoutRefs.current.push(
      setTimeout(() => {
        setHasPlayed(true)
      }, FRAME_4_END)
    )
  }

  useEffect(() => {
    // Check for mobile and reduced motion
    reduceMotionRef.current = prefersReducedMotion()
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)

    // On mobile or reduced motion, show final frame immediately
    if (reduceMotionRef.current || window.innerWidth < 768) {
      setCurrentFrame("final")
      setHasPlayed(true)
      return () => {
        window.removeEventListener("resize", checkMobile)
        clearAllTimeouts()
      }
    }

    // Desktop: Start animation
    runAnimation()

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearAllTimeouts()
    }
  }, [])

  // Handle hover replay on desktop
  const handleMouseEnter = () => {
    if (isMobile || reduceMotionRef.current || !hasPlayed) return
    runAnimation()
  }

  const handleMouseLeave = () => {
    if (isMobile || reduceMotionRef.current || !hasPlayed) return
    clearAllTimeouts()
    setCurrentFrame("final")
  }

  // Calculate opacity and transform for smooth transitions
  const getFrameStyle = (frame: AnimationFrame) => {
    // Only the current frame is visible (frames build progressively within themselves)
    const isVisible = currentFrame === frame
    
    return {
      opacity: isVisible ? 1 : 0,
      pointerEvents: isVisible ? "auto" as const : "none" as const,
      transform: isVisible ? "translateY(0)" : "translateY(8px)",
      transition: reduceMotionRef.current
        ? "none"
        : `opacity ${durations.base}ms ${easing.enter}, transform ${durations.base}ms ${easing.enter}`,
    }
  }

  // Evidence chips animation
  const getEvidenceChipStyle = (index: number) => {
    const isVisible = currentFrame === "evidence" || currentFrame === "confidence"
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "translateX(0)" : "translateX(-12px)",
      transition: reduceMotionRef.current
        ? "none"
        : `opacity ${durations.base}ms ${easing.enter} ${200 + index * 60}ms, transform ${durations.base}ms ${easing.enter} ${200 + index * 60}ms`,
    }
  }

  // Confidence transition
  const getConfidenceStyle = () => {
    const isVisible = currentFrame === "confidence"
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? "scale(1)" : "scale(0.95)",
      transition: reduceMotionRef.current
        ? "none"
        : `opacity ${durations.slow}ms ${easing.enter}, transform ${durations.slow}ms ${easing.enter}`,
    }
  }

  return (
    <div
      className="relative w-full max-w-4xl mx-auto"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-white rounded-lg border border-border-subtle p-6 sm:p-8 md:p-10 min-h-[300px] sm:min-h-[400px] flex flex-col">
        {/* Frame 1: The Hunch */}
        <div
          style={getFrameStyle("hunch")}
          className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-center"
        >
          <div className="space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-text-primary leading-relaxed">
              {HUNCH_TEXT}
            </p>
            {currentFrame === "hunch" && (
              <p className="text-xs text-text-muted">Starting point</p>
            )}
          </div>
        </div>

        {/* Frame 2: Evidence attaches */}
        <div
          style={getFrameStyle("evidence")}
          className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-6"
        >
          <div className="space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-text-primary leading-relaxed">
              {HUNCH_TEXT}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {EVIDENCE_CHIPS.map((chip, index) => (
                <Badge
                  key={index}
                  variant="muted"
                  style={getEvidenceChipStyle(index)}
                  className="text-xs"
                >
                  {chip.sourceType} · {chip.domain}
                </Badge>
              ))}
            </div>

            {(currentFrame === "evidence" || currentFrame === "confidence") && (
              <p className="text-xs text-text-muted pt-2">
                Evidence found · {EVIDENCE_CHIPS.length} sources · 3 types
              </p>
            )}
          </div>
        </div>

        {/* Frame 3: Confidence becomes explicit */}
        <div
          style={getFrameStyle("confidence")}
          className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-center space-y-6"
        >
          <div className="space-y-4">
            <p className="text-lg sm:text-xl md:text-2xl text-text-primary leading-relaxed">
              {HUNCH_TEXT}
            </p>
            
            <div className="flex flex-wrap gap-2 pt-2">
              {EVIDENCE_CHIPS.map((chip, index) => (
                <Badge
                  key={index}
                  variant="muted"
                  className="text-xs opacity-60"
                >
                  {chip.sourceType} · {chip.domain}
                </Badge>
              ))}
            </div>

            <div className="space-y-3 pt-2">
              <div style={getConfidenceStyle()}>
                <ConfidencePill level={RECOMMENDATION_CONFIDENCE} />
              </div>
              
              {currentFrame === "confidence" && (
                <p className="text-xs text-text-muted">
                  Supported today · Would change if enterprise reviews increase
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Frame 4: The call (final artifact) */}
        <div
          style={getFrameStyle("final")}
          className="absolute inset-0 p-6 sm:p-8 md:p-10 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text-primary leading-tight mb-4">
                {RECOMMENDATION_TITLE}
              </h3>
              
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs text-text-muted">Confidence:</span>
                <ConfidencePill level={RECOMMENDATION_CONFIDENCE} />
              </div>
            </div>

            <div className="space-y-2 text-sm text-text-secondary">
              <p>Why it ranks: 3 signals</p>
              <p>What would change this call: +2 enterprise reviews</p>
            </div>
          </div>

          <div className="pt-4 border-t border-border-subtle">
            <Link
              href="/example"
              className="inline-flex items-center text-sm font-medium text-primary hover:underline"
            >
              See how a decision takes shape →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

