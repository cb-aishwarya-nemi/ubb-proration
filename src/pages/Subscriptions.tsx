import { Link, useNavigate } from "react-router-dom";
import { Search, Plus, Filter, Download } from "lucide-react";
import { AppSidebar } from "@/components/AppSidebar";

const SUBSCRIPTIONS = [
  { id: "sub_AzZlx1TQ8K9aP2", customer: "Acme Corp", email: "billing@acme.com", plan: "Growth — Monthly", status: "Active", mrr: "$249.00", next: "May 12, 2026" },
  { id: "sub_BqMnv2RY7L8bQ3", customer: "Globex", email: "ap@globex.io", plan: "Starter — Monthly", status: "Active", mrr: "$49.00", next: "May 18, 2026" },
  { id: "sub_CrPow3SZ6M7cR4", customer: "Initech", email: "finance@initech.com", plan: "Enterprise — Annual", status: "Non-renewing", mrr: "$1,200.00", next: "Jun 01, 2026" },
  { id: "sub_DsQpx4TA5N6dS5", customer: "Umbrella", email: "ops@umbrella.co", plan: "Growth — Annual", status: "In Trial", mrr: "$0.00", next: "May 09, 2026" },
  { id: "sub_EtRqy5UB4O5eT6", customer: "Hooli", email: "ar@hooli.xyz", plan: "Starter — Monthly", status: "Paused", mrr: "$49.00", next: "—" },
  { id: "sub_FuSrz6VC3P4fU7", customer: "Pied Piper", email: "richard@piedpiper.com", plan: "Growth — Monthly", status: "Cancelled", mrr: "$0.00", next: "—" },
  { id: "sub_GvTsa7WD2Q3gV8", customer: "Stark Industries", email: "pepper@stark.com", plan: "Enterprise — Annual", status: "Active", mrr: "$2,400.00", next: "Aug 22, 2026" },
  { id: "sub_HwUtb8XE1R2hW9", customer: "Wayne Enterprises", email: "lucius@wayne.com", plan: "Growth — Annual", status: "Active", mrr: "$249.00", next: "Dec 03, 2026" },
];

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  "In Trial": "bg-sky-50 text-sky-700 ring-sky-200",
  "Non-renewing": "bg-amber-50 text-amber-700 ring-amber-200",
  Paused: "bg-slate-100 text-slate-700 ring-slate-200",
  Cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function Subscriptions() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen bg-[#f5f6f8]">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-border bg-card">
          <div className="flex items-center justify-between px-8 py-4">
            <div>
              <div className="text-xs">
                <Link to="/" className="text-sky-600 hover:underline">Home</Link>
                <span className="mx-1 text-muted-foreground">/</span>
                <span className="text-muted-foreground">Subscriptions</span>
              </div>
              <h1 className="mt-1 text-base font-semibold text-foreground">Subscriptions</h1>
            </div>
            <div className="flex items-center gap-2">
              <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                <Download className="h-3.5 w-3.5" /> Export
              </button>
              <button className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-700">
                <Plus className="h-3.5 w-3.5" /> New subscription
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1280px] px-8 py-6">
          <div className="mb-3 flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search by ID, customer, email"
                className="w-full rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-xs outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium">Subscription ID</th>
                  <th className="px-4 py-2.5 text-left font-medium">Customer</th>
                  <th className="px-4 py-2.5 text-left font-medium">Plan</th>
                  <th className="px-4 py-2.5 text-left font-medium">Status</th>
                  <th className="px-4 py-2.5 text-right font-medium">MRR</th>
                  <th className="px-4 py-2.5 text-left font-medium">Next billing</th>
                </tr>
              </thead>
              <tbody>
                {SUBSCRIPTIONS.map((s) => (
                  <tr key={s.id} onClick={() => navigate(`/subscriptions/${s.id}`)} className="cursor-pointer border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <button className="text-xs font-medium text-sky-600 hover:underline">{s.id}</button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-[13px] font-medium text-foreground">{s.customer}</div>
                      <div className="text-[11px] text-muted-foreground">{s.email}</div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{s.plan}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ring-inset ${STATUS_STYLES[s.status] ?? ""}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-[13px] tabular-nums text-foreground">{s.mrr}</td>
                    <td className="px-4 py-3 text-[13px] text-foreground">{s.next}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
