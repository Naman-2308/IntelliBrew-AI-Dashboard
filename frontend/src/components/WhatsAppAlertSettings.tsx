import { useEffect, useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { AlertPrefs, WhatsAppTestResult } from "@/hooks/useTeaApi";
import { cn } from "@/lib/utils";

interface WhatsAppAlertSettingsProps {
  prefs: AlertPrefs | null;
  loading: boolean;
  onUpdate: (patch: {
    enabled?: boolean;
    phone_number?: string;
  }) => Promise<AlertPrefs>;
  onSendTest: () => Promise<WhatsAppTestResult>;
}

const WhatsAppAlertSettings = ({
  prefs,
  loading,
  onUpdate,
  onSendTest,
}: WhatsAppAlertSettingsProps) => {
  const [phoneDraft, setPhoneDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const savedPhone = (prefs?.phone_number ?? "").trim();

  useEffect(() => {
    if (prefs?.phone_number != null) setPhoneDraft(prefs.phone_number);
  }, [prefs?.phone_number]);

  const enabled = prefs?.enabled ?? false;
  const providerOk = prefs?.provider_configured ?? false;

  const canTest =
    enabled && savedPhone.length > 0 && providerOk && !loading && !!prefs;

  const savePhone = async () => {
    const next = phoneDraft.trim();
    if (!next) {
      toast.error("Enter a number with country code");
      return;
    }
    setSaving(true);
    try {
      await onUpdate({ phone_number: next });
      toast.success("Number saved");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (checked: boolean) => {
    try {
      await onUpdate({ enabled: checked });
      toast.success(checked ? "Alerts on" : "Alerts off");
    } catch {
      toast.error("Could not update alerts");
    }
  };

  const test = async () => {
    setTesting(true);
    try {
      const r = await onSendTest();
      if (r.ok) {
        toast.success("Test message sent");
      } else {
        const parts = [r.error, r.detail].filter(
          (s): s is string => typeof s === "string" && s.length > 0
        );
        toast.error(parts.length > 0 ? parts.join(" — ") : "Test failed");
      }
    } catch {
      toast.error("Could not send test");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-card card-shadow overflow-hidden animate-fade-in">
      <div className="px-5 py-4 border-b border-border/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <MessageCircle className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display text-base font-semibold text-card-foreground">
              WhatsApp stock alerts
            </h3>
            <p className="text-xs font-body text-muted-foreground mt-0.5">
              Automatic low-stock messages when inventory drops below 50 kg
            </p>
          </div>
        </div>
        <span
          className={cn(
            "self-start sm:self-center text-[10px] font-body font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0",
            providerOk
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400"
              : "border-border bg-secondary text-muted-foreground"
          )}
        >
          {providerOk ? "Server ready" : "Configure server"}
        </span>
      </div>

      <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-secondary/20 px-4 py-3">
          <div className="space-y-0.5">
            <Label
              htmlFor="alerts-toggle"
              className="text-sm font-body font-medium text-card-foreground"
            >
              Alerts
            </Label>
            <p className="text-xs text-muted-foreground font-body">
              {enabled ? "On" : "Off"}
            </p>
          </div>
          <Switch
            id="alerts-toggle"
            checked={enabled}
            onCheckedChange={toggle}
            disabled={loading || !prefs}
          />
        </div>

        <div className="lg:col-span-8 flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1 min-w-0 space-y-1.5">
            <Label
              htmlFor="wa-phone"
              className="text-xs font-body font-medium text-muted-foreground"
            >
              WhatsApp number (country code)
            </Label>
            <input
              id="wa-phone"
              type="tel"
              autoComplete="tel"
              placeholder="e.g. +91 98765 43210"
              value={phoneDraft}
              onChange={(e) => setPhoneDraft(e.target.value)}
              disabled={loading}
              className="w-full h-11 rounded-lg border border-input bg-background px-3 font-body text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={savePhone}
            disabled={saving || loading}
            className="h-11 px-5 rounded-lg border border-border bg-background font-body text-sm font-medium hover:bg-secondary transition-colors shrink-0 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save number"}
          </button>
          <button
            type="button"
            onClick={test}
            disabled={testing || !canTest}
            className="h-11 px-4 rounded-lg gold-gradient text-accent-foreground font-body text-sm font-semibold flex items-center justify-center gap-2 shrink-0 hover:opacity-90 disabled:opacity-40 disabled:pointer-events-none"
            title={
              !providerOk
                ? "Configure a WhatsApp provider on the server"
                : !savedPhone
                  ? "Save a phone number first"
                  : !enabled
                    ? "Turn alerts on"
                    : undefined
            }
          >
            <Send className="w-4 h-4" />
            {testing ? "Sending…" : "Test"}
          </button>
        </div>
      </div>

      {!providerOk && (
        <p className="px-5 pb-4 -mt-2 text-[11px] font-body text-muted-foreground leading-relaxed max-w-3xl">
          Set one of:{" "}
          <code className="text-xs bg-secondary px-1 rounded">TWILIO_*</code>,{" "}
          <code className="text-xs bg-secondary px-1 rounded">WHATSAPP_CLOUD_*</code>,{" "}
          <code className="text-xs bg-secondary px-1 rounded">WHATSAPP_WEBHOOK_URL</code>, or{" "}
          <code className="text-xs bg-secondary px-1 rounded">CALLMEBOT_APIKEY</code> on the
          server.
        </p>
      )}
    </div>
  );
};

export default WhatsAppAlertSettings;
