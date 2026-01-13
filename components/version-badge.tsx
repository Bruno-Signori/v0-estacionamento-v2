"use client"

import { APP_VERSION } from "@/lib/version"
import { Package } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function VersionBadge() {
  const isProduction = process.env.NODE_ENV === "production"
  const bgColor = isProduction ? "bg-green-100" : "bg-yellow-100"
  const textColor = isProduction ? "text-green-700" : "text-yellow-700"
  const borderColor = isProduction ? "border-green-300" : "border-yellow-300"

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${bgColor} ${textColor} border ${borderColor} cursor-help`}
          >
            <Package className="h-3 w-3" />
            <span>v{APP_VERSION}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <p>
              <strong>Versão:</strong> {APP_VERSION}
            </p>
            <p>
              <strong>Ambiente:</strong> {isProduction ? "Produção" : "Desenvolvimento"}
            </p>
            <p>
              <strong>Status:</strong> {isProduction ? "🟢 Online" : "🟡 Teste"}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
