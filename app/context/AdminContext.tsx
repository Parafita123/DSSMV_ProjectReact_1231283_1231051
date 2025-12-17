import React, {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useEffect,
  useReducer,
} from "react";
import { useAuth, User } from "./AuthContext";
import { getAllOrders } from "./CartContext";

/**
 * AdminContext (Flux)
 * - Store: AdminState
 * - Actions: AdminAction { type, payload }
 * - Reducer: adminReducer(state, action)
 * - Dispatcher: dispatch(action) via useReducer
 */

export type Client = {
  email: string;
  name: string;
  banned: boolean;
  blocked: boolean;
};

export type Promotion = {
  discountPercent: number;
  startAt: string;
  endAt: string;
};

export type Meal = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  spicy?: boolean;
  available: boolean;
  stock: number;
  promo?: Promotion | null;
};

export type Employee = {
  id: string;
  name: string;
  role: string;
  email: string;
};

export type Report = {
  id: string;
  clientEmail: string;
  orderId: string;
  type: string;
  description: string;
  createdAt: string;
  resolved: boolean;
};

export type AdminContextType = {
  clients: Client[];
  meals: Meal[];
  employees: Employee[];
  reports: Report[];
  addClient: (client: { email: string; name: string }) => void;
  banClient: (email: string) => void;
  unbanClient: (email: string) => void;
  blockClient: (email: string) => void;
  unblockClient: (email: string) => void;
  addMeal: (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    spicy?: boolean;
    stock: number;
  }) => void;
  updateMeal: (mealId: string, changes: Partial<Meal>) => void;
  updateStock: (mealId: string, change: number, absolute?: boolean) => void;
  addEmployee: (emp: { name: string; role: string; email: string }) => void;
  removeEmployee: (id: string) => void;
  addPromotion: (
    mealId: string,
    discountPercent: number,
    startAt: string,
    endAt: string
  ) => void;
  removePromotion: (mealId: string) => void;
  addReport: (data: {
    clientEmail: string;
    orderId: string;
    type: string;
    description: string;
  }) => void;
  resolveReport: (reportId: string) => void;
  getBilling: (timeframe: number | "all") => number;
};

type AdminState = {
  clients: Client[];
  meals: Meal[];
  employees: Employee[];
  reports: Report[];
};

type AdminAction =
  | { type: "SYNC_CLIENTS_FROM_USERS"; payload: { users: User[] } }
  | { type: "ADD_CLIENT"; payload: { email: string; name: string } }
  | { type: "SET_CLIENT_FLAG"; payload: { email: string; flag: "banned" | "blocked"; value: boolean } }
  | {
      type: "ADD_MEAL";
      payload: {
        id: string;
        name: string;
        description: string;
        price: number;
        category: string;
        spicy?: boolean;
        stock: number;
      };
    }
  | { type: "UPDATE_MEAL"; payload: { mealId: string; changes: Partial<Meal> } }
  | { type: "UPDATE_STOCK"; payload: { mealId: string; change: number; absolute?: boolean } }
  | { type: "ADD_EMPLOYEE"; payload: Employee }
  | { type: "REMOVE_EMPLOYEE"; payload: { id: string } }
  | {
      type: "ADD_PROMOTION";
      payload: { mealId: string; discountPercent: number; startAt: string; endAt: string };
    }
  | { type: "REMOVE_PROMOTION"; payload: { mealId: string } }
  | { type: "ADD_REPORT"; payload: Report }
  | { type: "RESOLVE_REPORT"; payload: { reportId: string } };

const seedMeals: Meal[] = [
  {
    id: "1",
    name: "Frango Piri-Piri Pós-Galo",
    description: "Frango assado no carvão com molho picante da casa.",
    price: 9.5,
    category: "Especialidade da Casa",
    spicy: true,
    available: true,
    stock: 10,
    promo: null,
  },
  {
    id: "2",
    name: "Hambúrguer do Galo",
    description: "Hambúrguer de frango crocante com queijo e molho especial.",
    price: 8.0,
    category: "Hambúrgueres",
    available: true,
    stock: 10,
    promo: null,
  },
  {
    id: "3",
    name: "Menu Almoço Pós-Galo",
    description: "Prato do dia + bebida + café.",
    price: 7.5,
    category: "Menu do Dia",
    available: true,
    stock: 10,
    promo: null,
  },
  {
    id: "4",
    name: "Salada Fit da Capoeira",
    description: "Mix de verdes, frango grelhado e molho de iogurte.",
    price: 7.0,
    category: "Saladas",
    available: false,
    stock: 0,
    promo: null,
  },
];

function usersToClients(users: User[]): Client[] {
  return users
    .filter((u) => u.role === "client")
    .map((u) => ({
      email: u.email,
      name: u.name,
      banned: u.banned,
      blocked: u.blocked,
    }));
}

function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    case "SYNC_CLIENTS_FROM_USERS": {
      return { ...state, clients: usersToClients(action.payload.users) };
    }

    case "ADD_CLIENT": {
      if (state.clients.some((c) => c.email === action.payload.email)) return state;
      return {
        ...state,
        clients: [...state.clients, { ...action.payload, banned: false, blocked: false }],
      };
    }

    case "SET_CLIENT_FLAG": {
      return {
        ...state,
        clients: state.clients.map((c) =>
          c.email === action.payload.email ? { ...c, [action.payload.flag]: action.payload.value } : c
        ),
      };
    }

    case "ADD_MEAL": {
      const newMeal: Meal = {
        id: action.payload.id,
        name: action.payload.name,
        description: action.payload.description,
        price: action.payload.price,
        category: action.payload.category,
        spicy: action.payload.spicy,
        stock: action.payload.stock,
        available: action.payload.stock > 0,
        promo: null,
      };
      return { ...state, meals: [...state.meals, newMeal] };
    }

    case "UPDATE_MEAL": {
      return {
        ...state,
        meals: state.meals.map((m) => {
          if (m.id !== action.payload.mealId) return m;
          const merged = { ...m, ...action.payload.changes };
          const stock = merged.stock;
          return { ...merged, available: stock > 0 };
        }),
      };
    }

    case "UPDATE_STOCK": {
      return {
        ...state,
        meals: state.meals.map((m) => {
          if (m.id !== action.payload.mealId) return m;
          const newStock = action.payload.absolute ? action.payload.change : m.stock + action.payload.change;
          const safeStock = newStock < 0 ? 0 : newStock;
          return { ...m, stock: safeStock, available: safeStock > 0 };
        }),
      };
    }

    case "ADD_EMPLOYEE":
      return { ...state, employees: [...state.employees, action.payload] };

    case "REMOVE_EMPLOYEE":
      return { ...state, employees: state.employees.filter((e) => e.id !== action.payload.id) };

    case "ADD_PROMOTION":
      return {
        ...state,
        meals: state.meals.map((m) =>
          m.id === action.payload.mealId
            ? { ...m, promo: { discountPercent: action.payload.discountPercent, startAt: action.payload.startAt, endAt: action.payload.endAt } }
            : m
        ),
      };

    case "REMOVE_PROMOTION":
      return { ...state, meals: state.meals.map((m) => (m.id === action.payload.mealId ? { ...m, promo: null } : m)) };

    case "ADD_REPORT":
      return { ...state, reports: [action.payload, ...state.reports] };

    case "RESOLVE_REPORT":
      return {
        ...state,
        reports: state.reports.map((r) => (r.id === action.payload.reportId ? { ...r, resolved: true } : r)),
      };

    default:
      return state;
  }
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { users, setUsers } = useAuth();

  const [state, dispatch] = useReducer(adminReducer, {
    clients: usersToClients(users),
    meals: seedMeals,
    employees: [],
    reports: [],
  });

  // Flux: manter a store do Admin sincronizada com a store do Auth (users)
  useEffect(() => {
    dispatch({ type: "SYNC_CLIENTS_FROM_USERS", payload: { users } });
  }, [users]);

  // ==== Client management (wrappers que fazem dispatch + (quando preciso) side-effects no Auth) ====

  const addClient = (client: { email: string; name: string }) => {
    dispatch({ type: "ADD_CLIENT", payload: client });

    // Side-effect: garantir que o AuthContext tem o user correspondente
    setUsers((prev) => {
      if (prev.some((u) => u.email === client.email)) return prev;
      const newUser: User = {
        name: client.name,
        email: client.email,
        nif: "",
        address: "",
        phone: "",
        password: "123456",
        role: "client",
        banned: false,
        blocked: false,
      };
      return [...prev, newUser];
    });
  };

  const setClientFlag = (email: string, flag: "banned" | "blocked", value: boolean) => {
    dispatch({ type: "SET_CLIENT_FLAG", payload: { email, flag, value } });

    // Side-effect: refletir no AuthContext
    setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, [flag]: value } : u)));
  };

  const banClient = (email: string) => setClientFlag(email, "banned", true);
  const unbanClient = (email: string) => setClientFlag(email, "banned", false);
  const blockClient = (email: string) => setClientFlag(email, "blocked", true);
  const unblockClient = (email: string) => setClientFlag(email, "blocked", false);

  // ==== Meal management ====

  const addMeal = (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    spicy?: boolean;
    stock: number;
  }) => {
    const id = Date.now().toString();
    dispatch({ type: "ADD_MEAL", payload: { id, ...data } });
  };

  const updateMeal = (mealId: string, changes: Partial<Meal>) => {
    dispatch({ type: "UPDATE_MEAL", payload: { mealId, changes } });
  };

  const updateStock = (mealId: string, change: number, absolute?: boolean) => {
    dispatch({ type: "UPDATE_STOCK", payload: { mealId, change, absolute } });
  };

  // ==== Employee management ====

  const addEmployee = (emp: { name: string; role: string; email: string }) => {
    const id = Date.now().toString();
    dispatch({ type: "ADD_EMPLOYEE", payload: { id, name: emp.name, role: emp.role, email: emp.email } });
  };

  const removeEmployee = (id: string) => {
    dispatch({ type: "REMOVE_EMPLOYEE", payload: { id } });
  };

  // ==== Promotion management ====

  const addPromotion = (mealId: string, discountPercent: number, startAt: string, endAt: string) => {
    dispatch({ type: "ADD_PROMOTION", payload: { mealId, discountPercent, startAt, endAt } });
  };

  const removePromotion = (mealId: string) => {
    dispatch({ type: "REMOVE_PROMOTION", payload: { mealId } });
  };

  // ==== Reports management ====

  const addReport = (data: { clientEmail: string; orderId: string; type: string; description: string }) => {
    const id = Date.now().toString();
    const report: Report = {
      id,
      clientEmail: data.clientEmail,
      orderId: data.orderId,
      type: data.type,
      description: data.description,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    dispatch({ type: "ADD_REPORT", payload: report });
  };

  const resolveReport = (reportId: string) => {
    dispatch({ type: "RESOLVE_REPORT", payload: { reportId } });
  };

  // Billing usa os pedidos globais (CartContext)
  const getBilling = (timeframe: number | "all"): number => {
    const orders = getAllOrders();
    let threshold = 0;
    if (timeframe !== "all") threshold = Date.now() - timeframe * 24 * 60 * 60 * 1000;

    return orders.reduce((sum, order) => {
      if (timeframe !== "all") {
        const orderDate = new Date(order.createdAt).getTime();
        if (orderDate < threshold) return sum;
      }
      return sum + order.total;
    }, 0);
  };

  const value = useMemo(
    () => ({
      clients: state.clients,
      meals: state.meals,
      employees: state.employees,
      reports: state.reports,
      addClient,
      banClient,
      unbanClient,
      blockClient,
      unblockClient,
      addMeal,
      updateMeal,
      updateStock,
      addEmployee,
      removeEmployee,
      addPromotion,
      removePromotion,
      addReport,
      resolveReport,
      getBilling,
    }),
    [state]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextType => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin deve ser usado dentro de um AdminProvider");
  return ctx;
};
