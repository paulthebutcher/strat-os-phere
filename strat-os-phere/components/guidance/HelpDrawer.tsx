'use client'

import { useState, useMemo } from 'react'
import { Search, HelpCircle } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { routeToPageId } from '@/lib/guidance/routeMap'
import { guidanceContent, getGuidanceForPage, type PageId } from '@/lib/guidance/content'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface HelpDrawerProps {
  children?: React.ReactNode
}

/**
 * Global Help Drawer that provides contextual guidance based on current route.
 * Includes search functionality and organized sections.
 */
export function HelpDrawer({ children }: HelpDrawerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()
  const currentPageId = routeToPageId(pathname || '')
  const currentGuidance = getGuidanceForPage(currentPageId)

  // Filter guidance content based on search
  const filteredContent = useMemo(() => {
    if (!searchQuery.trim()) {
      return guidanceContent
    }

    const query = searchQuery.toLowerCase()
    const filtered: Partial<typeof guidanceContent> = {}

    Object.entries(guidanceContent).forEach(([pageId, guidance]) => {
      const matchesTitle = guidance.title.toLowerCase().includes(query)
      const matchesIntro = guidance.intro.toLowerCase().includes(query)
      const matchesSteps = guidance.nextSteps.some((step) =>
        step.toLowerCase().includes(query)
      )
      const matchesGlossary = Object.entries(guidance.glossary).some(
        ([term, def]) =>
          term.toLowerCase().includes(query) || def.toLowerCase().includes(query)
      )
      const matchesMistakes = guidance.commonMistakes.some((mistake) =>
        mistake.toLowerCase().includes(query)
      )

      if (matchesTitle || matchesIntro || matchesSteps || matchesGlossary || matchesMistakes) {
        filtered[pageId as PageId] = guidance
      }
    })

    return filtered
  }, [searchQuery])

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      content: [
        {
          question: 'How do I create my first analysis?',
          answer:
            'Start by creating a new project from the dashboard. Fill in your market category, target customer, and business goal. Then add 3-7 competitors and generate your analysis.',
        },
        {
          question: 'What information do I need to get started?',
          answer:
            'You need: (1) A clear market category, (2) Your target customer profile, (3) Your business goal or decision you\'re trying to make, and (4) 3-7 competitors to analyze.',
        },
        {
          question: 'How long does analysis generation take?',
          answer:
            'Analysis generation typically takes a few minutes. The system collects evidence from public sources and generates ranked opportunities with citations.',
        },
      ],
    },
    {
      id: 'evidence',
      title: 'Evidence',
      content: [
        {
          question: 'What is evidence?',
          answer:
            'Evidence is public signals collected from competitors: pricing pages, reviews, job postings, changelogs, and documentation from the last 90 days.',
        },
        {
          question: 'How is evidence collected?',
          answer:
            'Plinth automatically scans public sources for each competitor you add. You can also manually generate evidence for specific competitors.',
        },
        {
          question: 'How recent is the evidence?',
          answer:
            'Evidence is collected from the last 90 days to ensure insights are current and relevant.',
        },
      ],
    },
    {
      id: 'opportunities',
      title: 'Opportunities',
      content: [
        {
          question: 'What are opportunities?',
          answer:
            'Opportunities are ranked differentiation opportunities with scores, confidence levels, and actionable next steps. Each is backed by evidence and citations.',
        },
        {
          question: 'How are opportunities scored?',
          answer:
            'Opportunity scores combine differentiation potential, feasibility, and strategic fit. Higher scores indicate stronger opportunities.',
        },
        {
          question: 'What does confidence mean?',
          answer:
            'Confidence indicates how certain we are about an opportunity based on evidence quality and recency. Higher confidence means more reliable insights.',
        },
      ],
    },
    {
      id: 'bets',
      title: 'Strategic Bets',
      content: [
        {
          question: 'What are strategic bets?',
          answer:
            'Strategic bets identify what to pursue and what to avoid, with experiments to validate. They help you say no to opportunities that competitors can easily copy.',
        },
        {
          question: 'How do I use strategic bets?',
          answer:
            'Review strategic bets to understand which opportunities are defensible and which aren\'t. Use the suggested experiments to validate opportunities before committing.',
        },
      ],
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      content: [
        {
          question: 'Why can\'t I generate an analysis?',
          answer:
            'You need at least 3 competitors to generate an analysis. Make sure you\'ve added competitors and generated evidence for them.',
        },
        {
          question: 'My opportunities seem generic. What can I do?',
          answer:
            'Be more specific in your market category and target customer descriptions. Also use the "Sharpen analysis" section to add constraints and calibration.',
        },
        {
          question: 'How do I improve analysis quality?',
          answer:
            'Fill out the "Sharpen analysis" section with primary constraints, risk posture, ambition level, and input confidence. These help Plinth generate more relevant insights.',
        },
      ],
    },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Help & Guidance</SheetTitle>
          <SheetDescription>
            Find answers and learn how to use Plinth effectively.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search help content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* On This Page Section */}
          {!searchQuery && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">On this page</h3>
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-1">
                    {currentGuidance.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">{currentGuidance.intro}</p>
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-foreground mb-2">
                    Quick actions:
                  </h5>
                  <ul className="space-y-1">
                    {currentGuidance.nextSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="text-xs text-muted-foreground flex items-start gap-2">
                        <span className="text-primary font-semibold mt-0.5">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {currentGuidance.links.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                    {currentGuidance.links.map((link, index) => (
                      <Link
                        key={index}
                        href={link.href}
                        className="text-xs text-primary hover:underline"
                        onClick={() => setOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* FAQ Sections */}
          <Accordion type="single" collapsible className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-sm font-semibold">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    {section.content.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <h5 className="text-xs font-medium text-foreground">
                          {item.question}
                        </h5>
                        <p className="text-xs text-muted-foreground">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Glossary (if search is active or showing current page) */}
          {!searchQuery && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Key terms</h3>
              <div className="space-y-2">
                {Object.entries(currentGuidance.glossary).map(([term, definition]) => (
                  <div key={term} className="text-xs">
                    <span className="font-medium text-foreground">{term}:</span>{' '}
                    <span className="text-muted-foreground">{definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

