/**
 * Single Source of Truth for Zod in Contracts
 * 
 * All contract files should import z from here:
 *   import { z } from './z'
 * 
 * This prevents "Cannot find name 'z'" errors and provides
 * a single place to configure Zod if needed in the future.
 */

import { z } from 'zod'
export { z }

