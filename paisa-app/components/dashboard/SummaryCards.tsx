import { TrendingUp, TrendingDown, CreditCard } from 'lucide-react';
import { formatPKR } from '@/lib/utils';

interface SummaryCardsProps {
  summary: {
    thisMonthTotal: number;
    allTimeTotal: number;
    changePercent: number;
  };
}

export function SummaryCards({ summary }: SummaryCardsProps) {
  const isUp = summary.changePercent >= 0;

  return (
    <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
      {/* This Month */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            This Month
          </p>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: isUp ? 'var(--color-success-light)' : 'var(--color-error-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isUp
              ? <TrendingUp size={14} color="var(--color-success)" />
              : <TrendingDown size={14} color="var(--color-error)" />
            }
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.3px', lineHeight: 1 }}>
            {formatPKR(summary.thisMonthTotal)}
          </p>
          <p style={{ fontSize: '12px', fontWeight: 600, color: isUp ? 'var(--color-success)' : 'var(--color-error)' }}>
            {isUp ? '+' : ''}{summary.changePercent}% vs last month
          </p>
        </div>
      </div>

      {/* All Time */}
      <div
        className="card"
        style={{
          padding: 'var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '120px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            Total Given
          </p>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '8px',
              backgroundColor: 'var(--color-primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CreditCard size={14} color="var(--color-primary)" />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text)', letterSpacing: '-0.3px', lineHeight: 1 }}>
            {formatPKR(summary.allTimeTotal)}
          </p>
          <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-muted)' }}>
            All time
          </p>
        </div>
      </div>
    </section>
  );
}
