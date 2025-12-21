import { z, type ZodIssue, type ZodTypeAny } from 'zod'

export type SafeParseLLMJsonSuccess<T> = {
  ok: true
  data: T
  raw: string
  extracted?: string
}

export type SafeParseLLMJsonFailure = {
  ok: false
  error: string
  raw: string
  extracted?: string
  issues?: ZodIssue[]
}

export type SafeParseLLMJsonResult<T> =
  | SafeParseLLMJsonSuccess<T>
  | SafeParseLLMJsonFailure

function extractJson(text: string): { extracted: string | null; raw: string } {
  const raw = text ?? ''

  const fencedJsonMatch = raw.match(/```json\s*([\s\S]*?)```/i)
  if (fencedJsonMatch?.[1]) {
    return { extracted: fencedJsonMatch[1].trim(), raw }
  }

  const genericFenceMatch = raw.match(/```([\s\S]*?)```/)
  if (genericFenceMatch?.[1]) {
    return { extracted: genericFenceMatch[1].trim(), raw }
  }

  const firstBrace = raw.indexOf('{')
  const lastBrace = raw.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return {
      extracted: raw.slice(firstBrace, lastBrace + 1).trim(),
      raw,
    }
  }

  const trimmed = raw.trim()
  if (trimmed) {
    return { extracted: trimmed, raw }
  }

  return { extracted: null, raw }
}

export function safeParseLLMJson<S extends ZodTypeAny>(
  text: string,
  schema: S
): SafeParseLLMJsonResult<z.infer<S>> {
  const { extracted, raw } = extractJson(text)

  if (!extracted) {
    return {
      ok: false,
      error:
        'Could not find any JSON in the model response. Please try again and ensure the assistant outputs valid JSON.',
      raw,
    }
  }

  let parsed: unknown

  try {
    parsed = JSON.parse(extracted)
  } catch (_error) {
    return {
      ok: false,
      error:
        'The model response was not valid JSON. Please try again and ask the assistant to return only JSON.',
      raw,
      extracted,
    }
  }

  const result = schema.safeParse(parsed)

  if (!result.success) {
    const issues = result.error.issues
    const summary = issues
      .slice(0, 5)
      .map((issue) => {
        const path = issue.path.join('.')
        return path ? `${path}: ${issue.message}` : issue.message
      })
      .join('; ')

    return {
      ok: false,
      error:
        'The JSON did not match the expected format. ' +
        (summary ? `Details: ${summary}` : ''),
      raw,
      extracted,
      issues,
    }
  }

  return {
    ok: true,
    data: result.data,
    raw,
    extracted,
  }
}

export function validateOrExplain<S extends ZodTypeAny>(
  schema: S,
  text: string
): z.infer<S> | string {
  const result = safeParseLLMJson(text, schema)

  if (result.ok) {
    return result.data
  }

  if (!result.issues || result.issues.length === 0) {
    return result.error
  }

  const details = result.issues
    .slice(0, 5)
    .map((issue) => {
      const path = issue.path.join('.')
      return path ? `${path}: ${issue.message}` : issue.message
    })
    .join('; ')

  return `Response was not in the expected format: ${details}`
}


