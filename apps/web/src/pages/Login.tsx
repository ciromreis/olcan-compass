import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

/**
 * MMXD Login page — Void dark with Lumina accents.
 * First point of contact for returning users.
 */
export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  /**
   * Handle login form submission.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: () => {
          navigate('/')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-lumina/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-lumina-200 to-lumina-300 shadow-glow mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h2 text-white">
            Bem-vindo ao Compass
          </h1>
          <p className="text-body text-neutral-300 mt-2">
            Seu sistema operacional de mobilidade global
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-neutral-700/50 backdrop-blur-lg border border-neutral-600/40 rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMutation.isError && (
              <Alert variant="error">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Erro ao entrar. Verifique suas credenciais.'}
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

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-neutral-400 hover:text-neutral-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-body-sm text-lumina hover:text-lumina-100 transition-colors"
              >
                Esqueceu a senha?
              </button>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={loginMutation.isPending}
              size="lg"
            >
              Entrar
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-neutral-600/30 text-center">
            <p className="text-body-sm text-neutral-400">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-lumina hover:text-lumina-100 font-medium transition-colors"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-caption text-neutral-500 mt-6">
          © {new Date().getFullYear()} Olcan · Mobilidade Internacional
        </p>
      </motion.div>
    </div>
  )
}
