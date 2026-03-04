import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios'

const RAW_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const NORMALIZED_API_URL = RAW_API_URL.replace(/\/+$/, '')
const API_BASE_URL = /\/api(?:\/v\d+)?$/.test(NORMALIZED_API_URL)
  ? NORMALIZED_API_URL
  : `${NORMALIZED_API_URL}/api`

class ApiClient {
  private client: AxiosInstance
  private isRefreshing = false
  private failedQueue: Array<{
    resolve: (value?: any) => void
    reject: (reason?: any) => void
  }> = []

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add auth token
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Response interceptor for error handling and token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean
        }

        const requestUrl = originalRequest?.url ?? ''
        const token = localStorage.getItem('token')

        // Demo mode interception
        if (token === 'demo') {
          console.warn('Demo Mode: Intercepting failed request', requestUrl)

          if (requestUrl.includes('/routes/templates')) {
            return Promise.resolve({
              data: {
                templates: [
                  { id: '1', name_pt: 'Rota Starter', description_pt: 'Rota de teste inicial.', route_type: 'global', estimated_duration_months: 3, competitiveness_level: 'low' }
                ], total: 1
              }
            })
          }
          if (requestUrl.includes('/routes')) {
            return Promise.resolve({ data: { routes: [], route: null, milestones: [], total: 0 } })
          }
          if (requestUrl.includes('/sprints/readiness') || requestUrl.includes('/sprints')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/applications')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/marketplace/providers')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/marketplace/bookings')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/marketplace/conversations')) {
            return Promise.resolve({ data: [] })
          }
          if (requestUrl.includes('/marketplace')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/constraints/profile')) {
            return Promise.resolve({
              data: {
                id: 'demo-constraint',
                user_id: 'demo-user',
                budget_max: null,
                time_available_months: null,
                weekly_bandwidth_hours: null,
                languages: [],
                target_countries: [],
                excluded_countries: [],
                citizenship_countries: [],
                commitment_level: 'medium',
                risk_tolerance: 'medium',
                is_active: true,
                last_updated_at: new Date().toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            })
          }
          if (requestUrl.includes('/constraints/prune-opportunities')) {
            return Promise.resolve({
              data: {
                opportunities: [],
                total_opportunities: 0,
                shown_opportunities: 0,
                hidden_opportunities: 0,
                pruning_version: 'demo',
              }
            })
          }
          if (requestUrl.includes('/constraints/pruning-history')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/constraints')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/interviews')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/narratives')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/psych')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/credentials')) {
            return Promise.resolve({ data: { items: [], total: 0 } })
          }
          if (requestUrl.includes('/escrow')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/scenarios')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/temporal-matching')) {
            return Promise.resolve({ data: {} })
          }
          if (requestUrl.includes('/opportunity-cost')) {
            return Promise.resolve({ data: {} })
          }

          // Default empty successful response for demo
          return Promise.resolve({ data: {} })
        }

        const isAuthRequest =
          requestUrl.includes('/auth/login') ||
          requestUrl.includes('/auth/register') ||
          requestUrl.includes('/auth/refresh') ||
          requestUrl.includes('/auth/forgot-password') ||
          requestUrl.includes('/auth/reset-password')

        // Handle 401 errors with token refresh (skip auth endpoints)
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
          if (this.isRefreshing) {
            // Queue the request while token is being refreshed
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject })
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return this.client(originalRequest)
              })
              .catch((err) => Promise.reject(err))
          }

          originalRequest._retry = true
          this.isRefreshing = true

          const refreshToken = localStorage.getItem('refresh_token')

          if (!refreshToken || refreshToken === 'demo') {
            this.handleLogout()
            return Promise.reject(error)
          }

          try {
            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
              headers: {
                Authorization: `Bearer ${refreshToken}`,
              },
            })

            const { access_token, refresh_token: newRefreshToken } = response.data

            localStorage.setItem('token', access_token)
            localStorage.setItem('refresh_token', newRefreshToken)

            // Process queued requests
            this.failedQueue.forEach((prom) => prom.resolve(access_token))
            this.failedQueue = []

            originalRequest.headers.Authorization = `Bearer ${access_token}`
            return this.client(originalRequest)
          } catch (refreshError) {
            this.failedQueue.forEach((prom) => prom.reject(refreshError))
            this.failedQueue = []
            this.handleLogout()
            return Promise.reject(refreshError)
          } finally {
            this.isRefreshing = false
          }
        }

        // Transform errors to Portuguese user-friendly messages
        return Promise.reject(this.transformError(error))
      }
    )
  }

  private handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    window.location.href = '/login'
  }

  private transformError(error: AxiosError): Error {
    const status = error.response?.status
    const data = error.response?.data as any

    // Use backend error message if available
    if (data?.detail) {
      if (typeof data.detail === 'string') {
        return new Error(data.detail)
      } else if (Array.isArray(data.detail)) {
        const messages = data.detail.map((err: any) => err.msg).join(', ')
        return new Error(`Erro de validação: ${messages}`)
      }
      return new Error(JSON.stringify(data.detail))
    }

    // Default Portuguese error messages
    switch (status) {
      case 400:
        return new Error('Requisição inválida. Verifique os dados enviados.')
      case 401:
        return new Error('Não autorizado. Faça login novamente.')
      case 403:
        return new Error('Acesso negado. Você não tem permissão para esta ação.')
      case 404:
        return new Error('Recurso não encontrado.')
      case 409:
        return new Error('Conflito. Este recurso já existe.')
      case 422:
        return new Error('Dados inválidos. Verifique os campos do formulário.')
      case 500:
        return new Error('Erro no servidor. Tente novamente mais tarde.')
      case 503:
        return new Error('Serviço temporariamente indisponível.')
      default:
        if (!error.response) {
          return new Error('Erro de conexão. Verifique sua internet.')
        }
        return new Error('Ocorreu um erro inesperado. Tente novamente.')
    }
  }

  // Generic HTTP methods for use with React Query hooks
  get<T = any>(url: string, config?: any) {
    return this.client.get<T>(url, config)
  }

  post<T = any>(url: string, data?: any, config?: any) {
    return this.client.post<T>(url, data, config)
  }

  put<T = any>(url: string, data?: any, config?: any) {
    return this.client.put<T>(url, data, config)
  }

  patch<T = any>(url: string, data?: any, config?: any) {
    return this.client.patch<T>(url, data, config)
  }

  delete<T = any>(url: string, config?: any) {
    return this.client.delete<T>(url, config)
  }

  // Auth
  async login(email: string, password: string) {
    const response = await this.client.post('/auth/login', { email, password })
    // Backend returns { user_id, email, role, token: { access_token, refresh_token } }
    const { token } = response.data
    localStorage.setItem('token', token.access_token)
    localStorage.setItem('refresh_token', token.refresh_token)

    // Fetch full profile to get full_name
    const profile = await this.getProfile()
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: response.data.role,
    }
  }

  async register(email: string, password: string, fullName: string) {
    const response = await this.client.post('/auth/register', {
      email,
      password,
      full_name: fullName,
    })
    // Backend returns { user_id, email, role, token: { access_token, refresh_token } }
    const { token } = response.data
    localStorage.setItem('token', token.access_token)
    localStorage.setItem('refresh_token', token.refresh_token)

    const profile = await this.getProfile()
    return {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: response.data.role,
    }
  }

  async getProfile() {
    const response = await this.client.get('/auth/me')
    return response.data
  }

  // Narratives
  async getNarratives() {
    const response = await this.client.get('/narratives')
    return response.data
  }

  async createNarrative(data: unknown) {
    const response = await this.client.post('/narratives', data)
    return response.data
  }

  // Interviews
  async getInterviewSessions() {
    const response = await this.client.get('/interviews/sessions')
    return response.data
  }

  // Applications
  async getApplications() {
    const response = await this.client.get('/applications')
    return response.data
  }

  async getOpportunities() {
    const response = await this.client.get('/applications/opportunities')
    return response.data
  }

  // Sprints
  async getSprints() {
    const response = await this.client.get('/sprints')
    return response.data
  }

  async getReadinessOverview() {
    const response = await this.client.get('/sprints/readiness/overview')
    return response.data
  }

  // Marketplace
  async getProviders() {
    const response = await this.client.get('/marketplace/providers')
    return response.data
  }

  async getServices() {
    const response = await this.client.get('/marketplace/services')
    return response.data
  }

  async getBookings() {
    const response = await this.client.get('/marketplace/bookings')
    return response.data
  }

  // AI
  async getAIJobs() {
    const response = await this.client.get('/ai/jobs')
    return response.data
  }

  // Psychology / Assessment
  async startAssessment(assessmentType = 'onboarding') {
    const response = await this.client.post('/psych/assessment/start', {
      assessment_type: assessmentType,
    })
    return response.data
  }

  async getNextQuestion(sessionId: string) {
    const response = await this.client.get(`/psych/assessment/${sessionId}/question`)
    return response.data
  }

  async submitAnswer(data: {
    session_id: string
    question_id: string
    answer_value: string
    answer_text?: string
  }) {
    const response = await this.client.post('/psych/assessment/answer', data)
    return response.data
  }

  async getPsychProfile() {
    const response = await this.client.get('/psych/profile')
    return response.data
  }
}

export const api = new ApiClient()
