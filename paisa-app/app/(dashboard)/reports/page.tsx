"use client";

import { useEffect, useState, useMemo } from "react";
import { Transaction, Profile } from "@/types";
import { formatPKR } from "@/lib/utils";
import { TransactionCard } from "@/components/TransactionCard";
import {
  Home,
  ShoppingCart,
  Bolt,
  User,
  Package,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Calendar,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface ReportData {
  totalAmount: number;
  transactionCount: number;
  lastMonthTotal: number;
  changePercent: number;
  categoryBreakdown: {
    category: string;
    total: number;
    percent: number;
  }[];
  dadTotal: number;
  momTotal: number;
  dadPercent: number;
  momPercent: number;
  topTransactions: Transaction[];
  members: Profile[];
  error?: string;
}

const CATEGORY_MAP: Record<
  string,
  {
    label: string;
    color: string;
    icon: React.ComponentType<{ size: number }>;
  }
> = {
  home_expenses: { label: "Home", color: "#16a34a", icon: Home },
  grocery: { label: "Grocery", color: "#d97706", icon: ShoppingCart },
  utility: { label: "Utility", color: "#7c3aed", icon: Bolt },
  personal: { label: "Personal", color: "#374151", icon: User },
  other: { label: "Other", color: "#1d4ed8", icon: Package },
};

export default function ReportsPage() {
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [data, setData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const months = useMemo(() => {
    const result = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = d.toISOString().substring(0, 7);
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        year: i === 0 || d.getMonth() === 0 ? "2-digit" : undefined,
      });
      result.push({ label, value });
    }
    result.push({ label: "All Time", value: "all" });
    return result;
  }, []);

  useEffect(() => {
    if (months.length > 0 && !selectedMonth) {
      setSelectedMonth(months[0].value);
    }
  }, [months, selectedMonth]);

  useEffect(() => {
    if (!selectedMonth) return;

    async function fetchReport() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/reports?month=${selectedMonth}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error("Failed to fetch report:", err);
        setData({ error: "Network error occurred" } as ReportData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchReport();
  }, [selectedMonth]);

  const maxCategoryAmount = useMemo(() => {
    if (!data?.categoryBreakdown?.length) return 0;
    return Math.max(...data.categoryBreakdown.map((c) => c.total));
  }, [data]);

  if (isLoading && !data) {
    return <ReportsSkeleton />;
  }

  // Handle API error response
  if (data?.error) {
    return (
      <div className="page-content" style={{ paddingTop: "var(--space-6)", textAlign: "center" }}>
        <div style={{ color: "var(--color-error)", marginBottom: "var(--space-4)" }}>
          <AlertCircle size={48} style={{ margin: "0 auto" }} />
        </div>
        <p className="text-section-heading" style={{ marginBottom: "var(--space-2)" }}>Failed to load report</p>
        <p className="text-meta">{data.error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="btn btn-primary" 
          style={{ marginTop: "var(--space-4)", width: "auto", padding: "0 var(--space-6)" }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div
      className="page-content"
      style={{
        paddingTop: "var(--space-6)",
        paddingBottom: "calc(var(--nav-height) + var(--space-8))",
      }}
    >
      <h1 className="text-page-title" style={{ marginBottom: "var(--space-4)" }}>
        Monthly Summary
      </h1>

      {/* Month Selector */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-2)",
          overflowX: "auto",
          paddingBottom: "var(--space-4)",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        className="no-scrollbar"
      >
        {months.map((m) => (
          <button
            key={m.value}
            onClick={() => setSelectedMonth(m.value)}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--border-radius-pill)",
              fontSize: "13px",
              fontWeight: 600,
              whiteSpace: "nowrap",
              border: "1px solid var(--color-border)",
              backgroundColor:
                selectedMonth === m.value
                  ? "var(--color-primary)"
                  : "var(--color-surface)",
              color: selectedMonth === m.value ? "#ffffff" : "var(--color-text)",
              transition: "all 0.2s ease",
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      {!isLoading && (data?.transactionCount === 0 || data?.totalAmount === 0) ? (
        <div style={{ textAlign: "center", padding: "var(--space-12) 0" }}>
          <div style={{ color: "var(--color-text-muted)", marginBottom: "var(--space-4)" }}>
            <Calendar size={48} strokeWidth={1} style={{ margin: "0 auto" }} />
          </div>
          <p className="text-section-heading" style={{ marginBottom: "var(--space-2)" }}>No Data for this month</p>
          <p className="text-meta">Try selecting a different month or log your first transaction.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          {/* Total Spent Card */}
          <div className="card">
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "var(--space-2)",
              }}
            >
              Total Transfers
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: "32px", fontWeight: 800 }}>
                {formatPKR(data?.totalAmount || 0)}
              </span>
              {selectedMonth !== "all" && data && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "14px",
                    fontWeight: 600,
                    color:
                      (data.changePercent || 0) > 0
                        ? "var(--color-error)"
                        : "var(--color-success)",
                  }}
                >
                  {(data.changePercent || 0) > 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>
                    {Math.abs(data.changePercent || 0)}% vs last month
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "var(--space-3)",
              }}
            >
              Category Breakdown
            </span>
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
              {data?.categoryBreakdown?.map((cat, i) => {
                const info = CATEGORY_MAP[cat.category] || CATEGORY_MAP.other;
                const Icon = info.icon;
                return (
                  <div key={cat.category} style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            backgroundColor: "var(--color-bg)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: info.color,
                          }}
                        >
                          <Icon size={18} />
                        </div>
                        <span className="text-card-title">{info.label}</span>
                      </div>
                      <span className="text-amount" style={{ fontSize: "16px" }}>
                        {formatPKR(cat.total)}
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "6px", backgroundColor: "var(--color-bg)", borderRadius: "3px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${(cat.total / maxCategoryAmount) * 100}%`,
                          backgroundColor: info.color,
                          borderRadius: "3px",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contribution Split */}
          <div>
            <span
              style={{
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "var(--color-text-muted)",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "var(--space-3)",
              }}
            >
              Contribution Split
            </span>
            <div className="card">
              <div
                style={{
                  width: "100%",
                  height: "12px",
                  display: "flex",
                  borderRadius: "6px",
                  overflow: "hidden",
                  marginBottom: "var(--space-4)",
                }}
              >
                <div style={{ width: `${data?.dadPercent || 0}%`, backgroundColor: "var(--color-dad)" }} />
                <div style={{ width: `${data?.momPercent || 0}%`, backgroundColor: "var(--color-mom)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-dad)" }} />
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Dad</span>
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 700 }}>{formatPKR(data?.dadTotal || 0)}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{data?.dadPercent || 0}%</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>Mom</span>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-mom)" }} />
                  </div>
                  <span style={{ fontSize: "15px", fontWeight: 700 }}>{formatPKR(data?.momTotal || 0)}</span>
                  <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>{data?.momPercent || 0}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Biggest Transactions */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-3)" }}>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--color-text-muted)",
                  letterSpacing: "0.06em",
                }}
              >
                Biggest This Month
              </span>
              <Link
                href="/history"
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "2px",
                  textDecoration: "none",
                }}
              >
                See All <ChevronRight size={14} />
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              {data?.topTransactions?.map((t) => (
                <TransactionCard
                  key={t.id}
                  transaction={t}
                  members={data?.members || []}
                  onClick={() => (window.location.href = `/history/${t.id}`)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="page-content" style={{ paddingTop: "var(--space-6)" }}>
      <div className="skeleton" style={{ width: "180px", height: "28px", marginBottom: "var(--space-6)" }} />
      <div style={{ display: "flex", gap: "var(--space-2)", marginBottom: "var(--space-6)" }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="skeleton" style={{ width: "80px", height: "36px", borderRadius: "18px" }} />
        ))}
      </div>
      <div className="skeleton" style={{ width: "100%", height: "100px", borderRadius: "12px", marginBottom: "var(--space-6)" }} />
      <div className="skeleton" style={{ width: "120px", height: "16px", marginBottom: "var(--space-3)" }} />
      <div className="skeleton" style={{ width: "100%", height: "200px", borderRadius: "12px" }} />
    </div>
  );
}
