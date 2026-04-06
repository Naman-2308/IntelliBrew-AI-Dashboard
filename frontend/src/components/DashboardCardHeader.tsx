import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DashboardCardHeaderProps {
  icon: ReactNode;
  title: string;
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

/**
 * Matched height / rhythm for dashboard cards (Record sale, Sales history, etc.)
 */
const DashboardCardHeader = ({
  icon,
  title,
  meta,
  actions,
  className,
}: DashboardCardHeaderProps) => {
  return (
    <div
      className={cn(
        "shrink-0 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-6 min-h-[3.5rem] py-2.5 border-b border-border bg-card",
        className
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="shrink-0 flex items-center justify-center [&>svg]:w-5 [&>svg]:h-5">
          {icon}
        </span>
        <h2 className="font-display text-base font-semibold text-card-foreground tracking-tight truncate">
          {title}
        </h2>
      </div>
      <div className="min-w-0 flex items-center gap-2 flex-wrap sm:flex-nowrap">
        {meta}
      </div>
      <div className="flex items-center justify-end gap-2 shrink-0">
        {actions}
      </div>
    </div>
  );
};

export default DashboardCardHeader;
