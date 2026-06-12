import React from 'react';
import { formatPKR } from '@/lib/utils';

interface ContributionSplitProps {
  dadTotal: number;
  momTotal: number;
  dadPercent: number;
  momPercent: number;
}

export function ContributionSplit({ dadTotal, momTotal, dadPercent, momPercent }: ContributionSplitProps) {
  return (
    <div className="card" style={{ padding: '16px' }}>
      <span
        style={{
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase",
          color: "var(--color-text-muted)",
          letterSpacing: "0.06em",
          display: "block",
          marginBottom: "12px",
        }}
      >
        Contribution Split
      </span>
      <div
        style={{
          width: "100%",
          height: "10px",
          display: "flex",
          borderRadius: "5px",
          overflow: "hidden",
          marginBottom: "12px",
          backgroundColor: '#f3f4f6'
        }}
      >
        <div style={{ width: `${dadPercent}%`, backgroundColor: "var(--color-dad)", transition: 'width 0.5s ease' }} />
        <div style={{ width: `${momPercent}%`, backgroundColor: "var(--color-mom)", transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-dad)" }} />
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Dad</span>
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>{formatPKR(dadTotal)}</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{dadPercent}%</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1px", alignItems: "flex-end" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px", fontWeight: 600 }}>Mom</span>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-mom)" }} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 700 }}>{formatPKR(momTotal)}</span>
          <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{momPercent}%</span>
        </div>
      </div>
    </div>
  );
}
