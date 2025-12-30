// src/flux/stores/AuthStore.ts
import { BaseStore } from "./BaseStore";
import { Dispatcher } from "../dispatcher/Dispatcher";
import { AuthActionTypes } from "../actions/auth.action";
import type { User } from "../types/auth.types";
import { AuthActions } from "../actions/auth.action";

export type AuthState = {
  users: User[];
  currentEmail: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: AuthState = {
  users: [],
  currentEmail: null,
  loading: false,
  error: null,
};

function upsertUser(list: User[], u: User): User[] {
  const idx = list.findIndex((x) => x.email === u.email);
  if (idx === -1) return [...list, u];
  const copy = [...list];
  copy[idx] = { ...copy[idx], ...u };
  return copy;
}

export class AuthStoreClass extends BaseStore {
  private state: AuthState = initialState;

  constructor() {
    super();
    Dispatcher.register(this.onDispatch.bind(this));
  }

  getState(): AuthState {
    return this.state;
  }

  getCurrentUser(): User | null {
    const email = this.state.currentEmail;
    if (!email) return null;
    return this.state.users.find((u) => u.email === email) ?? null;
  }

  private setState(next: Partial<AuthState>) {
    this.state = { ...this.state, ...next };
    this.emitChange();
  }

  private onDispatch(action: any) {
    switch (action.type) {
      case "AUTH/SET_LOADING":
        this.setState({ loading: !!action.payload?.loading });
        return;

      case "AUTH/SET_ERROR":
        this.setState({ error: action.payload?.error ?? null });
        return;

      case AuthActionTypes.CLEAR_ERROR:
        this.setState({ error: null });
        return;

      case AuthActionTypes.INIT_REQUEST:
        this.setState({ error: null });
        return;

      case AuthActionTypes.INIT_SUCCESS:
        this.setState({ users: action.payload?.users ?? [], error: null });
        return;

      case AuthActionTypes.INIT_FAILURE:
        this.setState({ error: action.payload?.error ?? "Erro ao carregar utilizadores." });
        return;

      case AuthActionTypes.REGISTER_SUCCESS: {
        const user: User = action.payload.user;
        this.setState({ users: upsertUser(this.state.users, user), error: null });
        return;
      }

      case AuthActionTypes.REGISTER_FAILURE:
        this.setState({ error: action.payload?.error ?? "Erro no registo." });
        return;

      case "AUTH/UPSERT_USER": {
        const user: User = action.payload.user;
        this.setState({ users: upsertUser(this.state.users, user) });
        return;
      }

      case AuthActionTypes.LOGIN_SUCCESS:
        this.setState({ currentEmail: action.payload.email, error: null });
        return;

      case AuthActionTypes.LOGIN_FAILURE:
        this.setState({ error: action.payload?.error ?? "Erro no login." });
        return;

      case AuthActionTypes.LOGOUT:
        this.setState({ currentEmail: null });
        return;

      // Ponte para manter o view igual ao antigo (Conta.tsx chama updateUser(changes))
      case "AUTH/UPDATE_ME_REQUEST": {
        const changes: Partial<User> = action.payload?.changes ?? {};
        const current = this.getCurrentUser();
        if (!current) return;

        // chama a action "byEmail" que realmente persiste no Supabase
        AuthActions.updateUser(changes);
        return;
      }

      case AuthActionTypes.UPDATE_SUCCESS: {
        const email: string = action.payload.email;
        const changes: Partial<User> = action.payload.changes;
        this.setState({
          users: this.state.users.map((u) => (u.email === email ? { ...u, ...changes } : u)),
          error: null,
        });
        return;
      }

      case AuthActionTypes.UPDATE_FAILURE:
        this.setState({ error: action.payload?.error ?? "Erro ao atualizar utilizador." });
        return;

      default:
        return;
    }
  }
}

export const AuthStore = new AuthStoreClass();
