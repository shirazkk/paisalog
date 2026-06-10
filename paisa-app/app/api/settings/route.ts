import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch user profile + household
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*, households(*)')
      .eq('id', session.user.id)
      .single()

    if (profileError) throw profileError

    // 2. Fetch partner profile
    const { data: partner, error: partnerError } = await supabase
      .from('profiles')
      .select('display_name, role')
      .eq('household_id', profile.household_id)
      .neq('id', session.user.id)
      .single()

    return NextResponse.json({
      profile,
      household: profile.households,
      partner: partner || null
    }, { status: 200 })
  } catch (err: any) {
    console.error('[API Error] Settings fetch failed:', err)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}
