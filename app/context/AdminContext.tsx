import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";
import { useAuth, User } from "./AuthContext";
import { getAllOrders, Order } from "./CartContext";

/**
 * This context centralises data and operations that are only relevant to the
 * administrative area of the application. It keeps track of clients, meals,
 * employees, promotions and reports. Because there is no backend in this
 * assignment, everything is stored in memory. When the app restarts the
 * information will reset to defaults.
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
  /** Add a new client manually. Usually invoked when registering a new user. */
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
  /**
   * Compute total billing from all orders. If timeframe is a number it is
   * interpreted as a number of days into the past from now. If timeframe is
   * "all", all orders are counted.
   */
  getBilling: (timeframe: number | "all") => number;
};

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { users, setUsers } = useAuth();

  // Initialise clients from the Auth context. Only users with role "client" are
  // considered clients here. We also mirror the banned/blocked flags so that
  // updating them in this context will propagate to the AuthContext via
  // setUsers.
  const [clients, setClients] = useState<Client[]>(() => {
    return users
      .filter((u) => u.role === "client")
      .map((u) => ({
        email: u.email,
        name: u.name,
        banned: u.banned,
        blocked: u.blocked,
      }));
  });

  // Seed some meals. These match the samples in CartContext but include stock
  // and promo fields. Stock is arbitrarily set to 10 for each.
  const [meals, setMeals] = useState<Meal[]>([
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
  ]);

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [reports, setReports] = useState<Report[]>([]);

  /**
   * When the list of users changes (e.g. registration), make sure clients list
   * includes any new client accounts. This runs on every render, but will only
   * update state when there is a difference.
   */
  React.useEffect(() => {
    const newClients = users
      .filter((u) => u.role === "client")
      .map((u) => ({
        email: u.email,
        name: u.name,
        banned: u.banned,
        blocked: u.blocked,
      }));
    setClients((prev) => {
      // If counts differ or any client flags changed, refresh the list
      if (
        prev.length !== newClients.length ||
        prev.some((c, idx) => {
          const nc = newClients[idx];
          return (
            c.email !== nc.email ||
            c.banned !== nc.banned ||
            c.blocked !== nc.blocked ||
            c.name !== nc.name
          );
        })
      ) {
        return newClients;
      }
      return prev;
    });
  }, [users]);

  // Client management
  const addClient = (client: { email: string; name: string }) => {
    setClients((prev) => {
      if (prev.some((c) => c.email === client.email)) return prev;
      return [...prev, { ...client, banned: false, blocked: false }];
    });
    // ensure AuthContext has the corresponding User entry
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

  const updateClientFlag = (
    email: string,
    flag: "banned" | "blocked",
    value: boolean
  ) => {
    setClients((prev) =>
      prev.map((c) => (c.email === email ? { ...c, [flag]: value } : c))
    );
    // also update in AuthContext
    setUsers((prev) =>
      prev.map((u) =>
        u.email === email ? { ...u, [flag]: value } : u
      )
    );
  };

  const banClient = (email: string) => updateClientFlag(email, "banned", true);
  const unbanClient = (email: string) => updateClientFlag(email, "banned", false);
  const blockClient = (email: string) => updateClientFlag(email, "blocked", true);
  const unblockClient = (email: string) => updateClientFlag(email, "blocked", false);

  // Meal management
  const addMeal = (data: {
    name: string;
    description: string;
    price: number;
    category: string;
    spicy?: boolean;
    stock: number;
  }) => {
    const id = Date.now().toString();
    const newMeal: Meal = {
      id,
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      spicy: data.spicy,
      available: data.stock > 0,
      stock: data.stock,
      promo: null,
    };
    setMeals((prev) => [...prev, newMeal]);
  };

  const updateMeal = (mealId: string, changes: Partial<Meal>) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? {
              ...m,
              ...changes,
              available:
                changes.stock !== undefined
                  ? changes.stock > 0
                  : m.stock > 0,
            }
          : m
      )
    );
  };

  const updateStock = (mealId: string, change: number, absolute?: boolean) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        const newStock = absolute ? change : m.stock + change;
        return {
          ...m,
          stock: newStock < 0 ? 0 : newStock,
          available: newStock > 0,
        };
      })
    );
  };

  // Employee management
  const addEmployee = (emp: { name: string; role: string; email: string }) => {
    const id = Date.now().toString();
    const newEmp: Employee = { id, name: emp.name, role: emp.role, email: emp.email };
    setEmployees((prev) => [...prev, newEmp]);
  };
  const removeEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Promotion management
  const addPromotion = (
    mealId: string,
    discountPercent: number,
    startAt: string,
    endAt: string
  ) => {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? {
              ...m,
              promo: { discountPercent, startAt, endAt },
            }
          : m
      )
    );
  };
  const removePromotion = (mealId: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, promo: null } : m))
    );
  };

  // Reports management
  const addReport = (data: {
    clientEmail: string;
    orderId: string;
    type: string;
    description: string;
  }) => {
    const id = Date.now().toString();
    const newReport: Report = {
      id,
      clientEmail: data.clientEmail,
      orderId: data.orderId,
      type: data.type,
      description: data.description,
      createdAt: new Date().toISOString(),
      resolved: false,
    };
    setReports((prev) => [newReport, ...prev]);
  };
  const resolveReport = (reportId: string) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, resolved: true } : r))
    );
  };

  const getBilling = (timeframe: number | "all"): number => {
    const orders = getAllOrders();
    let threshold = 0;
    if (timeframe !== "all") {
      threshold = Date.now() - timeframe * 24 * 60 * 60 * 1000;
    }
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
      clients,
      meals,
      employees,
      reports,
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
    [clients, meals, employees, reports]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = (): AdminContextType => {
  const ctx = useContext(AdminContext);
  if (!ctx) {
    throw new Error("useAdmin deve ser usado dentro de um AdminProvider");
  }
  return ctx;
};