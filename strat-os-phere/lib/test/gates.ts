/**
 * Test gates for feature-flagged contract tests.
 * 
 * These gates allow tests to be written in parallel with implementation PRs
 * without breaking CI. Tests are skipped by default and only run when the
 * corresponding environment variable is set.
 */

export const shouldRunGuestAuthContractTests =
  process.env.GUEST_AUTH_CONTRACT_TESTS === "1";

