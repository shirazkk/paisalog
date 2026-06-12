'use client'

import React, { useState, useEffect } from 'react';
import { ContributionSplit } from './ContributionSplit';
import { CategoryBreakdown } from './CategoryBreakdown';
import { TrendingUp, TrendingDown, LayoutDashboard, BarChart2 } from 'lucide-react';
import { formatPKR } from '@/lib/utils';
import { showToast } from '@/lib/toast';

interface HistoryInsightsProps {
  selectedMonth: string;
}

export function HistoryInsights({ selectedMonth }: HistoryInsightsProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchInsights() {
      setLoading(true);
      setData(null); // Clear old data immediately to avoid "stale data flash"
      try {
        const res = await fetch(`/api/reports?month=${selectedMonth}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error('Failed to fetch history insights:', err);
        showToast("Couldn't load insights. Please try again later.", 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchInsights();
  }, [selectedMonth]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="skeleton" style={{ height: '120px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '100px', borderRadius: '12px' }} />
        <div className="skeleton" style={{ height: '200px', borderRadius: '12px' }} />
      </div>
    );
  }

  if (!data || data.transactionCount === 0) {
    return (
      <div
        className="card"
        style={{
          padding: 'var(--space-12) var(--space-4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          border: '2px dashed var(--color-border)',
          backgroundColor: 'var(--color-bg)',
          boxShadow: 'none',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            backgroundColor: 'var(--color-primary-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <BarChart2 size={22} color="var(--color-primary)" strokeWidth={1.5} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
            No insights available
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            There are no transactions logged for this period to generate a report.
          </p>
        </div>
      </div>
    );
  }

  const isUp = data.changePercent > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      {/* Overview Card */}
      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '0.06em' }}>
            {selectedMonth === 'all' ? 'All Time Overview' : 'Monthly Overview'}
          </span>
          <LayoutDashboard size={14} color="var(--color-text-muted)" />
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>{formatPKR(data.totalAmount)}</h2>
          {selectedMonth !== 'all' && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '4px', 
              fontSize: '12px', 
              fontWeight: 600,
              color: isUp ? 'var(--color-error)' : 'var(--color-success)'
            }}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(data.changePercent)}% vs last month</span>
            </div>
          )}
        </div>
        <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Across {data.transactionCount} transactions
        </p>
      </div>

      <ContributionSplit 
        dadTotal={data.dadTotal} 
        momTotal={data.momTotal} 
        dadPercent={data.dadPercent} 
        momPercent={data.momPercent} 
      />

      <CategoryBreakdown breakdown={data.categoryBreakdown} />
    </div>
  );
}
