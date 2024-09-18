module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  projects: [
    {
      displayName: "COWF",
      preset: "ts-jest",
      testMatch: ["<rootDir>/tests/COWF/**/*.test.ts"],
    },
    {
      displayName: "Artf",
      preset: "ts-jest",
      testMatch: ["<rootDir>/tests/Artf/**/*.test.ts"],
    },
  ],
};
