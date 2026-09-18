import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Pencil,
  ExternalLink,
  Info,
  Clock,
  Play,
} from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";
import type { QuoteLineItem } from "@/components/dashboard/AddItemDrawer";

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-md border border-border bg-card ${className}`}>{children}</div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[12px] font-medium text-foreground">{children}</div>;
}

function RightLink({ children, withIcon = false, muted = false, onClick }: { children: React.ReactNode; withIcon?: boolean; muted?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={`flex w-full items-center gap-1 py-1 text-left text-[12px] hover:underline ${muted ? "text-muted-foreground/70" : "text-foreground/85"}`}>
      <span>{children}</span>
      {withIcon && (
        <span className="inline-flex h-3 w-3 items-center justify-center rounded-sm bg-sky-100 text-sky-600">
          <Play className="h-2 w-2 fill-current" />
        </span>
      )}
    </button>
  );
}

function RightGroup({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="mb-4">
      <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
        {title}
        {badge && (
          <span className="rounded bg-foreground px-1 py-0.5 text-[8px] font-bold uppercase text-white">{badge}</span>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}


const TABS = [
  "Summary",
  "Subscription info",
  "Usage Summary",
  "Ramps",
  "Subscription Co...",
  "Tax Details",
  "Address",
  "Payment Metho...",
  "Unbilled Charges",
  "Invoice Note",
  "Entitlements",
  "History",
  "Comments",
  "Activity Log",
];

export default function SubscriptionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const subId = id ?? "AzgaULVEC1dGS174";

  const [storedItems, setStoredItems] = useState<QuoteLineItem[] | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`subscriptionItems:${id}`);
      if (raw) setStoredItems(JSON.parse(raw));
    } catch {}
  }, [id]);

  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Test mode banner */}
        <div className="bg-[#ffd84d] py-1 text-center text-[11px] font-medium text-foreground">
          Test site — Safe to simulate and experiment
        </div>

        {/* Breadcrumb */}
        <div className="border-b border-border bg-card px-6 py-2">
          <div className="text-[12px]">
            <Link to="/subscriptions" className="text-sky-600 hover:underline">
              Subscriptions
            </Link>
            <span className="mx-1 text-muted-foreground">/</span>
            <Link to="#" className="text-sky-600 hover:underline">
              SampleMFACustomer
            </Link>
          </div>
        </div>

        <div className="flex min-w-0 flex-1">
          {/* Left tab nav */}
          <aside className="w-[180px] shrink-0 bg-[#f5f6f8] pt-5">
            <nav className="flex flex-col px-3">
              {TABS.map((t, i) => (
                <button
                  key={t}
                  className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] hover:bg-muted ${
                    i === 0 ? "bg-card font-medium text-sky-700 shadow-sm ring-1 ring-border" : "text-foreground/80"
                  }`}
                >
                  <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
                  {t}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="min-w-0 flex-1 px-6 py-5">
            {/* Header card */}
            <Card className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-base font-semibold text-foreground">Sample GA</h1>
                  <div className="mt-0.5 text-[12px] text-muted-foreground">INR, Monthly</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> ACTIVE
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-foreground/80">Channel Web</span>
                <span className="rounded bg-muted px-2 py-0.5 text-foreground/80">lovable-plans</span>
                <span className="rounded bg-muted px-2 py-0.5 text-foreground/80">Subscription ID {subId}</span>
                <span className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-foreground/80">
                  <span className="text-sm">🇮🇳</span> INR
                </span>
                <span className="rounded bg-muted px-2 py-0.5 text-foreground/80">Billed Monthly</span>
              </div>

              <div className="mt-4 rounded border border-dashed border-border p-3 text-[12px]">
                <div className="font-medium text-foreground">Summary</div>
                <div className="mt-1 text-muted-foreground">Total MRR ₹200.00 INR</div>
                <div className="text-muted-foreground">Upcoming invoice of ₹200.00 INR will be raised on 18-May-2026 00:00</div>
              </div>
            </Card>

            {/* Items */}
            <Card className="mt-4">
              <div className="flex items-center justify-between border-b border-border px-4 py-2.5 text-[12px]">
                <div className="font-semibold text-foreground">Items ({storedItems ? storedItems.length : 2})</div>
                <div className="inline-flex items-center gap-1 font-medium text-foreground">
                  Amount <Info className="h-3 w-3 text-muted-foreground" />
                </div>
              </div>
              {storedItems ? (
                <div className="px-4 py-3 space-y-4">
                  {(["Plan", "Addon", "Charge"] as const).map((group) => {
                    const rows = storedItems.filter((it) => it.type === group);
                    if (rows.length === 0) return null;
                    const label = group === "Plan" ? "Plans" : group === "Addon" ? "Addons" : "Charges";
                    return (
                      <div key={group}>
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
                        {rows.map((it, i) => (
                          <div key={i} className="mt-2 flex items-start justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                            <div>
                              <button className="text-[13px] font-medium text-sky-600 hover:underline">{it.name}</button>
                              <div className="mt-1 text-[11px] text-muted-foreground">• Billed {String(it.billingFrequency).toLowerCase()}</div>
                            </div>
                            <div className="text-[13px] tabular-nums text-foreground">{it.price}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="px-4 py-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Plans</div>
                  <div className="mt-2 flex items-start justify-between border-b border-border pb-3">
                    <div>
                      <button className="text-[13px] font-medium text-sky-600 hover:underline">Sample GA INR Monthly</button>
                      <div className="mt-1 text-[11px] text-muted-foreground">• Billed monthly</div>
                    </div>
                    <div className="text-[13px] tabular-nums text-foreground">₹100.00 INR</div>
                  </div>
                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Addons</div>
                  <div className="mt-2 flex items-start justify-between">
                    <div>
                      <button className="text-[13px] font-medium text-sky-600 hover:underline">SampleGAreadinessNon-metered INR Monthly</button>
                      <div className="mt-1 text-[11px] text-muted-foreground">• Billed monthly</div>
                    </div>
                    <div className="text-[13px] tabular-nums text-foreground">₹100.00 INR</div>
                  </div>
                </div>
              )}
              <div className="border-t border-border px-4 py-2 text-[11px] text-muted-foreground">Amount does not include discounts.</div>
            </Card>

            {/* Usage Summary */}
            <div className="mt-5">
              <SectionLabel>Usage Summary</SectionLabel>
              <Card>
                <table className="w-full text-[12px]">
                  <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Feature</th>
                      <th className="px-4 py-2 text-left font-medium">Included usage balance</th>
                      <th className="px-4 py-2 text-left font-medium">On-demand usage</th>
                      <th className="px-4 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3"><button className="text-sky-600 hover:underline">Credit Usage</button></td>
                      <td className="px-4 py-3 text-foreground">100 <span className="text-muted-foreground">credit available</span></td>
                      <td className="px-4 py-3 text-muted-foreground">—</td>
                      <td className="px-4 py-3 text-right"><ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" /></td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Ramps */}
            <div className="mt-5">
              <SectionLabel>Ramps</SectionLabel>
              <Card className="px-4 py-6">
                <div className="flex flex-col items-center justify-center gap-2">
                  <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-[12px] font-medium text-sky-600 hover:bg-muted">
                    <Pencil className="h-3.5 w-3.5" /> Create Ramp
                  </button>
                  <p className="text-[11px] text-muted-foreground">
                    Set up changes to a subscription based on product and pricing updates.{" "}
                    <a className="inline-flex items-center gap-0.5 text-sky-600 hover:underline" href="#">
                      <ExternalLink className="h-3 w-3" /> Learn more
                    </a>
                  </p>
                </div>
              </Card>
            </div>

            {/* Subscription Configurations */}
            <div className="mt-5">
              <SectionLabel>Subscription Configurations</SectionLabel>
              <Card className="divide-y divide-border">
                <div className="flex items-start justify-between px-4 py-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">Auto collection</div>
                    <div className="text-[13px] text-foreground">Off</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-bold uppercase text-sky-700 ring-1 ring-inset ring-sky-200">Overridden</span>
                    <button className="text-[12px] text-sky-600 hover:underline">Change</button>
                  </div>
                </div>
                <div className="flex items-start justify-between px-4 py-3">
                  <div>
                    <div className="text-[11px] text-muted-foreground">JSON Metadata</div>
                    <div className="text-[13px] text-foreground">No JSON Meta configured</div>
                    <div className="text-[11px] text-muted-foreground">Additional information about this subscription in JSON format.</div>
                  </div>
                  <button className="text-[12px] text-sky-600 hover:underline">Add</button>
                </div>
                <div className="px-4 py-3">
                  <div className="text-[11px] text-muted-foreground">Closure of invoices</div>
                  <div className="text-[13px] text-foreground">Manual</div>
                </div>
              </Card>
            </div>

            {/* Tax Details */}
            <div className="mt-5">
              <SectionLabel>Tax Details</SectionLabel>
              <Card className="px-4 py-3">
                <div className="text-[11px] text-muted-foreground">Exempt From Tax</div>
                <div className="text-[13px] text-foreground">No</div>
              </Card>
            </div>

            {/* Billing Address */}
            <div className="mt-5">
              <SectionLabel>Billing Address</SectionLabel>
              <Card className="divide-y divide-border">
                <div className="px-4 py-2.5 text-[12px]">
                  <a className="text-sky-600 hover:underline" href="#">Add billing address</a>
                  <span className="text-muted-foreground"> to be used for all billing communication.</span>
                </div>
                <div className="px-4 py-2.5 text-[12px]">
                  <a className="text-sky-600 hover:underline" href="#">Add shipping address</a>
                  <span className="text-muted-foreground"> to which you'd like to ship products.</span>
                </div>
              </Card>
            </div>

            {/* Payment Methods */}
            <div className="mt-5">
              <SectionLabel>Payment Methods</SectionLabel>
              <Card className="px-4 py-2.5 text-[12px]">
                <a className="text-sky-600 hover:underline" href="#">Add Card</a>
                <span className="text-muted-foreground"> for this customer to collect payments.</span>
              </Card>
            </div>

            {/* Unbilled Charges */}
            <div className="mt-5">
              <SectionLabel>Unbilled Charges</SectionLabel>
              <Card className="px-4 py-2.5 text-[12px] text-muted-foreground">
                No unbilled charges found for this customer.{" "}
                <a className="inline-flex items-center gap-0.5 text-sky-600 hover:underline" href="#">
                  <ExternalLink className="h-3 w-3" /> Learn more
                </a>
              </Card>
            </div>

            {/* Invoice Note */}
            <div className="mt-5">
              <SectionLabel>Invoice Note</SectionLabel>
              <Card className="px-4 py-2.5 text-[12px]">
                <a className="text-sky-600 hover:underline" href="#">Add subscription invoice note</a>
                <span className="text-muted-foreground"> to display personalized information on invoices of this subscription.{" "}</span>
                <a className="inline-flex items-center gap-0.5 text-sky-600 hover:underline" href="#">
                  <ExternalLink className="h-3 w-3" /> Learn more
                </a>
              </Card>
            </div>

            {/* Entitlements */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[12px] font-medium text-foreground">Entitlements</div>
                <button className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-[12px] font-medium text-sky-600 hover:bg-muted">
                  <Pencil className="h-3 w-3" /> Edit
                </button>
              </div>
              <Card>
                <div className="flex items-center gap-4 border-b border-border px-4 text-[12px]">
                  {["All", "Plan", "Plan Prices", "Addons", "Addon Prices", "More"].map((t, i) => (
                    <button key={t} className={`relative py-2 ${i === 0 ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                      {t}{i === 5 && <ChevronDown className="ml-0.5 inline h-3 w-3" />}
                      {i === 0 && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-sky-600" />}
                    </button>
                  ))}
                </div>
                <div className="flex items-start gap-2 bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <p>This card includes draft features while the corresponding API operation lists only active and archived features. Entitlements to draft features will come into effect and will be included in the API result when the feature is activated.</p>
                </div>
                <table className="w-full text-[12px]">
                  <thead className="bg-muted/40 text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Features</th>
                      <th className="px-4 py-2 text-left font-medium">Entitlements</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-border">
                      <td className="px-4 py-3"><button className="inline-flex items-center gap-1 text-sky-600 hover:underline">Credit Usage <ExternalLink className="h-3 w-3" /></button></td>
                      <td className="px-4 py-3 text-foreground">100 credits</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          Active <ChevronDown className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Card>
            </div>

            {/* History */}
            <div className="mt-5">
              <SectionLabel>History</SectionLabel>
              <Card>
                <div className="flex items-center gap-4 border-b border-border px-4 text-[12px]">
                  {["Invoices", "Events", "Quotes", "Credit Notes", "Email Logs", "More"].map((t, i) => (
                    <button key={t} className={`relative py-2 ${i === 0 ? "font-semibold text-sky-700" : "text-muted-foreground"}`}>
                      {t}{i === 5 && <ChevronDown className="ml-0.5 inline h-3 w-3" />}
                      {i === 0 && <span className="absolute -bottom-px left-0 right-0 h-[2px] bg-sky-600" />}
                    </button>
                  ))}
                </div>
                <table className="w-full text-[12px]">
                  <thead className="bg-muted/30 text-[11px] text-muted-foreground">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">ID</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Type</th>
                      <th className="px-4 py-2 text-left font-medium">Created On</th>
                      <th className="px-4 py-2 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "61", date: "18-Apr-2026 00:00" },
                      { id: "58", date: "18-Mar-2026 00:00" },
                    ].map((r) => (
                      <tr key={r.id} className="border-t border-border">
                        <td className="px-4 py-2.5"><button className="text-sky-600 hover:underline">{r.id}</button></td>
                        <td className="px-4 py-2.5"><span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700 ring-1 ring-inset ring-rose-200">PAYMENT_DUE</span></td>
                        <td className="px-4 py-2.5 text-foreground">Recurring</td>
                        <td className="px-4 py-2.5 text-foreground">{r.date}</td>
                        <td className="px-4 py-2.5 text-right tabular-nums text-foreground">₹200.00 INR</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Comments */}
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[12px] font-medium text-foreground">Comments</div>
                <button className="inline-flex items-center gap-1 text-[12px] text-sky-600 hover:underline">
                  <Plus className="h-3 w-3" /> Add Attachment
                </button>
              </div>
              <Card className="flex items-center gap-2 p-2">
                <input
                  placeholder="Write a comment..."
                  className="min-w-0 flex-1 bg-transparent px-2 py-1 text-[12px] outline-none placeholder:text-muted-foreground"
                />
                <button className="rounded-md bg-muted px-3 py-1 text-[12px] font-medium text-muted-foreground">Comment</button>
              </Card>
            </div>

            {/* Activity Log */}
            <div className="mt-5">
              <SectionLabel>Activity Log</SectionLabel>
              <Card className="divide-y divide-border">
                <div className="px-4 py-3">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-foreground/80">Via Scheduled Activity</span>
                  <div className="mt-2 flex items-start justify-between">
                    <div className="text-[12px]">
                      <div className="text-foreground">• <button className="text-sky-600 hover:underline">Subscription</button> modified.</div>
                      <button className="mt-1 text-[11px] text-sky-600 hover:underline">Show More</button>
                    </div>
                    <div className="flex items-center gap-3 text-[11px]">
                      <div className="text-foreground">18-Apr-2026 00:00</div>
                      <button className="text-sky-600 hover:underline">View details</button>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-bold uppercase text-foreground/80">Via Chargebee Interface</span>
                  <div className="mt-2 flex items-start justify-between">
                    <div className="text-[12px]">
                      <div className="text-foreground">Active <button className="text-sky-600 hover:underline">subscription</button> created for Sample-GA-INR-Monthly plan.</div>
                      <button className="mt-1 text-[11px] text-sky-600 hover:underline">Show More</button>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-[11px]">
                      <div className="text-foreground">18-Mar-2026 14:18</div>
                      <div className="text-muted-foreground">aishwarya.nemi@chargebee.com</div>
                      <button className="text-sky-600 hover:underline">View details</button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </main>

          {/* Right action panel */}
          <aside className="w-[240px] shrink-0 bg-[#f5f6f8] px-5 py-5">
            <RightGroup title="Subscription Actions">
              <RightLink withIcon onClick={() => navigate(`/subscriptions/${id}/edit`)}>Edit Subscription</RightLink>
              <RightLink>Change Customer Details</RightLink>
              <RightLink>Create Ramps</RightLink>
              <RightLink withIcon>Cancel Subscription</RightLink>
            </RightGroup>
            <RightGroup title="Quotes and Discounts">
              <RightLink>Create and Send a Quote</RightLink>
              <RightLink>Add Coupon</RightLink>
              <RightLink>Add Manual Discount</RightLink>
            </RightGroup>
            <RightGroup title="Billing Actions">
              <RightLink withIcon>Add One-Time Charges and Quick Charges</RightLink>
              <RightLink>Add Charge</RightLink>
              <RightLink>Create Quick Charge</RightLink>
              <button className="flex w-full items-center gap-1 py-1 text-left text-[12px] text-muted-foreground/60">
                <span>Request Payment Method Update</span>
                <Info className="h-3 w-3" />
              </button>
              <RightLink>Bill and Invoice for Future Renewals</RightLink>
              <RightLink>Edit Next Billing Date</RightLink>
            </RightGroup>
            <RightGroup title="Alerts" badge="New">
              <RightLink>Create Alert</RightLink>
              <RightLink>Manage Alerts</RightLink>
            </RightGroup>
            <div className="mb-4">
              <button className="text-[12px] font-medium text-rose-600 hover:underline">Delete Subscription</button>
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold text-foreground">
                <Clock className="h-3.5 w-3.5" /> Timeline
              </div>
              <ul className="space-y-1.5 text-[11px]">
                {[
                  ["Created on", "18-Mar-2026 14:18"],
                  ["Started on", "18-Mar-2026 00:00"],
                  ["Active on", "18-Mar-2026 00:00"],
                  ["Next billing on", "18-May-2026 00:00"],
                  ["Next renewal on", "18-May-2026 00:00"],
                ].map(([k, v]) => (
                  <li key={k} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-foreground" />
                    <span className="text-foreground">{k} <span className="ml-1 text-foreground/70">{v}</span></span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

