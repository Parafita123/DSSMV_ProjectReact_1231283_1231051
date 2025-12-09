import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useMemo,
} from "react";

// We extend the User model to support different roles and admin flags.
// Each user has a role that determines which area of the app they can access.
// By default, users are of type "client", but an admin user has role "admin".
// We also add banned and blocked flags so the admin can control access.
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

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  register: (data: User) => { success: boolean; message?: string };
  login: (email: string, password: string) => { success: boolean; message?: string };
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  /**
   * Expose the list of users so that admin screens can list clients and employees.
   */
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔹 utilizadores mock
// We seed the context with two regular client accounts and a special admin account.
const MOCK_USERS: User[] = [
  {
    name: "Cliente Cheio",
    email: "cliente.cheio@comidaposgalos.pt",
    nif: "123456789",
    address: "Rua dos Galos Cheios, 1",
    phone: "910000001",
    password: "123456",
    role: "client",
    banned: false,
    blocked: false,
  },
  {
    name: "Cliente Vazio",
    email: "cliente.vazio@comidaposgalos.pt",
    nif: "987654321",
    address: "Rua dos Galos Vazios, 2",
    phone: "910000002",
    password: "123456",
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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  const currentUser = users.find((u) => u.email === currentEmail) || null;

  const register = (data: User) => {
    const exists = users.some((u) => u.email === data.email);
    if (exists) {
      return { success: false, message: "Já existe uma conta com este email." };
    }
    // Always register a user with role client and default flags unless they are explicitly provided
    const newUser: User = {
      ...data,
      role: data.role ?? "client",
      banned: data.banned ?? false,
      blocked: data.blocked ?? false,
    };
    setUsers((prev) => [...prev, newUser]);
    setCurrentEmail(newUser.email);
    return { success: true };
  };

  const login = (email: string, password: string) => {
    const user = users.find(
      (u) => u.email === email.trim() && u.password === password
    );
    if (!user) {
      return { success: false, message: "Email ou password inválidos." };
    }
    if (user.banned) {
      return { success: false, message: "Esta conta está banida." };
    }
    if (user.blocked) {
      return { success: false, message: "Esta conta está bloqueada." };
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
      users,
      setUsers,
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
