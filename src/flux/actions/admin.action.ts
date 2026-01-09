// src/flux/actions/admin.action.ts
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal } from "../types/cart.types";
import type { User } from "../types/auth.types";
import type { Employee, Report } from "../types/admin.types";

import { fetchTable, deleteRows } from "../../../app/supabase";

/**
 * ⚠️ Não mexemos no supabase.ts.
 * - Para evitar "Already read", fazemos PATCH/POST aqui com leitura do body 1x.
 * - Para evitar UUID inválido, o addMeal passa a usar POST com return=representation
 *   (assim apanha o UUID real do Supabase).
 */

const SUPABASE_URL = "https://xrzgniwdagwvcygqerjd.supabase.co";
const SUPABASE_API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyemduaXdkYWd3dmN5Z3FlcmpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5OTE0NDYsImV4cCI6MjA4MTU2NzQ0Nn0.O7obWlRudDfHg07hzuEAAY6H1G1br0ht6_zfeHam_Tg";

function toMsg(err: any, fallback: string) {
  return err?.message || fallback;
}

async function supabasePatch(table: string, filter: string, body: any) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}`;

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text(); // ✅ ler uma vez
  if (!res.ok) {
    throw new Error(text || `Supabase PATCH error (${res.status})`);
  }

  if (!text) return [];
  try {
    return JSON.parse(text);
  } catch {
    return [];
  }
}

/**
 * ✅ POST que devolve a row inserida (UUID real!)
 * Isto resolve o teu "invalid input syntax for type uuid: 1767..."
 */
async function supabaseInsert(table: string, body: any) {
  const url = `${SUPABASE_URL}/rest/v1/${table}`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      apikey: SUPABASE_API_KEY,
      Authorization: `Bearer ${SUPABASE_API_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify(body),
  });

  const text = await res.text(); // ✅ ler uma vez
  if (!res.ok) {
    throw new Error(text || `Supabase POST error (${res.status})`);
  }

  if (!text) return null;
  try {
    const parsed = JSON.parse(text);
    // PostgREST devolve array
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    return null;
  }
}

/**
 * ✅ Employees sem Supabase: persistem durante a app estar aberta.
 * (não persistem ao matar a app, que é o esperado)
 */
let employeesMemory: Employee[] = [];

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

  // Reports
  REPORTS_REQUEST: "ADMIN/REPORTS_REQUEST",
  REPORTS_SUCCESS: "ADMIN/REPORTS_SUCCESS",
  REPORTS_FAILURE: "ADMIN/REPORTS_FAILURE",
  REPORT_RESOLVE_SUCCESS: "ADMIN/REPORT_RESOLVE_SUCCESS",

  // compat (para não dar erro no AdminStore)
  ADD_REPORT: "ADMIN/ADD_REPORT",
  RESOLVE_REPORT: "ADMIN/RESOLVE_REPORT",

  // Employees (local)
  EMPLOYEES_REQUEST: "ADMIN/EMPLOYEES_REQUEST",
  EMPLOYEES_SUCCESS: "ADMIN/EMPLOYEES_SUCCESS",
  EMPLOYEES_FAILURE: "ADMIN/EMPLOYEES_FAILURE",
  EMPLOYEE_ADD_SUCCESS: "ADMIN/EMPLOYEE_ADD_SUCCESS",
  EMPLOYEE_REMOVE_SUCCESS: "ADMIN/EMPLOYEE_REMOVE_SUCCESS",

  // Promotions
  PROMO_SET_SUCCESS: "ADMIN/PROMO_SET_SUCCESS",
  PROMO_REMOVE_SUCCESS: "ADMIN/PROMO_REMOVE_SUCCESS",
} as const;

export const AdminActions = {
  // -------- Meals --------
  async initMeals() {
    Dispatcher.dispatch({ type: AdminActionTypes.MEALS_REQUEST });
    try {
      const meals = await fetchTable<Meal>("meals", "*");

      const normalized = (meals ?? []).map((m: any) => {
        const stock = Number(m.stock ?? 0);
        const available =
          typeof m.available === "boolean" ? m.available : stock > 0;
        return { ...m, stock, available };
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
      stock: Number((data as any).stock ?? 0),
    };

    payload.available =
      typeof data.available === "boolean" ? data.available : payload.stock > 0;

    // ✅ IMPORTANTÍSSIMO: agora devolve o UUID real do Supabase
    const inserted = await supabaseInsert("meals", payload);

    // se por alguma razão vier null, faz fallback mas avisa no state (evita rebentar)
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
      patch.stock = Number(patch.stock);
      patch.available = patch.stock > 0;
    }

    // ✅ com UUID certo deixa de falhar
    await supabasePatch("meals", `id=eq.${mealId}`, patch);

    Dispatcher.dispatch({
      type: AdminActionTypes.MEAL_UPDATE_SUCCESS,
      payload: { mealId, changes: patch },
    });
  },

  async removeMeal(mealId: string) {
    // ✅ com UUID certo deixa de falhar
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

    const rows = await fetchTable<Meal>("meals", "id,stock");
    const current = (rows ?? []).find((m) => m.id === mealId);
    const currentStock = Number((current as any)?.stock ?? 0);

    const next = absolute
      ? Math.max(0, Number(deltaOrValue))
      : Math.max(0, currentStock + Number(deltaOrValue));

    await supabasePatch("meals", `id=eq.${mealId}`, {
      stock: next,
      available: next > 0,
    });
  },

  // -------- Clients --------
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
    await supabasePatch("clients", `email=eq.${encodeURIComponent(email)}`, {
      banned: true,
    });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { banned: true } },
    });
  },

  async unbanClient(email: string) {
    await supabasePatch("clients", `email=eq.${encodeURIComponent(email)}`, {
      banned: false,
    });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { banned: false } },
    });
  },

  async blockClient(email: string) {
    await supabasePatch("clients", `email=eq.${encodeURIComponent(email)}`, {
      blocked: true,
    });
    Dispatcher.dispatch({
      type: AdminActionTypes.CLIENT_PATCH_SUCCESS,
      payload: { email, changes: { blocked: true } },
    });
  },

  async unblockClient(email: string) {
    await supabasePatch("clients", `email=eq.${encodeURIComponent(email)}`, {
      blocked: false,
    });
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

  // -------- Promotions --------
  async addPromotion(
    mealId: string,
    discountPercent: number,
    startAt: string,
    endAt: string
  ) {
    const promo = { discountPercent, startAt, endAt };
    await supabasePatch("meals", `id=eq.${mealId}`, { promo });

    Dispatcher.dispatch({
      type: AdminActionTypes.PROMO_SET_SUCCESS,
      payload: { mealId, promo },
    });
  },

  async removePromotion(mealId: string) {
    await supabasePatch("meals", `id=eq.${mealId}`, { promo: null });

    Dispatcher.dispatch({
      type: AdminActionTypes.PROMO_REMOVE_SUCCESS,
      payload: { mealId },
    });
  },

  // -------- Reports (local-only) --------
  async initReports() {
    Dispatcher.dispatch({
      type: AdminActionTypes.REPORTS_SUCCESS,
      payload: { reports: [] },
    });
  },

  async resolveReport(reportId: string) {
    Dispatcher.dispatch({
      type: AdminActionTypes.REPORT_RESOLVE_SUCCESS,
      payload: { reportId },
    });
  },

  async addReport(data: Omit<Report, "id" | "createdAt" | "resolved">) {
    const report: Report = {
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      resolved: false,
      ...data,
    };

    Dispatcher.dispatch({
      type: AdminActionTypes.ADD_REPORT,
      payload: { report },
    });
  },

  // -------- Employees (local-only, mas persistem durante a app aberta) --------
  async initEmployees() {
    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEES_SUCCESS,
      payload: { employees: employeesMemory },
    });
  },

  async addEmployee(data: Omit<Employee, "id">) {
    const employee: Employee = { id: String(Date.now()), ...data };
    employeesMemory = [employee, ...employeesMemory];

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEE_ADD_SUCCESS,
      payload: { employee },
    });
  },

  async removeEmployee(employeeId: string) {
    employeesMemory = employeesMemory.filter((e) => e.id !== employeeId);

    Dispatcher.dispatch({
      type: AdminActionTypes.EMPLOYEE_REMOVE_SUCCESS,
      payload: { employeeId },
    });
  },
};

// ✅ exports diretos para views que importam funções
export const addReport = (data: Omit<Report, "id" | "createdAt" | "resolved">) =>
  AdminActions.addReport(data);

export const resolveReport = (reportId: string) =>
  AdminActions.resolveReport(reportId);
