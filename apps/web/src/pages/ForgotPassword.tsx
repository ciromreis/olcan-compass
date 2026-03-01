import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Mail, ArrowLeft } from 'lucide-react'
import { usePasswordReset } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

type ForgotPasswordResponse = {
  message?: string
  token?: string
  reset_url?: string
}

/**
 * MMXD Forgot Password page — request password reset email.
 */
export function ForgotPassword() {
  const navigate = useNavigate()
  const resetMutation = usePasswordReset()

  const [email, setEmail] = useState('')
  const [result, setResult] = useState<ForgotPasswordResponse | null>(null)

  /**
   * Handle password reset request.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    resetMutation.mutate(email, {
      onSuccess: (data) => {
        setResult(data)
      },
    })
  }

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-blue/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/30 shadow-glow mb-4">
              <Mail className="w-7 h-7 text-success" />
            </div>
            <h1 className="font-heading text-h2 text-white">
              Solicitação recebida
            </h1>
            <p className="text-body text-slate mt-2">
              Se o email existir, você poderá redefinir sua senha
            </p>
          </div>

          <div className="liquid-glass rounded-2xl p-6 shadow-card">
            {typeof result?.message === 'string' && (
              <p className="text-body text-silver mb-4">
                {result.message}
              </p>
            )}
            <p className="text-body text-silver mb-4">
              Se a entrega de emails estiver habilitada, um link de redefinição será enviado para <strong>{email}</strong>.
            </p>
            <p className="text-body-sm text-slate mb-6">
              O link expira em 1 hora. Se não receber o email, verifique sua pasta de spam.
            </p>

            {typeof result?.reset_url === 'string' && (
              <div className="mb-6 rounded-xl border border-white/10 bg-void-primary/30 p-4">
                <p className="text-body-sm text-slate mb-2">
                  Ambiente de desenvolvimento: copie e abra este link para redefinir sua senha.
                </p>
                <a
                  href={result.reset_url}
                  className="text-body-sm text-cyan hover:text-cyan-400 break-all"
                >
                  {result.reset_url}
                </a>
              </div>
            )}
            <Button
              onClick={() => navigate('/login')}
              fullWidth
              variant="secondary"
            >
              Voltar para login
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary-blue/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-blue to-cyan shadow-glow mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h2 text-white">
            Esqueceu a senha?
          </h1>
          <p className="text-body text-slate mt-2">
            Enviaremos um link para redefinir sua senha
          </p>
        </div>

        <div className="liquid-glass rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {resetMutation.isError && (
              <Alert variant="error">
                {resetMutation.error instanceof Error
                  ? resetMutation.error.message
                  : 'Erro ao enviar email. Tente novamente.'}
              </Alert>
            )}

            <Input
              
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
              autoFocus
            />

            <Button
              type="submit"
              fullWidth
              isLoading={resetMutation.isPending}
              size="lg"
            >
              Enviar link de redefinição
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 text-body-sm text-slate hover:text-silver transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para login
            </button>
          </div>
        </div>

        <p className="text-center text-caption text-slate-500 mt-6">
          © {new Date().getFullYear()} Olcan · Mobilidade Internacional
        </p>
      </motion.div>
    </div>
  )
}
