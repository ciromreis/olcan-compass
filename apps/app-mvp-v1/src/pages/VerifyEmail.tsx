import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Mail } from 'lucide-react'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

/**
 * MMXD Email Verification page — verify email with token.
 */
export function VerifyEmail() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function verifyEmail() {
      if (!token) {
        setStatus('error')
        setErrorMessage('Token de verificação inválido.')
        return
      }

      try {
        await api.post('/auth/verify-email', { token })
        setStatus('success')
        setTimeout(() => navigate('/login'), 3000)
      } catch (error) {
        setStatus('error')
        if (error && typeof error === 'object' && 'response' in error) {
          const axiosErr = error as { response?: { data?: { detail?: string } } }
          setErrorMessage(
            axiosErr.response?.data?.detail || 'Erro ao verificar email. O link pode ter expirado.'
          )
        } else {
          setErrorMessage('Erro de conexão. Tente novamente.')
        }
      }
    }

    verifyEmail()
  }, [token, navigate])

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-blue to-cyan shadow-glow mb-4">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <h1 className="font-heading text-h2 text-white">
                Verificando email
              </h1>
              <p className="text-body text-slate mt-2">
                Aguarde enquanto confirmamos seu email
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-12 shadow-card">
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/30 shadow-glow mb-4">
                <CheckCircle className="w-7 h-7 text-success" />
              </div>
              <h1 className="font-heading text-h2 text-white">
                Email verificado
              </h1>
              <p className="text-body text-slate mt-2">
                Sua conta foi ativada com sucesso
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 shadow-card text-center">
              <p className="text-body text-silver mb-4">
                Você será redirecionado para a página de login em alguns segundos...
              </p>
              <Button
                onClick={() => navigate('/login')}
                fullWidth
              >
                Ir para login
              </Button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-error/20 to-error/30 shadow-glow mb-4">
                <XCircle className="w-7 h-7 text-error" />
              </div>
              <h1 className="font-heading text-h2 text-white">
                Erro na verificação
              </h1>
              <p className="text-body text-slate mt-2">
                Não foi possível verificar seu email
              </p>
            </div>

            <div className="liquid-glass rounded-2xl p-6 shadow-card">
              <p className="text-body text-error mb-6">
                {errorMessage}
              </p>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate('/login')}
                  fullWidth
                >
                  Ir para login
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  fullWidth
                  variant="secondary"
                >
                  Criar nova conta
                </Button>
              </div>
            </div>
          </>
        )}

        <p className="text-center text-caption text-slate-500 mt-6">
          © {new Date().getFullYear()} Olcan · Mobilidade Internacional
        </p>
      </motion.div>
    </div>
  )
}
