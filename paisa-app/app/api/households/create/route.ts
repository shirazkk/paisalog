import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'
import { supabaseService } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    // 1. Validate auth
    const supabase = await createServerClientInstance()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = user.id

    // 2. Parse body
    const body = await request.json()
    const familyName = body.familyName || 'My Family'

    // 3. Generate unique invite code (format: PL-XXXX where X is digit)
    let isUnique = false
    let inviteCode = ''
    let attempts = 0

    while (!isUnique && attempts < 10) {
      attempts++
      const randomDigits = Math.floor(1000 + Math.random() * 9000)
      inviteCode = `PL-${randomDigits}`

      // Check if it already exists
      const { data: existing } = await supabaseService
        .from('households')
        .select('id')
        .eq('invite_code', inviteCode)
        .maybeSingle()

      if (!existing) {
        isUnique = true
      }
    }

    if (!isUnique) {
      throw new Error('Could not generate a unique invite code')
    }

    // 4. Create household (using service client to bypass RLS for insertion)
    const { data: household, error: householdError } = await supabaseService
      .from('households')
      .insert({
        name: familyName,
        invite_code: inviteCode
      })
      .select()
      .single()

    if (householdError) throw householdError

    // 5. Link user profile to the household and assign 'dad' role by default
    const { error: profileError } = await supabaseService
      .from('profiles')
      .update({
        household_id: household.id,
        role: 'dad'
      })
      .eq('id', userId)

    if (profileError) throw profileError

    return NextResponse.json({ household }, { status: 201 })
  } catch (err: unknown) {
    console.error('[API Error] Create household failed:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
