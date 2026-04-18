import React, { useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Button } from '@/components/ui/Button';
import { useCredentials } from '@/hooks/useCredentials';
import { CheckCircle2, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface VerificationBadgeProps {
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * VerificationBadge - Exibe badge "Perfil Verificado" quando credencial existe
 * 
 * Funcionalidades:
 * - Exibe badge quando usuário tem credencial ativa
 * - Tooltip com detalhes da credencial
 * - Botão para copiar link de verificação
 * 
 * Requirements: 1.5, 9.1
 */
export const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  showTooltip = true,
  size = 'md',
  className,
}) => {
  const { credentials, hasActiveCredential, isLoading, copyVerificationLink } = useCredentials();
  const [copied, setCopied] = React.useState(false);

  // Get the most recent active credential
  const activeCredential = credentials.find((c) => c.is_active);

  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  // Don't render if loading or no active credential
  if (isLoading || !hasActiveCredential || !activeCredential) {
    return null;
  }

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await copyVerificationLink(activeCredential.verification_url);
    if (success) {
      setCopied(true);
    }
  };

  // Format credential type for display
  const getCredentialTypeName = (type: string): string => {
    const typeMap: Record<string, string> = {
      readiness: 'Prontidão',
      milestone: 'Marco',
      assessment: 'Avaliação',
    };
    return typeMap[type] || type;
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const badgeContent = (
    <Badge
      variant="success"
      size={size}
      dot
      className={cn('cursor-default', className)}
    >
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>Perfil Verificado</span>
    </Badge>
  );

  if (!showTooltip) {
    return badgeContent;
  }

  const tooltipContent = (
    <div className="space-y-3 min-w-[240px]">
      <div>
        <p className="text-xs font-semibold text-lux-100 mb-1">
          Credencial de {getCredentialTypeName(activeCredential.credential_type)}
        </p>
        <p className="text-xs text-lux-200">
          Score: <span className="font-semibold">{activeCredential.score_value}</span>/100
        </p>
      </div>

      <div className="text-xs text-lux-200 space-y-1">
        <p>Emitida em: {formatDate(activeCredential.issued_at)}</p>
        {activeCredential.expires_at && (
          <p>Válida até: {formatDate(activeCredential.expires_at)}</p>
        )}
        {activeCredential.verification_clicks > 0 && (
          <p>Verificações: {activeCredential.verification_clicks}</p>
        )}
      </div>

      <div className="pt-2 border-t border-neutral-600">
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCopyLink}
          className="w-full text-xs"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              <span>Link Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copiar Link de Verificação</span>
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-lux-300 italic">
        Compartilhe este link com empregadores para comprovar sua preparação
      </p>
    </div>
  );

  return (
    <Tooltip content={tooltipContent} position="bottom" delay={300}>
      {badgeContent}
    </Tooltip>
  );
};
