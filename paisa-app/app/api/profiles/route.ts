import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase/server";

export async function PATCH(request: NextRequest) {
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

    const body = await request.json();
    const { displayName } = body;

    if (!displayName || displayName.trim() === "") {
      return NextResponse.json(
        { error: "Display name is required" },
        { status: 400 },
      );
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({ message: "Profile updated" }, { status: 200 });
  } catch (err: any) {
    console.error("[API Error] Profile update failed:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
