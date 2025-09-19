"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { FileText, BarChart3, Upload, Download, Settings, CreditCard } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { cn } from "@/lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "Upload",
    href: "/dashboard?tab=upload",
    icon: Upload,
  },
  {
    name: "Documents",
    href: "/dashboard?tab=documents",
    icon: FileText,
  },
  {
    name: "Reports",
    href: "/dashboard?tab=reports",
    icon: Download,
  },
  {
    name: "Billing",
    href: "/billing",
    icon: CreditCard,
  },
]

export function HiddenSidebar() {
  const [isVisible, setIsVisible] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Show sidebar when mouse is within 20px of left edge
      if (e.clientX < 20 && !isVisible) {
        setIsVisible(true)
      }
    }

    document.addEventListener("mousemove", handleMouseMove)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isVisible])

  if (!user) return null

  const handleSidebarMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={sidebarRef}
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background border-r shadow-xl z-50 transform transition-all duration-300 ease-out",
          isVisible ? "translate-x-0" : "-translate-x-full",
        )}
        onMouseLeave={handleSidebarMouseLeave}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold">Smart Doc Checker</span>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href.includes("?tab=") && pathname === "/dashboard")
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* User Profile Section */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-medium">{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Premium User</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Background overlay when sidebar is visible on mobile */}
      {isVisible && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsVisible(false)} />}
    </>
  )
}
