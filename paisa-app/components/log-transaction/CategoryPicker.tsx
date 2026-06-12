import React from 'react';
import { UseFormSetValue, FieldErrors } from 'react-hook-form';
import { TransactionFormValues } from '@/lib/validations';
import { CheckCircle2 } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';

interface CategoryPickerProps {
  selectedCategory: string | undefined;
  setValue: UseFormSetValue<TransactionFormValues>;
  errors: FieldErrors<TransactionFormValues>;
}

export function CategoryPicker({ selectedCategory, setValue, errors }: CategoryPickerProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text)' }}>Category</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
        {CATEGORIES.map((cat) => {
          const CatIcon = cat.icon;
          const isSelected = selectedCategory === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => setValue('category', cat.value as any, { shouldValidate: true })}
              style={{
                gridColumn: cat.value === 'other' ? 'span 2' : 'span 1',
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-3)',
                padding: '12px var(--space-3)',
                borderRadius: 'var(--border-radius)',
                border: `1.5px solid ${isSelected ? cat.color : 'var(--color-border)'}`,
                backgroundColor: isSelected ? cat.bg : 'var(--color-surface)',
                cursor: 'pointer',
                transition: 'all 120ms ease',
                textAlign: 'left',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? cat.color : 'var(--color-bg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 120ms ease',
                }}
              >
                <CatIcon size={16} color={isSelected ? '#ffffff' : cat.color} strokeWidth={isSelected ? 2.5 : 1.5} />
              </div>
              <span style={{
                fontSize: '14px',
                fontWeight: isSelected ? 600 : 500,
                color: isSelected ? cat.color : 'var(--color-text)',
              }}>
                {cat.label}
              </span>
              {isSelected && (
                <CheckCircle2 size={16} color={cat.color} style={{ marginLeft: 'auto', flexShrink: 0 }} />
              )}
            </button>
          );
        })}
      </div>
      {errors.category && (
        <p style={{ fontSize: '12px', color: 'var(--color-error)', fontWeight: 500 }}>
          {errors.category.message}
        </p>
      )}
    </div>
  );
}
