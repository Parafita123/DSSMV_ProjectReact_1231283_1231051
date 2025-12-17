import React, { createContext, ReactNode, useContext, useMemo, useReducer } from "react";

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

const MOCK_USERS: User[] = [
  {
    name: "Cliente Cheio",
    email: "cheio@gmail.com",
    nif: "123456789",
    address: "Rua dos Galos Cheios, 1",
    phone: "910000001",
    password: "123",
    role: "client",
    banned: false,
    blocked: false,
  },
  {
    name: "Cliente Vazio",
    email: "vazio@gmail.com",
    nif: "987654321",
    address: "Rua dos Galos Vazios, 2",
    phone: "910000002",
    password: "123",
    role: "client",
    banned: false,
    blocked: false,
  },
  {
    name: "Guta",
    email: "guta@gmail.com",
    nif: "000000000",
    address: "",
    phone: "",
    password: "1231051",
    role: "admin",
    banned: false,
    blocked: false,
  },
];

const initialState: AuthState = {
  users: MOCK_USERS,
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
  register: (data: User) => { success: boolean; message?: string };
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  updateUser: (data: Partial<User>) => void;

  // Mantemos isto porque o teu AdminContext já usa users + setUsers
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const currentUser = useMemo(
    () => state.users.find((u) => u.email === state.currentEmail) || null,
    [state.users, state.currentEmail]
  );

  const register = (data: User) => {
    const exists = state.users.some((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (exists) return { success: false, message: "Já existe uma conta com este email." };

    const newUser: User = {
      ...data,
      role: data.role ?? "client",
      banned: data.banned ?? false,
      blocked: data.blocked ?? false,
      email: data.email.trim(),
    };

    dispatch({ type: "REGISTER", payload: newUser });
    return { success: true };
  };

  const login = (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const user = state.users.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.password === password
    );

    if (!user) return { success: false, message: "Email ou password inválidos." };
    if (user.banned) return { success: false, message: "Esta conta está banida." };
    if (user.blocked) return { success: false, message: "Esta conta está bloqueada." };

    dispatch({ type: "LOGIN_SUCCESS", payload: { email: user.email } });
    return { success: true };
  };

  const logout = () => dispatch({ type: "LOGOUT" });

  const updateUser = (data: Partial<User>) => {
    if (!currentUser) return;
    dispatch({ type: "UPDATE_USER", payload: { email: currentUser.email, changes: data } });
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
