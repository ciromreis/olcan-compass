import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useRegister } from '../hooks/useAuth'
import { useAuthStore } from '../store/auth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

/**
 * Liquid Glass Register page — Deep Navy with Cyan accent glow.
 * First step of the funnel before psych onboarding.
 */
export function Register() {
  const navigate = useNavigate()
  const registerMutation = useRegister()
  const { setUser, setAuthenticated } = useAuthStore()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [validationError, setValidationError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  /**
   * Handle registration form submission.
   */
  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setValidationError('')

    // Client-side validation
    if (password !== confirmPassword) {
      setValidationError('As senhas não coincidem.')
      return
    }

    if (password.length < 8) {
      setValidationError('A senha deve ter pelo menos 8 caracteres.')
      return
    }

    if (!hasUppercase || !hasNumber) {
      setValidationError('A senha deve conter pelo menos 1 letra maiúscula e 1 número.')
      return
    }

    registerMutation.mutate(
      { email, password, full_name: fullName },
      {
        onSuccess: (data) => {
          setUser({
            id: data.id,
            email: data.email,
            full_name: data.full_name || fullName,
            role: data.role,
          })
          setAuthenticated(true)
          navigate('/')
        },
      }
    )
  }

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-primary-blue/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[15%] w-[300px] h-[300px] bg-cyan/5 rounded-full blur-[120px] pointer-events-none" />
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
            Crie sua conta
          </h1>
          <p className="text-body text-slate mt-2">
            Comece seu plano de mobilidade internacional
          </p>
        </div>

        {/* Register Card */}
        <div className="liquid-glass p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {(validationError || registerMutation.isError) && (
              <Alert variant="error">
                {validationError ||
                  (registerMutation.error instanceof Error
                    ? registerMutation.error.message
                    : 'Erro ao criar conta. Tente novamente.')}
              </Alert>
            )}

            <Input
              
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              leftIcon={<User className="w-4 h-4" />}
              required
              autoFocus
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
              autoComplete="email"
            />

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                leftIcon={<Lock className="w-4 h-4" />}
                helperText="Obrigatório: 1 letra maiúscula e 1 número"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate hover:text-silver transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a senha"
              leftIcon={<Lock className="w-4 h-4" />}
              error={confirmPassword && password !== confirmPassword ? 'As senhas não coincidem' : undefined}
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              fullWidth
              isLoading={registerMutation.isPending}
              size="lg"
            >
              Criar conta
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <p className="text-body-sm text-slate">
              Já tem uma conta?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-primary-blue hover:text-cyan font-medium transition-colors cursor-pointer"
              >
                Entrar
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
