/**
 * Loading Skeleton Components - Olcan Compass v2.5
 * Provides better UX during data loading
 */

import React from 'react'

export function CompanionSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-8 w-48 bg-cream-200 rounded-lg" />
        <div className="h-12 w-64 bg-cream-200 rounded-lg" />
      </div>

      {/* Visual */}
      <div className="card-surface p-12 rounded-3xl">
        <div className="w-64 h-64 mx-auto bg-cream-200 rounded-full" />
        
        {/* Progress bars */}
        <div className="mt-8 space-y-4 max-w-2xl mx-auto">
          <div className="h-2 bg-cream-200 rounded-full" />
          <div className="h-2 bg-cream-200 rounded-full w-3/4" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mt-12">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="w-10 h-10 bg-cream-200 rounded-xl" />
              <div className="h-4 bg-cream-200 rounded" />
              <div className="h-6 bg-cream-200 rounded w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Activities */}
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card-surface p-6 rounded-2xl flex items-center gap-6">
            <div className="w-14 h-14 bg-cream-200 rounded-xl" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-cream-200 rounded w-24" />
              <div className="h-4 bg-cream-200 rounded w-32" />
            </div>
            <div className="w-16 h-8 bg-cream-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="h-10 w-64 bg-cream-200 rounded-lg" />
        <div className="h-6 w-96 bg-cream-200 rounded-lg" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-6 rounded-2xl space-y-4">
            <div className="h-5 w-32 bg-cream-200 rounded" />
            <div className="h-8 w-20 bg-cream-200 rounded" />
            <div className="h-2 bg-cream-200 rounded-full" />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card-surface p-6 rounded-2xl space-y-4">
              <div className="h-6 w-48 bg-cream-200 rounded" />
              <div className="h-4 w-full bg-cream-200 rounded" />
              <div className="h-4 w-3/4 bg-cream-200 rounded" />
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="card-surface p-6 rounded-2xl space-y-4">
              <div className="h-5 w-32 bg-cream-200 rounded" />
              <div className="h-20 bg-cream-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-surface p-4 rounded-xl flex items-center gap-4 animate-pulse">
          <div className="w-12 h-12 bg-cream-200 rounded-lg" />
          <div className="flex-1 space-y-2">
            <div className="h-5 bg-cream-200 rounded w-48" />
            <div className="h-4 bg-cream-200 rounded w-32" />
          </div>
          <div className="w-20 h-8 bg-cream-200 rounded" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card-surface p-6 rounded-2xl animate-pulse space-y-4">
      <div className="h-6 w-48 bg-cream-200 rounded" />
      <div className="h-4 w-full bg-cream-200 rounded" />
      <div className="h-4 w-3/4 bg-cream-200 rounded" />
      <div className="h-2 bg-cream-200 rounded-full mt-4" />
    </div>
  )
}
