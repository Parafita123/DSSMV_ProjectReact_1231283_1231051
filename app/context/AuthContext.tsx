import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

export type User = {
  name: string;
  email: string;
  nif: string;
  address: string;
  phone: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  register: (data: User) => { success: boolean; message?: string };
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔹 dois utilizadores mock
const MOCK_USERS: User[] = [
  {
    name: "Cliente Cheio",
    email: "cliente.cheio@comidaposgalos.pt",
    nif: "123456789",
    address: "Rua dos Galos Cheios, 1",
    phone: "910000001",
    password: "123456",
  },
  {
    name: "Cliente Vazio",
    email: "cliente.vazio@comidaposgalos.pt",
    nif: "987654321",
    address: "Rua dos Galos Vazios, 2",
    phone: "910000002",
    password: "123456",
  },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const currentUser = users.find((u) => u.email === currentEmail) || null;

  const register = (data: User) => {
    const exists = users.some((u) => u.email === data.email);
    if (exists) {
      return { success: false, message: "Já existe uma conta com este email." };
    }
    setUsers((prev) => [...prev, data]);
    setCurrentEmail(data.email);
    return { success: true };
  };

  const login = (email: string, password: string) => {
    const user = users.find(
      (u) => u.email === email.trim() && u.password === password
    );
    if (!user) {
      return { success: false, message: "Email ou password inválidos." };
    }
    setCurrentEmail(user.email);
    return { success: true };
  };

  const logout = () => {
    setCurrentEmail(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (!currentUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.email === currentUser.email ? { ...u, ...data } : u
      )
    );
  };

  const value = useMemo(
    () => ({
      user: currentUser,
      isAuthenticated: !!currentUser,
      register,
      login,
      logout,
      updateUser,
    }),
    [currentUser, users]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return ctx;
};
