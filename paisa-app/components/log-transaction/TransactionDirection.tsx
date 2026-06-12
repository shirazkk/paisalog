import React from 'react';
import { ArrowRight } from 'lucide-react';

interface TransactionDirectionProps {
  isDad: boolean;
}

export function TransactionDirection({ isDad }: TransactionDirectionProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>From → To</p>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--border-radius)',
          backgroundColor: 'var(--color-primary-light)',
          border: '1.5px solid rgba(26, 86, 219, 0.2)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className={`avatar ${isDad ? 'avatar-dad' : 'avatar-mom'}`}>
            {isDad ? 'D' : 'M'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {isDad ? 'Dad' : 'Mom'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--color-primary)' }}>
          <div style={{ width: '24px', height: '1.5px', backgroundColor: 'var(--color-primary)', opacity: 0.4 }} />
          <ArrowRight size={16} color="var(--color-primary)" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <div className={`avatar ${isDad ? 'avatar-mom' : 'avatar-dad'}`}>
            {isDad ? 'M' : 'D'}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
            {isDad ? 'Mom' : 'Dad'}
          </span>
        </div>
      </div>
    </div>
  );
}
