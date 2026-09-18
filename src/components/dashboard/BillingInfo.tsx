import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink } from "lucide-react";

export function BillingInfo() {
  const [autoCollection, setAutoCollection] = useState<"customer" | "on" | "off">("off");
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <header
        className={`flex items-center justify-between px-5 py-3 bg-[hsl(var(--table-header-bg))] cursor-pointer ${open ? "border-b border-border" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-[14px] font-semibold text-foreground">Billing info</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </header>

      {open && (
      <div className="px-5 py-5 space-y-6">
        {/* Start date */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-foreground">Start date</label>
          <div className="relative w-[420px] max-w-full">
            <select
              defaultValue="immediately"
              className="w-full h-10 px-3 pr-9 text-[13px] text-foreground bg-card border border-border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            >
              <option value="immediately">Immediately</option>
              <option value="specific">Specific date</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <p className="w-[420px] max-w-full text-[12px] text-muted-foreground">
            Typically, used for future subscriptions. You can specify past dates in specific cases.{" "}
            <a href="#" className="inline-flex items-center gap-1 text-[hsl(var(--link))] hover:underline">
              <ExternalLink className="w-3 h-3" />
              Learn more
            </a>
          </p>
        </div>

        {/* Billing cycles */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-foreground">Billing Cycles</label>
          <div className="relative w-[420px] max-w-full">
            <select
              defaultValue="forever"
              className="w-full h-10 px-3 pr-9 text-[13px] text-foreground bg-card border border-border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            >
              <option value="forever">Forever</option>
              <option value="custom">Custom</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
          <p className="w-[420px] max-w-full text-[12px] text-muted-foreground">
            Number of billing cycles this subscription should be charged. Overrides the billing cycles if configured at the plan level.
          </p>
        </div>

        {/* Auto-collection */}
        <div className="space-y-2">
          <div>
            <p className="text-[13px] font-semibold text-foreground">Auto-collection</p>
            <p className="w-[420px] max-w-full text-[12px] text-muted-foreground">
              Auto-collection lets you automatically attempt to charge a customer's payment method whenever an invoice is created.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="radio"
                name="auto-collection"
                checked={autoCollection === "customer"}
                onChange={() => setAutoCollection("customer")}
                className="mt-0.5 accent-[hsl(var(--link))]"
              />
              <span className="text-[13px] text-foreground">
                Use customer's settings
                <span className="block text-[12px] text-muted-foreground">Auto collection is turned ON now</span>
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="auto-collection"
                checked={autoCollection === "on"}
                onChange={() => setAutoCollection("on")}
                className="accent-[hsl(var(--link))]"
              />
              <span className="text-[13px] text-foreground">On</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="auto-collection"
                checked={autoCollection === "off"}
                onChange={() => setAutoCollection("off")}
                className="accent-[hsl(var(--link))]"
              />
              <span className="text-[13px] text-foreground">Off</span>
            </label>
          </div>
        </div>

        {/* PO number */}
        <div className="space-y-1.5">
          <label className="block text-[13px] text-foreground">PO number</label>
          <input
            type="text"
            className="w-[420px] max-w-full h-10 px-3 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
          />
          <p className="text-[12px] text-muted-foreground">Enter the Purchase Order Number</p>
        </div>
      </div>
      )}
    </section>
  );
}
