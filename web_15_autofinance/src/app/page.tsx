"use client";
import { useEffect, useState, useMemo } from "react";
import { BlurCard } from "@/components/ui/BlurCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Suspense } from "react";
import { useSeedRouter } from "@/hooks/useSeedRouter";
import { ArrowRight, Wallet, TrendingUp, CreditCard, PiggyBank, ShieldCheck, DollarSign, BarChart3 } from "lucide-react";
import { logEvent, EVENT_TYPES } from "@/events";
import { SafeImage } from "@/components/ui/SafeImage";
import { useSeed } from "@/context/SeedContext";
import { useDynamicSystem } from "@/dynamic/shared";
import { ID_VARIANTS_MAP, CLASS_VARIANTS_MAP, TEXT_VARIANTS_MAP } from "@/dynamic/v3";
import { isV1Enabled, isV3Enabled } from "@/dynamic/shared/flags";

const FINANCE_CATEGORIES = ["Accounts", "Transactions", "Budgets", "Investments", "Savings"] as const;

// Mock data for finance accounts
const mockAccounts = [
  { id: "1", name: "Checking Account", balance: 5420.50, type: "checking", accountNumber: "****1234" },
  { id: "2", name: "Savings Account", balance: 15230.75, type: "savings", accountNumber: "****5678" },
  { id: "3", name: "Credit Card", balance: -1250.00, type: "credit", accountNumber: "****9012" },
  { id: "4", name: "Investment Portfolio", balance: 45230.25, type: "investment", accountNumber: "****3456" },
];

const mockTransactions = [
  { id: "1", description: "Grocery Store", amount: -85.50, date: "2024-01-15", category: "Food" },
  { id: "2", description: "Salary Deposit", amount: 3500.00, date: "2024-01-14", category: "Income" },
  { id: "3", description: "Electric Bill", amount: -120.00, date: "2024-01-13", category: "Utilities" },
  { id: "4", description: "Coffee Shop", amount: -5.75, date: "2024-01-12", category: "Food" },
  { id: "5", description: "Gas Station", amount: -45.00, date: "2024-01-11", category: "Transportation" },
];

function HomeContent() {
  const { seed } = useSeed();
  const dyn = useDynamicSystem();
  const router = useSeedRouter();

  // Debug: Verify V1, V2, and V3 are working
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[page.tsx] Debug dinámico:", {
        seed: dyn.seed,
        v1Enabled: isV1Enabled(),
        v2Enabled: dyn.v2.isEnabled(),
        v3Enabled: isV3Enabled(),
      });
    }
  }, [dyn.seed, dyn.v2]);

  // Local text variants for this component
  const dynamicV3TextVariants: Record<string, string[]> = {
    hero_title: [
      "Take control of your finances",
      "Manage your money with confidence",
      "Your personal finance dashboard"
    ],
    hero_description: [
      "Track accounts, monitor spending, and achieve your financial goals all in one place.",
      "Comprehensive financial management tools to help you stay on top of your money.",
      "View balances, track transactions, and manage your budget effortlessly."
    ],
    accounts_overview: [
      "Accounts Overview",
      "Your Accounts",
      "Account Summary"
    ],
    total_balance: [
      "Total Balance",
      "Net Worth",
      "Total Assets"
    ],
    recent_transactions: [
      "Recent Transactions",
      "Transaction History",
      "Latest Activity"
    ],
    view_all_accounts: [
      "View all accounts",
      "See all accounts",
      "Manage accounts"
    ],
    view_all_transactions: [
      "View all transactions",
      "See all transactions",
      "Transaction history"
    ],
    quick_actions: [
      "Quick Actions",
      "Quick Access",
      "Actions"
    ],
    transfer_money: [
      "Transfer Money",
      "Make Transfer",
      "Transfer"
    ],
    pay_bills: [
      "Pay Bills",
      "Bill Payment",
      "Bills"
    ],
    set_budget: [
      "Set Budget",
      "Create Budget",
      "Budget"
    ],
  };

  const totalBalance = useMemo(() => {
    return mockAccounts.reduce((sum, account) => sum + account.balance, 0);
  }, []);

  // Dynamic ordering for category buttons
  const changeOrderElements = dyn.v1.changeOrderElements;
  const orderedCategories = useMemo(() => {
    const order = changeOrderElements("home-categories", FINANCE_CATEGORIES.length);
    return order.map((idx) => FINANCE_CATEGORIES[idx]);
  }, [changeOrderElements]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const webAgentId = params.get("X-WebAgent-Id");
    const userId = params.get("user");

    if (webAgentId) localStorage.setItem("web_agent_id", webAgentId);
    else localStorage.setItem("web_agent_id", "null");

    if (userId) localStorage.setItem("user", userId);
    else localStorage.setItem("user", "null");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeoutId = setTimeout(() => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo({ left: 0, top: 0, behavior: 'instant' });
      }
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <main
      id={dyn.v3.getVariant("home-main", ID_VARIANTS_MAP, "home-main")}
      className={dyn.v3.getVariant("main-container", CLASS_VARIANTS_MAP, "min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-100 overflow-x-hidden")}
    >
      {dyn.v1.addWrapDecoy("home-main-container", (
        <div className="relative z-10 pb-16">
          {/* Hero Section */}
          {dyn.v1.addWrapDecoy("home-hero-section", (
            <section
              id={dyn.v3.getVariant("hero-section", ID_VARIANTS_MAP, "hero-section")}
              className={dyn.v3.getVariant("hero-section", CLASS_VARIANTS_MAP, "omnizon-container grid gap-10 pb-12 pt-28 lg:grid-cols-[1.1fr,0.9fr]")}
            >
              {dyn.v1.addWrapDecoy("home-hero-content", (
                <div className="space-y-6">
                  <span className="pill pill-muted">PERSONAL FINANCE</span>
                  <h1 className="text-4xl font-semibold text-slate-900 md:text-5xl">
                    {dyn.v3.getVariant("hero_title", dynamicV3TextVariants, "Take control of your finances")}
                  </h1>
                  <p className="text-base text-slate-600 md:text-lg">
                    {dyn.v3.getVariant("hero_description", dynamicV3TextVariants, "Track accounts, monitor spending, and achieve your financial goals all in one place.")}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1 text-sm text-slate-700">
                    {dyn.v1.addWrapDecoy("home-feature-secure", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        Secure & Encrypted
                      </span>
                    ))}
                    {dyn.v1.addWrapDecoy("home-feature-realtime", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <BarChart3 className="h-4 w-4 text-indigo-600" />
                        Real-time Updates
                      </span>
                    ))}
                    {dyn.v1.addWrapDecoy("home-feature-insights", (
                      <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 shadow-sm">
                        <TrendingUp className="h-4 w-4 text-amber-500" />
                        Financial Insights
                      </span>
                    ))}
                  </div>

                  {/* Total Balance Card */}
                  {dyn.v1.addWrapDecoy("home-total-balance", (
                    <div className="pt-4">
                      <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white shadow-lg">
                        <p className="text-sm opacity-90 mb-2">
                          {dyn.v3.getVariant("total_balance", dynamicV3TextVariants, "Total Balance")}
                        </p>
                        <p className="text-4xl font-bold">
                          {formatCurrency(totalBalance)}
                        </p>
                        <p className="text-sm opacity-75 mt-2">
                          Across {mockAccounts.length} accounts
                        </p>
                      </div>
                    </div>
                  ))}

                  {/* Quick Categories */}
                  {dyn.v1.addWrapDecoy("home-categories-section", (
                    <div className="pt-4 space-y-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400 font-semibold">
                        {dyn.v3.getVariant("quick_actions", dynamicV3TextVariants, "Quick Actions")}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {orderedCategories.map((cat) => (
                          dyn.v1.addWrapDecoy(`home-category-${cat}`, (
                            <button
                              key={cat}
                              onClick={() => router.push(`/search?category=${cat.toLowerCase()}`)}
                              id={dyn.v3.getVariant("category-link", ID_VARIANTS_MAP, `category-${cat.toLowerCase()}`)}
                              className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400 hover:bg-slate-50 transition-colors")}
                            >
                              {cat}
                            </button>
                          ), cat)
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          ))}

          {/* Accounts Overview Section */}
          {dyn.v1.addWrapDecoy("home-accounts-section", (
            <section
              id={dyn.v3.getVariant("accounts-section", ID_VARIANTS_MAP, "accounts")}
              className={dyn.v3.getVariant("section-container", CLASS_VARIANTS_MAP, "omnizon-container mt-8 space-y-6")}
            >
              <SectionHeading
                eyebrow={dyn.v3.getVariant("accounts_overview", dynamicV3TextVariants, "Accounts Overview")}
                title="Your Financial Accounts"
                description="View and manage all your accounts in one place."
                actions={
                  dyn.v1.addWrapDecoy("home-accounts-view-all-btn", (
                    <button
                      type="button"
                      onClick={() => {
                        logEvent(EVENT_TYPES.VIEW_DETAIL, {
                          source: "home_accounts",
                          intent: "view_all",
                        });
                        router.push("/search?category=accounts");
                      }}
                      id={dyn.v3.getVariant("view-all-btn", ID_VARIANTS_MAP, "view-all-accounts-btn")}
                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                    >
                      {dyn.v3.getVariant("view_all_accounts", dynamicV3TextVariants, "View all accounts")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))
                }
              />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {mockAccounts.map((account) => (
                  dyn.v1.addWrapDecoy(`account-${account.id}`, (
                    <BlurCard
                      key={account.id}
                      interactive
                      id={dyn.v3.getVariant("account-card", ID_VARIANTS_MAP, `account-${account.id}`)}
                      className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "p-6 cursor-pointer hover:shadow-lg transition-shadow")}
                      onClick={() => {
                        logEvent(EVENT_TYPES.VIEW_DETAIL, {
                          accountId: account.id,
                          accountType: account.type,
                        });
                        router.push(`/search?account=${account.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        {account.type === "checking" && <Wallet className="h-6 w-6 text-blue-600" />}
                        {account.type === "savings" && <PiggyBank className="h-6 w-6 text-green-600" />}
                        {account.type === "credit" && <CreditCard className="h-6 w-6 text-red-600" />}
                        {account.type === "investment" && <TrendingUp className="h-6 w-6 text-purple-600" />}
                        <span className="text-xs text-slate-500">{account.accountNumber}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-1">
                        {account.name}
                      </h3>
                      <p className={`text-2xl font-bold ${account.balance < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </BlurCard>
                  ), account.id)
                ))}
              </div>
            </section>
          ))}

          {/* Recent Transactions Section */}
          {dyn.v1.addWrapDecoy("home-transactions-section", (
            <section
              id={dyn.v3.getVariant("transactions-section", ID_VARIANTS_MAP, "transactions")}
              className={dyn.v3.getVariant("section-container", CLASS_VARIANTS_MAP, "omnizon-container mt-8 space-y-6")}
            >
              <SectionHeading
                eyebrow={dyn.v3.getVariant("recent_transactions", dynamicV3TextVariants, "Recent Transactions")}
                title="Latest Activity"
                description="Track your recent financial transactions."
                actions={
                  dyn.v1.addWrapDecoy("home-transactions-view-all-btn", (
                    <button
                      type="button"
                      onClick={() => {
                        logEvent(EVENT_TYPES.VIEW_DETAIL, {
                          source: "home_transactions",
                          intent: "view_all",
                        });
                        router.push("/search?category=transactions");
                      }}
                      id={dyn.v3.getVariant("view-all-btn", ID_VARIANTS_MAP, "view-all-transactions-btn")}
                      className={dyn.v3.getVariant("button-secondary", CLASS_VARIANTS_MAP, "inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400")}
                    >
                      {dyn.v3.getVariant("view_all_transactions", dynamicV3TextVariants, "View all transactions")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ))
                }
              />
              <div className="space-y-3">
                {mockTransactions.map((transaction) => (
                  dyn.v1.addWrapDecoy(`transaction-${transaction.id}`, (
                    <BlurCard
                      key={transaction.id}
                      interactive
                      id={dyn.v3.getVariant("transaction-item", ID_VARIANTS_MAP, `transaction-${transaction.id}`)}
                      className={dyn.v3.getVariant("card", CLASS_VARIANTS_MAP, "p-4 cursor-pointer hover:shadow-md transition-shadow")}
                      onClick={() => {
                        logEvent(EVENT_TYPES.VIEW_DETAIL, {
                          transactionId: transaction.id,
                          category: transaction.category,
                        });
                        router.push(`/search?transaction=${transaction.id}`);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`rounded-full p-2 ${transaction.amount < 0 ? 'bg-red-100' : 'bg-green-100'}`}>
                            {transaction.amount < 0 ? (
                              <DollarSign className={`h-5 w-5 ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`} />
                            ) : (
                              <TrendingUp className="h-5 w-5 text-green-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-900">{transaction.description}</h4>
                            <p className="text-sm text-slate-500">{transaction.category} • {transaction.date}</p>
                          </div>
                        </div>
                        <p className={`text-lg font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>
                    </BlurCard>
                  ), transaction.id)
                ))}
              </div>
            </section>
          ))}
        </div>
      ))}
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
