/**
 * Olcan Marketplace API Client
 * Connects v2.5 app to the MedusaJS marketplace backend
 */

const MARKETPLACE_API_URL = process.env.NEXT_PUBLIC_MARKETPLACE_API_URL || 'http://localhost:9000'

interface ApiResponse<T> {
  data: T
  error?: string
}

// Types matching backend models
export interface DigitalProduct {
  id: string
  title: string
  slug: string
  description: string | null
  type: 'kit_application' | 'ebook' | 'course' | 'guide'
  price_b2c: number
  price_b2b: number
  currency: string
  download_url: string | null
  access_duration_days: number
  license_type: 'single' | 'multi'
  vendor_id: string
  commission_rate: number
  is_active: boolean
  is_featured: boolean
  files: any[]
  preview_images: string[]
  tags: string[]
  download_count: number
  purchase_count: number
  created_at: string
  updated_at: string
}

export interface BookableService {
  id: string
  title: string
  slug: string
  description: string | null
  type: 'coaching' | 'mentoring' | 'cv_review' | 'interview_prep' | 'sop_editing' | 'consulting'
  price: number
  currency: string
  duration_minutes: number
  booking_buffer_minutes: number
  vendor_id: string
  commission_rate: number
  max_bookings_per_day: number
  advance_booking_days: number
  min_notice_hours: number
  meeting_platform: 'zoom' | 'google_meet' | 'teams'
  meeting_link_template: string | null
  preparation_required: boolean
  preparation_instructions: string | null
  cancellation_policy: string | null
  rescheduling_allowed: boolean
  is_active: boolean
  is_featured: boolean
  preview_images: string[]
  tags: string[]
  booking_count: number
  completion_count: number
  average_rating: number | null
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  service_id: string
  customer_id: string
  vendor_id: string
  order_id: string | null
  scheduled_date: string
  scheduled_time: string
  duration_minutes: number
  timezone: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  payment_status: 'pending' | 'held' | 'released' | 'refunded'
  price_paid: number
  currency: string
  meeting_link: string | null
  meeting_platform: string | null
  customer_notes: string | null
  vendor_notes: string | null
  rating: number | null
  review_text: string | null
  created_at: string
  updated_at: string
}

export interface Vendor {
  id: string
  user_id: string
  business_name: string
  business_type: 'individual' | 'company'
  bio: string | null
  headline: string | null
  avatar_url: string | null
  specialties: string[]
  languages: string[]
  years_experience: number | null
  status: 'pending' | 'approved' | 'suspended' | 'rejected' | 'inactive'
  commission_rate: number
  rating_average: number | null
  review_count: number
  created_at: string
}

class MarketplaceClient {
  private baseUrl: string

  constructor(baseUrl: string = MARKETPLACE_API_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Request failed' }))
        return { data: null as any, error: error.message || 'Request failed' }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      return { 
        data: null as any, 
        error: error instanceof Error ? error.message : 'Network error' 
      }
    }
  }

  // Digital Products
  async getProducts(params?: { 
    type?: string
    featured?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ products: DigitalProduct[], count: number }>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/store/products${query ? '?' + query : ''}`)
  }

  async getProduct(slug: string): Promise<ApiResponse<DigitalProduct>> {
    return this.request(`/store/products/${slug}`)
  }

  async purchaseProduct(productId: string, customerType: 'b2c' | 'b2b' = 'b2c'): Promise<ApiResponse<{ order_id: string, download_url: string }>> {
    return this.request('/store/products/purchase', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, customer_type: customerType }),
    })
  }

  // Bookable Services
  async getServices(params?: {
    type?: string
    vendor_id?: string
    featured?: boolean
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ services: BookableService[], count: number }>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/store/services${query ? '?' + query : ''}`)
  }

  async getService(slug: string): Promise<ApiResponse<BookableService>> {
    return this.request(`/store/services/${slug}`)
  }

  async getServiceAvailability(serviceId: string, date: string): Promise<ApiResponse<{ slots: string[] }>> {
    return this.request(`/store/services/${serviceId}/availability?date=${date}`)
  }

  async createBooking(data: {
    service_id: string
    scheduled_date: string
    scheduled_time: string
    customer_notes?: string
  }): Promise<ApiResponse<Booking>> {
    return this.request('/store/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Bookings Management
  async getMyBookings(): Promise<ApiResponse<{ bookings: Booking[] }>> {
    return this.request('/store/bookings/me')
  }

  async getBooking(bookingId: string): Promise<ApiResponse<Booking>> {
    return this.request(`/store/bookings/${bookingId}`)
  }

  async cancelBooking(bookingId: string, reason: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/store/bookings/${bookingId}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    })
  }

  async rateBooking(bookingId: string, rating: number, review: string): Promise<ApiResponse<{ success: boolean }>> {
    return this.request(`/store/bookings/${bookingId}/rate`, {
      method: 'POST',
      body: JSON.stringify({ rating, review }),
    })
  }

  // Vendors
  async getVendors(params?: {
    specialty?: string
    limit?: number
    offset?: number
  }): Promise<ApiResponse<{ vendors: Vendor[], count: number }>> {
    const query = new URLSearchParams(params as any).toString()
    return this.request(`/store/vendors${query ? '?' + query : ''}`)
  }

  async getVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
    return this.request(`/store/vendors/${vendorId}`)
  }

  // Vendor Portal (for providers)
  async getMyVendorProfile(): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/profile/me')
  }

  async updateMyVendorProfile(updates: Partial<Vendor>): Promise<ApiResponse<Vendor>> {
    return this.request('/vendor/profile/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async getMyServices(): Promise<ApiResponse<{ services: BookableService[] }>> {
    return this.request('/vendor/services/me')
  }

  async createMyService(service: Partial<BookableService>): Promise<ApiResponse<BookableService>> {
    return this.request('/vendor/services', {
      method: 'POST',
      body: JSON.stringify(service),
    })
  }

  async updateMyService(serviceId: string, updates: Partial<BookableService>): Promise<ApiResponse<BookableService>> {
    return this.request(`/vendor/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    })
  }

  async getMyVendorBookings(): Promise<ApiResponse<{ bookings: Booking[] }>> {
    return this.request('/vendor/bookings/me')
  }

  async confirmBooking(bookingId: string, meetingLink: string): Promise<ApiResponse<Booking>> {
    return this.request(`/vendor/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ meeting_link: meetingLink }),
    })
  }

  async completeBooking(bookingId: string, summary: string): Promise<ApiResponse<Booking>> {
    return this.request(`/vendor/bookings/${bookingId}/complete`, {
      method: 'POST',
      body: JSON.stringify({ summary }),
    })
  }

  async getMyEarnings(): Promise<ApiResponse<{
    total_earnings: number
    pending_payout: number
    lifetime_payout: number
  }>> {
    return this.request('/vendor/earnings/me')
  }

  async requestPayout(amount: number): Promise<ApiResponse<{ payout_id: string }>> {
    return this.request('/vendor/payouts/request', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
  }
}

// Singleton instance
export const marketplaceClient = new MarketplaceClient()

// Export for custom instances
export default MarketplaceClient
