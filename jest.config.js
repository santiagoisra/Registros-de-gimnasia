// eslint-disable-next-line @typescript-eslint/no-require-imports
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
  // Usar ts-jest para los tests de hooks puros fuera de pages/app
  transformOverrides: {
    '\\.test\\.(ts|tsx)$': 'ts-jest',
  },
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // El transform global sigue para fallback
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  transformIgnorePatterns: ['/node_modules/'],
}

module.exports = createJestConfig(customJestConfig) 