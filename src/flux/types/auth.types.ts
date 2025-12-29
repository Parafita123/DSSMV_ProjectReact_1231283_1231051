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

export type AuthState = {
  users: User[];
  currentEmail: string | null;
  loading: boolean;
  error: string | null;
};
