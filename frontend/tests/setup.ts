import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

// RTL only auto-registers cleanup when `afterEach` is a global, which it
// isn't here since vitest globals are disabled.
afterEach(cleanup)
