// src/flux/actions/auth.action.ts
import { Dispatcher } from "../dispatcher/Dispatcher";
import type { User } from "../types/auth.types";
import { fetchTable, insertRow, updateRows, supabaseFetch } from "../../../app/supabase";

// ✅ precisamos do email atual para o updateUser(changes)
import { AuthStore } from "../stores/AuthStore";

export const AuthActionTypes = {
  INIT_REQUEST: "AUTH/INIT_REQUEST",
  INIT_SUCCESS: "AUTH/INIT_SUCCESS",
  INIT_FAILURE: "AUTH/INIT_FAILURE",

  REGISTER_REQUEST: "AUTH/REGISTER_REQUEST",
  REGISTER_SUCCESS: "AUTH/REGISTER_SUCCESS",
  REGISTER_FAILURE: "AUTH/REGISTER_FAILURE",

  LOGIN_REQUEST: "AUTH/LOGIN_REQUEST",
  LOGIN_SUCCESS: "AUTH/LOGIN_SUCCESS",
  LOGIN_FAILURE: "AUTH/LOGIN_FAILURE",

  LOGOUT: "AUTH/LOGOUT",

  UPDATE_REQUEST: "AUTH/UPDATE_REQUEST",
  UPDATE_SUCCESS: "AUTH/UPDATE_SUCCESS",
  UPDATE_FAILURE: "AUTH/UPDATE_FAILURE",

  CLEAR_ERROR: "AUTH/CLEAR_ERROR",

  // (mantém os teus events auxiliares que já estás a usar)
  SET_LOADING: "AUTH/SET_LOADING",
  SET_ERROR: "AUTH/SET_ERROR",
  UPSERT_USER: "AUTH/UPSERT_USER",
} as const;

function setLoading(loading: boolean) {
  Dispatcher.dispatch({ type: AuthActionTypes.SET_LOADING, payload: { loading } });
}

function setError(error: string | null) {
  Dispatcher.dispatch({ type: AuthActionTypes.SET_ERROR, payload: { error } });
}

export const AuthActions = {
  clearError() {
    Dispatcher.dispatch({ type: AuthActionTypes.CLEAR_ERROR });
  },

  async init() {
    Dispatcher.dispatch({ type: AuthActionTypes.INIT_REQUEST });
    setLoading(true);
    setError(null);

    try {
      const data = await fetchTable<User>("clients", "*");
      Dispatcher.dispatch({
        type: AuthActionTypes.INIT_SUCCESS,
        payload: { users: data ?? [] },
      });
    } catch (err: any) {
      const msg = err?.message || "Erro ao carregar utilizadores.";
      Dispatcher.dispatch({
        type: AuthActionTypes.INIT_FAILURE,
        payload: { error: msg },
      });
    } finally {
      setLoading(false);
    }
  },

  async register(user: User) {
    Dispatcher.dispatch({ type: AuthActionTypes.REGISTER_REQUEST });
    setLoading(true);
    setError(null);

    try {
      const email = user.email.trim();
      const normalizedEmail = email.toLowerCase();

      // Proteção contra duplicados (igual ao Context antigo)
      const exists = await supabaseFetch("clients", {
        query: `select=*&email=eq.${encodeURIComponent(normalizedEmail)}`,
      });

      if (Array.isArray(exists) && exists.length > 0) {
        throw new Error("Já existe uma conta com este email.");
      }

      const payload: User = {
        ...user,
        email,
        role: user.role ?? "client",
        banned: user.banned ?? false,
        blocked: user.blocked ?? false,
      };

      await insertRow("clients", payload);

      // Atualiza store local + login automático
      Dispatcher.dispatch({
        type: AuthActionTypes.REGISTER_SUCCESS,
        payload: { user: payload },
      });

      Dispatcher.dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { email: payload.email },
      });
    } catch (err: any) {
      const msg = err?.message || "Erro no registo.";
      Dispatcher.dispatch({
        type: AuthActionTypes.REGISTER_FAILURE,
        payload: { error: msg },
      });
    } finally {
      setLoading(false);
    }
  },

  async login(email: string, password: string) {
    Dispatcher.dispatch({ type: AuthActionTypes.LOGIN_REQUEST });
    setLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();

      const results: any[] = await supabaseFetch("clients", {
        query: `select=*&email=eq.${encodeURIComponent(normalizedEmail)}`,
      });

      const user = results && results.length > 0 ? (results[0] as User) : null;

      if (!user || user.password !== password) {
        throw new Error("Email ou password inválidos.");
      }
      if (user.banned) throw new Error("Esta conta está banida.");
      if (user.blocked) throw new Error("Esta conta está bloqueada.");

      // garante que o user está no array local
      Dispatcher.dispatch({
        type: AuthActionTypes.UPSERT_USER,
        payload: { user },
      });

      Dispatcher.dispatch({
        type: AuthActionTypes.LOGIN_SUCCESS,
        payload: { email: user.email },
      });
    } catch (err: any) {
      const msg = err?.message || "Erro no login.";
      Dispatcher.dispatch({
        type: AuthActionTypes.LOGIN_FAILURE,
        payload: { error: msg },
      });
    } finally {
      setLoading(false);
    }
  },

  logout() {
    Dispatcher.dispatch({ type: AuthActionTypes.LOGOUT });
  },

  /**
   * ✅ Mantém o teu Conta.tsx limpo:
   * updateUser(changes) resolve o email do utilizador atual através do AuthStore
   * e faz update no Supabase + UPDATE_SUCCESS.
   */
  async updateUser(changes: Partial<User>) {
    Dispatcher.dispatch({ type: AuthActionTypes.UPDATE_REQUEST });
    setLoading(true);
    setError(null);

    try {
      const me = AuthStore.getCurrentUser();
      const email = me?.email;

      if (!email) {
        throw new Error("Sem utilizador autenticado para atualizar.");
      }

      await updateRows("clients", `email=eq.${email}`, changes);

      Dispatcher.dispatch({
        type: AuthActionTypes.UPDATE_SUCCESS,
        payload: { email, changes },
      });
    } catch (err: any) {
      const msg = err?.message || "Erro ao atualizar utilizador.";
      Dispatcher.dispatch({
        type: AuthActionTypes.UPDATE_FAILURE,
        payload: { error: msg },
      });
    } finally {
      setLoading(false);
    }
  },
};

/**
 * ✅ IMPORTANTÍSSIMO:
 * O teu Conta.tsx está a fazer:
 *   import { updateUser, logout } from ".../auth.action"
 * Por isso criamos named exports que apontam para AuthActions.
 */
export const clearError = AuthActions.clearError;
export const init = AuthActions.init;
export const register = AuthActions.register;
export const login = AuthActions.login;
export const logout = AuthActions.logout;
export const updateUser = AuthActions.updateUser;
