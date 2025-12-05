"use client"

import { useCallback, useState } from "react"

export function useAsync<T>(asyncFunction: () => Promise<T>, immediate = true) {
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async () => {
    setStatus("pending")
    setData(null)
    setError(null)

    try {
      const response = await asyncFunction()
      setData(response)
      setStatus("success")
      return response
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Unknown error"))
      setStatus("error")
      return null
    }
  }, [asyncFunction])

  useState(() => {
    if (immediate) {
      execute()
    }
  })

  return { execute, status, data, error }
}

export function useFormState<T extends Record<string, any>>(initialState: T) {
  const [formData, setFormData] = useState(initialState)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const updateField = useCallback(
    (field: keyof T, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      
      // 💡 FIX: Cast 'field' to 'string' to satisfy TypeScript
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field as string] // 💡 
          return newErrors
        })
      }
    },
    [errors],
  )

  const reset = useCallback(() => {
    setFormData(initialState)
    setErrors({})
  }, [initialState])

  return { formData, errors, updateField, setErrors, reset }
}