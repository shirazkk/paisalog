import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { startOfMonth, endOfMonth, subMonths, format, parseISO } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!user || error) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile.household_id) {
      return NextResponse.json({ error: "No household" }, { status: 400 });
    }

    const householdId = profile.household_id;
    const { searchParams } = new URL(request.url);
    const monthParam = searchParams.get("month"); // YYYY-MM

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId);

    let lastMonthQuery = supabase
      .from("transactions")
      .select("amount")
      .eq("household_id", householdId);

    if (monthParam && monthParam !== "all") {
      const selectedDate = parseISO(`${monthParam}-01`);
      const startDate = format(startOfMonth(selectedDate), "yyyy-MM-dd");
      const endDate = format(endOfMonth(selectedDate), "yyyy-MM-dd");

      query = query.gte("txn_date", startDate).lte("txn_date", endDate);

      // Previous month for delta
      const prevMonthDate = subMonths(selectedDate, 1);
      const prevStartDate = format(startOfMonth(prevMonthDate), "yyyy-MM-dd");
      const prevEndDate = format(endOfMonth(prevMonthDate), "yyyy-MM-dd");

      lastMonthQuery = lastMonthQuery.gte("txn_date", prevStartDate).lte("txn_date", prevEndDate);
    } else {
      lastMonthQuery = lastMonthQuery.limit(0); 
    }

    const [currentTxns, lastTxns, members] = await Promise.all([
      query.order("amount", { ascending: false }),
      lastMonthQuery,
      supabase.from("profiles").select("id, role, display_name").eq("household_id", householdId)
    ]);

    if (currentTxns.error) throw currentTxns.error;
    if (lastTxns.error) throw lastTxns.error;
    if (members.error) throw members.error;

    const totalAmount = currentTxns.data.reduce((sum, t) => sum + Number(t.amount), 0);
    const lastMonthTotal = lastTxns.data.reduce((sum, t) => sum + Number(t.amount), 0);
    
    let changePercent = 0;
    if (lastMonthTotal > 0) {
      changePercent = Math.round(((totalAmount - lastMonthTotal) / lastMonthTotal) * 100);
    } else if (totalAmount > 0) {
      changePercent = 100;
    }

    // Category Breakdown
    const catMap: Record<string, number> = {};
    currentTxns.data.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + Number(t.amount);
    });

    const categoryBreakdown = Object.entries(catMap)
      .map(([category, total]) => ({
        category,
        total,
        percent: totalAmount > 0 ? Math.round((total / totalAmount) * 100) : 0
      }))
      .sort((a, b) => b.total - a.total);

    // Contribution Split
    const dadProfile = members.data.find(m => m.role === "dad");
    const momProfile = members.data.find(m => m.role === "mom");

    const dadTotal = currentTxns.data
      .filter(t => t.giver_id === dadProfile?.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const momTotal = currentTxns.data
      .filter(t => t.giver_id === momProfile?.id)
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const dadPercent = totalAmount > 0 ? Math.round((dadTotal / totalAmount) * 100) : 0;
    const momPercent = totalAmount > 0 ? 100 - dadPercent : 0;

    return NextResponse.json({
      totalAmount,
      transactionCount: currentTxns.data.length,
      lastMonthTotal,
      changePercent,
      categoryBreakdown,
      dadTotal,
      momTotal,
      dadPercent,
      momPercent,
      topTransactions: currentTxns.data.slice(0, 5),
      members: members.data
    });

  } catch (err: any) {
    console.error("[API Error] Reports failed:", err);
    return NextResponse.json({ error: "Failed to load report data" }, { status: 500 });
  }
}
