'use client'

import { useState } from 'react'
import { Edit2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Badge } from '@/components/ui/badge'

interface ExtractedFieldsPanelProps {
  values: {
    market_category?: string | null
    target_customer?: string | null
    business_goal?: string | null
    geography?: string | null
  }
  onUpdate: (values: {
    market_category?: string | null
    target_customer?: string | null
    business_goal?: string | null
    geography?: string | null
  }) => void
}

export function ExtractedFieldsPanel({
  values,
  onUpdate,
}: ExtractedFieldsPanelProps) {
  const [editing, setEditing] = useState<{
    market?: boolean
    customer?: boolean
    goal?: boolean
    geography?: boolean
  }>({})
  const [editValues, setEditValues] = useState({
    market_category: values.market_category || '',
    target_customer: values.target_customer || '',
    business_goal: values.business_goal || '',
    geography: values.geography || '',
  })

  const handleEdit = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    setEditing((prev) => ({ ...prev, [field]: true }))
  }

  const handleSave = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    const updated = {
      market_category:
        field === 'market' ? editValues.market_category || null : values.market_category,
      target_customer:
        field === 'customer' ? editValues.target_customer || null : values.target_customer,
      business_goal:
        field === 'goal' ? editValues.business_goal || null : values.business_goal,
      geography:
        field === 'geography' ? editValues.geography || null : values.geography,
    }
    onUpdate(updated)
    setEditing((prev) => ({ ...prev, [field]: false }))
  }

  const handleCancel = (field: 'market' | 'customer' | 'goal' | 'geography') => {
    setEditValues({
      market_category: values.market_category || '',
      target_customer: values.target_customer || '',
      business_goal: values.business_goal || '',
      geography: values.geography || '',
    })
    setEditing((prev) => ({ ...prev, [field]: false }))
  }

  // Only show if at least one field has a value
  const hasAnyValue =
    values.market_category ||
    values.target_customer ||
    values.business_goal ||
    values.geography

  if (!hasAnyValue) {
    return null
  }

  return (
    <SurfaceCard className="p-4 space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-foreground">
          Extracted from your notes
        </p>
        <p className="text-xs text-muted-foreground">
          Review and edit the extracted fields below
        </p>
      </div>

      <div className="space-y-2">
        {/* Market */}
        {values.market_category && (
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs min-w-[80px]">
              Market
            </Badge>
            {editing.market ? (
              <div className="flex-1 space-y-1">
                <Input
                  value={editValues.market_category}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      market_category: e.target.value,
                    }))
                  }
                  className="h-7 text-xs"
                  size={20}
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave('market')}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancel('market')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-foreground">
                  {values.market_category}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit('market')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Customer */}
        {values.target_customer && (
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs min-w-[80px]">
              Customer
            </Badge>
            {editing.customer ? (
              <div className="flex-1 space-y-1">
                <Input
                  value={editValues.target_customer}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      target_customer: e.target.value,
                    }))
                  }
                  className="h-7 text-xs"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave('customer')}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancel('customer')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-foreground">
                  {values.target_customer}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit('customer')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Goal */}
        {values.business_goal && (
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs min-w-[80px]">
              Goal
            </Badge>
            {editing.goal ? (
              <div className="flex-1 space-y-1">
                <Textarea
                  value={editValues.business_goal}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      business_goal: e.target.value,
                    }))
                  }
                  className="h-16 text-xs"
                  rows={2}
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave('goal')}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancel('goal')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-foreground line-clamp-2">
                  {values.business_goal}
                </span>
                <button
                  type="button"
                  onClick={() => handleEdit('goal')}
                  className="text-xs text-muted-foreground hover:text-foreground ml-2"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Geography */}
        {values.geography && (
          <div className="flex items-start gap-2">
            <Badge variant="secondary" className="text-xs min-w-[80px]">
              Geography
            </Badge>
            {editing.geography ? (
              <div className="flex-1 space-y-1">
                <Input
                  value={editValues.geography}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      geography: e.target.value,
                    }))
                  }
                  className="h-7 text-xs"
                />
                <div className="flex gap-1">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSave('geography')}
                    className="h-6 px-2 text-xs"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleCancel('geography')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <span className="text-xs text-foreground">{values.geography}</span>
                <button
                  type="button"
                  onClick={() => handleEdit('geography')}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}

