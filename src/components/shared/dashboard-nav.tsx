"use client"

"use client"

import Link from "next/link"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Suspense } from "react"
import {
  ShieldCheck,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Users,
  Gavel,
  Settings,
  Clipboard,
} from "lucide-react"
import { cn } from "@/lib/utils"

function DashboardNavContent() {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const userLinks = [
    { href: "/user/my-cases", label: "My Cases", icon: FolderOpen },
    { href: "/user/new-complaint", label: "File Dispute", icon: FileText },
    { href: "/user/settings", label: "Settings", icon: Settings },
  ]

  const officerLinks = [{ href: "/officer", label: "Assigned Cases", icon: LayoutDashboard }]

  const jurorLinks = [{ href: "/juror", label: "Review Queue", icon: Gavel }]

  const adminLinks = [
    { href: "/admin", label: "Admin", icon: LayoutDashboard },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  const auditorLinks = [{ href: "/auditor", label: "Audit Log", icon: Clipboard }]

  const isOfficer = ["OFFICER_BANK", "OFFICER_NPCI", "OMBUDSMAN", "CYBERCRIME"].includes(
    user?.role ?? ""
  )
  const isAuditor = user?.role === "AUDITOR"

  const links =
    user?.role === "ADMIN"
      ? [...userLinks, ...adminLinks]
      : user?.role === "JUROR"
        ? jurorLinks
        : isOfficer
          ? officerLinks
          : isAuditor
            ? auditorLinks
            : userLinks

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white shadow-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex flex-1 items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
            Fintrust-AI
          </Link>
          <div className="mx-4 flex-1">
            <Input
              placeholder="Search cases..."
              value={searchParams.get("search") ?? ""}
              onChange={(e) => {
                const value = e.target.value
                const params = new URLSearchParams(searchParams)
                if (value) {
                  params.set("search", value)
                } else {
                  params.delete("search")
                }
                const queryString = params.toString()
                router.push(queryString ? `${pathname}?${queryString}` : pathname)
              }}
              className="w-full max-w-xs"
            />
          </div>
          <nav className="hidden items-center gap-1 sm:flex">
            {links.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith(href)
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </Link>
            ))}
            <Link
              href="/public-dashboard"
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname === "/public-dashboard"
                  ? "bg-primary-50 text-primary-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-gray-500 sm:block">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={logout} className="text-gray-600">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}

export function DashboardNav() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-10 border-b border-gray-200 bg-linear-to-r from-blue-50 to-white shadow-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <div className="flex items-center gap-2 font-semibold text-gray-900">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              Fintrust-AI
            </div>
          </div>
        </header>
      }
    >
      <DashboardNavContent />
    </Suspense>
  )
}
