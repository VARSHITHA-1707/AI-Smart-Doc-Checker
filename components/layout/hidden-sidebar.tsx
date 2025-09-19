"use client"

import { useState, useEffect } from "react"
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
  const [mouseX, setMouseX] = useState(0)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Track mouse position for hover detection
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX)
      // Show sidebar when mouse is within 50px of left edge
      setIsVisible(e.clientX < 50)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  if (!user) return null

  // Keep sidebar visible when hovering over it
  const handleSidebarMouseEnter = () => {
    setIsVisible(true)
  }

  const handleSidebarMouseLeave = () => {
    // Only hide if mouse is not near left edge
    if (mouseX > 300) {
      setIsVisible(false)
    }
  }

  return (
    <>
      {/* Hover trigger zone - invisible area on left edge */}
      <div className="fixed left-0 top-0 w-12 h-full z-40 bg-transparent" onMouseEnter={() => setIsVisible(true)} />

      {/* Sidebar overlay */}
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background border-r shadow-lg z-50 transform transition-transform duration-300 ease-in-out",
          isVisible ? "translate-x-0" : "-translate-x-full",
        )}
        onMouseEnter={handleSidebarMouseEnter}
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

          {/* Dashboard Button */}
          <div className="px-4 pb-2">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                <BarChart3 className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
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

      {/* Background overlay when sidebar is visible */}
      {isVisible && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={() => setIsVisible(false)} />}
    </>
  )
}
