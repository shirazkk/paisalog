import { redirect } from "next/navigation";
import { createServerClientInstance } from "@/lib/supabase/server";
import { DashboardNavigation } from "@/components/DashboardNavigation";
import { LogTransactionSheetWrapper } from "@/components/LogTransactionSheetWrapper";

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
    // ADD THIS LOG
    console.log("[Dashboard Layout] Profile fetch error:", error);
    redirect("/login");
  }

  // Ensure household check is strict
  if (!profile.household_id) {
    redirect("/join-household");
  }

  return (
    <div className="app-container relative bg-bg flex flex-col min-h-screen">
      {/* Top App Bar - Client component to handle user initial */}
      <header className="bg-white fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-40 flex items-center justify-between px-4 h-14 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="text-primary flex items-center justify-center">
            {/* Wallet icon import needed or use Lucide */}
          </div>
          <h1 className="text-[18px] font-extrabold text-primary tracking-tight">
            PaisaLog
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`avatar w-8 h-8 text-[12px] ${
              profile.role === "dad" ? "avatar-dad" : "avatar-mom"
            }`}
          >
            {profile.role === "dad" ? "D" : "M"}
          </div>
        </div>
      </header>

      {/* Main Canvas content */}
      <main className="flex-1  pb-20 overflow-y-auto">{children}</main>

      {/* Navigation and Sheet - Moved to client component wrapper */}
      <DashboardNavigation />
      <LogTransactionSheetWrapper
        householdId={profile.household_id}
        currentUserProfile={profile}
      />
    </div>
  );
}
