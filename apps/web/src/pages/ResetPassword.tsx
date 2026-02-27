import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Lock, Eye, EyeOff } from 'lucide-react'
import { usePasswordResetConfirm } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

/**
 * MMXD Reset Password page — confirm password reset with token.
 */
export function ResetPassword() {
  const navigate = useNavigate()
  const { token } = useParams<{ token: string }>()
  const confirmMutation = usePasswordResetConfirm()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [validationError, setValidationError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  /**
   * Handle password reset confirmation.
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

    if (!token) {
      setValidationError('Token inválido.')
      return
    }

    confirmMutation.mutate(
      { token, new_password: password },
      {
        onSuccess: () => {
          setIsSuccess(true)
          setTimeout(() => navigate('/login'), 3000)
        },
      }
    )
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-lumina/5 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-success/20 to-success/30 shadow-glow mb-4">
              <Lock className="w-7 h-7 text-success" />
            </div>
            <h1 className="font-heading text-h2 text-white">
              Senha redefinida
            </h1>
            <p className="text-body text-neutral-300 mt-2">
              Sua senha foi alterada com sucesso
            </p>
          </div>

          <div className="bg-neutral-700/50 backdrop-blur-lg border border-neutral-600/40 rounded-2xl p-6 shadow-card text-center">
            <p className="text-body text-neutral-200 mb-4">
              Você será redirecionado para a página de login em alguns segundos...
            </p>
            <Button
              onClick={() => navigate('/login')}
              fullWidth
            >
              Ir para login
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-void flex items-center justify-center p-4">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-lumina/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-lumina-200 to-lumina-300 shadow-glow mb-4">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-h2 text-white">
            Nova senha
          </h1>
          <p className="text-body text-neutral-300 mt-2">
            Escolha uma senha forte para sua conta
          </p>
        </div>

        <div className="bg-neutral-700/50 backdrop-blur-lg border border-neutral-600/40 rounded-2xl p-6 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-5">
            {(validationError || confirmMutation.isError) && (
              <Alert variant="error">
                {validationError ||
                  (confirmMutation.error instanceof Error
                    ? confirmMutation.error.message
                    : 'Erro ao redefinir senha. O link pode ter expirado.')}
              </Alert>
            )}

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
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-200 transition-colors"
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
              isLoading={confirmMutation.isPending}
              size="lg"
            >
              Redefinir senha
            </Button>
          </form>
        </div>

        <p className="text-center text-caption text-neutral-500 mt-6">
          © {new Date().getFullYear()} Olcan · Mobilidade Internacional
        </p>
      </motion.div>
    </div>
  )
}
