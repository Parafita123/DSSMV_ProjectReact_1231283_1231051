import fetchMock from 'jest-fetch-mock';
import {
  deleteRow,
  fetchTable,
  insertRow,
  updateRows,
} from '../app/supabase';

// Reset mocks before each test to avoid leakage between cases
beforeEach(() => {
  fetchMock.resetMocks();
});

describe('supabase helper functions', () => {
  test('fetchTable constructs query and returns parsed data', async () => {
    // Arrange: prepare a mocked JSON response
    const mockData = [{ id: 1, name: 'Alice' }];
    fetchMock.mockResponseOnce(JSON.stringify(mockData));

    // Act: call fetchTable
    const result = await fetchTable('clients');

    // Assert: verify fetch was called with correct URL and options
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/clients\?select=\*/);
    expect(options).toBeDefined();
    // Should return the parsed array
    expect(result).toEqual(mockData);
  });

  test('insertRow posts data with proper headers and body', async () => {
    const row = { email: 'test@example.com' };
    fetchMock.mockResponseOnce(JSON.stringify({ id: '10', ...row }));

    await insertRow('clients', row);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/clients$/);
    expect(options?.method).toBe('POST');
    expect(options?.headers).toHaveProperty('Content-Type', 'application/json');
    expect(options?.body).toBe(JSON.stringify(row));
  });

  test('updateRows issues a PATCH request with query', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([{ id: '1', name: 'Bob' }]));

    await updateRows('clients', 'id=eq.1', { name: 'Bob' });
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/clients\?id=eq\.1/);
    expect(options?.method).toBe('PATCH');
    expect(options?.body).toBe(JSON.stringify({ name: 'Bob' }));
  });

  test('deleteRow calls DELETE method and resolves true', async () => {
    // Successful delete returns empty body
    fetchMock.mockResponseOnce('', { status: 200 });

    const result = await deleteRow('clients', 'id', '5');
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/rest\/v1\/clients\?id=eq\.5/);
    expect(options?.method).toBe('DELETE');
    expect(result).toBe(true);
  });
});