import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Hash, Contact, Share2, Download, Flag, CalendarCheck, PlayCircle, Gauge } from "lucide-react";

const CREDIT_KEYWORDS = ["credit", "token", "point"];
const METERED_KEYWORDS = ["gb", "tb", "mb", "api", "calls", "events", "emails", "seat", "seats", "bandwidth", "hours", "webhooks", "envs", "sandbox"];
const UNIT_TOKENS = ["GB", "TB", "MB", "KB", "calls", "events", "emails", "seats", "seat", "hours", "hour", "webhooks", "envs", "requests", "users", "credits", "tokens", "points"];

type ParsedGrant = {
  feature: string;
  amount: string;
  unit: string;
  kind: "Credit" | "Metered feature" | "Non-metered feature";
};

const parseGrantString = (raw: string): ParsedGrant => {
  // strip frequency suffix like "/mo"
  const noFreq = raw.replace(/\s*\/(mo|month|monthly|yr|year|yearly|day|daily|wk|week)\b/i, "");
  const m = noFreq.match(/^([\d,.]+(?:\s*[KMB])?)\s+(.*)$/i);
  let amount = "";
  let feature = noFreq;
  let unit = "";
  if (m) {
    amount = m[1].trim();
    feature = m[2].trim();
    // extract leading unit token from feature
    const parts = feature.split(/\s+/);
    const first = parts[0];
    const matchUnit = UNIT_TOKENS.find((u) => u.toLowerCase() === first.toLowerCase());
    if (matchUnit) {
      unit = first;
      feature = parts.slice(1).join(" ") || first;
    }
  }
  const lower = raw.toLowerCase();
  let kind: ParsedGrant["kind"] = "Non-metered feature";
  if (CREDIT_KEYWORDS.some((k) => lower.includes(k))) kind = "Credit";
  else if (amount && METERED_KEYWORDS.some((k) => lower.includes(k))) kind = "Metered feature";
  else if (amount) kind = "Metered feature";
  // capitalize feature
  const cleanFeature = (feature || raw).replace(/^\w/, (c) => c.toUpperCase());
  return { feature: cleanFeature, amount: amount || "—", unit, kind };
};


const DUMMY_CUSTOMER = { name: "Acme Corp", email: "billing@acme.com" };

type BreakdownItem = {
  name: string;
  qty: number;
  listUnitPrice: string;
  proration: string;
  netAmount: string;
  grants?: string[];
  billingFrequency?: string;
};

type BreakdownPayload = {
  amount?: string;
  addedAt?: string;
  items?: BreakdownItem[];
  creditedAmount?: string;
  creditedItems?: BreakdownItem[];
};

const ChargeBreakdown = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const decodeData = (param: string | null): BreakdownPayload => {
    if (!param) return {};
    try { return JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(param))))); } catch { return {}; }
  };
  const readStorage = (): BreakdownPayload => {
    try { return JSON.parse(localStorage.getItem(`chargeBreakdown:${id}`) || "{}"); } catch { return {}; }
  };
  const initial: BreakdownPayload = (() => {
    const fromStorage = readStorage();
    if (fromStorage.items) return fromStorage;
    return decodeData(searchParams.get("data"));
  })();
  const [stored, setStored] = useState<BreakdownPayload>(initial);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const sync = () => {
      const next = readStorage();
      if (next.items) setStored(next);
    };
    window.addEventListener("storage", sync);
    const interval = window.setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      window.clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1400);
    return () => window.clearTimeout(t);
  }, []);

  const amount = stored.amount ?? searchParams.get("amount") ?? "$##.##";
  const breakdownItems: BreakdownItem[] = stored.items ?? [];
  const creditedItems: BreakdownItem[] = stored.creditedItems ?? [];
  const creditedAmount = stored.creditedAmount ?? "$##.##";
  const addedOn = stored.addedAt ?? new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const customer = DUMMY_CUSTOMER;

  const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const DAYS_IN_CYCLE = 30;
  const USED_DAYS = 15;
  const REMAINING_DAYS = DAYS_IN_CYCLE - USED_DAYS;
  const todayDate = new Date();
  const startDate = new Date(todayDate);
  startDate.setDate(startDate.getDate() - USED_DAYS);
  const endDate = new Date(todayDate);
  endDate.setDate(endDate.getDate() + REMAINING_DAYS);
  const today = fmtDate(todayDate);
  const usedPct = (USED_DAYS / DAYS_IN_CYCLE) * 100;

  const parsePrice = (s: string) => parseFloat(String(s).replace(/[^0-9.\-]/g, "")) || 0;
  const fmtMoney = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;
  const computeProrated = (listUnitPrice: string, qty: number, fraction: number, sign: 1 | -1 = 1) =>
    fmtMoney(sign * parsePrice(listUnitPrice) * (qty || 1) * fraction);

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3">
        <h1 className="text-base font-semibold text-foreground">Charge breakdown</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(window.location.href)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
            Share
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Download
          </button>
        </div>
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
      </div>

      {loading ? (
        <main className="px-8 py-10">
          <div className="mx-auto max-w-[1040px] space-y-8 animate-pulse">
            <div className="rounded-lg border border-border bg-card px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-3.5 w-20 rounded bg-muted" />
                  <div className="h-3 w-14 rounded bg-muted" />
                </div>
                <div className="space-y-2 items-center flex flex-col">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-3.5 w-24 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
                <div className="space-y-2 items-end flex flex-col">
                  <div className="h-4 w-4 rounded-full bg-muted" />
                  <div className="h-3.5 w-20 rounded bg-muted" />
                  <div className="h-3 w-14 rounded bg-muted" />
                </div>
              </div>
              <div className="mt-6 h-[2px] w-full bg-muted" />
              <div className="mt-3 flex justify-between">
                <div className="h-3 w-32 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>
            </div>
            {[0, 1].map((s) => (
              <div key={s}>
                <div className="mb-3 h-4 w-72 rounded bg-muted" />
                <div className="mb-3 h-3 w-96 rounded bg-muted" />
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <div className="border-b border-border bg-muted/40 px-4 py-3">
                    <div className="h-3 w-full rounded bg-muted" />
                  </div>
                  {[0, 1, 2].map((r) => (
                    <div key={r} className="border-b border-border last:border-b-0 px-4 py-4">
                      <div className="h-3 w-full rounded bg-muted" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      ) : (
      <>
      <main className="px-8 py-10">
        <div className="mx-auto max-w-[1040px]">
          <section className="rounded-lg border border-border bg-card px-6 py-6">
            {/* Top labels */}
            <div className="relative h-[60px]">
              {/* Cycle Start */}
              <div className="absolute left-0 top-0 flex flex-col items-start">
                <PlayCircle className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                <div className="mt-1.5 text-[14px] font-medium text-foreground">Cycle Start</div>
                <div className="text-[12px] text-muted-foreground">{startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
              </div>

              {/* Intermediate labels */}
              {Array.from({ length: DAYS_IN_CYCLE + 1 }).map((_, i) => {
                if (i === 0 || i === DAYS_IN_CYCLE || i === USED_DAYS) return null;
                if (i % 5 !== 0) return null;
                const d = new Date(startDate);
                d.setDate(d.getDate() + i);
                return (
                  <div
                    key={i}
                    className="absolute bottom-0 -translate-x-1/2 text-[12px] text-muted-foreground"
                    style={{ left: `${(i / DAYS_IN_CYCLE) * 100}%` }}
                  >
                    {d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                );
              })}

              {/* Change date (today) */}
              <div className="absolute -translate-x-1/2 flex flex-col items-center" style={{ left: `${usedPct}%`, top: 0 }}>
                <Flag className="h-4 w-4 text-[hsl(var(--link))]" strokeWidth={2} />
                <div className="mt-1.5 text-[14px] font-semibold text-[hsl(var(--link))]">Change Date</div>
                <div className="text-[12px] font-medium text-[hsl(var(--link))]">
                  {todayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} (today)
                </div>
              </div>

              {/* Cycle End */}
              <div className="absolute right-0 top-0 flex flex-col items-end">
                <CalendarCheck className="h-4 w-4 text-muted-foreground" strokeWidth={1.75} />
                <div className="mt-1.5 text-[14px] font-medium text-foreground">Cycle End</div>
                <div className="text-[12px] text-muted-foreground">{endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
              </div>
            </div>

            {/* Bar — 6px gap from labels above */}
            <div className="relative h-9" style={{ marginTop: "6px" }}>
              {/* Base grey line */}
              <div className="absolute left-0 right-0 top-2 h-[2px] bg-border" />
              <div className="absolute left-0 top-2 h-[2px] bg-[hsl(var(--link))]" style={{ width: `${usedPct}%` }} />

              {/* Vertical markers for each displayed date */}
              {Array.from({ length: DAYS_IN_CYCLE + 1 }).map((_, i) => {
                if (i % 5 !== 0 && i !== USED_DAYS) return null;
                const isToday = i === USED_DAYS;
                return (
                  <div
                    key={i}
                    className={`absolute -translate-x-1/2 w-px ${isToday ? "bg-[hsl(var(--link))]/40" : "bg-border"}`}
                    style={{
                      left: `${(i / DAYS_IN_CYCLE) * 100}%`,
                      top: 0,
                      height: "8px",
                    }}
                  />
                );
              })}

              {/* Today dot on the line */}
              <div
                className="absolute top-2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-[hsl(var(--link))] ring-4 ring-card"
                style={{ left: `${usedPct}%` }}
              />

              {/* Labels below the line */}
              <div
                className="absolute left-0 top-5 flex items-center justify-center text-[12px] font-medium text-muted-foreground"
                style={{ width: `${usedPct}%` }}
              >
                Completed · {USED_DAYS}d ({Math.round(usedPct)}%)
              </div>
              <div
                className="absolute top-5 flex items-center justify-center text-[12px] font-medium text-muted-foreground"
                style={{ left: `${usedPct}%`, right: 0 }}
              >
                Remaining · {REMAINING_DAYS}d ({Math.round(100 - usedPct)}%)
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-[15px] font-semibold text-foreground">Why is the invoice amount {amount}</h2>
            <p className="mb-3 mt-1 text-[12px] text-muted-foreground">Charges for new items or item changes from effective date till end of the billing cycle</p>
            <div className="overflow-hidden rounded-lg border border-border bg-card">
              <table className="w-full text-[13px] table-fixed">
                <colgroup>
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "6%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead>
                  <tr className="border-b border-border bg-muted/40 text-left text-[12px] font-medium text-muted-foreground">
                    <th className="px-4 py-2.5">Item</th>
                    <th className="px-4 py-2.5">Qty</th>
                    <th className="px-4 py-2.5 text-right">List unit price</th>
                    <th className="px-4 py-2.5">Proration</th>
                    <th className="px-4 py-2.5">Active period</th>
                    <th className="px-4 py-2.5 text-right">Net amount</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdownItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                        No newly added items.
                      </td>
                    </tr>
                  ) : (
                    breakdownItems.map((it, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 font-medium text-foreground">{it.name}</td>
                        <td className="px-4 py-3 text-foreground">{it.qty}</td>
                        <td className="px-4 py-3 text-right text-foreground">{it.listUnitPrice}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.proration}</td>
                        <td className="px-4 py-3">
                          <div className="text-foreground">
                            {todayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {REMAINING_DAYS}/{DAYS_IN_CYCLE} days
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-foreground">{computeProrated(it.listUnitPrice, it.qty, REMAINING_DAYS / DAYS_IN_CYCLE)}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {it.listUnitPrice}{it.qty > 1 ? ` × ${it.qty}` : ""} × ({REMAINING_DAYS}/{DAYS_IN_CYCLE})
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {breakdownItems.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border bg-muted/40 text-foreground">
                      <td colSpan={5} className="px-4 py-2.5 text-right font-semibold">Net total</td>
                      <td className="px-4 py-2.5 text-right font-semibold">
                        {(() => {
                          const total = breakdownItems.reduce(
                            (sum, it) => sum + parsePrice(it.listUnitPrice) * (it.qty || 1) * (REMAINING_DAYS / DAYS_IN_CYCLE),
                            0
                          );
                          return fmtMoney(total);
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </section>

          {(() => {
            const itemsWithGrants = breakdownItems;
            if (itemsWithGrants.length === 0) return null;
            const freqLabel = (f?: string) => {
              if (!f) return "per cycle";
              const map: Record<string, string> = {
                Monthly: "per month",
                Yearly: "per year",
                Daily: "per day",
                Weekly: "per week",
                Quarterly: "per quarter",
              };
              return map[f] ?? `per ${f.toLowerCase()}`;
            };
            return (
              <section className="mt-8">
                <h2 className="text-[15px] font-semibold text-foreground">What entitlements/credits are granted</h2>
                <p className="mb-3 mt-1 text-[12px] text-muted-foreground">Entitlements and credits provisioned to the customer for the newly added items.</p>
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <table className="w-full text-[13px] table-fixed">
                    <colgroup>
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "13%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "14%" }} />
                      <col style={{ width: "14%" }} />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-left text-[12px] font-medium text-muted-foreground">
                        <th className="px-4 py-2.5">Feature/Credit</th>
                        <th className="px-4 py-2.5">Grant</th>
                        <th className="px-4 py-2.5">Grant frequency</th>
                        <th className="px-4 py-2.5">Proration</th>
                        <th className="px-4 py-2.5">Rollover</th>
                        <th className="px-4 py-2.5">Active period</th>
                        <th className="px-4 py-2.5 text-right">Current grant</th>
                      </tr>
                    </thead>
                    <tbody>
                      {itemsWithGrants.map((it, idx) => {
                        const defaultGrantsFor = (name: string): string[] => {
                          const lower = name.toLowerCase();
                          if (lower.includes("api") || lower.includes("call")) {
                            return ["10,000 API calls /mo", "50 Credits /mo", "Priority support"];
                          }
                          if (lower.includes("storage") || lower.includes("gb")) {
                            return ["500 GB Storage /mo", "100 GB Bandwidth /mo"];
                          }
                          if (lower.includes("seat") || lower.includes("user")) {
                            return ["5 seats /mo", "Advanced analytics"];
                          }
                          if (lower.includes("email")) {
                            return ["50,000 emails /mo", "Custom domain"];
                          }
                          return ["1,000 Credits /mo", "5 seats /mo", "Premium features"];
                        };
                        const grantsSource = (it.grants && it.grants.length > 0) ? it.grants : defaultGrantsFor(it.name);
                        const parsed = grantsSource.map(parseGrantString);
                        const parseAmt = (a: string) => {
                          const m = a.match(/([\d,.]+)\s*([KMB])?/i);
                          if (!m) return null;
                          const n = parseFloat(m[1].replace(/,/g, ""));
                          if (isNaN(n)) return null;
                          const mult = m[2]?.toUpperCase() === "K" ? 1e3 : m[2]?.toUpperCase() === "M" ? 1e6 : m[2]?.toUpperCase() === "B" ? 1e9 : 1;
                          return { n: n * mult, suffix: m[2]?.toUpperCase() ?? "" };
                        };
                        const fmtAmt = (n: number, suffix: string) => {
                          const div = suffix === "K" ? 1e3 : suffix === "M" ? 1e6 : suffix === "B" ? 1e9 : 1;
                          const v = n / div;
                          const s = v >= 100 ? Math.round(v).toString() : v.toFixed(v < 10 ? 2 : 1).replace(/\.?0+$/, "");
                          return `${s}${suffix}`;
                        };
                        return (
                          <>
                            <tr key={`hdr-${idx}`} className="bg-[hsl(var(--table-header-bg,var(--muted)))]/60 border-b border-border">
                              <td colSpan={7} className="px-4 py-2 text-[13px] font-medium text-foreground">
                                {it.name}
                              </td>
                            </tr>
                            {parsed.map((g, gi) => {
                              const isLastRow = idx === itemsWithGrants.length - 1 && gi === parsed.length - 1;
                              const isFeature = g.kind === "Non-metered feature";
                              const isMetered = g.kind === "Metered feature";
                              const isCredit = g.kind === "Credit";
                              const parsedAmt = parseAmt(g.amount);
                              const current = isFeature
                                ? "Granted"
                                : parsedAmt
                                  ? `${fmtAmt(parsedAmt.n * (REMAINING_DAYS / DAYS_IN_CYCLE), parsedAmt.suffix)}${g.unit ? ` ${g.unit}` : ""}`
                                  : "—";
                              const grantFreq = isCredit ? "per month" : freqLabel(it.billingFrequency);
                              const featureGrantFreq = freqLabel(it.billingFrequency);
                              return (
                                <tr key={`${idx}-${gi}`} className={isLastRow ? "" : "border-b border-border"}>
                                  <td className="px-4 py-3 text-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <span>{g.feature}</span>
                                      {isMetered && <Gauge className="h-3.5 w-3.5 text-muted-foreground shrink-0" strokeWidth={1.75} />}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-foreground">
                                    {isFeature ? "Enabled" : `${g.amount}${g.unit ? ` ${g.unit}` : ""}`}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {isFeature ? featureGrantFreq : grantFreq}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {isFeature ? "Not applicable" : "Grant based on time"}
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">
                                    {isFeature ? "Not applicable" : isCredit ? "Rolls over" : "No rollover"}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-foreground">
                                      {todayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                    </div>
                                    <div className="mt-0.5 text-[11px] text-muted-foreground">
                                      {REMAINING_DAYS}/{DAYS_IN_CYCLE} days
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <div className="font-medium text-foreground">{current}</div>
                                    {!isFeature && parsedAmt && (
                                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                                        {g.amount}{g.unit ? ` ${g.unit}` : ""} × ({REMAINING_DAYS}/{DAYS_IN_CYCLE})
                                      </div>
                                    )}
                                    {isFeature && (
                                      <div className="mt-0.5 text-[11px] text-muted-foreground">
                                        Active for {REMAINING_DAYS} days
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })()}

          {creditedItems.length > 0 && (
            <section className="mt-8">
              <h2 className="text-[15px] font-semibold text-foreground">Why is the credit note amount {creditedAmount}</h2>
              <p className="mb-3 mt-1 text-[12px] text-muted-foreground">Credits to be issued for unused time or entitlements of the removed items.</p>
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <table className="w-full text-[13px] table-fixed">
                  <colgroup>
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "6%" }} />
                    <col style={{ width: "14%" }} />
                    <col style={{ width: "22%" }} />
                    <col style={{ width: "20%" }} />
                    <col style={{ width: "18%" }} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-[12px] font-medium text-muted-foreground">
                      <th className="px-4 py-2.5">Item</th>
                      <th className="px-4 py-2.5">Qty</th>
                      <th className="px-4 py-2.5 text-right">List unit price</th>
                      <th className="px-4 py-2.5">Proration</th>
                      <th className="px-4 py-2.5">Inactive period / usage</th>
                      <th className="px-4 py-2.5 text-right">Net amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creditedItems.map((it, i) => (
                      <tr key={i} className="border-b border-border last:border-b-0">
                        <td className="px-4 py-3 font-medium text-foreground">{it.name}</td>
                        <td className="px-4 py-3 text-foreground">{it.qty}</td>
                        <td className="px-4 py-3 text-right text-foreground">{it.listUnitPrice}</td>
                        <td className="px-4 py-3 text-muted-foreground">{it.proration}</td>
                        <td className="px-4 py-3">
                          {it.proration === "Credit based on usage" ? (
                            <>
                              <div className="text-foreground">500 / 700 GB used</div>
                              <div className="mt-0.5 text-[11px] text-muted-foreground">200 GB unused</div>
                            </>
                          ) : (
                            <>
                              <div className="text-foreground">
                                {todayDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                              <div className="mt-0.5 text-[11px] text-muted-foreground">
                                {REMAINING_DAYS}/{DAYS_IN_CYCLE} days
                              </div>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="font-medium text-foreground">
                            {it.proration === "Credit based on usage"
                              ? fmtMoney(-(parsePrice(it.listUnitPrice) / 700) * 200)
                              : computeProrated(it.listUnitPrice, it.qty, REMAINING_DAYS / DAYS_IN_CYCLE, -1)}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {it.proration === "Credit based on usage"
                              ? `(${it.listUnitPrice} / 700) × 200`
                              : `${it.listUnitPrice}${it.qty > 1 ? ` × ${it.qty}` : ""} × (${REMAINING_DAYS}/${DAYS_IN_CYCLE})`}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-border bg-muted/40 text-foreground">
                      <td colSpan={5} className="px-4 py-2.5 text-right font-semibold">Net total</td>
                      <td className="px-4 py-2.5 text-right font-semibold">
                        {(() => {
                          const total = creditedItems.reduce((sum, it) => {
                            if (it.proration === "Credit based on usage") {
                              return sum + (parsePrice(it.listUnitPrice) / 700) * 200;
                            }
                            return sum + parsePrice(it.listUnitPrice) * (it.qty || 1) * (REMAINING_DAYS / DAYS_IN_CYCLE);
                          }, 0);
                          return fmtMoney(-total);
                        })()}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          )}

          <section className="mt-8">
            <h2 className="text-[15px] font-semibold text-foreground">What happens to existing entitlements/credits</h2>
            <p className="mb-3 mt-1 text-[12px] text-muted-foreground">Impact on currently granted entitlements and credits from this change.</p>
            <div className="rounded-lg border border-border bg-card px-6 py-10 text-center text-[13px] text-muted-foreground">
              TBD
            </div>
          </section>
        </div>
      </main>
      </>
      )}
    </div>
  );
};

export default ChargeBreakdown;
