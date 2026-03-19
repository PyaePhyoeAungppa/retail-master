
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role, storeId } = await req.json()

    if (!email || !password || !fullName || !role || !storeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize Supabase with SERVICE_ROLE_KEY for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // This must be in .env.local
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

    // 2. Create Profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        store_id: storeId,
        role: role
      })

    if (profileError) throw profileError

    // 3. Link to Store with Role
    const { error: storeUserError } = await supabaseAdmin
      .from('store_users')
      .insert({
        store_id: storeId,
        user_id: userId,
        role: role
      })

    if (storeUserError) throw storeUserError

    return NextResponse.json({ success: true, userId })
  } catch (error: any) {
    console.error('Admin user creation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
