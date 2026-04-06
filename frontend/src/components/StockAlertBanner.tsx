import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AlertPrefs } from "@/hooks/useTeaApi";

interface StockAlertBannerProps {
  lowStockCount: number;
  alertPrefs: AlertPrefs | null;
  className?: string;
}

const StockAlertBanner = ({
  lowStockCount,
  alertPrefs,
  className,
}: StockAlertBannerProps) => {
  if (lowStockCount <= 0) return null;

  const enabled = alertPrefs?.enabled ?? false;
  const phone = (alertPrefs?.phone_number || "").trim();
  const configured = alertPrefs?.provider_configured ?? false;

  return (
    <div
      className={cn(
        "rounded-xl border border-destructive/25 bg-destructive/5 px-4 py-3.5 animate-fade-in",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 text-destructive" />
        </div>
        <div className="min-w-0 space-y-2">
          <div>
            <p className="font-display font-semibold text-card-foreground text-sm">
              Low stock items detected
            </p>
            <p className="text-sm font-body text-muted-foreground mt-0.5">
              {lowStockCount} product{lowStockCount === 1 ? "" : "s"} below 50 kg. Review
              inventory and reorder soon.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "text-[10px] font-body font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                configured
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
                  : "border-border bg-secondary text-muted-foreground"
              )}
            >
              {configured ? "Server ready" : "Configure server"}
            </span>
          </div>
          <p className="text-xs font-body text-muted-foreground leading-relaxed">
            {enabled ? (
              <>
                Alerts are <span className="text-card-foreground font-medium">on</span>
                {phone ? (
                  <>
                    . Number:{" "}
                    <span className="font-medium text-card-foreground">{phone}</span>
                  </>
                ) : (
                  <> — save a WhatsApp number in settings below.</>
                )}
                {!configured && (
                  <span className="block mt-1 text-amber-800 dark:text-amber-400">
                    Server still needs provider environment variables to deliver messages.
                  </span>
                )}
              </>
            ) : (
              <>Alerts are off. Enable them in WhatsApp stock alerts to get automatic messages.</>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StockAlertBanner;
