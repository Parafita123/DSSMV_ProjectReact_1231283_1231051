// src/flux/stores/AdminStore.ts
import { BaseStore } from "./BaseStore";
import { Dispatcher } from "../dispatcher/Dispatcher";
import { AdminActionTypes } from "../actions/admin.action";
import type { Meal } from "../types/cart.types";

export type Report = {
  id: string;
  clientEmail: string;
  orderId: string;
  type: string;
  description: string;
  createdAt: string;
  resolved: boolean;
};

export type AdminState = {
  meals: Meal[];
  reports: Report[];
  loadingMeals: boolean;
  errorMeals: string | null;
};

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export class AdminStoreClass extends BaseStore {
  private state: AdminState = {
    meals: [],
    reports: [],
    loadingMeals: false,
    errorMeals: null,
  };

  constructor() {
    super();
    Dispatcher.register(this.onDispatch.bind(this));
  }

  public getState(): AdminState {
    return this.state;
  }

  public getMeals(): Meal[] {
    return this.state.meals;
  }

  public getReports(): Report[] {
    return this.state.reports;
  }

  /**
   * ✅ FIX do "uncaught error" ao finalizar pedido:
   * O CartStore chama AdminStore.updateStock(mealId, -1).
   * Se o teu Meal tiver "stock" (ou "quantity") nós atualizamos.
   * Se não existir nenhum campo de stock, isto é no-op (não rebenta).
   */
  public updateStock(mealId: string, delta: number) {
    const idx = this.state.meals.findIndex((m: any) => m?.id === mealId);
    if (idx === -1) return;

    const current: any = this.state.meals[idx];
    const updated: any = { ...current };

    // tenta atualizar "stock" se existir
    if (typeof updated.stock === "number") {
      updated.stock = updated.stock + delta;
      if (updated.stock <= 0) {
        updated.stock = 0;
        // se existir available, marca indisponível
        if (typeof updated.available === "boolean") updated.available = false;
      }
    }

    // fallback: alguns projetos usam "quantity"
    if (typeof updated.quantity === "number") {
      updated.quantity = updated.quantity + delta;
      if (updated.quantity <= 0) {
        updated.quantity = 0;
        if (typeof updated.available === "boolean") updated.available = false;
      }
    }

    // Se não existir nenhum campo numérico, não faz nada (mas também não crasha)
    this.state = {
      ...this.state,
      meals: this.state.meals.map((m, i) => (i === idx ? updated : m)),
    };
    this.emitChange();
  }

  private onDispatch(action: any) {
    switch (action.type) {
      // ===== MEALS =====
      case AdminActionTypes.MEALS_REQUEST: {
        this.state = { ...this.state, loadingMeals: true, errorMeals: null };
        this.emitChange();
        return;
      }

      case AdminActionTypes.MEALS_SUCCESS: {
        const meals: Meal[] = action.payload?.meals ?? [];
        this.state = {
          ...this.state,
          meals,
          loadingMeals: false,
          errorMeals: null,
        };
        this.emitChange();
        return;
      }

      case AdminActionTypes.MEALS_FAILURE: {
        const error = action.payload?.error ?? "Erro ao carregar refeições.";
        this.state = { ...this.state, loadingMeals: false, errorMeals: error };
        this.emitChange();
        return;
      }

      // ===== REPORTS =====
      case AdminActionTypes.ADD_REPORT: {
        const data = action.payload?.data;
        if (!data) return;

        const report: Report = {
          id: makeId(),
          clientEmail: data.clientEmail,
          orderId: data.orderId,
          type: data.type,
          description: data.description,
          createdAt: new Date().toISOString(),
          resolved: false,
        };

        this.state = { ...this.state, reports: [report, ...this.state.reports] };
        this.emitChange();
        return;
      }

      case AdminActionTypes.RESOLVE_REPORT: {
        const reportId: string | undefined = action.payload?.reportId;
        if (!reportId) return;

        this.state = {
          ...this.state,
          reports: this.state.reports.map((r) =>
            r.id === reportId ? { ...r, resolved: true } : r
          ),
        };
        this.emitChange();
        return;
      }

      default:
        return;
    }
  }
}

export const AdminStore = new AdminStoreClass();
