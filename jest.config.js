/**
 * Jest configuration for the DSSMV React project.
 *
 * Utiliza o preset ts‑jest para compilar ficheiros TypeScript durante os testes.
 * Define o ambiente como Node, uma vez que os testes se focam na lógica
 * (stores, actions e utilitários) e não na renderização de componentes.
 *
 * O mapeamento de módulos react‑native para react‑native-web permite que
 * importações de 'react-native' não causem erros quando avaliadas em ambiente Node.
 *
 * O ficheiro jest.setup.js activa o jest-fetch-mock, permitindo substituir
 * chamadas a fetch por mocks nas suites de testes.
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react-native$': 'react-native-web',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
};

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  globals: {
    "ts-jest": {
      diagnostics: false,
      isolatedModules: true,
    },
  },
};
