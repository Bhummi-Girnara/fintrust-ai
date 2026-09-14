import { ReactNode, Suspense } from "react"
import { DashboardNav } from "@/components/shared/dashboard-nav"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={null}>
        <DashboardNav />
      </Suspense>
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  )
}
