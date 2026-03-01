import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'

/**
 * 404 Not Found page
 */
export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-void flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-[120px] font-heading font-bold text-cyan leading-none">
            404
          </h1>
          <h2 className="text-h2 font-heading text-white mt-4 mb-2">
            Página não encontrada
          </h2>
          <p className="text-body text-slate">
            A página que você está procurando não existe ou foi movida.
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => navigate(-1)}
            icon={<ArrowLeft className="w-4 h-4" />} iconPosition="left"
          >
            Voltar
          </Button>
          <Button
            onClick={() => navigate('/')}
            icon={<Home className="w-4 h-4" />} iconPosition="left"
          >
            Ir para o Início
          </Button>
        </div>
      </div>
    </div>
  )
}
