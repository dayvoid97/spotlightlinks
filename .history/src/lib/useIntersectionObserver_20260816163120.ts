import { useEffect, useRef } from 'react'

export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
  options?: IntersectionObserverInit
) {
  const ref = useRef<T>(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          observer.unobserve(entry.target)
        }
      },
      {
        threshold: 0.1,
        ...options,
      }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [options])

  return ref
}
