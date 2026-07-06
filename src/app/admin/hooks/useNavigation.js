'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useEffect } from 'react'

/**
 * Safe navigation hook that prevents memory leaks
 * Use this instead of window.location.href
 */
export function useSafeNavigation() {
  const router = useRouter()
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const navigate = useCallback((path, options = {}) => {
    if (!isMountedRef.current) return

    // Use Next.js router for client-side navigation
    if (options.replace) {
      router.replace(path)
    } else {
      router.push(path)
    }
  }, [router])

  const redirectToLogin = useCallback(() => {
    navigate('/admin/login', { replace: true })
  }, [navigate])

  return {
    navigate,
    redirectToLogin,
    router
  }
}

/**
 * Debounced function hook
 * Prevents multiple rapid calls
 */
export function useDebounce(callback, delay = 500) {
  const timeoutRef = useRef(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        callback(...args)
      }
    }, delay)
  }, [callback, delay])
}

/**
 * Safe async operation hook
 * Prevents setState on unmounted component
 */
export function useSafeAsync() {
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const safeAsync = useCallback(async (asyncFn) => {
    try {
      const result = await asyncFn()
      return isMountedRef.current ? result : null
    } catch (error) {
      if (isMountedRef.current) {
        throw error
      }
      return null
    }
  }, [])

  return { safeAsync, isMounted: () => isMountedRef.current }
}
