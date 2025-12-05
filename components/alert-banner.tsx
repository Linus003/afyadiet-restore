"use client"

import { AlertCircle, CheckCircle, InfoIcon, AlertTriangle } from "lucide-react"

interface AlertBannerProps {
  type: "error" | "success" | "info" | "warning"
  title: string
  message?: string
  onClose?: () => void
}

const typeConfig = {
  error: {
    icon: AlertCircle,
    bgClass: "bg-destructive/10",
    borderClass: "border-destructive/30",
    textClass: "text-destructive",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-green-100",
    borderClass: "border-green-300",
    textClass: "text-green-800",
  },
  info: {
    icon: InfoIcon,
    bgClass: "bg-blue-100",
    borderClass: "border-blue-300",
    textClass: "text-blue-800",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-yellow-100",
    borderClass: "border-yellow-300",
    textClass: "text-yellow-800",
  },
}

export function AlertBanner({ type, title, message, onClose }: AlertBannerProps) {
  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div className={`flex gap-3 p-4 ${config.bgClass} border ${config.borderClass} rounded-lg ${config.textClass}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm mt-1">{message}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 hover:opacity-70">
          ✕
        </button>
      )}
    </div>
  )
}
