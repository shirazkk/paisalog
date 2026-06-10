import { NextRequest, NextResponse } from 'next/server'
import { createServerClientInstance } from '@/lib/supabase/server'

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerClientInstance()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { displayName } = body

    if (!displayName || displayName.trim() === '') {
      return NextResponse.json({ error: 'Display name is required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', session.user.id)

    if (error) throw error

    return NextResponse.json({ message: 'Profile updated' }, { status: 200 })
  } catch (err: any) {
    console.error('[API Error] Profile update failed:', err)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
