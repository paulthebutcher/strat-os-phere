'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProjectFromForm } from "@/app/projects/actions"

interface ProjectFormProps {
  /**
   * Optional title to render above the form.
   */
  title?: string
  /**
   * Optional description helper text shown under the title.
   */
  description?: string
}

export function ProjectForm({
  title = "New Analysis",
  description = "Set up the basics for your competitive analysis project.",
}: ProjectFormProps) {
  const router = useRouter()
  const [formState, setFormState] = useState({
    name: "",
    marketCategory: "",
    targetCustomer: "",
    product: "",
    goal: "",
    geography: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formState.name || !formState.marketCategory || !formState.targetCustomer) {
      setError("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await createProjectFromForm(formState)

      if (!result?.success) {
        setError(
          result?.message ??
            "Something went wrong while creating the project."
        )
      } else if (result.projectId) {
        router.push(`/projects/${result.projectId}/competitors`)
      } else {
        setError("Something went wrong while creating the project.")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unexpected error while creating the project."
      )
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange<
    K extends keyof typeof formState,
    V extends (typeof formState)[K]
  >(key: K, value: V) {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <div className="panel w-full max-w-xl px-6 py-6">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Project name<span className="text-destructive">*</span>
          </label>
          <Input
            id="name"
            name="name"
            value={formState.name}
            onChange={(event) => handleChange("name", event.target.value)}
            placeholder="e.g. Competitive analysis for streaming platforms"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="marketCategory"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Market / category<span className="text-destructive">*</span>
          </label>
          <Input
            id="marketCategory"
            name="marketCategory"
            value={formState.marketCategory}
            onChange={(event) =>
              handleChange("marketCategory", event.target.value)
            }
            placeholder="e.g. B2C video streaming platforms"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="targetCustomer"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Target customer<span className="text-destructive">*</span>
          </label>
          <Input
            id="targetCustomer"
            name="targetCustomer"
            value={formState.targetCustomer}
            onChange={(event) =>
              handleChange("targetCustomer", event.target.value)
            }
            placeholder="e.g. Gen Z cord-cutters in the US"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="product"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Your product (optional)
          </label>
          <Input
            id="product"
            name="product"
            value={formState.product}
            onChange={(event) => handleChange("product", event.target.value)}
            placeholder="How you describe what you're building"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="goal"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Business goal (optional)
          </label>
          <Textarea
            id="goal"
            name="goal"
            value={formState.goal}
            onChange={(event) => handleChange("goal", event.target.value)}
            placeholder="What decision or outcome this analysis should support"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="geography"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Geography (optional)
          </label>
          <Input
            id="geography"
            name="geography"
            value={formState.geography}
            onChange={(event) =>
              handleChange("geography", event.target.value)
            }
            placeholder="e.g. North America and Western Europe"
          />
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground">
            <span className="text-destructive">*</span> Required fields
          </p>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create analysis"}
          </Button>
        </div>
      </form>
    </div>
  )
}


