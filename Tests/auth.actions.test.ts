

// Mock supabase helpers and Dispatcher before importing AuthActions
jest.mock('../app/supabase', () => ({
  supabaseFetch: jest.fn(),
  insertRow: jest.fn(),
  updateRows: jest.fn(),
}));

jest.mock('../src/flux/dispatcher/Dispatcher', () => ({
  Dispatcher: { dispatch: jest.fn() },
}));

jest.mock('../src/flux/stores/AuthStore', () => ({
  AuthStore: {
    getCurrentUser: jest.fn(),
  },
}));

import { insertRow, supabaseFetch, updateRows } from '../app/supabase';
import { AuthActions, AuthActionTypes } from '../src/flux/actions/auth.action';
import { Dispatcher } from '../src/flux/dispatcher/Dispatcher';
import { AuthStore } from '../src/flux/stores/AuthStore';

describe('AuthActions', () => {
  beforeEach(() => {
    // Clear dispatch and mocked functions before each test
    (Dispatcher.dispatch as jest.Mock).mockClear();
    (supabaseFetch as jest.Mock).mockReset();
    (insertRow as jest.Mock).mockReset();
    (updateRows as jest.Mock).mockReset();
    (AuthStore.getCurrentUser as jest.Mock).mockReset();
  });

  test('register inserts new user when email is unique', async () => {
    // supabaseFetch returns empty array => no duplicate
    (supabaseFetch as jest.Mock).mockResolvedValueOnce([]);
    (insertRow as jest.Mock).mockResolvedValueOnce({ id: '1' });

    const user = { email: 'test@example.com', password: '123' } as any;
    await AuthActions.register(user);
    // Should check for duplicates
    expect(supabaseFetch).toHaveBeenCalledWith('clients', {
      query: expect.stringContaining('email'),
    });
    // Should insert user
    expect(insertRow).toHaveBeenCalledWith('clients', expect.objectContaining({ email: 'test@example.com' }));
    // Should dispatch REGISTER_SUCCESS and LOGIN_SUCCESS eventually
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AuthActionTypes.REGISTER_SUCCESS);
    expect(types).toContain(AuthActionTypes.LOGIN_SUCCESS);
  });

  test('register fails if duplicate email exists', async () => {
    // supabaseFetch returns existing user => duplicate
    (supabaseFetch as jest.Mock).mockResolvedValueOnce([ { email: 'test@example.com' } ]);
    const user = { email: 'test@example.com', password: '123' } as any;
    await AuthActions.register(user);
    // insertRow should not be called
    expect(insertRow).not.toHaveBeenCalled();
    // Should dispatch REGISTER_FAILURE
    const calls = (Dispatcher.dispatch as jest.Mock).mock.calls;
    const failureCall = calls.find(([action]) => action.type === AuthActionTypes.REGISTER_FAILURE);
    expect(failureCall).toBeDefined();
  });

  test('login succeeds with correct credentials', async () => {
    const user = { email: 'test@example.com', password: '123', banned: false, blocked: false };
    (supabaseFetch as jest.Mock).mockResolvedValueOnce([user]);
    await AuthActions.login(user.email, user.password);
    // Should dispatch UPSERT_USER and LOGIN_SUCCESS
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AuthActionTypes.UPSERT_USER);
    expect(types).toContain(AuthActionTypes.LOGIN_SUCCESS);
  });

  test('login fails on invalid password', async () => {
    const user = { email: 'test@example.com', password: '123' };
    (supabaseFetch as jest.Mock).mockResolvedValueOnce([user]);
    await AuthActions.login(user.email, 'wrong');
    // Should dispatch LOGIN_FAILURE
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AuthActionTypes.LOGIN_FAILURE);
  });

  test('updateUser updates data of current user', async () => {
    (AuthStore.getCurrentUser as jest.Mock).mockReturnValue({ email: 'user@example.com' });
    (updateRows as jest.Mock).mockResolvedValueOnce([{}]);
    await AuthActions.updateUser({ name: 'New Name' });
    expect(updateRows).toHaveBeenCalledWith('clients', 'email=eq.user@example.com', { name: 'New Name' });
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AuthActionTypes.UPDATE_SUCCESS);
  });
});