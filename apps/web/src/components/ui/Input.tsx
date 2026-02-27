import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

/**
 * MMXD Input component with label, error state, and helper text.
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    /** Label text */
    label?: string
    /** Error message (triggers error state) */
    error?: string
    /** Success state */
    success?: boolean
    /** Helper text shown below input */
    helperText?: string
    /** Left icon/element */
    leftIcon?: ReactNode
    /** Right icon/element */
    rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            error,
            success,
            helperText,
            leftIcon,
            rightIcon,
            className,
            id,
            required,
            ...props
        },
        ref
    ) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-body-sm font-medium text-neutral-200"
                    >
                        {label}
                        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
                    </label>
                )}
                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        id={inputId}
                        required={required}
                        className={cn(
                            'w-full px-4 py-2.5 rounded-lg',
                            'bg-neutral-700/50 border border-neutral-500/40',
                            'text-body text-white placeholder:text-neutral-400',
                            'font-body',
                            'transition-all duration-fast',
                            'focus:outline-none focus:border-lumina/70 focus:ring-1 focus:ring-lumina/30',
                            'hover:border-lux-300/60',
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            error && 'border-error/60 focus:border-error focus:ring-error/30',
                            success && 'border-success/60 focus:border-success focus:ring-success/30',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p
                        id={`${inputId}-error`}
                        className="text-caption text-error flex items-center gap-1"
                        role="alert"
                    >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p
                        id={`${inputId}-helper`}
                        className="text-caption text-neutral-400"
                    >
                        {helperText}
                    </p>
                )}
            </div>
        )
    }
)

Input.displayName = 'Input'


/**
 * MMXD Textarea component with label and error state.
 */
interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    /** Label text */
    label?: string
    /** Error message */
    error?: string
    /** Success state */
    success?: boolean
    /** Helper text */
    helperText?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, success, helperText, className, id, required, ...props }, ref) => {
        const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

        return (
            <div className="space-y-1.5">
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-body-sm font-medium text-neutral-200"
                    >
                        {label}
                        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
                    </label>
                )}
                <textarea
                    ref={ref}
                    id={inputId}
                    required={required}
                    className={cn(
                        'w-full px-4 py-2.5 rounded-lg resize-y min-h-[100px]',
                        'bg-neutral-700/50 border border-neutral-500/40',
                        'text-body text-white placeholder:text-neutral-400',
                        'font-body',
                        'transition-all duration-fast',
                        'focus:outline-none focus:border-lumina/70 focus:ring-1 focus:ring-lumina/30',
                        'hover:border-lux-300/60',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        error && 'border-error/60 focus:border-error focus:ring-error/30',
                        success && 'border-success/60 focus:border-success focus:ring-success/30',
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                    {...props}
                />
                {error && (
                    <p id={`${inputId}-error`} className="text-caption text-error flex items-center gap-1" role="alert">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                            <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                        {error}
                    </p>
                )}
                {helperText && !error && (
                    <p id={`${inputId}-helper`} className="text-caption text-neutral-400">{helperText}</p>
                )}
            </div>
        )
    }
)

Textarea.displayName = 'Textarea'

/**
 * MMXD FormField wrapper component for custom form controls.
 * Provides consistent label, error, and helper text layout.
 */
interface FormFieldProps {
    /** Label text */
    label?: string
    /** Error message */
    error?: string
    /** Helper text */
    helperText?: string
    /** Field is required */
    required?: boolean
    /** Field ID for label association */
    htmlFor?: string
    /** Child form control */
    children: ReactNode
    /** Additional CSS classes */
    className?: string
}

function FormField({
    label,
    error,
    helperText,
    required,
    htmlFor,
    children,
    className,
}: FormFieldProps) {
    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <label
                    htmlFor={htmlFor}
                    className="block text-body-sm font-medium text-neutral-200"
                >
                    {label}
                    {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
                </label>
            )}
            {children}
            {error && (
                <p
                    id={htmlFor ? `${htmlFor}-error` : undefined}
                    className="text-caption text-error flex items-center gap-1"
                    role="alert"
                >
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                        />
                    </svg>
                    {error}
                </p>
            )}
            {helperText && !error && (
                <p
                    id={htmlFor ? `${htmlFor}-helper` : undefined}
                    className="text-caption text-neutral-400"
                >
                    {helperText}
                </p>
            )}
        </div>
    )
}

export { Input, Textarea, FormField }
export type { InputProps, TextareaProps, FormFieldProps }
