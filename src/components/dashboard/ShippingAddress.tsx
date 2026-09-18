import { useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function TextField({ label, className = "" }: { label: string; className?: string }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-[12px] text-foreground">{label}</label>
      <input
        type="text"
        className="w-full h-9 px-2.5 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
      />
    </div>
  );
}

export function ShippingAddress() {
  const [sameAsBilling, setSameAsBilling] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <header
        className="flex items-center justify-between px-5 py-3 bg-[hsl(var(--table-header-bg))] cursor-pointer"
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-[14px] font-semibold text-foreground">Shipping address</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </header>

      {open && (
      <div className="px-5 py-4 space-y-4 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={sameAsBilling}
            onChange={(e) => setSameAsBilling(e.target.checked)}
            className="h-4 w-4 accent-[hsl(var(--link))]"
          />
          <span className="text-[13px] text-foreground">Same as billing address</span>
        </label>

        {!sameAsBilling && (
          <div className="max-w-[640px] grid grid-cols-2 gap-x-3 gap-y-3">
            {/* Country - full width */}
            <div className="col-span-2 space-y-1">
              <label className="block text-[12px] text-foreground">Country</label>
              <div className="relative">
                <select
                  defaultValue=""
                  className="w-full h-9 px-2.5 pr-9 text-[13px] text-foreground bg-card border border-border rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
                >
                  <option value="" disabled>
                    Select Country
                  </option>
                  <option value="us">United States</option>
                  <option value="in">India</option>
                  <option value="gb">United Kingdom</option>
                  <option value="de">Germany</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <TextField label="First Name" />
            <TextField label="Last Name" />
            <TextField label="Email ID" className="col-span-2" />
            <TextField label="Company" />
            <TextField label="Phone" />
            <TextField label="Address line 1" className="col-span-2" />
            <TextField label="Address line 2" className="col-span-2" />
            <TextField label="City" />
            <TextField label="State" />
            <TextField label="Postal/Zip code" />
          </div>
        )}
      </div>
      )}
    </section>
  );
}
