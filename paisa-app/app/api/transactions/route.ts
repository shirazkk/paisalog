import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";
import { transactionSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
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

    // 2. Fetch user's profile to get household_id and role
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id, role")
      .eq("id", userId)
      .single();

    if (profileError || !profile.household_id) {
      return NextResponse.json(
        { error: "You must join a household before logging transactions." },
        { status: 400 },
      );
    }

    const householdId = profile.household_id;
    const userRole = profile.role;

    // 3. Parse and validate body
    const body = await request.json();
    const result = transactionSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0].message },
        { status: 400 },
      );
    }

    const validated = result.data;

    // 4. Enforce role-based direction
    if (userRole === "dad" && validated.direction !== "dad_to_mom") {
      return NextResponse.json(
        { error: "Dad can only log transactions from Dad to Mom." },
        { status: 403 },
      );
    }
    if (userRole === "mom" && validated.direction !== "mom_to_dad") {
      return NextResponse.json(
        { error: "Mom can only log transactions from Mom to Dad." },
        { status: 403 },
      );
    }

    // 5. Fetch the household members (must have both Dad and Mom profiles)
    const { data: members, error: membersError } = await supabase
      .from("profiles")
      .select("id, role")
      .eq("household_id", householdId);

    if (membersError) throw membersError;

    const dadProfile = members.find((m) => m.role === "dad");
    const momProfile = members.find((m) => m.role === "mom");

    if (!dadProfile || !momProfile) {
      return NextResponse.json(
        {
          error:
            "Your partner needs to link their account using the invite code before you can log transactions.",
        },
        { status: 400 },
      );
    }

    // 5. Determine giver and receiver based on selected direction
    let giverId = "";
    let receiverId = "";

    if (validated.direction === "dad_to_mom") {
      giverId = dadProfile.id;
      receiverId = momProfile.id;
    } else {
      giverId = momProfile.id;
      receiverId = dadProfile.id;
    }

    // 6. Insert transaction
    const { data: transaction, error: insertError } = await supabase
      .from("transactions")
      .insert({
        household_id: householdId,
        logged_by: userId,
        giver_id: giverId,
        receiver_id: receiverId,
        amount: parseFloat(validated.amount),
        category: validated.category,
        txn_date: validated.txn_date,
        note: validated.note || null,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[API Error] Log transaction failed:", error);
    return NextResponse.json(
      { error: "Couldn't save. Please try again." },
      { status: 500 },
    );
  }
}

// GET endpoint to fetch all transactions (for History screen)
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
    const userId = user.id;

    // Fetch profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("household_id")
      .eq("id", userId)
      .single();

    if (profileError || !profile.household_id) {
      return NextResponse.json(
        { error: "No household joined yet" },
        { status: 400 },
      );
    }

    const householdId = profile.household_id;

    // Parse filters from URL query params
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const month = searchParams.get("month"); // format YYYY-MM

    // console.log(
    //   "[API Debug] Fetching transactions for household:",
    //   householdId,
    //   "Category:",
    //   category,
    //   "Month:",
    //   month,
    // );

    let query = supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId);

    if (category && category !== "all") {
      // console.log("[API Debug] Applying category filter:", category);
      query = query.eq("category", category);
    }

    if (month && month !== "all") {
      const startOfMonth = `${month}-01`;
      // Calculate end date
      const [year, m] = month.split("-").map(Number);
      const lastDay = new Date(year, m, 0).getDate();
      const endOfMonth = `${month}-${String(lastDay).padStart(2, "0")}`;

      // console.log(
      //   "[API Debug] Applying date filter:",
      //   startOfMonth,
      //   "to",
      //   endOfMonth,
      // );
      query = query.gte("txn_date", startOfMonth).lte("txn_date", endOfMonth);
    }

    const { data: transactions, error: fetchError } = await query
      .order("txn_date", { ascending: false })
      .order("logged_at", { ascending: false });

    if (fetchError) throw fetchError;

    // Also fetch members to let client resolve profiles
    const { data: members, error: membersError } = await supabase
      .from("profiles")
      .select("id, display_name, role")
      .eq("household_id", householdId);

    if (membersError) throw membersError;

    return NextResponse.json({ transactions, members }, { status: 200 });
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[API Error] Fetch transactions failed:", error);
    return NextResponse.json(
      { error: "Couldn't load transaction logs. Please try again." },
      { status: 500 },
    );
  }
}
