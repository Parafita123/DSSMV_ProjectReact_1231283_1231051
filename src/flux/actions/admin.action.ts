// src/flux/actions/admin.action.ts
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { Meal } from "../types/cart.types";
import { fetchTable } from "../../../app/supabase";

export const AdminActionTypes = {
  // Meals
  MEALS_REQUEST: "ADMIN/MEALS_REQUEST",
  MEALS_SUCCESS: "ADMIN/MEALS_SUCCESS",
  MEALS_FAILURE: "ADMIN/MEALS_FAILURE",

  // Reports
  ADD_REPORT: "ADMIN/ADD_REPORT",
  RESOLVE_REPORT: "ADMIN/RESOLVE_REPORT",
} as const;

export const AdminActions = {
  async initMeals() {
    Dispatcher.dispatch({ type: AdminActionTypes.MEALS_REQUEST });

    try {

      const meals = await fetchTable<Meal>("meals", "*");

      Dispatcher.dispatch({
        type: AdminActionTypes.MEALS_SUCCESS,
        payload: { meals: meals ?? [] },
      });
    } catch (err: any) {
      Dispatcher.dispatch({
        type: AdminActionTypes.MEALS_FAILURE,
        payload: { error: err?.message || "Erro ao carregar refeições." },
      });
    }
  },
};

//Mantém os named exports (como já tinhas)
export function addReport(data: {
  clientEmail: string;
  orderId: string;
  type: string;
  description: string;
}) {
  Dispatcher.dispatch({ type: AdminActionTypes.ADD_REPORT, payload: { data } });
}

export function resolveReport(reportId: string) {
  Dispatcher.dispatch({
    type: AdminActionTypes.RESOLVE_REPORT,
    payload: { reportId },
  });
}
