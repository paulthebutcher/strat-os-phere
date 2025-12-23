'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import type { FollowUpQuestion, FollowUpAnswer } from '@/lib/followup/types'

interface FollowUpQuestionCardProps {
  question: FollowUpQuestion
  projectId: string
  onApply: (answer: FollowUpAnswer) => void
  onSkip: () => void
}

export function FollowUpQuestionCard({
  question,
  projectId,
  onApply,
  onSkip,
}: FollowUpQuestionCardProps) {
  const [answer, setAnswer] = React.useState('')
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleApply = async () => {
    if (question.inputType === 'single_select' && !selectedOption) {
      return
    }
    if (question.inputType === 'free_text' && !answer.trim()) {
      return
    }

    setIsSubmitting(true)

    const followUpAnswer: FollowUpAnswer = {
      questionId: question.generatedAt, // Use generatedAt as ID
      answer: question.inputType === 'single_select' ? selectedOption! : answer.trim(),
      answeredAt: new Date().toISOString(),
    }

    try {
      // Store answer
      const response = await fetch(`/api/projects/${projectId}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(followUpAnswer),
      })

      if (!response.ok) {
        throw new Error('Failed to save answer')
      }

      onApply(followUpAnswer)
    } catch (error) {
      console.error('Error saving follow-up answer:', error)
      alert('Failed to save answer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6 border-primary/20 bg-primary/5">
      <div className="space-y-4">
        <div>
          <h3 className="text-base font-semibold mb-1">One quick question to sharpen results</h3>
          <p className="text-sm text-muted-foreground mb-3">{question.rationale}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-3">{question.question}</p>

          {question.inputType === 'single_select' && question.options ? (
            <div className="space-y-2">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOption(option)}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedOption === option
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted'
                  }`}
                >
                  <span className="text-sm">{option}</span>
                </button>
              ))}
            </div>
          ) : (
            <Textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Your answer..."
              className="min-h-[100px]"
            />
          )}
        </div>

        {question.derivedFrom.gaps && question.derivedFrom.gaps.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="muted" className="text-xs">
              Evidence gap detected
            </Badge>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={handleApply}
            disabled={isSubmitting || (question.inputType === 'single_select' && !selectedOption) || (question.inputType === 'free_text' && !answer.trim())}
            size="sm"
          >
            {isSubmitting ? 'Applying...' : 'Apply'}
          </Button>
          <Button
            onClick={onSkip}
            variant="ghost"
            size="sm"
            disabled={isSubmitting}
          >
            Skip
          </Button>
        </div>
      </div>
    </Card>
  )
}

