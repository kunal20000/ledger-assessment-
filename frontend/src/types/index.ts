export type Account = {
  id: number;
  name: string;
  balance: string | number;
  createdAt: string;
};
export type LedgerTransaction = {
  id: number;
  accountId: number;
  accountName?: string;
  type: "credit" | "debit";
  amount: string;
  referenceId: string;
  description?: string | null;
  createdAt: string;
};
export type Page<T> = {
  items: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
