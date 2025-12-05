"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface FormFieldProps {
  label: string
  id: string
  type?: "text" | "email" | "number" | "password" | "textarea"
  placeholder?: string
  value?: string | number
  onChange?: (value: string | number) => void
  required?: boolean
  error?: string
  disabled?: boolean
  min?: number
  step?: string | number
  helperText?: string
}

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
  error,
  disabled,
  min,
  step,
  helperText,
}: FormFieldProps) {
  const Component = type === "textarea" ? Textarea : Input

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Component
        id={id}
        type={type === "textarea" ? undefined : type}
        placeholder={placeholder}
        value={value}
        onChange={(e: any) => onChange?.(e.target.value)}
        disabled={disabled}
        min={min}
        step={step}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
    </div>
  )
}
