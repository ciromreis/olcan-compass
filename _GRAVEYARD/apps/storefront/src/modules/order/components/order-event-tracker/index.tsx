"use client"

import { useEffect, useRef } from "react"
import { useMarketplaceEvents } from "@/app/StorefrontAuraBuddy"
import { HttpTypes } from "@medusajs/types"

type OrderEventTrackerProps = {
  order: HttpTypes.StoreOrder
}

export default function OrderEventTracker({ order }: OrderEventTrackerProps) {
  const { trackPurchaseComplete } = useMarketplaceEvents()
  const hasTracked = useRef(false)

  useEffect(() => {
    if (!hasTracked.current && order) {
      trackPurchaseComplete(
        order.id,
        order.total || 0,
        order.currency_code || "BRL",
        order.items?.length || 0
      )
      hasTracked.current = true
    }
  }, [order, trackPurchaseComplete])

  return null
}
