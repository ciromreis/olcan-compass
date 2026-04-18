// Enterprise-Grade Loading States
// Comprehensive loading components with skeleton screens and progress tracking

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Brain, Zap, Target, TrendingUp } from 'lucide-react';

// Base loading spinner with customization
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'primary' | 'secondary' | 'accent';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'primary', 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const variantClasses = {
    primary: 'text-brand-500',
    secondary: 'text-gray-500',
    accent: 'text-blue-500'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )}
      />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  );
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

export function Skeleton({ 
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg'
  };

  const baseClasses = cn(
    'bg-gray-200',
    variantClasses[variant],
    animate && 'animate-pulse',
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              baseClasses,
              index === lines - 1 ? 'w-3/4' : 'w-full'
            )}
            style={{
              height: height || '1rem',
            }}
          />
        ))}
      </div>
    );
  }

  return <div className={baseClasses} style={style} />;
}

// Card skeleton for loading states
export function CardSkeleton({ 
  showAvatar = false,
  showTitle = true,
  showDescription = true,
  showFooter = false,
  lines = 3
}: {
  showAvatar?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showFooter?: boolean;
  lines?: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      {showAvatar && (
        <div className="flex items-center space-x-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="40%" height={16} />
            <Skeleton width="25%" height={14} />
          </div>
        </div>
      )}

      {showTitle && <Skeleton width="60%" height={20} />}

      {showDescription && (
        <div className="space-y-2">
          <Skeleton lines={lines} height={14} />
        </div>
      )}

      {showFooter && (
        <div className="flex justify-between items-center pt-4">
          <Skeleton width={80} height={32} />
          <Skeleton width={60} height={32} />
        </div>
      )}
    </div>
  );
}

// Progress bar with percentage and status
interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showPercentage?: boolean;
  showLabel?: boolean;
  label?: string;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'primary',
  showPercentage = true,
  showLabel = false,
  label,
  animated = true,
  className
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3'
  };

  const variantClasses = {
    primary: 'bg-brand-500',
    secondary: 'bg-gray-500',
    success: 'bg-green-500',
    warning: 'bg-slate-500',
    error: 'bg-red-500'
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            {label || 'Progress'}
          </span>
          {showPercentage && (
            <span className="text-sm text-gray-500">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}

      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-out',
            variantClasses[variant],
            animated && 'animate-pulse'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {!showLabel && showPercentage && (
        <div className="mt-2 text-center">
          <span className="text-sm text-gray-500">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

// Step indicator for multi-step processes
interface StepIndicatorProps {
  steps: Array<{ label: string; status?: 'completed' | 'current' | 'pending' }>;
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('flex items-center justify-between', className)}>
      {steps.map((step, index) => {
        const status = step.status || 
          (index < currentStep ? 'completed' : 
           index === currentStep ? 'current' : 'pending');

        const stepClasses = {
          completed: 'bg-brand-500 text-white',
          current: 'bg-brand-100 text-brand-700 border-2 border-brand-500',
          pending: 'bg-gray-100 text-gray-500 border-2 border-gray-300'
        };

        return (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                stepClasses[status]
              )}>
                {status === 'completed' ? '✓' : index + 1}
              </div>
              <span className={cn(
                'ml-2 text-sm font-medium',
                status === 'completed' ? 'text-gray-900' :
                status === 'current' ? 'text-brand-700' :
                'text-gray-500'
              )}>
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className={cn(
                'flex-1 h-0.5 mx-4',
                index < currentStep ? 'bg-brand-500' : 'bg-gray-300'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// Micro-SaaS specific loading components
export function BudgetSimulatorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <CardSkeleton key={i} showTitle showDescription lines={2} />
        ))}
      </div>
      <CardSkeleton showTitle showDescription lines={4} showFooter />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <CardSkeleton key={i} showTitle showDescription lines={3} />
        ))}
      </div>
    </div>
  );
}

export function PitchLabSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex flex-col items-center space-y-4">
          <Skeleton variant="circular" width={120} height={120} />
          <Skeleton width={200} height={24} />
          <Skeleton width={300} height={16} />
          <Skeleton width={150} height={40} />
        </div>
      </div>
      <CardSkeleton showTitle showDescription lines={5} />
    </div>
  );
}

export function ForgeLabSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <CardSkeleton showTitle showDescription lines={8} />
        <CardSkeleton showTitle lines={3} />
      </div>
      <div className="space-y-4">
        <CardSkeleton showTitle showDescription lines={4} />
        <CardSkeleton showTitle lines={6} />
      </div>
    </div>
  );
}

export function NudgeEngineSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <CardSkeleton key={i} showTitle lines={2} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <CardSkeleton key={i} showTitle showDescription lines={3} />
        ))}
      </div>
    </div>
  );
}

export function InstitutionalDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={i} showTitle lines={2} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton showTitle showDescription lines={6} />
        <CardSkeleton showTitle showDescription lines={6} />
      </div>
    </div>
  );
}

// Smart loading component that adapts to context
interface SmartLoadingProps {
  type: 'budget-simulator' | 'pitch-lab' | 'forge-lab' | 'nudge-engine' | 'institutional';
  message?: string;
}

export function SmartLoading({ type, message }: SmartLoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
    } else {
      // Set contextual messages based on type
      const messages = {
        'budget-simulator': 'Analisando suas finanças...',
        'pitch-lab': 'Preparando estúdio de gravação...',
        'forge-lab': 'Carregando editor de documentos...',
        'nudge-engine': 'Personalizando suas motivações...',
        'institutional': 'Carregando painel analítico...'
      };
      setCurrentMessage(messages[type]);
    }
  }, [type, message]);

  const icons = {
    'budget-simulator': <TrendingUp className="w-6 h-6" />,
    'pitch-lab': <Zap className="w-6 h-6" />,
    'forge-lab': <Brain className="w-6 h-6" />,
    'nudge-engine': <Target className="w-6 h-6" />,
    'institutional': <TrendingUp className="w-6 h-6" />
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="text-brand-500 animate-pulse">
        {icons[type]}
      </div>
      <LoadingSpinner text={currentMessage} />
    </div>
  );
}

// Loading overlay for full-screen loading
export function LoadingOverlay({ 
  show, 
  message, 
  type 
}: { 
  show: boolean; 
  message?: string; 
  type?: SmartLoadingProps['type'];
}) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
      {type ? (
        <SmartLoading type={type} message={message} />
      ) : (
        <LoadingSpinner text={message} size="lg" />
      )}
    </div>
  );
}

const loadingStateComponents = {
  LoadingSpinner,
  Skeleton,
  CardSkeleton,
  ProgressBar,
  StepIndicator,
  BudgetSimulatorSkeleton,
  PitchLabSkeleton,
  ForgeLabSkeleton,
  NudgeEngineSkeleton,
  InstitutionalDashboardSkeleton,
  SmartLoading,
  LoadingOverlay
};

export default loadingStateComponents;
