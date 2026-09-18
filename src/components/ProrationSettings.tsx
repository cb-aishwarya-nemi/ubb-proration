import { useState } from "react";
import { Info, Lock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

function PreviewLink({ label, option }: { label: string; option: string }) {
  const totalDays = 31;
  const changeDay = 15;
  const remainingDays = totalDays - changeDay;
  const fullGrant = 1000;
  const unit = "AI credits";
  const proratedGrant = Math.round(fullGrant * (remainingDays / totalDays));
  const changePct = (changeDay / totalDays) * 100;

  const outcome: Record<string, { value: string; note: string }> = {
    "Charge based on time": { value: `${proratedGrant.toLocaleString()} ${unit}`, note: `Granted for ${remainingDays} of ${totalDays} days remaining in the term.` },
    "Charge in full": { value: `${fullGrant.toLocaleString()} ${unit}`, note: `Full entitlement granted regardless of time remaining in the term.` },
    "Do not charge": { value: `0 ${unit}`, note: `Nothing granted now. Full entitlement starts from the next renewal on Feb 1.` },
    "Grant full value": { value: `${fullGrant.toLocaleString()} ${unit}`, note: `Customer immediately receives the full entitlement.` },
    "Grant based on time": { value: `${proratedGrant.toLocaleString()} ${unit}`, note: `Customer receives a prorated entitlement for the remaining time in the term.` },
  };

  const showsProrated = option === "Charge based on time" || option === "Grant based on time";
  const showsFull = option === "Charge in full" || option === "Grant full value";
  const current = outcome[option] ?? { value: "—", note: "Preview not available for this option." };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs font-medium text-sky-600 hover:underline">Preview</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{label} — {option}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 text-sm text-foreground">
          <div className="rounded-md border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
            Example: Customer on a monthly term (<span className="font-medium text-foreground">Jan 1 – Jan 31</span>) adds the <span className="font-medium text-foreground">AI Credits add-on (1,000 {unit}/month)</span> on <span className="font-medium text-foreground">Jan 15</span>.
          </div>
          <div className="pt-2">
            <div className="relative h-2 w-full rounded-full bg-muted">
              <div className="absolute left-0 top-0 h-2 rounded-l-full bg-muted-foreground/30" style={{ width: `${changePct}%` }} />
              {(showsProrated || showsFull) && (
                <div className="absolute top-0 h-2 rounded-r-full bg-sky-500" style={{ left: `${changePct}%`, width: `${100 - changePct}%` }} />
              )}
              <div className="absolute -top-1 left-0 h-4 w-0.5 bg-foreground" />
              <div className="absolute -top-1 h-4 w-0.5 bg-sky-600" style={{ left: `${changePct}%` }} />
              <div className="absolute -top-1 right-0 h-4 w-0.5 bg-foreground" />
            </div>
            <div className="relative mt-2 h-8 text-[11px]">
              <div className="absolute left-0">
                <div className="font-medium text-foreground">Jan 1</div>
                <div className="text-muted-foreground">Term start</div>
              </div>
              <div className="absolute -translate-x-1/2 text-center" style={{ left: `${changePct}%` }}>
                <div className="font-medium text-sky-600">Jan 15</div>
                <div className="text-muted-foreground">Add-on added</div>
              </div>
              <div className="absolute right-0 text-right">
                <div className="font-medium text-foreground">Jan 31</div>
                <div className="text-muted-foreground">Term end</div>
              </div>
            </div>
          </div>
          <div className="rounded-md border border-border bg-card p-4">
            <div className="flex items-baseline justify-between">
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Customer receives</div>
              <div className="text-lg font-semibold text-foreground">{current.value}</div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{current.note}</p>
            {showsProrated && (
              <p className="mt-2 text-xs text-muted-foreground">
                Calculation: 1,000 × ({remainingDays} ÷ {totalDays}) = {proratedGrant.toLocaleString()} {unit}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ProrationSettingRow({
  label,
  description,
  options,
  placeholder = "Select an option",
  infoMessages,
  locked = false,
}: {
  label: string;
  description?: string;
  options?: string[];
  placeholder?: string;
  infoMessages?: Record<string, string>;
  locked?: boolean;
}) {
  const opts = options ?? [];
  const [value, setValue] = useState<string | undefined>(undefined);
  const info = value && infoMessages ? infoMessages[value] : undefined;
  return (
    <div className="flex items-start justify-between gap-6 px-6 py-4">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
      </div>
      <div className="flex w-[260px] flex-col items-end">
        {locked ? (
          <div className="flex h-9 w-[260px] items-center gap-2 rounded-md border border-border bg-muted/40 px-3 text-sm text-foreground">
            <Lock className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="truncate">{value ?? <span className="text-muted-foreground">Not configured</span>}</span>
          </div>
        ) : (
          <Select value={value} onValueChange={setValue} disabled={opts.length === 0}>
            <SelectTrigger className="w-[260px] [&[data-placeholder]]:text-muted-foreground/60">
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {opts.map((o) => (
                <SelectItem key={o} value={o}>{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {info && (
          <div className="mt-2 flex w-full items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>
              {info} <PreviewLink label={label} option={value!} />
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export const PRORATION_INVOICE_OPTIONS = ["Charge based on time", "Charge in full", "Do not charge"];
export const PRORATION_INVOICE_INFO = {
  "Charge in full": "Customers will be charged the full item price.",
  "Charge based on time": "Customers will be charged only for the remaining time in the term.",
  "Do not charge": "Customers will not be charged anything.",
};
export const PRORATION_GRANT_OPTIONS = ["Grant full value", "Grant based on time"];
export const PRORATION_GRANT_INFO = {
  "Grant full value": "Customers will receive the full entitlement/credit amount.",
  "Grant based on time": "Customers will receive entitlement/credits only for the remaining time in the term.",
};
export const PRORATION_CREDIT_OPTIONS = ["Credit based on usage", "Credit based on time", "Do not credit"];
export const PRORATION_CREDIT_INFO = {
  "Credit based on usage": "Customers will be credited based on their actual usage in the term.",
  "Credit based on time": "Customers will be credited only for the unused time remaining in the term.",
  "Do not credit": "Customers will not receive any credit.",
};
