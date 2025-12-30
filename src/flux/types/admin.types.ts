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
  createdAt?: string;
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

export type AdminState = {
  clients: Client[];
  meals: Meal[];
  employees: Employee[];
  reports: Report[];
};
