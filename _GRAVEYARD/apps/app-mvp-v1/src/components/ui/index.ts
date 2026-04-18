/**
 * MMXD UI Component Library — Barrel Export
 *
 * Usage:
 *   import { Button, Card, Input, Progress, Typography, Badge, Avatar, Icon } from '@/components/ui'
 */

// Base Components
export { Button } from './Button'
export type { ButtonProps, ButtonVariant, ButtonSize, IconPosition } from './Button'

export { Card, CardTitle, CardDescription } from './Card'
export type { CardProps, CardVariant } from './Card'

export { Input, Textarea, FormField } from './Input'
export type { InputProps, TextareaProps, FormFieldProps } from './Input'

export { Progress, CircularProgress } from './Progress'
export type { ProgressProps, CircularProgressProps } from './Progress'

export { Typography, Heading1, Heading2, Heading3, BodyText, Caption } from './Typography'
export type { TypographyProps, TypographyVariant } from './Typography'

export { Badge } from './Badge'
export type { BadgeProps, BadgeVariant, BadgeSize } from './Badge'

export { Avatar, AvatarGroup } from './Avatar'
export type { AvatarProps, AvatarGroupProps, AvatarSize } from './Avatar'

export { Icon } from './Icon'
export type { IconProps, IconSize } from './Icon'

// Layout Components
export { Container } from './Container'
export type { ContainerProps } from './Container'

export { Grid } from './Grid'
export type { GridProps } from './Grid'

export { Stack } from './Stack'
export type { StackProps } from './Stack'

export { Divider } from './Divider'
export type { DividerProps } from './Divider'

export { Spacer } from './Spacer'
export type { SpacerProps } from './Spacer'

// Navigation Components
export { Sidebar } from './Sidebar'
export type { SidebarProps, SidebarNavItem } from './Sidebar'

export { TopBar } from './TopBar'
export type { TopBarProps } from './TopBar'

export { Breadcrumb } from './Breadcrumb'
export type { BreadcrumbProps, BreadcrumbItem } from './Breadcrumb'

export { Tabs } from './Tabs'
export type { TabsProps, TabItem } from './Tabs'

export { Pagination } from './Pagination'
export type { PaginationProps } from './Pagination'

export { BottomTabBar } from './BottomTabBar'
export type { BottomTabBarProps, TabBarItem } from './BottomTabBar'

export { MobileMenu } from './MobileMenu'
export type { MobileMenuProps } from './MobileMenu'

export { SkipLink } from './SkipLink'
export type { SkipLinkProps } from './SkipLink'

// Feedback Components
export { Toast, ToastContainer } from './Toast'
export type { ToastProps } from './Toast'

export { Modal } from './Modal'
export type { ModalProps } from './Modal'

export { Alert } from './Alert'
export type { AlertProps } from './Alert'

export { Tooltip } from './Tooltip'
export type { TooltipProps } from './Tooltip'

export { LoadingSpinner, Skeleton } from './LoadingSpinner'
export type { LoadingSpinnerProps, SkeletonProps } from './LoadingSpinner'

export { MaterialSymbol } from './MaterialSymbol'
export type { MaterialSymbolProps } from './MaterialSymbol'

export { EmptyState } from './EmptyState'
export type { EmptyStateProps } from './EmptyState'

// Form Components
export { Select } from './Select'
export type { SelectProps, SelectOption } from './Select'

export { Checkbox } from './Checkbox'
export type { CheckboxProps } from './Checkbox'

export { RadioGroup } from './Radio'
export type { RadioGroupProps, RadioOption } from './Radio'

export { DatePicker } from './DatePicker'
export type { DatePickerProps } from './DatePicker'

export { FileUpload } from './FileUpload'
export type { FileUploadProps } from './FileUpload'

// Data Display Components
export { Table } from './Table'
export type { TableProps, TableColumn } from './Table'

export { List } from './List'
export type { ListProps } from './List'

export { Timeline } from './Timeline'
export type { TimelineProps, TimelineItem } from './Timeline'

export { StatCard } from './StatCard'
export type { StatCardProps } from './StatCard'

export { RadarChartComponent, BarChartComponent, LineChartComponent } from './Chart'
export type { RadarChartProps, BarChartProps, LineChartProps } from './Chart'

// Type Patterns and Conventions
export type {
  BaseComponentProps,
  Size,
  SemanticVariant,
  VisualVariant,
  LoadingProps,
  DisabledProps,
  PolymorphicProps,
  ComponentProps,
  WithChildren,
  WithOptionalChildren,
  ClickableProps,
  WithIcon,
  ValidationProps,
  AnimationProps,
  UIModeSupportProps,
  PsychAdaptiveProps,
  ExtractVariant,
  VariantProps,
  ForwardedRef,
  AriaProps,
  ResponsiveProps,
  ThemeProps,
} from './types'
