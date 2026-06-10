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
    <div className="app-container relative bg-bg flex flex-col min-h-screen">
      <header className=" fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-120 z-40 flex items-center justify-between px-4 h-14 border-b border-border">
        <div className="flex items-center gap-2">
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

      <DashboardUI householdId={profile.household_id} currentUserProfile={profile}>
        {children}
      </DashboardUI>
    </div>
  );
}
