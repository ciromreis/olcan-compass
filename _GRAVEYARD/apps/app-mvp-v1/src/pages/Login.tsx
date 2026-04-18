import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useLogin } from '../hooks/useAuth'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

/**
 * Liquid Glass Login page — Deep Navy with Cyan accent glow.
 * First point of contact for returning users.
 */
export function Login() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const { loginDemo } = useAuthStore()

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
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-blue/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[20%] w-[300px] h-[300px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />
      {/* Noise overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] noise-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-blue to-cyan shadow-cyan-glow mb-5">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-heading text-h2 text-white">
            Bem-vindo ao Compass
          </h1>
          <p className="text-body text-slate mt-2">
            Seu sistema operacional de mobilidade global
          </p>
        </div>

        {/* Login Card */}
        <div className="liquid-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {loginMutation.isError && (
              <Alert variant="error">
                {loginMutation.error instanceof Error
                  ? loginMutation.error.message
                  : 'Erro ao entrar. Verifique suas credenciais.'}
              </Alert>
            )}

            <Input
              label="Email"
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
                className="absolute right-3 top-9 text-slate hover:text-silver transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-body-sm text-primary-blue hover:text-cyan transition-colors cursor-pointer"
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

            <Button
              type="button"
              variant="secondary"
              fullWidth
              size="lg"
              onClick={() => {
                loginDemo()
                navigate('/')
              }}
            >
              Entrar em modo demo
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-body-sm text-slate">
              Não tem uma conta?{' '}
              <button
                onClick={() => navigate('/register')}
                className="text-primary-blue hover:text-cyan font-medium transition-colors cursor-pointer"
              >
                Criar conta
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-caption text-slate-500 mt-6">
          © {new Date().getFullYear()} Olcan · Mobilidade Internacional
        </p>
      </motion.div>
    </div>
  )
}
