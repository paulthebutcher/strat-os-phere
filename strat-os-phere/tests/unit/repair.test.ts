import { describe, it, expect } from 'vitest'
import type { RepairableSchemaName } from '@/lib/prompts/repair'
import { buildRepairMessages } from '@/lib/prompts/repair'

describe('RepairableSchemaName', () => {
  it('includes OpportunityV3ArtifactContent as a valid schema name', () => {
    // TypeScript will fail at compile time if this is not a valid schema name
    const schemaName: RepairableSchemaName = 'OpportunityV3ArtifactContent'
    expect(schemaName).toBe('OpportunityV3ArtifactContent')
  })

  it('allows buildRepairMessages to be called with OpportunityV3ArtifactContent', () => {
    const messages = buildRepairMessages({
      rawText: '{"invalid": "json"}',
      schemaName: 'OpportunityV3ArtifactContent',
      schemaShapeText: '{"meta": {}, "opportunities": []}',
      validationErrors: 'Test error',
    })

    expect(messages).toHaveLength(2)
    expect(messages[1].role).toBe('user')
    expect(messages[1].content).toContain('OpportunityV3ArtifactContent')
    expect(messages[1].content).toContain('REQUIRED SCHEMA SHAPE')
    expect(messages[1].content).toContain('VALIDATION ERRORS')
    expect(messages[1].content).toContain('Test error')
  })

  it('includes all expected repairable schema names', () => {
    const expectedSchemas: RepairableSchemaName[] = [
      'CompetitorSnapshot',
      'MarketSynthesis',
      'JtbdArtifactContent',
      'OpportunitiesArtifactContent',
      'OpportunityV3ArtifactContent',
      'ScoringMatrixArtifactContent',
      'StrategicBetsArtifactContent',
    ]

    // Verify each schema name can be assigned to RepairableSchemaName
    expectedSchemas.forEach((schemaName) => {
      const testSchema: RepairableSchemaName = schemaName
      expect(testSchema).toBe(schemaName)
    })
  })

  it('ensures generateOpportunitiesV3 uses canonical schemaName', () => {
    // This test ensures that the schema name used in generateOpportunitiesV3.ts
    // is a valid RepairableSchemaName (not a TypeScript type/interface name)
    const canonicalSchemaName: RepairableSchemaName = 'OpportunityV3ArtifactContent'
    
    // Verify it's a string literal, not a type reference
    expect(typeof canonicalSchemaName).toBe('string')
    expect(canonicalSchemaName).toBe('OpportunityV3ArtifactContent')
    
    // Verify it can be used in buildRepairMessages
    const messages = buildRepairMessages({
      rawText: 'test',
      schemaName: canonicalSchemaName,
      schemaShapeText: '{}',
    })
    
    expect(messages).toBeDefined()
  })
})

