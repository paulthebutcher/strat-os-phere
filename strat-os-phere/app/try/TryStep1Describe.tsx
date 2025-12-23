'use client'

import { useState } from 'react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { TryDraft } from '@/lib/tryDraft'

interface TryStep1DescribeProps {
  initialState: TryDraft
  onComplete: (updates: Partial<TryDraft>) => void
}

export function TryStep1Describe({
  initialState,
  onComplete,
}: TryStep1DescribeProps) {
  const [companyName, setCompanyName] = useState(
    initialState.primaryCompanyName || ''
  )
  const [contextText, setContextText] = useState(
    initialState.contextText || ''
  )
  const [marketCategory, setMarketCategory] = useState(
    initialState.marketCategory || ''
  )
  const [targetCustomer, setTargetCustomer] = useState(
    initialState.targetCustomer || ''
  )
  const [product, setProduct] = useState(initialState.product || '')
  const [error, setError] = useState<string | null>(null)

  const handleContinue = () => {
    if (!companyName.trim()) {
      setError('Please enter a company or product name')
      return
    }

    setError(null)
    onComplete({
      primaryCompanyName: companyName.trim(),
      contextText: contextText.trim() || undefined,
      marketCategory: marketCategory.trim() || undefined,
      targetCustomer: targetCustomer.trim() || undefined,
      product: product.trim() || undefined,
    })
  }

  const handleTryExample = () => {
    setCompanyName('monday')
    setContextText('Project management and team collaboration platform')
    setMarketCategory('Project management software')
    setTargetCustomer('Teams and organizations')
    setProduct('monday.com')
  }

  return (
    <div className="space-y-6">
      <SurfaceCard className="p-6 md:p-8 shadow-md">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-foreground mb-3 tracking-tight">
              Describe what to analyze
            </h2>
            <p className="text-base text-muted-foreground leading-relaxed">
              Enter a company or product name. You can optionally add context
              about the market, target customer, or your product.
            </p>
          </div>

          {/* Company name input */}
          <div className="space-y-2">
            <label
              htmlFor="companyName"
              className="text-sm font-semibold text-foreground"
            >
              Company or product name
              <span className="text-destructive ml-1">*</span>
            </label>
            <Input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(e) => {
                setCompanyName(e.target.value)
                setError(null)
              }}
              placeholder="e.g. monday, Asana, PagerDuty"
              required
            />
          </div>

          {/* Context text input */}
          <div className="space-y-2">
            <label
              htmlFor="contextText"
              className="text-sm font-semibold text-foreground"
            >
              What are you deciding?
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <Textarea
              id="contextText"
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="Describe the decision you're making or the context for this analysis..."
              rows={4}
            />
          </div>

          {/* Market/category input */}
          <div className="space-y-2">
            <label
              htmlFor="marketCategory"
              className="text-sm font-semibold text-foreground"
            >
              Market/category
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <Input
              id="marketCategory"
              type="text"
              value={marketCategory}
              onChange={(e) => setMarketCategory(e.target.value)}
              placeholder="e.g. Project management software"
            />
          </div>

          {/* Target customer input */}
          <div className="space-y-2">
            <label
              htmlFor="targetCustomer"
              className="text-sm font-semibold text-foreground"
            >
              Target customer
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <Input
              id="targetCustomer"
              type="text"
              value={targetCustomer}
              onChange={(e) => setTargetCustomer(e.target.value)}
              placeholder="e.g. Teams and organizations"
            />
          </div>

          {/* Your product input */}
          <div className="space-y-2">
            <label
              htmlFor="product"
              className="text-sm font-semibold text-foreground"
            >
              Your product
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <Input
              id="product"
              type="text"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              placeholder="e.g. Your product name"
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <Button
              type="button"
              onClick={handleContinue}
              disabled={!companyName.trim()}
              className="flex-1"
              size="lg"
              variant="brand"
            >
              Continue
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleTryExample}
              size="lg"
            >
              Try an example
            </Button>
          </div>
        </div>
      </SurfaceCard>
    </div>
  )
}

