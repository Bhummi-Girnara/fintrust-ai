"use client"

import { useEffect, useState, useCallback, Suspense } from "react"
import { useAuthFetch } from "@/hooks/use-fetch"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { Search, AlertCircle, CheckCircle2, Shield, Lock, Unlock, ChevronDown } from "lucide-react"

const ROLES = [
  "USER",
  "OFFICER_BANK",
  "OFFICER_NPCI",
  "OMBUDSMAN",
  "CYBERCRIME",
  "JUROR",
  "ADMIN",
  "AUDITOR",
] as const

const ROLE_COLORS: Record<string, string> = {
  USER: "bg-gray-100 text-gray-600",
  OFFICER_BANK: "bg-blue-100 text-blue-700",
  OFFICER_NPCI: "bg-purple-100 text-purple-700",
  OMBUDSMAN: "bg-indigo-100 text-indigo-700",
  CYBERCRIME: "bg-red-100 text-red-700",
  JUROR: "bg-yellow-100 text-yellow-700",
  ADMIN: "bg-green-100 text-green-700",
  AUDITOR: "bg-orange-100 text-orange-700",
}

interface User {
  id: string
  email: string
  role: string
  emailVerified: boolean
  isLocked: boolean
  twoFactorEnabled: boolean
  createdAt: string
  lastLoginAt: string | null
  _count: { cases: number }
}

function AdminUsersContent() {
  const authFetch = useAuthFetch()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const loadUsers = useCallback(
    async (q: string) => {
      setLoading(true)
      setError(null)
      const params = q ? `?search=${encodeURIComponent(q)}` : ""
      authFetch(`/api/admin/users${params}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            setError(data.error)
            return
          }
          setUsers(data.users ?? [])
        })
        .catch(() => setError("Failed to load users"))
        .finally(() => setLoading(false))
    },
    [authFetch]
  )

  useEffect(() => {
    loadUsers("")
  }, [loadUsers])

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => loadUsers(search), 400)
    return () => clearTimeout(t)
  }, [search, loadUsers])

  const changeRole = async (userId: string, newRole: string) => {
    setUpdating(userId)
    try {
      const res = await authFetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(`Error: ${data.error}`)
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
      showToast(`Role updated to ${newRole.replace(/_/g, " ")}`)
    } finally {
      setUpdating(null)
    }
  }

  const unlockUser = async (userId: string) => {
    setUpdating(userId)
    try {
      const res = await authFetch(`/api/admin/users/${userId}/unlock`, { method: "PATCH" })
      const data = await res.json()
      if (!res.ok) {
        showToast(`Error: ${data.error}`)
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isLocked: false } : u)))
      showToast("Account unlocked")
    } finally {
      setUpdating(null)
    }
  }

  // Summary counts
  const roleCounts = ROLES.reduce(
    (acc, r) => {
      acc[r] = users.filter((u) => u.role === r).length
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed right-4 bottom-4 z-50 flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">
          <CheckCircle2 className="h-4 w-4 text-green-400" />
          {toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">User management</h1>
        <p className="mt-0.5 text-sm text-gray-500">{users.length} total users</p>
      </div>

      {/* Role summary chips */}
      <div className="flex flex-wrap gap-2">
        {ROLES.filter((r) => roleCounts[r] > 0).map((role) => (
          <div
            key={role}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
              ROLE_COLORS[role]
            )}
          >
            <span>{role.replace(/_/g, " ")}</span>
            <span className="opacity-60">·</span>
            <span>{roleCounts[role]}</span>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search by email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Users table */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-500">User</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Role</th>
                <th className="hidden px-4 py-3 text-xs font-medium text-gray-500 sm:table-cell">
                  Cases
                </th>
                <th className="hidden px-4 py-3 text-xs font-medium text-gray-500 md:table-cell">
                  Last login
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-xs font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b transition-colors last:border-0 hover:bg-gray-50"
                >
                  {/* Email */}
                  <td className="px-4 py-3">
                    <p className="max-w-[180px] truncate font-medium text-gray-900">{user.email}</p>
                    <p className="font-mono text-xs text-gray-400">{user.id.slice(0, 8)}…</p>
                  </td>

                  {/* Role dropdown */}
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={user.role}
                        disabled={updating === user.id}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                        className={cn(
                          "cursor-pointer appearance-none rounded-full border-0 px-2.5 py-1 pr-6 text-xs font-medium",
                          "focus:ring-2 focus:ring-blue-300 focus:outline-none",
                          updating === user.id ? "cursor-not-allowed opacity-50" : "",
                          ROLE_COLORS[user.role]
                        )}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r.replace(/_/g, " ")}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute top-1/2 right-1.5 h-3 w-3 -translate-y-1/2 opacity-50" />
                    </div>
                  </td>

                  {/* Cases count */}
                  <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                    {user._count.cases}
                  </td>

                  {/* Last login */}
                  <td className="hidden px-4 py-3 text-xs text-gray-400 md:table-cell">
                    {user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}
                  </td>

                  {/* Status badges */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      {user.emailVerified ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle2 className="h-3 w-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Unverified</span>
                      )}
                      {user.twoFactorEnabled && (
                        <span className="flex items-center gap-1 text-xs text-blue-600">
                          <Shield className="h-3 w-3" /> 2FA on
                        </span>
                      )}
                      {user.isLocked && (
                        <span className="flex items-center gap-1 text-xs text-red-600">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Unlock button */}
                  <td className="px-4 py-3">
                    {user.isLocked && (
                      <button
                        onClick={() => unlockUser(user.id)}
                        disabled={updating === user.id}
                        className="flex items-center gap-1 text-xs font-medium text-orange-600 hover:text-orange-700 disabled:opacity-50"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Unlock
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* How to guide */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="mb-2 text-sm font-medium text-blue-800">How to promote a user</p>
        <ol className="list-inside list-decimal space-y-1 text-sm text-blue-700">
          <li>
            Ask the person to register normally at{" "}
            <code className="rounded bg-blue-100 px-1">/register</code>
          </li>
          <li>Find their email in this table</li>
          <li>Click the role dropdown next to their name and select the new role</li>
          <li>They can log out and back in — they will now see the correct dashboard</li>
        </ol>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      }
    >
      <AdminUsersContent />
    </Suspense>
  )
}
