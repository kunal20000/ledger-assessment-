import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  LayoutDashboard,
  Landmark,
  Menu,
  Plus,
  RefreshCw,
  Send,
  Settings,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";
import { Modal } from "./components/Modal";
import { AccountForm, MoneyForm, TransferForm } from "./components/ModalForm";
import { api } from "./lib/api";
import { Account, LedgerTransaction, Page } from "./types";

const money = (value: string | number) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const today = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
}).format(new Date());

export default function App() {
  const [accounts, setAccounts] = useState<Page<Account>>({
    items: [],
    meta: { page: 1, limit: 8, total: 0, totalPages: 0 },
  });
  const [selected, setSelected] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<LedgerTransaction[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transactionDetails, setTransactionDetails] =
    useState<LedgerTransaction | null>(null);
  const [activeNav, setActiveNav] = useState("overview");
  const [mobileNav, setMobileNav] = useState(false);

  const load = async (page = accounts.meta.page) => {
    try {
      setLoading(true);
      setAccounts(await api.accounts(page));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const loadRecent = async () => {
    try {
      setTransactions((await api.recentTransactions()).items);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  useEffect(() => {
    void load(1);
    void loadRecent();
  }, []);
  const totalBalance = useMemo(
    () =>
      accounts.items.reduce((sum, account) => sum + Number(account.balance), 0),
    [accounts.items]
  );
  const run = async (fn: () => Promise<void>, message: string) => {
    try {
      setError("");
      await fn();
      setNotice(message);
      window.setTimeout(() => setNotice(""), 3500);
      await load();
      await loadRecent();
    } catch (e) {
      throw e;
    }
  };
  const select = (account: Account) => {
    setSelected(account);
    setActiveNav("accounts");
  };
  const refreshDashboard = async () => {
    await load();
    await loadRecent();
    setNotice("Dashboard refreshed");
    window.setTimeout(() => setNotice(""), 2500);
  };
  const navigate = (target: string, label: string) => {
    setMobileNav(false);
    setActiveNav(target === "activity" ? "transactions" : target);
    if (target === "reports" || target === "settings") {
      setNotice(`${label} section is coming soon`);
      window.setTimeout(() => setNotice(""), 3000);
      return;
    }
    document
      .getElementById(target)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Landmark size={21} />
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase">Ledgerly</p>
            <p className="text-[11px] text-slate-500">Financial workspace</p>
          </div>
          <button
            className="sidebar-close btn-icon"
            onClick={() => setMobileNav(false)}
          >
            <X size={17} />
          </button>
        </div>
        <div className="sidebar-label">Workspace</div>
        <nav className="space-y-1">
          <NavItem
            icon={<LayoutDashboard size={17} />}
            label="Overview"
            active={activeNav === "overview"}
            onClick={() => navigate("overview", "Overview")}
          />
          <NavItem
            icon={<Wallet size={17} />}
            label="Accounts"
            active={activeNav === "accounts"}
            onClick={() => navigate("accounts", "Accounts")}
          />
          <NavItem
            icon={<Activity size={17} />}
            label="Transactions"
            active={activeNav === "transactions"}
            onClick={() => navigate("activity", "Transactions")}
          />
          <NavItem
            icon={<Send size={17} />}
            label="Transfers"
            active={activeNav === "transfers"}
            onClick={() => navigate("transfers", "Transfers")}
          />
        </nav>
        <div className="sidebar-label mt-8">Management</div>
        <nav className="space-y-1">
          <NavItem
            icon={<BarChart3 size={17} />}
            label="Reports"
            active={activeNav === "reports"}
            onClick={() => navigate("reports", "Reports")}
          />
          <NavItem
            icon={<Settings size={17} />}
            label="Settings"
            active={activeNav === "settings"}
            onClick={() => navigate("settings", "Settings")}
          />
        </nav>
        <div className="sidebar-bottom">
          <div className="security-card">
            <ShieldCheck size={18} className="text-cyan-300" />
            <div>
              <p className="text-xs font-semibold text-slate-200">
                Protected ledger
              </p>
              <p className="mt-1 text-[10px] leading-4 text-slate-500">
                Atomic balance updates are active.
              </p>
            </div>
          </div>
          <div className="user-card">
            <div className="avatar">OP</div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-200">
                Operations
              </p>
              <p className="truncate text-[10px] text-slate-500">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
      {mobileNav && (
        <button
          className="sidebar-overlay"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <main className="main-shell">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="mobile-menu btn-icon"
              onClick={() => setMobileNav(true)}
              aria-label="Open navigation"
            >
              <Menu size={19} />
            </button>
            <div className="mobile-brand">
              <div className="brand-mark">
                <Landmark size={18} />
              </div>
              <span className="text-sm font-bold text-white">Ledgerly</span>
            </div>
            <div className="topbar-title">
              <p className="text-xs text-slate-500">Workspace / Overview</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-200">
                Account management
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="system-status">
              <span className="status-dot" />{" "}
              <span className="hidden sm:inline">All systems operational</span>
              <span className="sm:hidden">Operational</span>
            </div>
            <button
              className="refresh-button"
              onClick={() => void refreshDashboard()}
              aria-label="Refresh dashboard"
              title="Refresh dashboard data"
            >
              <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>
            <div className="top-avatar">OP</div>
          </div>
        </header>
        <div className="dashboard-content">
          <section id="overview" className="hero-row">
            <div>
              <p className="eyebrow">{today}</p>
              <h1 className="dashboard-heading">Financial overview</h1>
              <p className="dashboard-subtitle">
                Manage your accounts, balances, and money movement in one place.
              </p>
            </div>
            <button
              className="btn-primary"
              onClick={() => setAccountModalOpen(true)}
            >
              <Plus size={17} /> New account
            </button>
          </section>
          {error && <div className="alert alert-error">{error}</div>}
          {notice && (
            <div className="toast toast-success">
              <span className="toast-check">✓</span>
              <span>{notice}</span>
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          <section className="kpi-grid">
            <Kpi
              label="Total balance"
              value={`$${money(totalBalance)}`}
              caption="Across visible accounts"
              icon={<CircleDollarSign />}
              accent="cyan"
            />
            <Kpi
              label="Active accounts"
              value={String(accounts.meta.total)}
              caption="Connected ledger accounts"
              icon={<Wallet />}
              accent="purple"
            />
            <Kpi
              label="Ledger status"
              value="Protected"
              caption="Atomic transactions enabled"
              icon={<ShieldCheck />}
              accent="green"
            />
            <Kpi
              label="Latest activity"
              value={transactions.length ? "Active" : "Quiet"}
              caption="Recent ledger activity"
              icon={<Activity />}
              accent="orange"
            />
          </section>
          <section className="dashboard-grid">
            <div id="accounts" className="panel portfolio-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Portfolio</p>
                  <h2 className="panel-title">Your accounts</h2>
                </div>
                <button
                  className="text-action"
                  onClick={() => setAccountModalOpen(true)}
                >
                  <Plus size={15} /> Add account
                </button>
              </div>
              <div className="account-list">
                {accounts.items.map((account) => (
                  <button
                    key={account.id}
                    onClick={() => select(account)}
                    className={`account-card ${
                      selected?.id === account.id ? "account-card-active" : ""
                    }`}
                  >
                    <span className="account-card-icon">
                      <CreditCard size={18} />
                    </span>
                    <span className="min-w-0 flex-1 text-left">
                      <span className="block truncate text-sm font-semibold text-slate-100">
                        {account.name}
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Account #{account.id} · Available
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-sm font-bold text-white">
                        ${money(account.balance)}
                      </span>
                      <span className="mt-1 block text-[10px] text-slate-500">
                        Current balance
                      </span>
                    </span>
                  </button>
                ))}
                {!accounts.items.length && (
                  <div className="empty-state py-12">
                    <Wallet size={28} />
                    <p>No accounts yet</p>
                    <span>Create your first account to begin.</span>
                  </div>
                )}
              </div>
              <div className="panel-footer">
                <span className="text-xs text-slate-500">
                  Showing {accounts.items.length} of {accounts.meta.total}{" "}
                  accounts
                </span>
                <div className="flex items-center gap-1">
                  <button
                    className="btn-icon btn-icon-small"
                    disabled={accounts.meta.page <= 1}
                    onClick={() => void load(accounts.meta.page - 1)}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <span className="px-2 text-xs text-slate-500">
                    {accounts.meta.page} /{" "}
                    {Math.max(accounts.meta.totalPages, 1)}
                  </span>
                  <button
                    className="btn-icon btn-icon-small"
                    disabled={accounts.meta.page >= accounts.meta.totalPages}
                    onClick={() => void load(accounts.meta.page + 1)}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div id="transactions" className="panel action-panel">
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">Quick action</p>
                  <h2 className="panel-title">Move money</h2>
                </div>
                <Send size={18} className="text-cyan-300" />
              </div>
              <div className="p-5 sm:p-6">
                {selected ? (
                  <>
                    <div className="selected-account">
                      <span className="account-card-icon">
                        <Wallet size={16} />
                      </span>
                      <span>
                        <span className="block text-xs text-slate-500">
                          Selected account
                        </span>
                        <strong className="mt-0.5 block text-sm text-slate-100">
                          {selected.name}
                        </strong>
                      </span>
                      <span className="ml-auto font-mono text-xs text-cyan-300">
                        ${money(selected.balance)}
                      </span>
                    </div>
                    <MoneyForm
                      accountId={selected.id}
                      onSubmit={(id, body) =>
                        run(
                          () => api.transaction(id, body).then(() => undefined),
                          "Transaction posted"
                        )
                      }
                    />
                  </>
                ) : (
                  <div className="empty-state min-h-[205px]">
                    <Wallet size={27} />
                    <p>Select an account</p>
                    <span>Choose an account to post a credit or debit.</span>
                  </div>
                )}
              </div>
            </div>
          </section>
          <section id="transfers" className="panel transfer-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Money movement</p>
                <h2 className="panel-title">Transfer between accounts</h2>
              </div>
              <span className="soft-badge">
                <ShieldCheck size={13} /> Atomic
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <TransferForm
                onSubmit={(body) =>
                  run(
                    () => api.transfer(body).then(() => undefined),
                    "Transfer completed atomically"
                  )
                }
              />
            </div>
          </section>
          <section id="activity" className="panel activity-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Audit trail</p>
                <h2 className="panel-title">Recent activity</h2>
              </div>
              <span className="soft-badge">All accounts</span>
            </div>
            <div className="activity-table">
              <div className="activity-head">
                <span>Transaction</span>
                <span>Account</span>
                <span>Reference</span>
                <span className="text-right">Amount</span>
              </div>
              {transactions.map((tx) => (
                <button
                  type="button"
                  key={tx.id}
                  className="activity-row activity-row-button"
                  onClick={() => {
                    setActiveNav("transactions");
                    setTransactionDetails(tx);
                  }}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`transaction-icon ${
                        tx.type === "credit"
                          ? "transaction-credit"
                          : "transaction-debit"
                      }`}
                    >
                      {tx.type === "credit" ? (
                        <ArrowDownLeft size={16} />
                      ) : (
                        <ArrowUpRight size={16} />
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="activity-type">{tx.type}</p>
                      <p className="activity-description">
                        {tx.description || "Ledger transaction"}
                      </p>
                    </div>
                  </div>
                  <span className="activity-account">
                    {tx.accountName || `Account #${tx.accountId}`}
                  </span>
                  <span className="activity-reference">{tx.referenceId}</span>
                  <span
                    className={`activity-amount ${
                      tx.type === "credit"
                        ? "activity-amount-credit"
                        : "activity-amount-debit"
                    }`}
                  >
                    {tx.type === "credit" ? "+" : "−"}${money(tx.amount)}
                  </span>
                </button>
              ))}
              {!transactions.length && (
                <div className="empty-state py-12">
                  <Activity size={26} />
                  <p>No recent activity</p>
                  <span>Transactions will appear here.</span>
                </div>
              )}
            </div>
          </section>
          <footer className="dashboard-footer">
            <span>Ledgerly · Financial account management</span>
            <span>Balances are updated atomically</span>
          </footer>
        </div>
      </main>
      <Modal
        open={accountModalOpen}
        title="Create a new account"
        description="Give your account a clear name to get started."
        onClose={() => setAccountModalOpen(false)}
      >
        <AccountForm
          onSubmit={(name) =>
            run(async () => {
              await api.createAccount(name);
              setAccountModalOpen(false);
            }, "Account created")
          }
        />
      </Modal>
      <Modal
        open={!!transactionDetails}
        title="Transaction details"
        description="Complete ledger information for this transaction."
        onClose={() => setTransactionDetails(null)}
      >
        {transactionDetails && (
          <TransactionDetails transaction={transactionDetails} />
        )}
      </Modal>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`nav-item ${active ? "nav-item-active" : ""}`}
    >
      {icon}
      <span>{label}</span>
      {active && <span className="nav-active-dot" />}
    </button>
  );
}
function Kpi({
  label,
  value,
  caption,
  icon,
  accent,
}: {
  label: string;
  value: string;
  caption: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon kpi-${accent}`}>{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-1 truncate text-xl font-bold tracking-tight text-white">
          {value}
        </p>
        <p className="mt-1 truncate text-[11px] text-slate-500">{caption}</p>
      </div>
    </div>
  );
}
function TransactionDetails({
  transaction,
}: {
  transaction: LedgerTransaction;
}) {
  const date = new Date(transaction.createdAt).toLocaleString();
  return (
    <div className="transaction-details">
      <div
        className={`detail-status ${
          transaction.type === "credit" ? "detail-credit" : "detail-debit"
        }`}
      >
        <span className="transaction-icon">
          {transaction.type === "credit" ? (
            <ArrowDownLeft size={18} />
          ) : (
            <ArrowUpRight size={18} />
          )}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider">
            {transaction.type}
          </p>
          <p className="mt-1 text-2xl font-bold">
            {transaction.type === "credit" ? "+" : "−"}$
            {money(transaction.amount)}
          </p>
        </div>
      </div>
      <div className="detail-grid">
        <Detail label="Transaction ID" value={`#${transaction.id}`} />
        <Detail
          label="Account"
          value={transaction.accountName || `Account #${transaction.accountId}`}
        />
        <Detail label="Account ID" value={String(transaction.accountId)} />
        <Detail label="Reference ID" value={transaction.referenceId} />
        <Detail label="Created at" value={date} />
      </div>
      <div className="detail-description">
        <p className="detail-label">Description</p>
        <p className="mt-1 text-sm text-slate-700">
          {transaction.description || "No description provided"}
        </p>
      </div>
    </div>
  );
}
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="detail-label">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}
