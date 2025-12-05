"use client"
import { Label } from "@/components/ui/label"
import { Filter } from "lucide-react"

interface FilterOption {
  label: string
  value: string
  isActive?: boolean
}

interface FilterSidebarProps {
  filters: {
    title: string
    options: FilterOption[]
    onSelect: (value: string) => void
  }[]
  onReset?: () => void
}

export function FilterSidebar({ filters, onReset }: FilterSidebarProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6 sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5" />
          Filters
        </h2>
        {onReset && (
          <button onClick={onReset} className="text-xs text-primary hover:underline">
            Reset
          </button>
        )}
      </div>

      <div className="space-y-6">
        {filters.map((filter) => (
          <div key={filter.title} className="space-y-3">
            <Label className="text-base font-medium">{filter.title}</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {filter.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => filter.onSelect(option.value)}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    option.isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
