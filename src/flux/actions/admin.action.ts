// src/flux/actions/admin.action.ts
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal } from "../types/cart.types";
import type { User } from "../types/auth.types";
import type { Employee, Report } from "../types/admin.types";

import { fetchTable, insertRow, updateRows, deleteRows } from "../../../app/supabase";

export const AdminActionTypes = {
  // Meals
  MEALS_REQUEST: "ADMIN/MEALS_REQUEST",
  MEALS_SUCCESS: "ADMIN/MEALS_SUCCESS",
  MEALS_FAILURE: "ADMIN/MEALS_FAILURE",

  MEAL_ADD_SUCCESS: "ADMIN/MEAL_ADD_SUCCESS",
  MEAL_UPDATE_SUCCESS: "ADMIN/MEAL_UPDATE_SUCCESS",
  MEAL_REMOVE_SUCCESS: "ADMIN/MEAL_REMOVE_SUCCESS",
  STOCK_UPDATE_SUCCESS: "ADMIN/STOCK_UPDATE_SUCCESS",

  // Clients
  CLIENTS_REQUEST: "ADMIN/CLIENTS_REQUEST",
  CLIENTS_SUCCESS: "ADMIN/CLIENTS_SUCCESS",
  CLIENTS_FAILURE: "ADMIN/CLIENTS_FAILURE",
  CLIENT_PATCH_SUCCESS: "ADMIN/CLIENT_PATCH_SUCCESS",
  CLIENT_REMOVE_SUCCESS: "ADMIN/CLIENT_REMOVE_SUCCESS",

  // Reports (compat + flux)
  REPORTS_REQUEST: "ADMIN/REPORTS_REQUEST",
  REPORTS_SUCCESS: "ADMIN/REPORTS_SUCCESS",
  REPORTS_FAILURE: "ADMIN/REPORTS_FAILURE",
  REPORT_RESOLVE_SUCCESS: "ADMIN/REPORT_RESOLVE_SUCCESS",

  // ✅ compat com AdminStore antigo
  ADD_REPORT: "ADMIN/ADD_REPORT",
  RESOLVE_REPORT: "ADMIN/RESOLVE_REPORT",

  // Employees
  EMPLOYEES_REQUEST: "ADMIN/EMPLOYEES_REQUEST",
  EMPLOYEES_SUCCESS: "ADMIN/EMPLOYEES_SUCCESS",
  EMPLOYEES_FAILURE: "ADMIN/EMPLOYEES_FAILURE",
  EMPLOYEE_ADD_SUCCESS: "ADMIN/EMPLOYEE_ADD_SUCCESS",
  EMPLOYEE_REMOVE_SUCCESS: "ADMIN/EMPLOYEE_REMOVE_SUCCESS",

  // Promotions
  PROMO_SET_SUCCESS: "ADMIN/PROMO_SET_SUCCESS",
  PROMO_REMOVE_SUCCESS: "ADMIN/PROMO_REMOVE_SUCCESS",
} as const;

function toMsg(err: any, fallback: string) {
  return err?.message || fallback;
}

/**
 * ✅ Tu disseste: Supabase só tem tables: suggestions, clients, meals.
 * Então employees/reports ficam em memória (persistência local).
 */
let memEmployees: Employee[] = [];
let memReports: Report[] = [];

export const AdminActions = {
  // -------- Meals (Supabase) --------
  async initMeals() {
    Dispatcher.dispatch({ type: AdminActionTypes.MEALS_REQUEST });
    try {
      const meals = await fetchTable<Meal>("meals", "*");

      // 🔥 Normalizar para não “sumir” tudo por available/stock undefined
      const normalized = (meals ?? []).map((m) => {
        const stockNum = Number((m as any).stock ?? 0);
        const available =
          typeof (m as any).available === "boolean" ? (m as any).available : stockNum > 0;

        return {
          ...m,
          stock: Number.isFinite(stockNum) ? stockNum : 0,
          available,
          promo: (m as any).promo ?? null,
        } as Meal;
      });

      Dispatcher.dispatch({
        type: AdminActionTypes.MEALS_SUCCESS,
        payload: { meals: normalized },
      });
    } catch (err: any) {
      Dispatcher.dispatch({
        type: AdminActionTypes.MEALS_FAILURE,
        payload: { error: toMsg(err, "Erro ao carregar refeições.") },
      });
    }
  },

  async addMeal(data: Omit<Meal, "id"> & Partial<Pick<Meal, "available">>) {
    const payload: any = {
      ...data,
      stock: Number(data.stock ?? 0),
      available:
        typeof data.available === "boolean"
          ? data.available
          : Number(data.stock ?? 0) > 0,
      promo: (data as any).promo ?? null,
    };

    const inserted = await insertRow("meals", payload);

    const meal: Meal =
      (inserted as any) ??
      ({
        id: String(Date.now()),
        ...payload,
      } as Meal);

    Dispatcher.dispatch({
      type: AdminActionTypes.MEAL_ADD_SUCCESS,
      payload: { meal },
    });
  },

  async updateMeal(mealId: string, changes: Partial<Meal>) {
    const patch: any = { ...changes };

    if (patch.stock != null) {
      const s = Number(patch.stock);
      patch.stock = Number.isFinite(s) ? s : 0;
      patch.available = patch.stock > 0;
    }

    await updateRows("meals", `id=eq.${mealId}`, patch);

    Dispatcher.dispatch({
      type: AdminActionTypes.MEAL_UPDATE_SUCCESS,
      payload: { mealId, changes: patch },
    });
  },

  async removeMeal(mealId: string) {
    await deleteRows("meals", `id=eq.${mealId}`);

    Dispatcher.dispatch({
      type: AdminActionTypes.MEAL_REMOVE_SUCCESS,
      payload: { mealId },
    });
  },

  async updateStock(mealId: string, deltaOrValue: number, absolute = false) {
    Dispatcher.dispatch({
      type: AdminActionTypes.STOCK_UPDATE_SUCCESS,
      payload: { mealId, deltaOrValue, absolute },
    });

    // Persistência no Supabase (meals existe)
    if (absolute) {
      const stock = Math.max(0, Number(deltaOrValue) || 0);
      await updateRows("meals", `id=eq.${mealId}`, {
        stock,
        available: stock > 0,
      });
      return;
    }

    // delta: lê estado atual e calcula próximo
    const rows = await fetchTable<Meal>("meals", "id,stock,available");
    const current = (rows ?? []).find((m) => m.id === mealId);
    const currentStock = Number((current as any)?.stock ?? 0);
    const next = Math.max(0, currentStock + (Number(deltaOrValue) || 0));

    await updateRows("meals", `id=eq.${mealId}`, {
      stock: next,
      available: next > 0,
    });
  },

  // -------- Clients (Supabase) --------
  async initClients() {
    Dispatcher.dispatch({ type: AdminActionTypes.CLIENTS_REQUEST });
    try {
      const clients = await fetchTable<User>("clients", "*");
      Dispatcher.dispatch({
        type: AdminActionTypes.CLIENTS_SUCCESS,
        payload: { clients: clients ?? [] },
      });
    } catch (err: any) {
      Dispatcher.dispatch({
        type: AdminActionTypes.CLIENTS_FAILURE,
        payload: { error: toMsg(err, "Erro ao carregar clientes.") },
      });
    }
  },

  async banClient(email: string) {
    await updateRows("clients", `email=eq.${encodeURIComponent(email)}`, { banned: true });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { banned: true } },
    });
  },

  async unbanClient(email: string) {
    await updateRows("clients", `email=eq.${encodeURIComponent(email)}`, { banned: false });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { banned: false } },
    });
  },

  async blockClient(email: string) {
    await updateRows("clients", `email=eq.${encodeURIComponent(email)}`, { blocked: true });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { blocked: true } },
    });
  },

  async unblockClient(email: string) {
    await updateRows("clients", `email=eq.${encodeURIComponent(email)}`, { blocked: false });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { blocked: false } },
    });
  },

  async removeClient(email: string) {
    await deleteRows("clients", `email=eq.${encodeURIComponent(email)}`);
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_REMOVE_SUCCESS,
      payload: { email },
    });
  },

  // -------- Reports (MEMÓRIA) --------
  async initReports() {
    Dispatcher.dispatch({ type: AdminActionTypes.REPORTS_REQUEST });
    try {
      Dispatcher.dispatch({
        type: AdminActionTypes.REPORTS_SUCCESS,
        payload: { reports: memReports },
      });
    } catch (err: any) {
      Dispatcher.dispatch({
        type: AdminActionTypes.REPORTS_FAILURE,
        payload: { error: toMsg(err, "Erro ao carregar reports.") },
      });
    }
  },

  // compat: views chamam resolveReport(reportId)
  async resolveReport(reportId: string) {
    memReports = memReports.map((r) => (r.id === reportId ? { ...r, resolved: true } : r));

    Dispatcher.dispatch({
      type: AdminActionTypes.REPORT_RESOLVE_SUCCESS,
      payload: { reportId },
    });

    // compat com store antigo
    Dispatcher.dispatch({
      type: AdminActionTypes.RESOLVE_REPORT,
      payload: { reportId },
    });
  },

  // compat caso exista código antigo a chamar addReport
  addReport(data: {
    clientEmail: string;
    orderId: string;
    type: string;
    description: string;
  }) {
    const report: Report = {
      id: String(Date.now()),
      clientEmail: data.clientEmail,
      orderId: data.orderId,
      type: data.type,
      description: data.description,
      createdAt: new Date().toISOString(),
      resolved: false,
    };

    memReports = [report, ...memReports];

    Dispatcher.dispatch({
      type: AdminActionTypes.ADD_REPORT,
      payload: { data },
    });

    Dispatcher.dispatch({
      type: AdminActionTypes.REPORTS_SUCCESS,
      payload: { reports: memReports },
    });
  },

  // -------- Employees (MEMÓRIA) --------
  async initEmployees() {
    Dispatcher.dispatch({ type: AdminActionTypes.EMPLOYEES_REQUEST });
    try {
      Dispatcher.dispatch({
        type: AdminActionTypes.EMPLOYEES_SUCCESS,
        payload: { employees: memEmployees },
      });
    } catch (err: any) {
      Dispatcher.dispatch({
        type: AdminActionTypes.EMPLOYEES_FAILURE,
        payload: { error: toMsg(err, "Erro ao carregar funcionários.") },
      });
    }
  },

  async addEmployee(data: Omit<Employee, "id">) {
    const employee: Employee = {
      id: String(Date.now()),
      ...data,
      createdAt: new Date().toISOString(),
    };

    memEmployees = [employee, ...memEmployees];

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEE_ADD_SUCCESS,
      payload: { employee },
    });

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEES_SUCCESS,
      payload: { employees: memEmployees },
    });
  },

  async removeEmployee(employeeId: string) {
    memEmployees = memEmployees.filter((e) => e.id !== employeeId);

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEE_REMOVE_SUCCESS,
      payload: { employeeId },
    });

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEES_SUCCESS,
      payload: { employees: memEmployees },
    });
  },

  // -------- Promotions (Supabase meals) --------
  async addPromotion(mealId: string, discountPercent: number, startAt: string, endAt: string) {
    const promo = { discountPercent, startAt, endAt };
    await updateRows("meals", `id=eq.${mealId}`, { promo });

    Dispatcher.dispatch({
      type: AdminActionTypes.PROMO_SET_SUCCESS,
      payload: { mealId, promo },
    });
  },

  async removePromotion(mealId: string) {
    await updateRows("meals", `id=eq.${mealId}`, { promo: null });

    Dispatcher.dispatch({
      type: AdminActionTypes.PROMO_REMOVE_SUCCESS,
      payload: { mealId },
    });
  },
};
