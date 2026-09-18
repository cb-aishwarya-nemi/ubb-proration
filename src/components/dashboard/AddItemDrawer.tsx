import { useState } from "react";
import { Search, ListFilter } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface QuoteLineItem {
  name: string;
  family: string;
  type: string;
  billingFrequency: string;
  grantsCount: number;
  price: string;
  grants: string[];
  status?: "added" | "removed";
  proration?: string;
}

interface AddItemDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  multipleGrants?: boolean;
  onAdd?: (items: QuoteLineItem[]) => void;
}

interface Item {
  type: string;
  family: string;
  name: string;
  frequency: string;
  price: string;
  grants: string[];
}

const ITEMS: Item[] = [
  { type: "Plan", family: "OmniSupport Solutions", name: "Business Suite", frequency: "Monthly", price: "$499.00 USD", grants: ["500 GB/mo storage", "10,000 API calls/mo", "25 seats", "50 GB bandwidth/mo", "5,000 emails/mo"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Enterprise Suite", frequency: "Yearly", price: "$4,799.00 USD", grants: ["5 TB/yr storage", "1M API calls/yr", "Unlimited seats", "500 GB bandwidth/mo", "100,000 emails/mo", "24/7 support hours", "10 sandbox envs", "Custom SLA"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Essential Support", frequency: "Monthly", price: "$199.00 USD", grants: ["100 GB/mo storage", "1,000 API calls/mo"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Professional Suite", frequency: "Quarterly", price: "$1,349.00 USD", grants: ["1 TB/qtr storage", "50,000 API calls/qtr", "10 seats", "20 GB bandwidth/mo"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Starter Plan", frequency: "Daily", price: "$9.00 USD", grants: ["1 GB/day storage"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Growth Plan", frequency: "Weekly", price: "$79.00 USD", grants: ["50 GB/wk storage", "5,000 API calls/wk", "5 seats"] },
  { type: "Addon", family: "OmniSupport Solutions", name: "Priority Support", frequency: "Monthly", price: "$49.00 USD", grants: ["20 support hours/mo"] },
  { type: "Addon", family: "OmniSupport Solutions", name: "Extra Storage 100GB", frequency: "Monthly", price: "$19.00 USD", grants: ["100 GB/mo storage"] },
  { type: "Addon", family: "OmniSupport Solutions", name: "Advanced Analytics", frequency: "Yearly", price: "$299.00 USD", grants: ["100,000 events/mo", "12 mo data retention"] },
  { type: "Addon", family: "OmniSupport Solutions", name: "SSO & SAML", frequency: "Yearly", price: "$599.00 USD", grants: [] },
  { type: "Addon", family: "OmniSupport Solutions", name: "Additional Seat", frequency: "Monthly", price: "$15.00 USD", grants: ["1 seat"] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Onboarding Fee", frequency: "Daily", price: "$1,500.00 USD", grants: [] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Implementation Charge", frequency: "Daily", price: "$2,500.00 USD", grants: [] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Custom Integration", frequency: "Daily", price: "$3,200.00 USD", grants: [] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Data Migration", frequency: "Daily", price: "$1,800.00 USD", grants: [] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Training Session", frequency: "Weekly", price: "$450.00 USD", grants: [] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Starter Bundle", frequency: "Monthly", price: "$249.00 USD", grants: ["200 GB/mo storage", "5,000 API calls/mo", "5 seats"] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Growth Bundle", frequency: "Quarterly", price: "$899.00 USD", grants: ["750 GB/qtr storage", "30,000 API calls/qtr", "15 seats", "10 support hours/mo", "3 sandbox envs"] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Scale Bundle", frequency: "Yearly", price: "$3,499.00 USD", grants: ["3 TB/yr storage", "500,000 API calls/yr", "50 seats", "100 GB bandwidth/mo", "20,000 emails/mo", "40 support hours/mo", "5 sandbox envs"] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Enterprise Bundle", frequency: "Yearly", price: "$7,999.00 USD", grants: ["10 TB/yr storage", "2M API calls/yr", "Unlimited seats", "1 TB bandwidth/mo", "250,000 emails/mo", "24/7 support hours", "20 sandbox envs", "Dedicated CSM", "Custom SLA", "On-prem connector"] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Support Bundle", frequency: "Monthly", price: "$349.00 USD", grants: ["40 support hours/mo", "Priority queue", "Named TAM", "Quarterly reviews"] },
  { type: "Plan", family: "OmniSupport Solutions", name: "Free Trial", frequency: "Weekly", price: "$0.00 USD", grants: ["10 GB/wk storage"] },
  { type: "Addon", family: "OmniSupport Solutions", name: "API Access Pack", frequency: "Quarterly", price: "$149.00 USD", grants: ["25,000 API calls/qtr", "10 webhooks"] },
  { type: "Bundle", family: "OmniSupport Solutions", name: "Developer Bundle", frequency: "Monthly", price: "$199.00 USD", grants: ["20,000 API calls/mo", "3 sandbox envs", "5 seats"] },
  { type: "Charge", family: "OmniSupport Solutions", name: "Premium Consultancy", frequency: "Daily", price: "$5,000.00 USD", grants: [] },
];

const ITEM_TYPE_OPTIONS = ["Plan", "Addon", "Charge", "Bundle"];
const ITEM_NAME_OPERATORS = ["Contains", "Does not contain", "Equals", "Starts with", "Ends with"];
const FREQUENCY_OPTIONS = ["Daily", "Weekly", "Monthly", "Yearly"];
const PRICE_OPERATORS = ["Equals", "Greater than", "Less than", "Between"];
const GRANTS_OPTIONS = ["Only features", "Only credits", "Both", "No grants"];

type ColumnFilter =
  | { kind: "multiselect"; selected: string[] }
  | { kind: "text"; operator: string; value: string }
  | { kind: "number"; operator: string; value: string; value2?: string }
  | { kind: "single"; selected: string };

interface ColumnConfig {
  key: "itemType" | "itemName" | "frequency" | "price" | "grants";
  label: string;
}

const COLUMNS: ColumnConfig[] = [
  { key: "itemType", label: "Item type" },
  { key: "itemName", label: "Item name" },
  { key: "frequency", label: "Frequency" },
  { key: "price", label: "Price" },
  { key: "grants", label: "Grants" },
];

interface ColumnFilterPopoverProps {
  column: ColumnConfig;
  filter: ColumnFilter;
  onChange: (next: ColumnFilter) => void;
  onClear: () => void;
  active: boolean;
}

const ColumnFilterPopover = ({ column, filter, onChange, onClear, active }: ColumnFilterPopoverProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Filter ${column.label}`}
          className={`p-0.5 rounded hover:bg-muted/60 ${active ? "text-[hsl(var(--link))]" : "text-muted-foreground"}`}
        >
          <ListFilter className="w-3.5 h-3.5" strokeWidth={2} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-3 bg-card border border-border">
        <div className="text-[12px] font-semibold text-foreground mb-2">Filter {column.label}</div>

        {filter.kind === "multiselect" && (
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {(column.key === "itemType" ? ITEM_TYPE_OPTIONS : []).map((opt) => {
              const checked = filter.selected.includes(opt);
              return (
                <label key={opt} className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...filter.selected, opt]
                        : filter.selected.filter((s) => s !== opt);
                      onChange({ kind: "multiselect", selected: next });
                    }}
                    className="w-3.5 h-3.5 accent-[hsl(var(--link))]"
                  />
                  {opt}
                </label>
              );
            })}
            {column.key === "frequency" &&
              FREQUENCY_OPTIONS.map((opt) => {
                const checked = filter.selected.includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...filter.selected, opt]
                          : filter.selected.filter((s) => s !== opt);
                        onChange({ kind: "multiselect", selected: next });
                      }}
                      className="w-3.5 h-3.5 accent-[hsl(var(--link))]"
                    />
                    {opt}
                  </label>
                );
              })}
          </div>
        )}

        {filter.kind === "text" && (
          <div className="space-y-2">
            <select
              value={filter.operator}
              onChange={(e) => onChange({ ...filter, operator: e.target.value })}
              className="w-full h-8 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            >
              {ITEM_NAME_OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <input
              type="text"
              value={filter.value}
              onChange={(e) => onChange({ ...filter, value: e.target.value })}
              placeholder="Enter value"
              className="w-full h-8 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            />
          </div>
        )}

        {filter.kind === "number" && (
          <div className="space-y-2">
            <select
              value={filter.operator}
              onChange={(e) => onChange({ ...filter, operator: e.target.value })}
              className="w-full h-8 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            >
              {PRICE_OPERATORS.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
            <input
              type="number"
              value={filter.value}
              onChange={(e) => onChange({ ...filter, value: e.target.value })}
              placeholder="Amount"
              className="w-full h-8 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
            />
            {filter.operator === "Between" && (
              <input
                type="number"
                value={filter.value2 ?? ""}
                onChange={(e) => onChange({ ...filter, value2: e.target.value })}
                placeholder="And"
                className="w-full h-8 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
              />
            )}
          </div>
        )}

        {filter.kind === "single" && (
          <div className="space-y-1.5">
            {GRANTS_OPTIONS.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-[13px] text-foreground cursor-pointer">
                <input
                  type="radio"
                  name={`grants-${column.key}`}
                  checked={filter.selected === opt}
                  onChange={() => onChange({ kind: "single", selected: opt })}
                  className="w-3.5 h-3.5 accent-[hsl(var(--link))]"
                />
                {opt}
              </label>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClear}
            className="px-2.5 py-1 text-[12px] text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

const initialFilters = (): Record<ColumnConfig["key"], ColumnFilter> => ({
  itemType: { kind: "multiselect", selected: [] },
  itemName: { kind: "text", operator: "Contains", value: "" },
  frequency: { kind: "multiselect", selected: [] },
  price: { kind: "number", operator: "Greater than", value: "" },
  grants: { kind: "single", selected: "" },
});

const isFilterActive = (f: ColumnFilter): boolean => {
  if (f.kind === "multiselect") return f.selected.length > 0;
  if (f.kind === "text") return f.value.trim() !== "";
  if (f.kind === "number") return f.value.trim() !== "";
  if (f.kind === "single") return f.selected !== "";
  return false;
};

const AddItemDrawer = ({ open, onOpenChange, onAdd }: AddItemDrawerProps) => {
  const [filters, setFilters] = useState<Record<ColumnConfig["key"], ColumnFilter>>(initialFilters);
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showOnlySelected, setShowOnlySelected] = useState(false);

  const toggleOne = (name: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const parsePrice = (p: string): number => {
    const n = parseFloat(p.replace(/[^0-9.]/g, ""));
    return isNaN(n) ? 0 : n;
  };

  const grantsCategory = (grants: string[]): "features" | "credits" | "both" | "none" => {
    if (!grants || grants.length === 0) return "none";
    const featureKeywords = ["sso", "saml", "support", "sla", "sandbox", "csm", "tam", "review", "connector", "priority", "queue", "named", "dedicated"];
    const creditKeywords = ["gb", "tb", "mb", "api", "calls", "events", "emails", "seat", "seats", "bandwidth", "tokens", "hours", "webhooks"];
    let hasFeature = false;
    let hasCredit = false;
    for (const g of grants) {
      const s = g.toLowerCase();
      if (featureKeywords.some((k) => s.includes(k))) hasFeature = true;
      if (creditKeywords.some((k) => s.includes(k))) hasCredit = true;
    }
    if (hasFeature && hasCredit) return "both";
    if (hasFeature) return "features";
    if (hasCredit) return "credits";
    return "credits";
  };

  const filteredItems = ITEMS.filter((item) => {
    if (showOnlySelected && !selected.has(item.name)) return false;
    if (searchQuery.trim() && !item.name.toLowerCase().includes(searchQuery.trim().toLowerCase())) {
      return false;
    }
    const tf = filters.itemType;
    if (tf.kind === "multiselect" && tf.selected.length > 0 && !tf.selected.includes(item.type)) return false;
    const nf = filters.itemName;
    if (nf.kind === "text" && nf.value.trim()) {
      const v = nf.value.trim().toLowerCase();
      const name = item.name.toLowerCase();
      const ok =
        nf.operator === "Contains" ? name.includes(v)
        : nf.operator === "Does not contain" ? !name.includes(v)
        : nf.operator === "Equals" ? name === v
        : nf.operator === "Starts with" ? name.startsWith(v)
        : nf.operator === "Ends with" ? name.endsWith(v)
        : true;
      if (!ok) return false;
    }
    const ff = filters.frequency;
    if (ff.kind === "multiselect" && ff.selected.length > 0 && !ff.selected.includes(item.frequency)) return false;
    const pf = filters.price;
    if (pf.kind === "number" && pf.value.trim()) {
      const price = parsePrice(item.price);
      const v1 = parseFloat(pf.value);
      const v2 = parseFloat(pf.value2 ?? "");
      const ok =
        pf.operator === "Equals" ? price === v1
        : pf.operator === "Greater than" ? price > v1
        : pf.operator === "Less than" ? price < v1
        : pf.operator === "Between" ? (!isNaN(v2) && price >= Math.min(v1, v2) && price <= Math.max(v1, v2))
        : true;
      if (!ok) return false;
    }
    const gf = filters.grants;
    if (gf.kind === "single" && gf.selected) {
      const cat = grantsCategory(item.grants);
      const ok =
        gf.selected === "No grants" ? cat === "none"
        : gf.selected === "Only features" ? cat === "features"
        : gf.selected === "Only credits" ? cat === "credits"
        : gf.selected === "Both" ? cat === "both"
        : true;
      if (!ok) return false;
    }
    return true;
  });

  const handleClose = () => onOpenChange(false);

  const handleAdd = () => {
    const picked = ITEMS.filter((it) => selected.has(it.name)).map((it) => ({
      name: it.name,
      family: it.family,
      type: it.type,
      billingFrequency: it.frequency,
      grantsCount: it.grants.length,
      price: it.price,
      grants: it.grants,
      status: "added" as const,
    }));
    if (picked.length > 0) onAdd?.(picked);
    setSelected(new Set());
    setShowOnlySelected(false);
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(o) => (o ? onOpenChange(o) : handleClose())}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[72vw] sm:w-[72vw] lg:max-w-[68vw] lg:w-[68vw] xl:max-w-[64vw] xl:w-[64vw] p-0 bg-card border-l border-border [&>button.absolute]:hidden"
      >
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 py-5 border-b border-border space-y-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-[18px] font-semibold text-foreground">
                Add item
              </SheetTitle>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 text-[13px] font-medium text-foreground bg-card border border-border rounded-md hover:bg-[hsl(var(--sidebar-hover))]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAdd}
                  className="px-4 py-1.5 text-[13px] font-semibold bg-[hsl(var(--link))] text-primary-foreground rounded-md hover:bg-[hsl(var(--link))]/90"
                >
                  Add
                </button>
              </div>
            </div>
          </SheetHeader>

          <div className="flex-1 min-h-0 px-6 py-5 flex flex-col overflow-hidden">
            <div className="flex flex-col flex-1 min-h-0">
              <div className="relative mb-4 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name"
                  className="w-full h-10 pl-9 pr-3 text-[13px] bg-card border border-[hsl(var(--link))] rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
                />
              </div>

              {selected.size > 0 && (
                <div className="mb-2 flex items-center justify-between shrink-0">
                  <div className="text-[13px] font-medium text-foreground">
                    {selected.size} {selected.size === 1 ? "item" : "items"} selected
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowOnlySelected((v) => !v)}
                      className="text-[12px] text-[hsl(var(--link))] hover:underline"
                    >
                      {showOnlySelected ? "Show all" : "View selected"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelected(new Set());
                        setShowOnlySelected(false);
                      }}
                      className="text-[12px] text-[hsl(var(--link))] hover:underline"
                    >
                      Clear selection
                    </button>
                  </div>
                </div>
              )}

              <div className="border border-border rounded-md flex flex-col flex-1 min-h-0 overflow-hidden">
                {(() => {
                  const allVisible = filteredItems.length > 0 && filteredItems.every((it) => selected.has(it.name));
                  const someVisible = filteredItems.some((it) => selected.has(it.name)) && !allVisible;
                  const toggleAll = () => {
                    setSelected((prev) => {
                      const next = new Set(prev);
                      if (allVisible) {
                        filteredItems.forEach((it) => next.delete(it.name));
                      } else {
                        filteredItems.forEach((it) => next.add(it.name));
                      }
                      return next;
                    });
                  };
                  return (
                    <div className="grid grid-cols-[36px_90px_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.3fr)] items-center px-4 py-2.5 shrink-0 bg-[hsl(var(--table-header-bg))] border-b border-border text-[12px] font-medium text-muted-foreground">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          aria-label="Select all"
                          checked={allVisible}
                          ref={(el) => { if (el) el.indeterminate = someVisible; }}
                          onChange={toggleAll}
                          className="w-3.5 h-3.5 accent-[hsl(var(--link))] cursor-pointer"
                        />
                      </div>
                      {COLUMNS.map((col) => (
                        <div key={col.key} className="flex items-center gap-1.5">
                          <span>{col.label}</span>
                          <ColumnFilterPopover
                            column={col}
                            filter={filters[col.key]}
                            active={isFilterActive(filters[col.key])}
                            onChange={(next) =>
                              setFilters((prev) => ({ ...prev, [col.key]: next }))
                            }
                            onClear={() =>
                              setFilters((prev) => ({ ...prev, [col.key]: initialFilters()[col.key] }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  );
                })()}
                <div className="flex-1 min-h-0 overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="px-4 py-8 text-center text-[13px] text-muted-foreground">
                      No items match the current filters.
                    </div>
                  ) : (
                    filteredItems.map((item, i) => {
                      const isChecked = selected.has(item.name);
                      return (
                        <label
                          key={item.name}
                          className={`grid grid-cols-[36px_90px_minmax(0,1.3fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.3fr)] items-center px-4 py-3 text-[13px] text-foreground cursor-pointer hover:bg-[hsl(var(--sidebar-hover))] ${
                            i !== filteredItems.length - 1 ? "border-b border-border" : ""
                          }`}
                        >
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleOne(item.name)}
                              className="w-3.5 h-3.5 accent-[hsl(var(--link))] cursor-pointer"
                            />
                          </div>
                          <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 text-[12px] text-foreground bg-muted rounded-full">
                              {item.type}
                            </span>
                          </div>
                          <div className="truncate">{item.name}</div>
                          <div className="truncate">{item.frequency}</div>
                          <div className="truncate">{item.price}</div>
                          <div className="min-w-0">
                            {item.grants.length === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="truncate">{item.grants[0].match(/^([\d,.]+\s*[A-Za-z]+(?:\/[A-Za-z]+)?)/)?.[1] ?? item.grants[0]}</span>
                                {item.grants.length > 1 && (
                                  <TooltipProvider delayDuration={150}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span
                                          onClick={(e) => e.preventDefault()}
                                          className="shrink-0 inline-flex items-center px-1.5 py-0.5 text-[11px] text-muted-foreground bg-muted rounded-full cursor-default"
                                        >
                                          +{item.grants.length - 1} more
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" align="end" className="max-w-[260px]">
                                        <ul className="space-y-1 text-xs">
                                          {item.grants.slice(1).map((g, i) => (
                                            <li key={i}>{g}</li>
                                          ))}
                                        </ul>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default AddItemDrawer;