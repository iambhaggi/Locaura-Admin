module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  detectOpenHandles: true,
  forceExit: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/']
};
