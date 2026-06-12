import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight } from 'lucide-react';
import { TransactionCard } from '@/components/TransactionCard';
import { Transaction, Profile } from '@/types';

interface RecentTransactionsProps {
  transactions: Transaction[];
  members: Profile[];
}

export function RecentTransactions({ transactions, members }: RecentTransactionsProps) {
  const router = useRouter();

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="text-section-heading">Recent</h2>
        <button
          onClick={() => router.push('/history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'var(--color-primary)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
          }}
        >
          View All <ArrowUpRight size={13} />
        </button>
      </div>

      {transactions.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {transactions.map((txn) => (
            <TransactionCard
              key={txn.id}
              transaction={txn}
              members={members}
              onClick={() => router.push(`/history/${txn.id}`)}
            />
          ))}
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-2)',
            borderStyle: 'dashed',
            borderColor: 'var(--color-border)',
            borderWidth: '2px',
            backgroundColor: 'var(--color-bg)',
            boxShadow: 'none',
          }}
        >
          <Wallet size={28} color="var(--color-text-muted)" strokeWidth={1.5} />
          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-text)' }}>
            No transactions yet
          </p>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            Tap the + button below to log your first one
          </p>
        </div>
      )}
    </section>
  );
}
