import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase/server";
import { 
  ArrowRight, 
  Smartphone, 
  Zap, 
  ShieldCheck, 
  Heart,
  Wallet
} from "lucide-react";

export default async function HomePage() {
  const supabase = await createServerClientInstance();
  const { data: { user } } = await supabase.auth.getUser();

  // If already logged in, go straight to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="app-container" style={{ backgroundColor: "var(--color-surface)" }}>
      {/* Hero Section */}
      <section style={{ 
        padding: "var(--space-12) var(--space-6) var(--space-8)",
        textAlign: "center",
        background: "linear-gradient(180deg, var(--color-primary-light) 0%, #ffffff 100%)",
      }}>
        <div style={{ 
          display: "inline-flex", 
          alignItems: "center", 
          gap: "8px", 
          padding: "8px 16px",
          backgroundColor: "#ffffff",
          borderRadius: "var(--border-radius-pill)",
          boxShadow: "var(--shadow-card)",
          marginBottom: "var(--space-6)",
        }}>
          <Wallet size={18} color="var(--color-primary)" />
          <span style={{ fontSize: "13px", fontWeight: 700, color: "var(--color-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            PaisaLog v1.0
          </span>
        </div>

        <h1 className="text-page-title" style={{ fontSize: "36px", marginBottom: "var(--space-4)", lineHeight: 1.1 }}>
          Never fight about <span style={{ color: "var(--color-primary)" }}>money</span> again.
        </h1>
        <p className="text-body" style={{ color: "var(--color-text-muted)", fontSize: "17px", marginBottom: "var(--space-8)" }}>
          The dead-simple household tracker for Dad and Mom to log, share, and remember every rupee.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <Link href="/signup" className="btn btn-primary" style={{ fontSize: "16px" }}>
            Get Started <ArrowRight size={18} />
          </Link>
          <Link href="/login" className="btn btn-secondary" style={{ fontSize: "16px" }}>
            Sign In
          </Link>
        </div>
      </section>

      {/* App Preview / Mockup UI */}
      <section style={{ padding: "0 var(--space-6)", marginTop: "-20px" }}>
        <div className="card" style={{ 
          padding: "var(--space-2)", 
          backgroundColor: "#f3f4f6", 
          border: "4px solid #ffffff",
          height: "200px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
        }}>
           <div style={{ height: "40px", width: "100%", backgroundColor: "#ffffff", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--color-dad)" }} />
              <div style={{ width: "12px", height: "2px", backgroundColor: "#e5e7eb", margin: "0 8px" }} />
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--color-mom)" }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: "60px", height: "12px", backgroundColor: "#f3f4f6", borderRadius: "4px" }} />
           </div>
           <div style={{ height: "40px", width: "100%", backgroundColor: "#ffffff", borderRadius: "8px", display: "flex", alignItems: "center", padding: "0 12px" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--color-mom)" }} />
              <div style={{ width: "12px", height: "2px", backgroundColor: "#e5e7eb", margin: "0 8px" }} />
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", backgroundColor: "var(--color-dad)" }} />
              <div style={{ flex: 1 }} />
              <div style={{ width: "40px", height: "12px", backgroundColor: "#f3f4f6", borderRadius: "4px" }} />
           </div>
           <div style={{ height: "40px", width: "100%", backgroundColor: "#ffffff", borderRadius: "8px", opacity: 0.5 }} />
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "var(--space-12) var(--space-6)" }}>
        <h2 className="text-section-heading" style={{ marginBottom: "var(--space-6)", textAlign: "center" }}>
          Built for Families
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
            <div style={{ padding: "10px", backgroundColor: "var(--color-primary-light)", borderRadius: "12px", color: "var(--color-primary)" }}>
              <Zap size={22} />
            </div>
            <div>
              <h3 className="text-card-title" style={{ marginBottom: "4px" }}>Real-time Sync</h3>
              <p className="text-meta">When Dad logs a transaction, Mom sees it instantly on her phone. No manual updates needed.</p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
            <div style={{ padding: "10px", backgroundColor: "#f0fdf4", borderRadius: "12px", color: "#16a34a" }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="text-card-title" style={{ marginBottom: "4px" }}>Private & Secure</h3>
              <p className="text-meta">Your family's data is only visible to the two of you. Secure, shared, and encrypted.</p>
            </div>
          </div>

          <div className="card" style={{ display: "flex", gap: "var(--space-4)", alignItems: "start" }}>
            <div style={{ padding: "10px", backgroundColor: "#fef2f2", borderRadius: "12px", color: "#dc2626" }}>
              <Smartphone size={22} />
            </div>
            <div>
              <h3 className="text-card-title" style={{ marginBottom: "4px" }}>App-like Experience</h3>
              <p className="text-meta">Install it on your home screen as a PWA. Works like a real app, fast and light.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section style={{ 
        padding: "var(--space-12) var(--space-6)", 
        textAlign: "center",
        backgroundColor: "var(--color-primary)",
        color: "#ffffff",
        margin: "0 var(--space-4) var(--space-8)",
        borderRadius: "var(--border-radius)",
      }}>
        <Heart size={32} style={{ marginBottom: "var(--space-4)" }} />
        <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "var(--space-2)" }}>Better Finacial Harmony</h2>
        <p style={{ opacity: 0.9, marginBottom: "var(--space-6)", fontSize: "14px" }}>Join families who have stopped arguing about small transfers and started trusting the record.</p>
        <Link href="/signup" className="btn btn-secondary" style={{ backgroundColor: "#ffffff", color: "var(--color-primary)" }}>
          Start for Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ padding: "0 var(--space-6) var(--space-12)", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
          © 2026 PaisaLog. Designed for Mom & Dad.
        </p>
      </footer>
    </div>
  );
}
