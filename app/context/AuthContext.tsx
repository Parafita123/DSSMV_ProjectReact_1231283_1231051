import React, { createContext, ReactNode, useContext, useMemo, useReducer, useEffect } from "react";
import { fetchTable, insertRow, updateRows, deleteRows, supabaseFetch } from "../supabase";

export type User = {
  name: string;
  email: string;
  nif: string;
  address: string;
  phone: string;
  password: string;
  role: "client" | "admin" | "employee";
  banned: boolean;
  blocked: boolean;
};

type AuthState = {
  users: User[];
  currentEmail: string | null;
};

type AuthAction =
  | { type: "REGISTER"; payload: User }
  | { type: "LOGIN_SUCCESS"; payload: { email: string } }
  | { type: "LOGOUT" }
  | { type: "UPDATE_USER"; payload: { email: string; changes: Partial<User> } }
  | { type: "SET_USERS"; payload: User[] };

// Initial state starts empty.  Users are loaded from Supabase when the provider mounts.
const initialState: AuthState = {
  users: [],
  currentEmail: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "REGISTER":
      return {
        ...state,
        users: [...state.users, action.payload],
        currentEmail: action.payload.email,
      };

    case "LOGIN_SUCCESS":
      return { ...state, currentEmail: action.payload.email };

    case "LOGOUT":
      return { ...state, currentEmail: null };

    case "UPDATE_USER":
      return {
        ...state,
        users: state.users.map((u) =>
          u.email === action.payload.email ? { ...u, ...action.payload.changes } : u
        ),
      };

    case "SET_USERS":
      return { ...state, users: action.payload };

    default:
      return state;
  }
}

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  register: (data: User) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;

  // Mantemos isto porque o teu AdminContext já usa users + setUsers
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load all users from Supabase on mount.  This will populate the users array
  // with any records in the `clients` table.  Administrators should also
  // reside in this table with role = 'admin'.
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data: any[] = await fetchTable("clients", "*");
        dispatch({ type: "SET_USERS", payload: data as User[] });
      } catch (err) {
        console.error("Erro ao carregar utilizadores do Supabase:", err);
      }
    };
    loadUsers();
  }, []);

  const currentUser = useMemo(
    () => state.users.find((u) => u.email === state.currentEmail) || null,
    [state.users, state.currentEmail]
  );

  /**
   * Register a new user in Supabase and update the local state.  This method
   * performs a case-insensitive check against existing users to avoid
   * duplicate emails.  On success it logs in the newly created user.
   */
  const register = async (
    data: User
  ): Promise<{ success: boolean; message?: string }> => {
    const exists = state.users.some(
      (u) => u.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (exists)
      return { success: false, message: "Já existe uma conta com este email." };
    const newUser: User = {
      ...data,
      role: data.role ?? "client",
      banned: data.banned ?? false,
      blocked: data.blocked ?? false,
      email: data.email.trim(),
    };
    try {
      await insertRow("clients", {
        name: newUser.name,
        email: newUser.email,
        nif: newUser.nif,
        address: newUser.address,
        phone: newUser.phone,
        password: newUser.password,
        role: newUser.role,
        banned: newUser.banned,
        blocked: newUser.blocked,
      });
      dispatch({ type: "REGISTER", payload: newUser });
      dispatch({ type: "LOGIN_SUCCESS", payload: { email: newUser.email } });
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return {
        success: false,
        message: err.message || "Erro no registo.",
      };
    }
  };

  /**
   * Log in by querying Supabase for the given email.  Validates the
   * password and banned/blocked flags.
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const results: any[] = await supabaseFetch("clients", {
        query: `select=*&email=eq.${encodeURIComponent(normalizedEmail)}`,
      });
      const user = results && results.length > 0 ? (results[0] as User) : null;
      if (!user || user.password !== password) {
        return { success: false, message: "Email ou password inválidos." };
      }
      if (user.banned)
        return { success: false, message: "Esta conta está banida." };
      if (user.blocked)
        return { success: false, message: "Esta conta está bloqueada." };
      dispatch({ type: "LOGIN_SUCCESS", payload: { email: user.email } });
      // Add to local users list if missing
      if (!state.users.some((u) => u.email === user.email)) {
        dispatch({ type: "SET_USERS", payload: [...state.users, user] });
      }
      return { success: true };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: err.message || "Erro no login." };
    }
  };

  const logout = () => dispatch({ type: "LOGOUT" });

  /**
   * Update the current user's data in Supabase and sync the local state.
   */
  const updateUser = async (data: Partial<User>) => {
    if (!currentUser) return;
    try {
      await updateRows("clients", `email=eq.${currentUser.email}`, data);
      dispatch({
        type: "UPDATE_USER",
        payload: { email: currentUser.email, changes: data },
      });
    } catch (err) {
      console.error("Erro ao atualizar utilizador:", err);
    }
  };

  // Compat: o AdminContext usa setUsers(...) — damos uma implementação que despacha SET_USERS
  const setUsers: React.Dispatch<React.SetStateAction<User[]>> = (updater) => {
    const next =
      typeof updater === "function"
        ? (updater as (prev: User[]) => User[])(state.users)
        : updater;
    dispatch({ type: "SET_USERS", payload: next });
  };

  const value = useMemo(
    () => ({
      user: currentUser,
      isAuthenticated: !!currentUser,
      register,
      login,
      logout,
      updateUser,
      users: state.users,
      setUsers,
    }),
    [currentUser, state.users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  return ctx;
};
