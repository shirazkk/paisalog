import { DashboardUI } from "@/components/DashboardUI";
import { createServerClientInstance } from "@/lib/supabase/server";
import { redirect } from "next/dist/client/components/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClientInstance();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.log("[Dashboard Layout] Profile fetch error:", error);
    redirect("/login");
  }

  if (!profile.household_id) {
    redirect("/join-household");
  }

  return (
    <div className="app-container relative flex flex-col min-h-screen">
      {/* Fixed header — h-14 = 56px */}
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '480px',
          height: '56px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 var(--space-4)',
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <h1
          style={{
            fontSize: '18px',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '-0.4px',
          }}
        >
          PaisaLog
        </h1>

        <div
          className={`avatar ${profile.role === 'dad' ? 'avatar-dad' : 'avatar-mom'}`}
          style={{ fontSize: '12px', overflow: 'hidden', padding: 0 }}
        >
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt={profile.display_name} 
              style={{  width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          ) : (
            profile.role === 'dad' ? 'D' : 'M'
          )}
        </div>
      </header>

      {/* Push content below the fixed header */}
      <div style={{ paddingTop: '56px', flex: 1 }}>
        <DashboardUI householdId={profile.household_id} currentUserProfile={profile}>
          {children}
        </DashboardUI>
      </div>
    </div>
  );
}