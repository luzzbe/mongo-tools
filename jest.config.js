module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "ts-jest",
  },
  testMatch: ["**/*.spec.ts"],
  coveragePathIgnorePatterns: ["node_modules"],
}
