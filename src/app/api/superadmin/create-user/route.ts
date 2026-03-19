
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role, storeIds } = await req.json()

    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create User in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (authError) throw authError
    const userId = authData.user.id

    // 2. Create Profile (Upsert handles case where trigger already ran)
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        role: role,
        // If provided, set the primary store to the first one in the list
        store_id: storeIds && storeIds.length > 0 ? storeIds[0] : null
      })
    if (profileError) throw profileError

    // 3. Attach to Stores (Multi-store support)
    if (storeIds && storeIds.length > 0) {
      const assignments = storeIds.map((sid: string) => ({
        store_id: sid,
        user_id: userId,
        role: role
      }))

      const { error: storeUserError } = await supabaseAdmin
        .from('store_users')
        .insert(assignments)

      if (storeUserError) throw storeUserError
    }

    return NextResponse.json({ 
      success: true, 
      userId,
      email,
      password,
      loginUrl: 'https://retailmaster.store/login'
    })
  } catch (error: any) {
    console.error('Superadmin user creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
