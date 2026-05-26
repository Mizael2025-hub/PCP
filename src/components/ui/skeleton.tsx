import { cn } from "@/lib/utils/cn"

export type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-ios-btn bg-zinc-200 dark:bg-zinc-800",
        className
      )}
    />
  )
}

export type SkeletonGroupProps = {
  rows?: number
  className?: string
}

export function SkeletonGroup({ rows = 3, className }: SkeletonGroupProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="animate-fade-in space-y-6 p-4 md:p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72" />
      </div>

      <div className="rounded-ios-card border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <SkeletonGroup rows={4} />
      </div>

      <div className="rounded-ios-card border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <Skeleton className="mb-4 h-6 w-40" />
        <SkeletonGroup rows={6} />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-fade-in space-y-2 p-4">
      <Skeleton className="mb-4 h-10 w-full" />
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="animate-fade-in rounded-ios-card border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <Skeleton className="mb-3 h-6 w-1/3" />
      <Skeleton className="mb-2 h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
