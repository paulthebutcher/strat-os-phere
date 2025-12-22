/**
 * Compile-time contract tests for artifact type system
 * These tests ensure type consistency between registry, Zod schemas, and runtime types
 * 
 * This file is included in the TypeScript build to catch type mismatches at compile time
 */

import type { ArtifactType } from '../artifacts/registry'
import { z } from 'zod'

// Import the schema to get its inferred type
import { ArtifactTypeSchema } from '../schemas/artifacts'

/**
 * Test 1: Zod schema inferred type matches ArtifactType union
 * This will fail at compile time if there's a mismatch
 */
type InferredArtifactType = z.infer<typeof ArtifactTypeSchema>
type _ArtifactTypeMatch = InferredArtifactType extends ArtifactType
  ? ArtifactType extends InferredArtifactType
    ? true
    : never
  : never
const _artifactTypeVerified: _ArtifactTypeMatch = true
void _artifactTypeVerified

/**
 * Test 2: All artifact types in registry are valid ArtifactType values
 * This is enforced by the registry structure, but we verify at compile time
 */
import { ARTIFACT_REGISTRY, ARTIFACT_TYPES } from '../artifacts/registry'
type RegistryKeys = keyof typeof ARTIFACT_REGISTRY
type _RegistryKeysMatch = RegistryKeys extends ArtifactType
  ? ArtifactType extends RegistryKeys
    ? true
    : never
  : never
const _registryKeysVerified: _RegistryKeysMatch = true
void _registryKeysVerified

/**
 * Test 3: Schema names are properly typed
 * This ensures RepairableSchemaName matches ArtifactSchemaName
 * Note: They should be the same type since RepairableSchemaName is derived from ArtifactSchemaName
 */
import type { ArtifactSchemaName } from '../artifacts/registry'
import type { RepairableSchemaName } from '../constants/types'
// Verify they are equivalent types
type _SchemaNameMatch1 = ArtifactSchemaName extends RepairableSchemaName ? true : never
type _SchemaNameMatch2 = RepairableSchemaName extends ArtifactSchemaName ? true : never
const _schemaNameVerified1: _SchemaNameMatch1 = true
const _schemaNameVerified2: _SchemaNameMatch2 = true
void _schemaNameVerified1
void _schemaNameVerified2

