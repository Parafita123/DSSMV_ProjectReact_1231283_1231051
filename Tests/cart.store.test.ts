import { CartStore } from '../src/flux/stores/CartStore';
import { Dispatcher } from '../src/flux/dispatcher/Dispatcher';

describe('CartStore', () => {
  // Helper to reset cart before each test
  beforeEach(() => {
    // Clear cart items via clear action
    Dispatcher.dispatch({ type: 'CART/CLEAR' });
  });

  test('getTotalItems and getTotalPrice reflect current cart state', () => {
    // Initially empty
    expect(CartStore.getTotalItems()).toBe(0);
    expect(CartStore.getTotalPrice()).toBe(0);
    // Add two items with price
    Dispatcher.dispatch({ type: 'CART/ADD_ITEM', payload: { meal: { id: '1', price: 5 } } });
    Dispatcher.dispatch({ type: 'CART/ADD_ITEM', payload: { meal: { id: '2', price: 3 } } });
    expect(CartStore.getTotalItems()).toBe(2);
    expect(CartStore.getTotalPrice()).toBe(8);
  });

  test('removing item updates items array', () => {
    Dispatcher.dispatch({ type: 'CART/ADD_ITEM', payload: { meal: { id: '1', price: 10 } } });
    Dispatcher.dispatch({ type: 'CART/ADD_ITEM', payload: { meal: { id: '2', price: 15 } } });
    expect(CartStore.getTotalItems()).toBe(2);
    // Remove first item
    Dispatcher.dispatch({ type: 'CART/REMOVE_ITEM', payload: { index: 0 } });
    expect(CartStore.getTotalItems()).toBe(1);
    expect(CartStore.getTotalPrice()).toBe(15);
  });

  test('adding order clears items and prepends order', () => {
    // Add items
    Dispatcher.dispatch({ type: 'CART/ADD_ITEM', payload: { meal: { id: '1', price: 7 } } });
    expect(CartStore.getTotalItems()).toBe(1);
    // Add existing orders to hydrate
    const existingOrders = [ { id: 'A', total: 10, items: [] } ];
    Dispatcher.dispatch({ type: 'CART/SET_ORDERS', payload: { orders: existingOrders } });
    // Dispatch ADD_ORDER
    const newOrder = { id: 'B', total: 7, items: [ { id: '1', price: 7 } ] };
    Dispatcher.dispatch({ type: 'CART/ADD_ORDER', payload: { order: newOrder } });
    // Items should be cleared
    expect(CartStore.getTotalItems()).toBe(0);
    // Orders should have new order first
    const orders = CartStore.getState().orders;
    expect(orders[0]).toEqual(newOrder);
    expect(orders[1]).toEqual(existingOrders[0]);
  });
});