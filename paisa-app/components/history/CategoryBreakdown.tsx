import React from 'react';
import { formatPKR } from '@/lib/utils';
import { CATEGORY_MAP } from '@/lib/constants';

interface CategoryBreakdownProps {
  breakdown: {
    category: string;
    total: number;
    percent: number;
  }[];
}

export function CategoryBreakdown({ breakdown }: CategoryBreakdownProps) {
  const maxAmount = Math.max(...breakdown.map((c) => c.total), 0);

  return (
    <div className="card" style={{ padding: '16px', display: "flex", flexDirection: "column", gap: "16px" }}>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          letterSpacing: "0.06em",
          display: "block",
        }}
      >
        Category Breakdown
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {breakdown.map((cat) => {
          const info = CATEGORY_MAP[cat.category] || CATEGORY_MAP.other;
          const Icon = info.icon;
          return (
            <div key={cat.category} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-bg)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: info.color,
                    }}
                  >
                    <Icon size={14} />
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{info.label}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700 }}>
                  {formatPKR(cat.total)}
                </span>
              </div>
              <div style={{ width: "100%", height: "4px", backgroundColor: "var(--color-bg)", borderRadius: "2px", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${(cat.total / maxAmount) * 100}%`,
                    backgroundColor: info.color,
                    borderRadius: "2px",
                    transition: 'width 0.5s ease'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
