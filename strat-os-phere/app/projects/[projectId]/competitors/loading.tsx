import { Skeleton } from '@/components/ui/skeleton'
import { SurfaceCard } from '@/components/ui/SurfaceCard'

export default function CompetitorsLoading() {
  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center pr-4">
      <main className="flex w-full max-w-5xl flex-col gap-6 py-10">
        {/* Header skeleton */}
        <header className="flex flex-col gap-4 border-b pb-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-32" />
          </div>
        </header>

        {/* Content skeleton */}
        <div className="space-y-6">
          <SurfaceCard className="p-6 space-y-4">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </SurfaceCard>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

