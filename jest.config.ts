import type { Config } from 'jest'

const config: Config = {
  silent: false,
  verbose: true,
  testEnvironment: 'node',
  testMatch: ['**/*.steps.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
}

export default config