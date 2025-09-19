"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { FileText, BarChart3, Upload, Download, Settings, Menu, CreditCard } from "lucide-react"
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

export function Navigation() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  if (!user) return null

  const NavigationItems = ({ mobile = false }: { mobile?: boolean }) => (
    <nav className={cn("space-y-2", mobile && "px-4")}>
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
            onClick={() => mobile && setOpen(false)}
          >
            <item.icon className="h-4 w-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden lg:block w-64 border-r bg-muted/10">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b px-6 py-4">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold">Smart Doc Checker</span>
          </div>
          <div className="flex-1 p-4">
            <NavigationItems />
          </div>
          <div className="border-t p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-medium">{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between border-b bg-background px-4 py-3">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="font-semibold">Smart Doc Checker</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex h-full flex-col">
                <div className="flex items-center gap-2 border-b px-6 py-4">
                  <FileText className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Smart Doc Checker</span>
                </div>
                <div className="flex-1 py-4">
                  <NavigationItems mobile />
                </div>
                <div className="border-t p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">{user.email?.[0]?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.email}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={signOut} className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
