// jest.setup.js (CommonJS)
// Corre antes de cada suite de testes.

const fetchMock = require("jest-fetch-mock");

fetchMock.enableMocks();
