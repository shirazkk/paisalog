import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, format } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get user household
    const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
    if (!profile?.household_id) return NextResponse.json({ error: "No household" }, { status: 400 });

    const householdId = profile.household_id;

    // 2. Fetch all budgets (limits)
    const { data: budgets, error: budgetError } = await supabase
      .from("budgets")
      .select("*")
      .eq("household_id", householdId);

    if (budgetError) throw budgetError;

    // 3. Fetch current month actuals
    const startDate = format(startOfMonth(new Date()), "yyyy-MM-dd");
    const endDate = format(endOfMonth(new Date()), "yyyy-MM-dd");

    const { data: transactions, error: txnError } = await supabase
      .from("transactions")
      .select("amount, category")
      .eq("household_id", householdId)
      .gte("txn_date", startDate)
      .lte("txn_date", endDate);

    if (txnError) throw txnError;

    // 4. Aggregate actuals
    const actualsMap: Record<string, number> = {};
    transactions.forEach((t) => {
      actualsMap[t.category] = (actualsMap[t.category] || 0) + Number(t.amount);
    });

    // 5. Merge data
    const result = budgets.map((b) => {
      const actual = actualsMap[b.category] || 0;
      return {
        category: b.category,
        limit: Number(b.amount_limit),
        actual,
        percent: b.amount_limit > 0 ? Math.round((actual / Number(b.amount_limit)) * 100) : 0,
      };
    });

    return NextResponse.json({ budgets: result });
  } catch (err: any) {
    console.error("[API Error] Budgets GET failed:", err);
    return NextResponse.json({ error: "Failed to load budget data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { category, limit } = await request.json();
    if (!category || limit === undefined) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user.id).single();
    if (!profile?.household_id) return NextResponse.json({ error: "No household" }, { status: 400 });

    const { data, error } = await supabase
      .from("budgets")
      .upsert({
        household_id: profile.household_id,
        category,
        amount_limit: limit,
        updated_at: new Date().toISOString(),
      }, { onConflict: "household_id,category" })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API Error] Budgets POST failed:", err);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
