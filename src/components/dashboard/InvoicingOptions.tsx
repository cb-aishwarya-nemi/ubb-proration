import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export function InvoicingOptions() {
  const [pending, setPending] = useState(false);
  const [whenInvoice, setWhenInvoice] = useState<"immediately" | "unbilled">("immediately");
  const [open, setOpen] = useState(true);

  return (
    <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <header
        className={`flex items-center justify-between px-5 py-3 bg-[hsl(var(--table-header-bg))] cursor-pointer ${open ? "border-b border-border" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-[14px] font-semibold text-foreground">Invoicing options</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </header>

      {open && (
      <div className="px-5 py-5 space-y-6">
        {/* Pending state checkbox */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pending}
              onChange={(e) => setPending(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[hsl(var(--link))]"
            />
            <div className="space-y-2">
              <span className="block text-[13px] text-foreground">
                Generate all renewal invoices in pending state
              </span>
              <p className="w-[520px] max-w-full text-[12px] text-muted-foreground">
                All invoices other than the first invoice will move to pending state. Invoices will close automatically or manually based on your site settings.
              </p>
              <p className="w-[520px] max-w-full text-[12px] text-foreground">
                <span className="font-semibold">Note:</span>
                <span className="ml-3 text-muted-foreground">You will need to manually close all renewal invoices.</span>
              </p>
            </div>
          </label>
        </div>

        {/* When should the invoice be generated */}
        <div className="space-y-2">
          <div>
            <p className="text-[13px] font-semibold text-foreground">When should the invoice be generated?</p>
            <p className="w-[520px] max-w-full text-[12px] text-muted-foreground">
              If there are any charges, you can generate an invoice immediately, or add them to unbilled charges and invoice them later.
            </p>
          </div>
          <div className="space-y-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="when-invoice"
                checked={whenInvoice === "immediately"}
                onChange={() => setWhenInvoice("immediately")}
                className="accent-[hsl(var(--link))]"
              />
              <span className="text-[13px] text-foreground">Immediately</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="when-invoice"
                checked={whenInvoice === "unbilled"}
                onChange={() => setWhenInvoice("unbilled")}
                className="accent-[hsl(var(--link))]"
              />
              <span className="text-[13px] text-foreground">Add to unbilled charges</span>
            </label>
          </div>
        </div>
      </div>
      )}
    </section>
  );
}
