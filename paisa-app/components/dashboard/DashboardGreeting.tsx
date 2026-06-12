
interface DashboardGreetingProps {
  displayName: string;
  isDad: boolean;
  isMom: boolean;
}

export function DashboardGreeting({ displayName, isDad, isMom }: DashboardGreetingProps) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        Welcome back
      </p>
      <h1 className="text-page-title">
        Hi, {displayName} {isDad ? '👋' : isMom ? '👋' : '👋'}
      </h1>
    </section>
  );
}
