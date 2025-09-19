"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

const navigationTabs = [
  { name: "Docs", href: "/dashboard/docs" },
  { name: "Help", href: "/dashboard/help" },
  { name: "Support", href: "/dashboard/support" },
  { name: "Settings", href: "/dashboard/settings" },
]

export function DashboardHeader() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-foreground">Smart Doc Checker</h1>
        </div>

        <nav className="flex items-center space-x-1">
          {navigationTabs.map((tab) => {
            const isActive = pathname === tab.href
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted",
                )}
              >
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
