import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/use-auth-store'

export function useCurrency() {
  const { storeId } = useAuthStore()
  
  const { data: currency } = useQuery({
    queryKey: ['store-currency', storeId],
    queryFn: async () => {
      if (!storeId) return '$'
      const { data, error } = await supabase
        .from('stores')
        .select('currency')
        .eq('id', storeId)
        .single()
        
      if (error) {
        console.error("Error fetching currency:", error)
        return '$'
      }
      return data?.currency || '$'
    },
    enabled: !!storeId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  })

  return currency || '$'
}
