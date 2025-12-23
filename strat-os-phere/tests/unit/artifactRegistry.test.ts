import { describe, it, expect } from 'vitest'
import {
  ARTIFACT_REGISTRY,
  ARTIFACT_TYPES,
  ARTIFACT_SCHEMA_NAMES,
  type ArtifactRegistryEntry,
  type ArtifactType,
  type ArtifactSchemaName,
  getArtifactEntry,
} from '@/lib/artifacts/registry'

describe('artifact registry', () => {
  describe('registry structure', () => {
    it('all registry entries have type and label', () => {
      for (const type of ARTIFACT_TYPES) {
        const entry = ARTIFACT_REGISTRY[type]
        expect(entry).toBeDefined()
        expect(entry.type).toBe(type)
        expect(entry.label).toBeTypeOf('string')
        expect(entry.label.length).toBeGreaterThan(0)
      }
    })

    it('all registry entries match ArtifactRegistryEntry type', () => {
      for (const type of ARTIFACT_TYPES) {
        const entry = ARTIFACT_REGISTRY[type]
        const typedEntry: ArtifactRegistryEntry = entry
        expect(typedEntry).toBeDefined()
        expect(typedEntry.type).toBe(type)
      }
    })
  })

  describe('schemaName validation', () => {
    it('any schemaName present must be in ARTIFACT_SCHEMA_NAMES', () => {
      for (const type of ARTIFACT_TYPES) {
        const entry = ARTIFACT_REGISTRY[type]
        if ('schemaName' in entry && entry.schemaName) {
          expect(ARTIFACT_SCHEMA_NAMES).toContain(entry.schemaName)
        }
      }
    })

    it('schemaName values are properly typed as ArtifactSchemaName', () => {
      for (const type of ARTIFACT_TYPES) {
        const entry = ARTIFACT_REGISTRY[type]
        if ('schemaName' in entry && entry.schemaName) {
          const schemaName: ArtifactSchemaName = entry.schemaName
          expect(schemaName).toBeDefined()
          expect(typeof schemaName).toBe('string')
        }
      }
    })
  })

  describe('registry consistency', () => {
    it('all ARTIFACT_TYPES have corresponding registry entries', () => {
      for (const type of ARTIFACT_TYPES) {
        expect(ARTIFACT_REGISTRY[type]).toBeDefined()
      }
    })

    it('all registry keys are in ARTIFACT_TYPES', () => {
      const registryKeys = Object.keys(ARTIFACT_REGISTRY) as ArtifactType[]
      for (const key of registryKeys) {
        expect(ARTIFACT_TYPES).toContain(key)
      }
    })
  })

  describe('getArtifactEntry', () => {
    it('returns correct entry for each artifact type', () => {
      for (const type of ARTIFACT_TYPES) {
        const entry = getArtifactEntry(type)
        expect(entry).toBeDefined()
        expect(entry.type).toBe(type)
        expect(entry).toBe(ARTIFACT_REGISTRY[type])
      }
    })
  })
})

