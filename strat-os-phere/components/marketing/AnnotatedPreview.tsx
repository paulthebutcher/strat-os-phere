/**
 * Annotated Product Preview
 * 
 * Static screenshot + subtle annotations with numbered callouts (1–4)
 * and one-line captions.
 * 
 * These should feel like a McKinsey slide, not a marketing diagram.
 * Explains without requiring text-heavy paragraphs.
 */
"use client"

import { cn } from "@/lib/utils"
import { DecisionCredibilityVisual } from "./DecisionCredibilityVisual"

interface Annotation {
  number: number
  label: string
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center"
  offset?: { x: number; y: number }
}

interface AnnotatedPreviewProps {
  className?: string
  annotations?: Annotation[]
  variant?: "decision-readout" | "custom"
  children?: React.ReactNode
}

const defaultAnnotations: Annotation[] = [
  {
    number: 1,
    label: "One recommendation, not a list",
    position: "top-left",
    offset: { x: -20, y: -40 }
  },
  {
    number: 2,
    label: "Every claim links to a source",
    position: "top-right",
    offset: { x: 20, y: -40 }
  },
  {
    number: 3,
    label: "Confidence is explicit",
    position: "bottom-left",
    offset: { x: -20, y: 40 }
  },
  {
    number: 4,
    label: "Next steps are defined",
    position: "bottom-right",
    offset: { x: 20, y: 40 }
  }
]

export function AnnotatedPreview({ 
  className,
  annotations = defaultAnnotations,
  variant = "decision-readout",
  children
}: AnnotatedPreviewProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* Main preview content */}
      <div className="relative rounded-xl border-2 border-border-subtle bg-white shadow-xl overflow-hidden">
        {variant === "decision-readout" ? (
          <DecisionCredibilityVisual />
        ) : (
          children
        )}
      </div>

      {/* Annotations overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {annotations.map((annotation) => {
          // Calculate position based on annotation.position
          let positionClasses = ""
          let transform = ""
          
          switch (annotation.position) {
            case "top-left":
              positionClasses = "top-0 left-0"
              transform = `translate(${annotation.offset?.x || -20}px, ${annotation.offset?.y || -40}px)`
              break
            case "top-right":
              positionClasses = "top-0 right-0"
              transform = `translate(${annotation.offset?.x || 20}px, ${annotation.offset?.y || -40}px)`
              break
            case "bottom-left":
              positionClasses = "bottom-0 left-0"
              transform = `translate(${annotation.offset?.x || -20}px, ${annotation.offset?.y || 40}px)`
              break
            case "bottom-right":
              positionClasses = "bottom-0 right-0"
              transform = `translate(${annotation.offset?.x || 20}px, ${annotation.offset?.y || 40}px)`
              break
            case "center":
              positionClasses = "top-1/2 left-1/2"
              transform = `translate(-50%, -50%) translate(${annotation.offset?.x || 0}px, ${annotation.offset?.y || 0}px)`
              break
          }

          return (
            <div
              key={annotation.number}
              className={cn("absolute", positionClasses)}
              style={{ transform }}
            >
              {/* Annotation callout */}
              <div className="flex items-start gap-2 group">
                {/* Number badge */}
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-full bg-accent-primary text-white flex items-center justify-center text-sm font-semibold shadow-lg">
                    {annotation.number}
                  </div>
                  {/* Connector line */}
                  <div 
                    className={cn(
                      "absolute w-0.5 bg-accent-primary/30",
                      annotation.position.includes("top") ? "top-full" : "bottom-full",
                      annotation.position.includes("left") ? "left-1/2" : "right-1/2"
                    )}
                    style={{
                      height: annotation.position.includes("top") 
                        ? `${Math.abs(annotation.offset?.y || 40)}px` 
                        : `${Math.abs(annotation.offset?.y || 40)}px`,
                      transform: annotation.position.includes("top") 
                        ? "translateX(-50%)" 
                        : "translateX(50%)"
                    }}
                  />
                </div>
                
                {/* Label */}
                <div className="bg-white rounded-lg border-2 border-accent-primary shadow-lg px-3 py-2 max-w-[200px]">
                  <p className="text-xs font-semibold text-text-primary leading-tight">
                    {annotation.label}
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

