import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { X, Hash, Play, Contact, ChevronDown, ChevronUp, Receipt, ExternalLink, Info, Plus, Minus } from "lucide-react";
import { ProductsAndPricing } from "@/components/dashboard/ProductsAndPricing";
import type { QuoteLineItem } from "@/components/dashboard/AddItemDrawer";
import { BillingInfo } from "@/components/dashboard/BillingInfo";
import { InvoicingOptions } from "@/components/dashboard/InvoicingOptions";
import { ShippingAddress } from "@/components/dashboard/ShippingAddress";
import { PRORATION_INVOICE_OPTIONS, PRORATION_CREDIT_OPTIONS } from "@/components/ProrationSettings";
import { getSite, getAnyPricePointProration } from "@/lib/prorationStore";

const DUMMY_CUSTOMER = { name: "Acme Corp", email: "billing@acme.com" };

const DUMMY_ITEMS: QuoteLineItem[] = [
  {
    name: "Business Suite",
    family: "OmniSupport Solutions",
    type: "Plan",
    billingFrequency: "Monthly",
    grantsCount: 5,
    price: "$499.00 USD",
    grants: ["500 GB/mo storage", "10,000 API calls/mo", "25 seats", "50 GB bandwidth/mo", "5,000 emails/mo"],
  },
  {
    name: "Priority Support",
    family: "OmniSupport Solutions",
    type: "Addon",
    billingFrequency: "Monthly",
    grantsCount: 1,
    price: "$49.00 USD",
    grants: ["20 support hours/mo"],
  },
  {
    name: "Onboarding Fee",
    family: "OmniSupport Solutions",
    type: "Charge",
    billingFrequency: "Daily",
    grantsCount: 0,
    price: "$1,500.00 USD",
    grants: [],
  },
];

const EditSubscription = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const customer = DUMMY_CUSTOMER;
  const [items, setItems] = useState<QuoteLineItem[]>(DUMMY_ITEMS);
  const parsePrice = (s: string) => Number(String(s).replace(/[^0-9.]/g, "")) || 0;
  const PRORATION_FACTOR = 0.5;
  const addedItems = items.filter((it) => (it as any).status === "added");
  const removedItems = items.filter((it) => (it as any).status === "removed");
  const removedCount = removedItems.length;
  const netTotal = addedItems.reduce((s, it) => s + parsePrice(it.price) * PRORATION_FACTOR, 0);
  const creditedTotal = removedItems.reduce((s, it) => s + parsePrice(it.price) * PRORATION_FACTOR, 0);
  const formatCurrency = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const proratedPriceFor = (it: QuoteLineItem) => formatCurrency(parsePrice(it.price) * PRORATION_FACTOR);
  const formattedTotal = formatCurrency(netTotal);
  const formattedCredited = formatCurrency(creditedTotal);
  const nextInvoiceTotal = items.filter((it) => (it as any).status !== "removed").reduce((s, it) => s + parsePrice(it.price), 0);
  const formattedNextInvoiceTotal = formatCurrency(nextInvoiceTotal);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<"invoice" | "credit">("invoice");
  const [previewMode, setPreviewMode] = useState<"topbar" | "rightRail">("topbar");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const sourceItems = addedItems;
  const ppDefaults = getAnyPricePointProration();
  const siteDefaults = getSite();
  const defaultInvoice = ppDefaults.invoice ?? siteDefaults.invoice ?? PRORATION_INVOICE_OPTIONS[0];
  const rawCredit = ppDefaults.credit ?? siteDefaults.credit;
  const defaultCredit = rawCredit && PRORATION_CREDIT_OPTIONS.includes(rawCredit) ? rawCredit : PRORATION_CREDIT_OPTIONS[0];

  const breakdownPayload = {
    amount: formattedTotal,
    addedAt: today,
    items: sourceItems.map((it) => ({
      name: it.name,
      qty: 1,
      listUnitPrice: it.price,
      proration: it.proration ?? defaultInvoice,
      netAmount: proratedPriceFor(it),
      grants: (it as any).grants ?? [],
      billingFrequency: (it as any).billingFrequency,
    })),
    creditedAmount: formattedCredited,
    creditedItems: removedItems.map((it) => {
      const p = it.proration;
      const credit = p && PRORATION_CREDIT_OPTIONS.includes(p) ? p : defaultCredit;
      return {
        name: it.name,
        qty: 1,
        listUnitPrice: it.price,
        proration: credit,
        netAmount: proratedPriceFor(it),
      };
    }),
  };
  const breakdownDataParam = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(breakdownPayload)))));
  const breakdownHref = `/subscriptions/${id}/charge-breakdown?data=${breakdownDataParam}`;

  useEffect(() => {
    try {
      localStorage.setItem(`chargeBreakdown:${id}`, JSON.stringify(breakdownPayload));
    } catch {}
  }, [id, breakdownDataParam]);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="text-foreground/70 transition-colors hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <h1 className="text-base font-semibold text-foreground">Edit subscription</h1>
        </div>
        <button
          onClick={() => setConfirmOpen(true)}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm"
        >
          Update
        </button>
      </header>
      <div className="flex items-center gap-2 border-b border-border bg-card px-6 py-2.5">
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] text-foreground shadow-sm">
          <Contact className="h-3.5 w-3.5 text-muted-foreground" />
          {customer.name}
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] text-foreground shadow-sm">
          <Hash className="h-3.5 w-3.5 text-muted-foreground" />
          {id}
        </div>
        {previewMode === "topbar" && (
        <div className="ml-auto relative">
          <button
            type="button"
            onClick={() => setPreviewOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-md border border-[hsl(217_92%_85%)] bg-[hsl(217_100%_97%)] px-2.5 py-1 text-[12px] text-foreground shadow-sm hover:bg-[hsl(217_100%_95%)]"
            aria-expanded={previewOpen}
          >
            <Receipt className="h-3.5 w-3.5 text-[hsl(var(--link))]" />
            <span>
              {customer.name} will be charged{" "}
              <span className="font-semibold">{formattedTotal}</span> immediately
            </span>
            {previewOpen ? (
              <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
          {previewOpen && (
            <div className="absolute right-0 top-[calc(100%+6px)] z-20 w-[320px] rounded-md border border-border bg-card p-3 text-[12px] shadow-md">
              <div className="mb-2 font-semibold text-foreground">Charge preview for {customer.name}</div>
              <ul className="mb-3 space-y-1.5 text-muted-foreground list-disc pl-4">
                <li>
                  <span className="font-semibold text-foreground">{formattedTotal}</span> will be charged immediately
                </li>
                {removedCount > 0 && (
                  <li>
                    <span className="font-semibold text-foreground">{formattedCredited}</span> will be credited
                  </li>
                )}
              </ul>
              <div className="flex items-center gap-4 text-[12px]">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewDoc("invoice");
                    setInvoiceModalOpen(true);
                    setPreviewOpen(false);
                  }}
                  className="font-medium text-[hsl(var(--link))] hover:underline"
                >
                  Preview charges
                </button>
                <span aria-hidden className="h-3.5 w-px bg-border" />
                <a
                  href={`${breakdownHref}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-medium text-[hsl(var(--link))] hover:underline"
                >
                  View breakdown
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
              <div className="mt-3 border-t border-border pt-2.5">
                <p className="flex items-start gap-1 text-[11px] text-muted-foreground">
                  <Info className="h-3 w-3 shrink-0 mt-[2px]" />
                  <span>
                    Next invoice for <span className="font-medium text-foreground">{formattedNextInvoiceTotal}</span> on {(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }); })()}.
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>
        )}
      </div>
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setConfirmOpen(false)}
        >
          <div
            className="w-full max-w-[760px] max-h-[90vh] flex flex-col rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-[14px] font-semibold text-foreground">Confirm subscription update</h3>
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-auto px-6 py-5 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[13px] font-semibold text-foreground">Change summary</div>
                  <a
                    href={breakdownHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--link))] hover:underline"
                  >
                    View breakdown
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex gap-2 rounded-md border border-[hsl(217_92%_85%)] bg-[hsl(217_100%_97%)] px-3 py-2.5 text-[13px]">
                  <Info className="h-4 w-4 shrink-0 mt-[2px] text-[hsl(var(--link))]" />
                  <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                    <li>
                      <span className="font-semibold text-foreground">{formattedTotal}</span> will be charged immediately
                    </li>
                    <li>
                      <span className="font-semibold text-foreground">{removedCount > 0 ? formattedCredited : "$0.00"}</span> will be credited
                    </li>
                  </ul>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-emerald-200 bg-emerald-50/40 overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                    <Plus className="h-3 w-3" />
                    Added ({addedItems.length})
                  </div>
                  <div className="px-3 py-2 text-[13px] text-foreground">
                    {addedItems.length > 0 ? (
                      <ul className="space-y-1">
                        {addedItems.map((it, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-emerald-600 shrink-0" />
                            <span>{it.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
                <div className="rounded-md border border-rose-200 bg-rose-50/40 overflow-hidden">
                  <div className="flex items-center gap-1.5 border-b border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-rose-700">
                    <Minus className="h-3 w-3" />
                    Removed ({removedItems.length})
                  </div>
                  <div className="px-3 py-2 text-[13px] text-foreground">
                    {removedItems.length > 0 ? (
                      <ul className="space-y-1">
                        {removedItems.map((it, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="h-1 w-1 rounded-full bg-rose-600 shrink-0" />
                            <span>{it.name}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1 border-b border-border">
                  <button
                    type="button"
                    onClick={() => setPreviewDoc("invoice")}
                    className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${previewDoc === "invoice" ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:bg-[hsl(var(--link))]" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Invoice
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDoc("credit")}
                    disabled={removedCount === 0}
                    className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${previewDoc === "credit" ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:bg-[hsl(var(--link))]" : "text-muted-foreground hover:text-foreground"} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Credit note
                  </button>
                </div>
                <div className="border border-border border-t-0 rounded-b-md p-4 bg-card">
                  {previewDoc === "invoice" ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-semibold text-foreground">Invoice</div>
                        <div className="text-[11px] text-muted-foreground">DRAFT · {today}</div>
                      </div>
                      <div className="border border-border rounded-md overflow-hidden">
                        <div className="grid grid-cols-[1fr_120px] bg-[hsl(var(--table-header-bg))] px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                          <div>Item</div>
                          <div className="text-right">Amount</div>
                        </div>
                        {addedItems.map((it, i) => (
                          <div key={i} className="grid grid-cols-[1fr_120px] px-3 py-2 text-[13px] text-foreground border-t border-border">
                            <div>
                              <div className="font-medium">{it.name}</div>
                              <div className="text-[11px] text-muted-foreground">{it.type} · {it.billingFrequency} · Prorated</div>
                            </div>
                            <div className="text-right">{proratedPriceFor(it)}</div>
                          </div>
                        ))}
                        {addedItems.length === 0 && (
                          <div className="px-3 py-4 text-center text-[12px] text-muted-foreground border-t border-border">No newly added items.</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-foreground">
                        <span>Total due</span>
                        <span>{formattedTotal}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="text-[14px] font-semibold text-foreground">Credit note</div>
                        <div className="text-[11px] text-muted-foreground">DRAFT · {today}</div>
                      </div>
                      <div className="border border-border rounded-md overflow-hidden">
                        <div className="grid grid-cols-[1fr_120px] bg-[hsl(var(--table-header-bg))] px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                          <div>Item</div>
                          <div className="text-right">Amount</div>
                        </div>
                        {removedItems.map((it, i) => (
                          <div key={i} className="grid grid-cols-[1fr_120px] px-3 py-2 text-[13px] text-foreground border-t border-border">
                            <div>
                              <div className="font-medium">{it.name}</div>
                              <div className="text-[11px] text-muted-foreground">{it.type} · {it.billingFrequency} · Prorated</div>
                            </div>
                            <div className="text-right">{proratedPriceFor(it)}</div>
                          </div>
                        ))}
                        {removedItems.length === 0 && (
                          <div className="px-3 py-4 text-center text-[12px] text-muted-foreground border-t border-border">No credited items.</div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[13px] font-semibold text-foreground">
                        <span>Total credited</span>
                        <span>{formattedCredited}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
              <button
                type="button"
                onClick={() => setConfirmOpen(false)}
                disabled={updating}
                className="inline-flex h-9 items-center rounded-md border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:pointer-events-none"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => {
                  setUpdating(true);
                  const finalItems = items.filter((it) => (it as any).status !== "removed");
                  try {
                    localStorage.setItem(`subscriptionItems:${id}`, JSON.stringify(finalItems));
                  } catch {}
                  setTimeout(() => {
                    setUpdating(false);
                    setConfirmOpen(false);
                    navigate(`/subscriptions/${id}`);
                  }, 1500);
                }}
                className="inline-flex h-9 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm disabled:opacity-80 disabled:pointer-events-none"
              >
                {updating && (
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
                {updating ? "Updating subscription" : "Confirm update"}
              </button>
            </div>
          </div>
        </div>
      )}
      {invoiceModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setInvoiceModalOpen(false)}
        >
          <div
            className="w-full max-w-[640px] max-h-[90vh] overflow-auto rounded-lg bg-card shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <h3 className="text-[14px] font-semibold text-foreground">Charges preview</h3>
              <button
                type="button"
                onClick={() => setInvoiceModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center gap-1 border-b border-border px-5 pt-2">
              <button
                type="button"
                onClick={() => setPreviewDoc("invoice")}
                className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${previewDoc === "invoice" ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:bg-[hsl(var(--link))]" : "text-muted-foreground hover:text-foreground"}`}
              >
                Invoice
              </button>
              <button
                type="button"
                onClick={() => setPreviewDoc("credit")}
                disabled={removedCount === 0}
                className={`relative px-3 py-2 text-[13px] font-medium transition-colors ${previewDoc === "credit" ? "text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-[2px] after:bg-[hsl(var(--link))]" : "text-muted-foreground hover:text-foreground"} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                Credit note
              </button>
            </div>
            {previewDoc === "invoice" && (
            <div className="px-6 py-6 space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[18px] font-semibold text-foreground">Invoice</div>
                  <div className="text-[12px] text-muted-foreground mt-0.5">DRAFT · {today}</div>
                </div>
                <div className="text-right text-[12px] text-muted-foreground">
                  <div className="font-semibold text-foreground">OmniSupport Solutions</div>
                  <div>billing@omnisupport.com</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-[12px]">
                <div>
                  <div className="text-muted-foreground mb-1">Billed to</div>
                  <div className="font-semibold text-foreground">{customer.name}</div>
                  <div className="text-muted-foreground">{customer.email}</div>
                </div>
                <div>
                  <div className="text-muted-foreground mb-1">Subscription</div>
                  <div className="font-semibold text-foreground">{id}</div>
                  <div className="text-muted-foreground">Charged immediately</div>
                </div>
              </div>

              <div className="border border-border rounded-md overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_120px] bg-[hsl(var(--table-header-bg))] px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                  <div>Item</div>
                  <div className="text-right">Qty</div>
                  <div className="text-right">Amount</div>
                </div>
                {items.filter((it) => (it as any).status === "added").map((it, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-[1fr_80px_120px] px-3 py-2.5 text-[13px] text-foreground border-t border-border"
                  >
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">{it.type} · {it.billingFrequency} · Prorated</div>
                    </div>
                    <div className="text-right">1</div>
                    <div className="text-right">{proratedPriceFor(it)}</div>
                  </div>
                ))}
                {items.filter((it) => (it as any).status === "added").length === 0 && (
                  <div className="px-3 py-6 text-center text-[12px] text-muted-foreground border-t border-border">
                    No newly added items.
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <div className="w-[240px] space-y-1.5 text-[13px]">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formattedTotal}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-1.5 text-foreground font-semibold">
                    <span>Total due</span>
                    <span>{formattedTotal}</span>
                  </div>
                  <div className="pt-1">
                    <a
                      href={breakdownHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--link))] hover:underline"
                    >
                      View breakdown
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
            )}

            {previewDoc === "credit" && removedCount > 0 && (
              <div className="px-6 py-6 space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-foreground">Credit note</div>
                    <div className="text-[12px] text-muted-foreground mt-0.5">DRAFT · {today}</div>
                  </div>
                  <div className="text-right text-[12px] text-muted-foreground">
                    <div className="font-semibold text-foreground">OmniSupport Solutions</div>
                    <div>billing@omnisupport.com</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[12px]">
                  <div>
                    <div className="text-muted-foreground mb-1">Credited to</div>
                    <div className="font-semibold text-foreground">{customer.name}</div>
                    <div className="text-muted-foreground">{customer.email}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Reason</div>
                    <div className="font-semibold text-foreground">Subscription change</div>
                    <div className="text-muted-foreground">Prorated for unused time</div>
                  </div>
                </div>

                <div className="border border-border rounded-md overflow-hidden">
                  <div className="grid grid-cols-[1fr_80px_120px] bg-[hsl(var(--table-header-bg))] px-3 py-2 text-[11px] font-semibold uppercase text-muted-foreground">
                    <div>Item</div>
                    <div className="text-right">Qty</div>
                    <div className="text-right">Amount</div>
                  </div>
                  {items.filter((it) => (it as any).status === "removed").map((it, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-[1fr_80px_120px] px-3 py-2.5 text-[13px] text-foreground border-t border-border"
                    >
                      <div>
                        <div className="font-medium">{it.name}</div>
                        <div className="text-[11px] text-muted-foreground">{it.type} · {it.billingFrequency} · Prorated</div>
                      </div>
                      <div className="text-right">1</div>
                      <div className="text-right">{proratedPriceFor(it)}</div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <div className="w-[240px] space-y-1.5 text-[13px]">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formattedCredited}</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-1.5 text-foreground font-semibold">
                      <span>Total credited</span>
                      <span>{formattedCredited}</span>
                    </div>
                    <div className="pt-1">
                      <a
                        href={breakdownHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[12px] font-medium text-[hsl(var(--link))] hover:underline"
                      >
                        View breakdown
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <main className="flex items-start gap-6 px-8 py-8">
        <div className="flex-1 min-w-0 space-y-6">
          <ProductsAndPricing items={items} onItemsChange={setItems} customerName={customer.name} />
          <BillingInfo />
          <InvoicingOptions />
          <ShippingAddress />
        </div>
        {previewMode === "rightRail" && (
          <aside className="w-[340px] shrink-0 sticky top-6">
            <div className="rounded-md border border-border bg-card shadow-sm overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-border bg-[hsl(217_100%_97%)] px-3 py-2 text-[12px] font-semibold text-foreground">
                <Receipt className="h-3.5 w-3.5 text-[hsl(var(--link))]" />
                Charge preview
              </div>
              <div className="px-3 py-3 text-[12px]">
                <div className="mb-2 text-muted-foreground">For {customer.name}</div>
                <ul className="mb-3 space-y-1.5 text-muted-foreground list-disc pl-4">
                  <li>
                    <span className="font-semibold text-foreground">{formattedTotal}</span> will be charged immediately
                  </li>
                  {removedCount > 0 && (
                    <li>
                      <span className="font-semibold text-foreground">{formattedCredited}</span> will be credited
                    </li>
                  )}
                </ul>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => { setPreviewDoc("invoice"); setInvoiceModalOpen(true); }}
                    className="font-medium text-[hsl(var(--link))] hover:underline"
                  >
                    Preview charges
                  </button>
                  <span aria-hidden className="h-3.5 w-px bg-border" />
                  <a href={`${breakdownHref}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-[hsl(var(--link))] hover:underline">
                    View breakdown
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="mt-3 border-t border-border pt-2.5">
                  <p className="flex items-start gap-1 text-[11px] text-muted-foreground">
                    <Info className="h-3 w-3 shrink-0 mt-[2px]" />
                    <span>
                      Next invoice for <span className="font-medium text-foreground">{formattedNextInvoiceTotal}</span> on {(() => { const d = new Date(); d.setMonth(d.getMonth() + 1); return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }); })()}.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </main>

      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-[12px] shadow-md">
        <label htmlFor="preview-mode" className="text-muted-foreground">Preview:</label>
        <select
          id="preview-mode"
          value={previewMode}
          onChange={(e) => setPreviewMode(e.target.value as "topbar" | "rightRail")}
          className="rounded border border-border bg-card px-2 py-1 text-[12px] font-medium text-foreground hover:bg-accent focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="topbar">Option 1 — Top bar</option>
          <option value="rightRail">Option 2 — Right rail</option>
        </select>
      </div>
    </div>
  );
};

export default EditSubscription;
