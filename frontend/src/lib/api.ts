const API = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message ?? "Request failed"
    );
  return data;
}
export const api = {
  accounts: (page = 1) =>
    request<import("../types").Page<import("../types").Account>>(
      `/accounts?page=${page}&limit=8`
    ),
  createAccount: (name: string) =>
    request<import("../types").Account>("/accounts", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  transactions: (id: number) =>
    request<import("../types").Page<import("../types").LedgerTransaction>>(
      `/accounts/${id}/transactions?limit=50`
    ),
  recentTransactions: (page = 1, limit = 20) =>
    request<import("../types").Page<import("../types").LedgerTransaction & { accountName: string }>>(
      `/transactions/recent?page=${page}&limit=${limit}`
    ),
  transaction: (id: number, body: object) =>
    request(`/accounts/${id}/transactions`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  transfer: (body: object) =>
    request("/transfers", { method: "POST", body: JSON.stringify(body) }),
};
