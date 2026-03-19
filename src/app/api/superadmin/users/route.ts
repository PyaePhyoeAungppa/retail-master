
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch ALL Auth Users
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    // 2. Fetch ALL Profiles
    const { data: profiles, error: pError } = await supabaseAdmin
      .from('profiles')
      .select('*, store:store_id(name)')
    
    if (pError) throw pError

    // 3. Fetch ALL Store Assignments
    const { data: storeUsers, error: suError } = await supabaseAdmin
      .from('store_users')
      .select('*, stores(name)')
    
    if (suError) throw suError

    // 4. Merge Data
    const enrichedUsers = users.map(authUser => {
      const profile = profiles.find(p => p.id === authUser.id)
      const assignments = storeUsers.filter(su => su.user_id === authUser.id)

      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || authUser.user_metadata?.full_name || 'No Name',
        role: profile?.role || 'user',
        primary_store: profile?.store,
        assignments: assignments.map(a => ({
          id: a.id,
          store_id: a.store_id,
          store_name: a.stores?.name,
          role: a.role
        }))
      }
    })

    return NextResponse.json(enrichedUsers)
  } catch (error: any) {
    console.error('Superadmin users fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
