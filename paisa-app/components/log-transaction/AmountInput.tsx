import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { TransactionFormValues } from '@/lib/validations';

interface AmountInputProps {
  register: UseFormRegister<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
  amountValue: string;
}

export function AmountInput({ register, errors, amountValue }: AmountInputProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        Amount (PKR)
      </p>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
        <span style={{ fontSize: '22px', fontWeight: 700, color: 'var(--color-text-muted)' }}>₨</span>
        <input
          type="number"
          inputMode="decimal"
          placeholder="0"
          style={{
            fontSize: '44px',
            fontWeight: 700,
            color: amountValue ? 'var(--color-text)' : 'var(--color-border)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '180px',
            textAlign: 'center',
            letterSpacing: '-1px',
            fontFamily: 'var(--font-family)',
          }}
          {...register('amount')}
        />
      </div>
      {/* Underline */}
      <div style={{
        width: '160px',
        height: '2px',
        borderRadius: '1px',
        backgroundColor: errors.amount
          ? 'var(--color-error)'
          : amountValue
            ? 'var(--color-primary)'
            : 'var(--color-border)',
        transition: 'background-color 150ms ease',
      }} />
      {errors.amount && (
        <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
          {errors.amount.message}
        </p>
      )}
    </div>
  );
}
