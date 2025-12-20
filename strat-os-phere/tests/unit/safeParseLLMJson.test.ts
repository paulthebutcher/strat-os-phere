import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'

const TestSchema = z.object({
  name: z.string(),
  age: z.number(),
})

describe('safeParseLLMJson', () => {
  it('extracts JSON from triple backticks with json language tag', () => {
    const text = '```json\n{"name": "John", "age": 30}\n```'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
      expect(result.extracted).toBe('{"name": "John", "age": 30}')
    }
  })

  it('extracts JSON from triple backticks without language tag', () => {
    const text = '```\n{"name": "John", "age": 30}\n```'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })

  it('extracts JSON from leading/trailing text', () => {
    const text = 'Here is the JSON:\n{"name": "John", "age": 30}\nThat was it.'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })

  it('handles plain JSON without extra text', () => {
    const text = '{"name": "John", "age": 30}'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })

  it('returns ok:false with raw on invalid JSON', () => {
    const text = 'This is not JSON at all'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.raw).toBe(text)
      expect(result.error).toContain('Could not find any JSON')
    }
  })

  it('returns ok:false when JSON is malformed', () => {
    const text = '{"name": "John", "age": }'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('not valid JSON')
      expect(result.extracted).toBeDefined()
    }
  })

  it('returns ok:false when JSON does not match schema', () => {
    const text = '{"name": "John"}'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('expected format')
      expect(result.issues).toBeDefined()
      expect(result.issues?.length).toBeGreaterThan(0)
    }
  })

  it('handles case-insensitive json code fence', () => {
    const text = '```JSON\n{"name": "John", "age": 30}\n```'
    const result = safeParseLLMJson(text, TestSchema)
    
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual({ name: 'John', age: 30 })
    }
  })

  it('preserves raw text in both success and failure cases', () => {
    const validText = '```json\n{"name": "John", "age": 30}\n```'
    const invalidText = 'Not JSON'
    
    const validResult = safeParseLLMJson(validText, TestSchema)
    const invalidResult = safeParseLLMJson(invalidText, TestSchema)
    
    expect(validResult.ok).toBe(true)
    expect(invalidResult.ok).toBe(false)
    
    if (validResult.ok) {
      expect(validResult.raw).toBe(validText)
    }
    if (!invalidResult.ok) {
      expect(invalidResult.raw).toBe(invalidText)
    }
  })
})

