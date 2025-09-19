import type React from "react"
import { HiddenSidebar } from "@/components/layout/hidden-sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-background relative">
      <HiddenSidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
