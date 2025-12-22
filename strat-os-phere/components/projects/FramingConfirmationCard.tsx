'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Badge } from '@/components/ui/badge'
import type { ProposedFraming, ConfidenceLevel } from '@/lib/projects/framing'

interface FramingConfirmationCardProps {
  framing: ProposedFraming
  onConfirm: (framing: ProposedFraming) => void
  onAdjust: () => void
  onUpdate: (framing: ProposedFraming) => void
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const colors = {
    high: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    med: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400',
  }

  return (
    <Badge className={`text-xs ${colors[level]}`}>
      {level === 'med' ? 'medium' : level} confidence
    </Badge>
  )
}

export function FramingConfirmationCard({
  framing,
  onConfirm,
  onAdjust,
  onUpdate,
}: FramingConfirmationCardProps) {
  const [editing, setEditing] = useState<{
    market?: boolean
    customer?: boolean
    goal?: boolean
    geography?: boolean
  }>({})
  const [editValues, setEditValues] = useState({
    market_category: framing.market_category || '',
    target_customer: framing.target_customer || '',
    business_goal: framing.business_goal || '',
    geography: framing.geography || '',
  })

  const handleEdit = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    setEditing((prev) => ({ ...prev, [field]: true }))
  }

  const handleSave = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    const updatedFraming: ProposedFraming = {
      ...framing,
      market_category:
        field === 'market' ? editValues.market_category || null : framing.market_category,
      target_customer:
        field === 'customer' ? editValues.target_customer || null : framing.target_customer,
      business_goal:
        field === 'goal' ? editValues.business_goal || null : framing.business_goal,
      geography:
        field === 'geography' ? editValues.geography || null : framing.geography,
    }
    onUpdate(updatedFraming)
    setEditing((prev) => ({ ...prev, [field]: false }))
  }

  const handleCancel = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    setEditValues({
      market_category: framing.market_category || '',
      target_customer: framing.target_customer || '',
      business_goal: framing.business_goal || '',
      geography: framing.geography || '',
    })
    setEditing((prev) => ({ ...prev, [field]: false }))
  }

  return (
    <SurfaceCard className="p-6 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          We think you're analyzing...
        </h3>
        <p className="text-xs text-muted-foreground">
          Review and adjust the fields below, then confirm to continue.
        </p>
      </div>

      {/* Market / Category */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Market / Category
          </label>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={framing.confidence.market} />
            {!editing.market && (
              <button
                type="button"
                onClick={() => handleEdit('market')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
        {editing.market ? (
          <div className="space-y-2">
            <Input
              value={editValues.market_category}
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  market_category: e.target.value,
                }))
              }
              placeholder="e.g. B2C video streaming platforms"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSave('market')}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleCancel('market')}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {framing.market_category || (
              <span className="text-muted-foreground italic">Not specified</span>
            )}
          </p>
        )}
      </div>

      {/* Target Customer */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Target Customer
          </label>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={framing.confidence.customer} />
            {!editing.customer && (
              <button
                type="button"
                onClick={() => handleEdit('customer')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
        {editing.customer ? (
          <div className="space-y-2">
            <Input
              value={editValues.target_customer}
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  target_customer: e.target.value,
                }))
              }
              placeholder="e.g. Gen Z cord-cutters in the US"
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSave('customer')}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleCancel('customer')}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {framing.target_customer || (
              <span className="text-muted-foreground italic">Not specified</span>
            )}
          </p>
        )}
      </div>

      {/* Business Goal */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-foreground">
            Business Goal
          </label>
          <div className="flex items-center gap-2">
            <ConfidenceBadge level={framing.confidence.goal} />
            {!editing.goal && (
              <button
                type="button"
                onClick={() => handleEdit('goal')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
        {editing.goal ? (
          <div className="space-y-2">
            <Textarea
              value={editValues.business_goal}
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  business_goal: e.target.value,
                }))
              }
              placeholder="What decision or outcome this analysis should support"
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleSave('goal')}
              >
                <Check className="h-3.5 w-3.5 mr-1" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => handleCancel('goal')}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {framing.business_goal || (
              <span className="text-muted-foreground italic">Not specified</span>
            )}
          </p>
        )}
      </div>

      {/* Geography (optional) */}
      {framing.geography && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-foreground">
              Geography
            </label>
            {!editing.geography && (
              <button
                type="button"
                onClick={() => handleEdit('geography')}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <Edit2 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
          {editing.geography ? (
            <div className="space-y-2">
              <Input
                value={editValues.geography}
                onChange={(e) =>
                  setEditValues((prev) => ({
                    ...prev,
                    geography: e.target.value,
                  }))
                }
                placeholder="e.g. North America and Western Europe"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => handleSave('geography')}
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Save
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCancel('geography')}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground">{framing.geography}</p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          type="button"
          onClick={() => onConfirm(framing)}
          className="flex-1"
        >
          Looks right
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onAdjust}
          className="flex-1"
        >
          Adjust
        </Button>
      </div>
    </SurfaceCard>
  )
}

