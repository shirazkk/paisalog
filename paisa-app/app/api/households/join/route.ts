import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate auth
    const supabase = await createServerClientInstance()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // 2. Parse and validate invite code
    const body = await request.json()
    const inviteCode = (body.inviteCode || '').trim().toUpperCase()

    if (!inviteCode) {
      return NextResponse.json({ error: 'Please enter an invite code.' }, { status: 400 })
    }

    // 3. Find the household
    const { data: household, error: householdError } = await supabaseService
      .from('households')
      .select('id, name')
      .eq('invite_code', inviteCode)
      .maybeSingle()

    if (householdError) throw householdError

    if (!household) {
      // Return specific error from Error Message Dictionary (error-handling skill)
      return NextResponse.json(
        { error: 'That code doesn\'t match. Check with your partner.' },
        { status: 400 }
      )
    }

    // 4. Check existing members of the household
    const { data: members, error: membersError } = await supabaseService
      .from('profiles')
      .select('id, role')
      .eq('household_id', household.id)

    if (membersError) throw membersError

    let designatedRole: 'dad' | 'mom' = 'dad'

    if (members.length >= 2) {
      return NextResponse.json(
        { error: 'This household is already full. PaisaLog is for 2 users only.' },
        { status: 400 }
      )
    } else if (members.length === 1) {
      // Assign the opposite role to the partner
      const partnerRole = members[0].role
      designatedRole = partnerRole === 'dad' ? 'mom' : 'dad'
    }

    // 5. Update user profile to link to the household
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({
        household_id: household.id,
        role: designatedRole
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return NextResponse.json({ household, role: designatedRole }, { status: 200 })
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Unknown error'
    console.error('[API Error] Join household failed:', error)
    return NextResponse.json(
      { error: 'Couldn\'t join household. Please try again.' },
      { status: 500 }
    )
  }
}
