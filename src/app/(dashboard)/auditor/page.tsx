"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

interface AuditEvent {
  id: string
  caseId: string | null
  eventType: string
  data: unknown
  hash: string
  prevHash: string
  actorId: string | null
  createdAt: string // ISO string
}

export default function AuditorPage() {
  // Explicitly type the state so TypeScript knows 'events' isn't of type 'never[]'
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAuditEvents() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/audit?limit=100")
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!cancelled) {
          setEvents(data as AuditEvent[])
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchAuditEvents()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    // Replaced 'bg-gradient-to-r' with 'bg-linear-to-r' for Tailwind CSS v4 compatibility
    <div className="from-primary-50 min-h-screen bg-linear-to-r to-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Auditor Dashboard</h1>
          <Link
            href="/"
            className="inline-flex items-center rounded-md bg-gray-200 px-4 py-2 text-gray-800 transition-colors hover:bg-gray-300"
          >
            ← Back to Home
          </Link>
        </div>

        {loading && (
          <div className="py-12 text-center">
            <div className="border-primary-600 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="mt-4 text-gray-600">Loading audit logs...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            <p>Error loading audit data: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Case ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Event Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                    Valid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {events.length === 0 ? (
                  <tr>
                    {/* Fixed colSpan to be a number instead of a string */}
                    <td className="px-6 py-4 text-center text-sm text-gray-500" colSpan={5}>
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  events.map((ev, idx) => (
                    <tr key={ev.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-6 py-4 text-sm text-gray-900">{ev.id}</td>
                      <td className="px-6 py-4 text-sm">
                        {ev.caseId ? (
                          <Link
                            href={`/audit/${ev.caseId}`}
                            className="hover:text-primary-600 underline"
                          >
                            {ev.caseId}
                          </Link>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{ev.eventType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(ev.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="xs:hidden xs:px-2.5 xs:py-0.5 xs:text-xs inline-flex items-center rounded-full bg-gray-200 px-2 leading-4 text-gray-600">
                          Verifying…
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
