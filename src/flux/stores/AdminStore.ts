// src/flux/stores/AdminStore.ts
import { BaseStore } from "./BaseStore";
import { Dispatcher } from "../dispatcher/Dispatcher";
import { AdminActionTypes } from "../actions/admin.action";

import type { Meal } from "../types/cart.types";
import type { User } from "../types/auth.types";
import type { Employee, Report } from "../types/admin.types";

export type AdminState = {
  meals: Meal[];
  clients: User[];
  reports: Report[];
  employees: Employee[];
  loading: boolean;
  error: string | null;
};

const initialState: AdminState = {
  meals: [],
  clients: [],
  reports: [],
  employees: [],
  loading: false,
  error: null,
};

export class AdminStoreClass extends BaseStore {
  private state: AdminState = initialState;

  constructor() {
    super();
    Dispatcher.register(this.onDispatch.bind(this));
  }

  getState(): AdminState {
    return this.state;
  }

  private setState(next: Partial<AdminState>) {
    this.state = { ...this.state, ...next };
    this.emitChange();
  }

  private onDispatch(action: any) {
    switch (action.type) {
      // ---- Meals ----
      case AdminActionTypes.MEALS_REQUEST:
        this.setState({ loading: true, error: null });
        return;

      case AdminActionTypes.MEALS_SUCCESS:
        this.setState({ loading: false, meals: action.payload?.meals ?? [], error: null });
        return;

      case AdminActionTypes.MEALS_FAILURE:
        this.setState({ loading: false, error: action.payload?.error ?? "Erro ao carregar refeições." });
        return;

      case AdminActionTypes.MEAL_ADD_SUCCESS: {
        const meal: Meal | undefined = action.payload?.meal;
        if (!meal) return;
        this.setState({ meals: [meal, ...this.state.meals] });
        return;
      }

      case AdminActionTypes.MEAL_UPDATE_SUCCESS: {
        const mealId: string = action.payload?.mealId;
        const changes: Partial<Meal> = action.payload?.changes ?? {};
        this.setState({
          meals: this.state.meals.map((m) => (m.id === mealId ? { ...m, ...changes } : m)),
        });
        return;
      }

      case AdminActionTypes.MEAL_REMOVE_SUCCESS: {
        const mealId: string = action.payload?.mealId;
        this.setState({ meals: this.state.meals.filter((m) => m.id !== mealId) });
        return;
      }

      case AdminActionTypes.STOCK_UPDATE_SUCCESS: {
        const mealId: string = action.payload?.mealId;
        const deltaOrValue: number = Number(action.payload?.deltaOrValue ?? 0);
        const absolute: boolean = !!action.payload?.absolute;

        this.setState({
          meals: this.state.meals.map((m) => {
            if (m.id !== mealId) return m;
            const current = Number((m as any).stock ?? 0);
            const nextStock = absolute ? Math.max(0, deltaOrValue) : Math.max(0, current + deltaOrValue);
            return { ...m, stock: nextStock, available: nextStock > 0 };
          }),
        });
        return;
      }

      // promo
      case AdminActionTypes.PROMO_SET_SUCCESS: {
        const mealId: string = action.payload?.mealId;
        const promo = action.payload?.promo ?? null;
        this.setState({
          meals: this.state.meals.map((m) => (m.id === mealId ? { ...m, promo } : m)),
        });
        return;
      }

      case AdminActionTypes.PROMO_REMOVE_SUCCESS: {
        const mealId: string = action.payload?.mealId;
        this.setState({
          meals: this.state.meals.map((m) => (m.id === mealId ? { ...m, promo: null } : m)),
        });
        return;
      }

      // ---- Clients ----
      case AdminActionTypes.CLIENTS_REQUEST:
        this.setState({ loading: true, error: null });
        return;

      case AdminActionTypes.CLIENTS_SUCCESS:
        this.setState({ loading: false, clients: action.payload?.clients ?? [], error: null });
        return;

      case AdminActionTypes.CLIENTS_FAILURE:
        this.setState({ loading: false, error: action.payload?.error ?? "Erro ao carregar clientes." });
        return;

      case AdminActionTypes.CLIENT_PATCH_SUCCESS: {
        const email: string = action.payload?.email;
        const changes = action.payload?.changes ?? {};
        this.setState({
          clients: this.state.clients.map((c) => (c.email === email ? { ...c, ...changes } : c)),
        });
        return;
      }

      case AdminActionTypes.CLIENT_REMOVE_SUCCESS: {
        const email: string = action.payload?.email;
        this.setState({ clients: this.state.clients.filter((c) => c.email !== email) });
        return;
      }

      // ---- Reports ----
      case AdminActionTypes.REPORTS_REQUEST:
        this.setState({ loading: true, error: null });
        return;

      case AdminActionTypes.REPORTS_SUCCESS:
        this.setState({ loading: false, reports: action.payload?.reports ?? [], error: null });
        return;

      case AdminActionTypes.REPORTS_FAILURE:
        this.setState({ loading: false, error: action.payload?.error ?? "Erro ao carregar reports." });
        return;

      case AdminActionTypes.REPORT_RESOLVE_SUCCESS: {
        const reportId: string = action.payload?.reportId;
        this.setState({
          reports: this.state.reports.map((r) => (r.id === reportId ? { ...r, resolved: true } : r)),
        });
        return;
      }

      case AdminActionTypes.ADD_REPORT: {
  const report = action.payload?.report;
  if (!report) return;

  this.setState({
    reports: [report, ...this.state.reports],
  });
  return;
}

      case AdminActionTypes.RESOLVE_REPORT: {
  const reportId: string = action.payload?.reportId;
  this.setState({
    reports: this.state.reports.map((r) =>
      r.id === reportId ? { ...r, resolved: true } : r
    ),
  });
  return;
}

      // ---- Employees ----
      case AdminActionTypes.EMPLOYEES_REQUEST:
        this.setState({ loading: true, error: null });
        return;

      case AdminActionTypes.EMPLOYEES_SUCCESS:
        this.setState({ loading: false, employees: action.payload?.employees ?? [], error: null });
        return;

      case AdminActionTypes.EMPLOYEES_FAILURE:
        this.setState({ loading: false, error: action.payload?.error ?? "Erro ao carregar funcionários." });
        return;

      case AdminActionTypes.EMPLOYEE_ADD_SUCCESS: {
        const employee: Employee | undefined = action.payload?.employee;
        if (!employee) return;
        this.setState({ employees: [employee, ...this.state.employees] });
        return;
      }

      case AdminActionTypes.EMPLOYEE_REMOVE_SUCCESS: {
        const employeeId: string = action.payload?.employeeId;
        this.setState({ employees: this.state.employees.filter((e) => e.id !== employeeId) });
        return;
      }

      default:
        return;
    }
  }
}

export const AdminStore = new AdminStoreClass();
