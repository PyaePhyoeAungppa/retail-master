
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: stores, error } = await supabaseAdmin
      .from('stores')
      .select(`
        *,
        terminals (id),
        products (id),
        categories (id),
        store_users (id)
      `)
    
    if (error) throw error

    // Map to include counts for a better overview
    const enrichedStores = stores.map(s => ({
      ...s,
      terminalCount: s.terminals?.length || 0,
      productCount: s.products?.length || 0,
      categoryCount: s.categories?.length || 0,
      staffCount: s.store_users?.length || 0
    }))

    return NextResponse.json(enrichedStores)
  } catch (error: any) {
    console.error('Superadmin stores fetch error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
