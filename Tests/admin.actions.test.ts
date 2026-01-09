

// Mock supabase helpers and dispatcher
jest.mock('../app/supabase', () => ({
  fetchTable: jest.fn(),
  insertRow: jest.fn(),
  updateRows: jest.fn(),
  deleteRows: jest.fn(),
}));

jest.mock('../src/flux/dispatcher/Dispatcher', () => ({
  Dispatcher: { dispatch: jest.fn() },
}));

import { fetchTable, insertRow } from '../app/supabase';
import { AdminActions, AdminActionTypes } from '../src/flux/actions/admin.action';
import { Dispatcher } from '../src/flux/dispatcher/Dispatcher';

describe('AdminActions', () => {
  beforeEach(() => {
    (Dispatcher.dispatch as jest.Mock).mockClear();
    (fetchTable as jest.Mock).mockReset();
    (insertRow as jest.Mock).mockReset();
  });

  test('initMeals normalizes stock and dispatches success', async () => {
    // mock fetchTable returning a meal with stock as string and undefined available/promo
    (fetchTable as jest.Mock).mockResolvedValueOnce([
      { id: '1', name: 'Sopa', stock: '3' },
      { id: '2', name: 'Salada', stock: 0 },
    ]);
    await AdminActions.initMeals();
    // Should dispatch MEALS_REQUEST then MEALS_SUCCESS
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AdminActionTypes.MEALS_REQUEST);
    expect(types).toContain(AdminActionTypes.MEALS_SUCCESS);
    // Verify that meals are normalized: stock numeric, available based on stock, promo default null
    const successCall = (Dispatcher.dispatch as jest.Mock).mock.calls.find(([action]) => action.type === AdminActionTypes.MEALS_SUCCESS);
    expect(successCall).toBeDefined();
    const meals = successCall![0].payload.meals;
    expect(meals[0]).toEqual({ id: '1', name: 'Sopa', stock: 3, available: true, promo: null });
    expect(meals[1]).toEqual({ id: '2', name: 'Salada', stock: 0, available: false, promo: null });
  });

  test('addMeal calls insertRow and dispatches MEAL_ADD_SUCCESS', async () => {
    const mealData = { name: 'Frango', price: 4.5, stock: 2 } as any;
    (insertRow as jest.Mock).mockResolvedValueOnce({ id: '9', ...mealData });
    await AdminActions.addMeal(mealData);
    expect(insertRow).toHaveBeenCalledWith('meals', expect.objectContaining({ name: 'Frango' }));
    const types = (Dispatcher.dispatch as jest.Mock).mock.calls.map((c) => c[0].type);
    expect(types).toContain(AdminActionTypes.MEAL_ADD_SUCCESS);
    const call = (Dispatcher.dispatch as jest.Mock).mock.calls.find(([action]) => action.type === AdminActionTypes.MEAL_ADD_SUCCESS);
    expect(call![0].payload.meal.id).toBe('9');
    expect(call![0].payload.meal.name).toBe('Frango');
  });
});