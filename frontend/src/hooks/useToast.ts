import { useContext } from 'react'
import { ToastContext } from '@/contexts/ToastContext'

/**
 * Hook to access the toast notification queue.
 *
 * @example
 * const { toast } = useToast()
 * toast({ title: 'Saved!', variant: 'success' })
 */
export function useToast() {
  return useContext(ToastContext)
}
