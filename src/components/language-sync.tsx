"use client"

import { useEffect, Suspense } from "react"
import { useSearchParams, usePathname } from "next/navigation"
import { useLanguageStore } from "@/store/use-language-store"
import { Language } from "@/lib/translations"

function InnerLanguageSync() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { language, setLanguage } = useLanguageStore()

  useEffect(() => {
    const lan = searchParams.get('lan')
    
    // 1. URL Parameter -> Store Synchronization
    if (lan === 'en' || lan === 'mm') {
      if (lan !== language) {
        setLanguage(lan as Language)
      }
    } 
    // 2. Default Handling for Landing Page
    else if (!lan && pathname === '/') {
       // Requirement: "when they visit retailmaster.store show the english version"
       // We force English if no 'lan' parameter is present on the root path.
       if (language !== 'en') {
         setLanguage('en')
       }
    }
  }, [searchParams, language, setLanguage, pathname])

  return null
}

export function LanguageSync() {
  return (
    <Suspense fallback={null}>
      <InnerLanguageSync />
    </Suspense>
  )
}
