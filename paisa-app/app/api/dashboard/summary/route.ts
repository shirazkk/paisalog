import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // 1. Validate auth
    const supabase = await createServerClientInstance();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!user || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    // 2. Fetch current user profile to get household_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id, display_name, role")
      .eq("id", userId)
      .single();

    if (profileError) throw profileError;

    if (!profile.household_id) {
      return NextResponse.json({ error: "No household" }, { status: 400 });
    }

    const householdId = profile.household_id;

    // Get date boundaries
    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      .toISOString()
      .split("T")[0];
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      .toISOString()
      .split("T")[0];

    // 3. Fetch current month amounts
    const { data: thisMonthTxns, error: thisMonthError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("household_id", householdId)
      .gte("txn_date", startOfThisMonth);

    if (thisMonthError) throw thisMonthError;

    // 4. Fetch last month amounts
    const { data: lastMonthTxns, error: lastMonthError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("household_id", householdId)
      .gte("txn_date", startOfLastMonth)
      .lte("txn_date", endOfLastMonth);

    if (lastMonthError) throw lastMonthError;

    // 5. Fetch all time amounts
    const { data: allTimeTxns, error: allTimeError } = await supabase
      .from("transactions")
      .select("amount")
      .eq("household_id", householdId);

    if (allTimeError) throw allTimeError;

    // 6. Fetch recent 5 transactions
    const { data: recentTransactions, error: recentError } = await supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .order("txn_date", { ascending: false })
      .order("logged_at", { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    // 7. Fetch household profiles (Dad and Mom names and roles)
    const { data: members, error: membersError } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("household_id", householdId);

    if (membersError) throw membersError;

    // Calculate sums
    const thisMonthTotal = thisMonthTxns.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );
    const lastMonthTotal = lastMonthTxns.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );
    const allTimeTotal = allTimeTxns.reduce(
      (acc, curr) => acc + Number(curr.amount),
      0,
    );

    // Calculate percentage change
    let changePercent = 0;
    if (lastMonthTotal > 0) {
      changePercent = Math.round(
        ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100,
      );
    } else if (thisMonthTotal > 0) {
      changePercent = 100; // Default to +100% if no history last month
    }

    return NextResponse.json(
      {
        profile: {
          displayName: profile.display_name,
          role: profile.role,
        },
        summary: {
          thisMonthTotal,
          lastMonthTotal,
          allTimeTotal,
          changePercent,
        },
        recentTransactions,
        members,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[API Error] Fetch summary failed:", err);
    return NextResponse.json(
      { error: "Couldn't load dashboard data. Please try again." },
      { status: 500 },
    );
  }
}
