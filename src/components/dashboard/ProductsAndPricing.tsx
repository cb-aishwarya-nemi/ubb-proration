import { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Info,
  Plus,
  Calendar as CalendarIcon,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AddItemDrawer, { type QuoteLineItem } from "./AddItemDrawer";
import { GrantsOverrideDrawer } from "@/components/grants/GrantsOverrideDrawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check } from "lucide-react";
import { PRORATION_INVOICE_OPTIONS, PRORATION_CREDIT_OPTIONS } from "@/components/ProrationSettings";
import { getSite, getAnyPricePointProration } from "@/lib/prorationStore";

interface ProductsAndPricingProps {
  items?: QuoteLineItem[];
  onItemsChange?: (items: QuoteLineItem[]) => void;
  customerName?: string;
}

export function ProductsAndPricing({ items: itemsProp, onItemsChange, customerName }: ProductsAndPricingProps = {}) {
  const [internalItems, setInternalItems] = useState<QuoteLineItem[]>([]);
  const items = itemsProp ?? internalItems;
  const setItems = (updater: QuoteLineItem[] | ((prev: QuoteLineItem[]) => QuoteLineItem[])) => {
    const next = typeof updater === "function" ? (updater as (p: QuoteLineItem[]) => QuoteLineItem[])(items) : updater;
    if (onItemsChange) onItemsChange(next);
    else setInternalItems(next);
  };
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [grantsDrawer, setGrantsDrawer] = useState<{ index: number } | null>(null);
  const [grantsOverrides, setGrantsOverrides] = useState<Record<string, string>>({});
  const grantsItem = grantsDrawer != null ? items[grantsDrawer.index] : null;

  const removeAt = (idx: number) =>
    setItems((prev) => {
      const item = prev[idx];
      // If item was newly added in this session, drop it entirely.
      if (item?.status === "added") {
        return prev.filter((_, i) => i !== idx);
      }
      // Otherwise mark existing item as removed.
      return prev.map((it, i) => (i === idx ? { ...it, status: "removed" as const } : it));
    });

  const setProration = (idx: number, value: string) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, proration: value } : it)) as QuoteLineItem[]);

  const restoreAt = (idx: number) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, status: undefined } : it)));

  const hasChanges = items.some((it) => it.status === "added" || it.status === "removed");
  const ppDefaults = getAnyPricePointProration();
  const siteDefaults = getSite();
  const defaultInvoice = ppDefaults.invoice ?? siteDefaults.invoice ?? PRORATION_INVOICE_OPTIONS[0];
  const defaultCredit = ppDefaults.credit ?? siteDefaults.credit ?? PRORATION_CREDIT_OPTIONS[0];

  const parsePrice = (p: string) => Number(String(p).replace(/[^0-9.]/g, "")) || 0;
  const formatUSD = (n: number) =>
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const netAmountFor = (it: QuoteLineItem) => parsePrice(it.price);
  const formatNet = (it: QuoteLineItem) => {
    const v = netAmountFor(it);
    return it.status === "removed" ? `-${formatUSD(v)}` : formatUSD(v);
  };

  return (
    <>
      {items.length === 0 ? (
        <section key="empty" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
      <header
        className={`flex items-center justify-between px-5 py-3 bg-[hsl(var(--table-header-bg))] cursor-pointer ${open ? "border-b border-border" : ""}`}
        onClick={() => setOpen((v) => !v)}
      >
        <h2 className="text-[14px] font-semibold text-foreground">Products and pricing</h2>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </header>

      {open && (<>
          <div className="grid grid-cols-8 gap-4 px-5 py-3 border-b border-border text-[12px] font-semibold text-muted-foreground">
        <div>Item name</div>
        <div>Billing frequency</div>
        <div>Pricing model</div>
        <div>Quantity</div>
        <div>List unit price</div>
        <div>Grants</div>
        <div>Net amount</div>
        <div>Entitlement</div>
      </div>
          <div className="px-5 py-12 flex flex-col items-center justify-center gap-3 border-b border-border">
        <p className="text-[13px] text-foreground">Add items to this subscription.</p>
        <button
          type="button"
              onClick={() => setAddItemOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[hsl(var(--link))] bg-card border border-[hsl(var(--link))] rounded-md hover:bg-[hsl(var(--link))]/5"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>
          <div className="flex items-center justify-end px-5 py-4 bg-[hsl(var(--table-header-bg))]">
        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-muted-foreground">Net Total</span>
          <span className="font-semibold text-foreground">$0.00</span>
        </div>
      </div>
      </>)}
        </section>
      ) : (
        <section key="filled" className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          <header
            className={`flex items-center justify-between px-5 py-3 bg-[hsl(var(--table-header-bg))] cursor-pointer ${open ? "border-b border-border" : ""}`}
            onClick={() => setOpen((v) => !v)}
          >
            <h2 className="text-[14px] font-semibold text-foreground">Products and pricing</h2>
            {open ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </header>

          {open && (<>
          <div className="flex items-center justify-between px-5 py-3 border-b border-border">
            <div />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAddItemOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-[hsl(var(--link))] bg-card border border-[hsl(var(--link))] rounded-md hover:bg-[hsl(var(--link))]/5"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className={`grid ${hasChanges ? "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1fr)_36px]" : "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)_36px]"} gap-4 items-center px-5 py-3 text-[12px] font-semibold text-foreground border-b border-border`}>
            <div>Item name</div>
            <div>Billing frequency</div>
            <div>Pricing model</div>
            <div>Quantity</div>
            <div>List unit price</div>
            <div>Grants</div>
            {hasChanges && <div>Proration</div>}
            <div className="text-right pr-2">Net amount</div>
            <div />
          </div>

          {(() => {
            const TYPE_LABELS: Record<string, string> = {
              Plan: "Plans",
              Addon: "Add-ons",
              Charge: "Charges",
              Bundle: "Bundles",
            };
            const ORDER = ["Plan", "Addon", "Charge", "Bundle"];
            const groups = ORDER
              .map((t) => ({ type: t, rows: items.map((it, i) => ({ it, i })).filter(({ it }) => it.type === t) }))
              .filter((g) => g.rows.length > 0);
            return groups.map((group) => (
              <div key={group.type}>
                <div className="px-5 py-2 bg-[hsl(var(--table-header-bg))] text-[13px] text-foreground border-b border-border">
                  {TYPE_LABELS[group.type] ?? group.type}
                </div>
                {group.rows.map(({ it: item, i }) => {
                  const isRemoved = item.status === "removed";
                  const isChanged = item.status === "added" || item.status === "removed";
                  const disabledFieldCls = isRemoved ? "opacity-50 pointer-events-none" : "";
                  return (
                  <div
                    key={`${item.name}-${i}`}
              className={`grid ${hasChanges ? "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1fr)_36px]" : "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)_36px]"} gap-4 items-center px-5 py-3 text-[13px] text-foreground border-b border-border hover:bg-[hsl(var(--sidebar-hover))]`}
            >
              <div className={`flex items-center gap-1.5 ${disabledFieldCls}`}>
                <span className={isRemoved ? "line-through" : ""}>{item.name}</span>
                <Info className="w-3.5 h-3.5 text-muted-foreground" />
                {item.status === "added" && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[hsl(142_76%_94%)] text-[hsl(142_72%_29%)]">Added</span>
                )}
                {item.status === "removed" && (
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[10px] font-semibold rounded bg-[hsl(0_85%_94%)] text-[hsl(0_72%_45%)]">Removed</span>
                )}
              </div>
              <div className={disabledFieldCls}>{item.billingFrequency}</div>
              <div className={disabledFieldCls}>Flat Fee</div>
              <div className={disabledFieldCls}>
                <input
                  type="number"
                  min={1}
                  defaultValue={1}
                  disabled={isRemoved}
                  className="w-full h-9 px-2 text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))] disabled:bg-muted/40"
                />
              </div>
              <div className={disabledFieldCls}>
                <div className="relative w-full">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-muted-foreground">$</span>
                  <input
                    key={`price-${item.name}-${item.price}`}
                    type="text"
                    value={(Number(String(item.price).replace(/[^0-9.]/g, "")) || 0).toFixed(2)}
                    onChange={() => {}}
                    disabled={isRemoved}
                    className="w-full h-9 pl-6 pr-3 text-right text-[13px] bg-card border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))] disabled:bg-muted/40"
                  />
                </div>
              </div>
              <div className={disabledFieldCls}>
                {item.grantsCount === 0 ? (
                  <span className="text-[13px] text-muted-foreground">—</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setGrantsDrawer({ index: i })}
                    className="text-[13px] font-medium text-[hsl(var(--link))] hover:underline"
                  >
                    {item.grantsCount} grants
                  </button>
                )}
              </div>
              {hasChanges && (
                <div>
                  {isChanged ? (() => {
                    const isRemove = item.status === "removed";
                    const opts = isRemove ? PRORATION_CREDIT_OPTIONS : PRORATION_INVOICE_OPTIONS;
                    const def = isRemove ? defaultCredit : defaultInvoice;
                    const title = isRemove ? "Credit note amount" : "Invoice amount";
                    const value = item.proration ?? def;
                    return (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="flex w-full items-center justify-between h-9 px-2.5 text-[13px] bg-card border border-border rounded-md hover:bg-[hsl(var(--sidebar-hover))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--link))]"
                          >
                            <span className="truncate text-foreground">{value}</span>
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-1" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          align="start"
                          sideOffset={4}
                          className="w-[260px] p-0 bg-card border border-border shadow-md rounded-md"
                        >
                          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground border-b border-border">
                            {title}
                          </div>
                          <div className="py-1">
                            {opts.map((opt) => {
                              const selected = opt === value;
                              return (
                                <button
                                  key={opt}
                                  type="button"
                                  onClick={() => setProration(i, opt)}
                                  className={`flex w-full items-center justify-between px-3 py-2 text-[13px] text-left hover:bg-[hsl(var(--sidebar-hover))] ${selected ? "text-foreground" : "text-foreground"}`}
                                >
                                  <span>{opt}</span>
                                  {selected && <Check className="w-3.5 h-3.5 text-[hsl(var(--link))]" />}
                                </button>
                              );
                            })}
                          </div>
                        </PopoverContent>
                      </Popover>
                    );
                  })() : (
                    <span className="text-[13px] text-muted-foreground">—</span>
                  )}
                </div>
              )}
              <div className={`text-right pr-2 ${disabledFieldCls}`}>
                <div className="font-medium">{formatNet(item)}</div>
              </div>
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="p-1 rounded hover:bg-[hsl(var(--sidebar-hover))] focus:outline-none"
                      aria-label="Row actions"
                    >
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 py-2">
                    {isRemoved ? (
                      <DropdownMenuItem
                        className="px-4 py-2 text-[13px] cursor-pointer"
                        onClick={() => restoreAt(i)}
                      >
                        Restore
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem className="px-4 py-2 text-[13px] cursor-pointer">
                          Change plan
                        </DropdownMenuItem>
                        <DropdownMenuItem className="px-4 py-2 text-[13px] cursor-pointer">
                          Reset to default
                        </DropdownMenuItem>
                        <DropdownMenuItem className="px-4 py-2 text-[13px] cursor-pointer">
                          Add manual discount
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="px-4 py-2 text-[13px] cursor-pointer"
                          onClick={() => removeAt(i)}
                        >
                          Remove
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
                  );
                })}
              </div>
            ));
          })()}

          <div className={`grid ${hasChanges ? "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1.1fr)_minmax(0,1fr)_36px]" : "grid-cols-[minmax(0,1.6fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,1.1fr)_minmax(0,0.8fr)_minmax(0,1fr)_36px]"} gap-4 items-center px-5 py-3 bg-[hsl(var(--table-header-bg))] text-[13px]`}>
            <div className="col-span-6 flex items-center justify-end gap-4">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-[13px] font-medium text-[hsl(var(--link))] hover:underline"
                    >
                      Add discount
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[12px]">
                    Add coupons, coupon codes or manual discounts
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="h-4 w-px bg-border" aria-hidden="true" />
              <span className="text-muted-foreground">Net Total</span>
            </div>
            {hasChanges && <div />}
            <div className="text-right pr-2 font-semibold text-foreground">
              {formatUSD(items.reduce((s, it) => (it.status === "removed" ? s : s + netAmountFor(it)), 0))}
            </div>
            <div />
          </div>

          </>)}
        </section>
      )}

      <AddItemDrawer
        open={addItemOpen}
        onOpenChange={setAddItemOpen}
        multipleGrants={items.length >= 1}
        onAdd={(newItems) => setItems((prev) => [...prev, ...newItems])}
      />

      <GrantsOverrideDrawer
        open={!!grantsDrawer}
        onOpenChange={(o) => !o && setGrantsDrawer(null)}
        itemName={grantsItem?.name}
        billingFrequency={grantsItem?.billingFrequency}
        grants={grantsItem?.grants ?? []}
        rowKey={String(grantsDrawer?.index ?? -1)}
        overrides={grantsOverrides}
        onOverridesChange={setGrantsOverrides}
      />
    </>
  );
}