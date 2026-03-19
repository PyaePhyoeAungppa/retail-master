
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const storeId = searchParams.get('storeId')

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch Auth Users (to get emails)
    // For a real production app with thousands of users, you might want to paginate or filter.
    // Here we'll take the simple approach of listing users.
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError

    // 2. Fetch Store Users / Assignments
    let query = supabaseAdmin
      .from('store_users')
      .select(`
        id,
        user_id,
        role,
        created_at,
        store_id,
        store:store_id (name)
      `)

    if (storeId && storeId !== 'all') {
      query = query.eq('store_id', storeId)
    }

    const { data: storeUsers, error: suError } = await query
    if (suError) throw suError

    // 3. Fetch Profiles (for primary store links)
    let pQuery = supabaseAdmin
      .from('profiles')
      .select('*, store:store_id(name)')
    
    if (storeId && storeId !== 'all') {
      pQuery = pQuery.eq('store_id', storeId)
    }

    const { data: storeProfiles, error: spError } = await pQuery
    if (spError) throw spError

    // 4. Merge Data
    const staffMap = new Map()

    // Process store assignments
    storeUsers?.forEach(su => {
      const authUser = users.find(u => u.id === su.user_id)
      staffMap.set(su.user_id, {
        ...su,
        profiles: {
          full_name: authUser?.user_metadata?.full_name || 'Unknown Name',
          email: authUser?.email || 'No Email'
        }
      })
    })

    // Process primary profiles (for owners/creators)
    storeProfiles?.forEach(p => {
      if (!staffMap.has(p.id)) {
        staffMap.set(p.id, {
          id: `p-${p.id}`,
          user_id: p.id,
          role: p.role,
          created_at: p.created_at,
          store_id: p.store_id,
          store: p.store,
          profiles: {
            full_name: p.full_name,
            email: users.find(u => u.id === p.id)?.email || 'No Email'
          }
        })
      }
    })

    return NextResponse.json(Array.from(staffMap.values()))
  } catch (error: any) {
    console.error('Staff fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
