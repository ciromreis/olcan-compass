import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  actions?: React.ReactNode;
  className?: string;
}

function PageHeader({ title, subtitle, backHref, actions, className }: PageHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {backHref && (
          <Link href={backHref} className="p-2 rounded-lg hover:bg-cream-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
        )}
        <div>
          <h1 className="font-heading text-h2 text-text-primary">{title}</h1>
          {subtitle && <p className="text-body-sm text-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export { PageHeader, type PageHeaderProps };
